// 用 Playwright 重新抓取内容过短的文章（JS 渲染站点）
const { chromium } = require('playwright');
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'news.db');
const MIN_CONTENT_LENGTH = 500; // 少于这个字符数就重新抓取

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '') // 去除控制字符
    .trim();
}

function extractArticleText(page) {
  // 尝试多种选择器提取正文
  return page.evaluate(() => {
    // 常见文章正文选择器
    const selectors = [
      '.article-content', '.article-body', '.article',
      '.news-content', '.content', '[class*="article"]',
      '.detail-content', '.news-detail', '#article-content',
      '.post-content', '.entry-content',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        // 移除脚本、样式、广告等
        const clone = el.cloneNode(true);
        clone.querySelectorAll('script, style, .ad, .advertisement, .share, .recommend, .related').forEach(n => n.remove());
        const text = clone.textContent || '';
        if (text.trim().length > 100) return text.trim();
      }
    }

    // 备用：取 body 中较长的文本块
    const body = document.body;
    if (!body) return '';
    const clone = body.cloneNode(true);
    clone.querySelectorAll('script, style, nav, header, footer, .nav, .header, .footer, .sidebar, .ad, .share, .recommend').forEach(n => n.remove());
    const text = clone.textContent || '';
    // 取前 10000 字符
    return text.substring(0, 10000).trim();
  });
}

async function main() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  // 查找内容过短的文章
  const rows = [];
  const stmt = db.prepare(`SELECT id, title, source, source_url, length(content) as len FROM news WHERE length(content) < ${MIN_CONTENT_LENGTH} ORDER BY len ASC`);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();

  console.log(`内容过短的文章: ${rows.length} 篇\n`);

  if (rows.length === 0) { db.close(); return; }

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  });

  let updated = 0;
  for (const row of rows) {
    console.log(`[${row.id}] ${row.len}chars | ${row.source} | ${row.title.substring(0, 50)}`);

    if (!row.source_url || !row.source_url.startsWith('http')) {
      console.log('  SKIP: no valid URL');
      continue;
    }

    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      const page = await context.newPage();

      await page.goto(row.source_url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000); // 等 JS 渲染

      let text = await extractArticleText(page);
      await context.close();

      if (!text || text.length < 100) {
        console.log(`  FAIL: extracted only ${text ? text.length : 0} chars`);
        continue;
      }

      // 清理
      text = cleanText(text);

      // 去除常见的页面无关文字（按来源定制）
      if (row.source.includes('10jqka')) {
        // 同花顺的免责声明等
        text = text.replace(/郑重声明[：:][^\n]*/g, '');
        text = text.replace(/以上内容[^\n]*不构成投资建议[^\n]*/g, '');
        text = text.replace(/股市有风险[，,][^\n]*/g, '');
      }

      if (text.length > row.len + 50) {
        db.run('UPDATE news SET content = ?, summary = ? WHERE id = ?', [
          text,
          text.substring(0, 200),
          row.id,
        ]);
        // Fix summary to sentence boundary
        const s = text.substring(0, 200);
        const lp = Math.max(s.lastIndexOf('。'), s.lastIndexOf('！'), s.lastIndexOf('？'));
        if (lp >= 80) {
          db.run('UPDATE news SET summary = ? WHERE id = ?', [s.substring(0, lp + 1), row.id]);
        }
        console.log(`  ✓ ${row.len} → ${text.length} chars`);
        updated++;
      } else {
        console.log(`  NO CHANGE: ${row.len} → ${text.length} chars`);
      }
    } catch (e) {
      console.log(`  ERROR: ${e.message ? e.message.substring(0, 80) : e}`);
    }
  }

  await browser.close();

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log(`\n更新完成: ${updated}/${rows.length} 篇`);
  db.close();
}

main().catch(e => { console.error(e); process.exit(1); });

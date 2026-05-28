// 精准重抓：使用特定站点的选择器提取正文
const { chromium } = require('playwright');
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'news.db');

// 各站点正文选择器
const SITE_SELECTORS = {
  '163.com': ['.post_body', '.article-body', '.post-content p', '.article p'],
  '10jqka.com.cn': ['.article-content', '.newstext', '.content', '[class*=article] p'],
  'sohu.com': ['article', '.article', '.article-body', '.content p'],
  'zol.com.cn': ['.article-content', '.article-body', '.content'],
  'stockstar.com': ['.article-body', '.news-content', '.content'],
  'jrj.com.cn': ['.article-content', '.news-content', '.content'],
  'kylinos.cn': ['.news-content', '.article-body', '.content'],
};

function getSelectors(url) {
  for (const [domain, selectors] of Object.entries(SITE_SELECTORS)) {
    if (url.includes(domain)) return selectors;
  }
  // 通用
  return ['article', '.article', '.article-body', '.article-content', '.news-content', '.content'];
}

async function extractArticleText(page, url) {
  const selectors = getSelectors(url);

  for (const sel of selectors) {
    try {
      const texts = await page.$$eval(sel, els => {
        return els.map(el => {
          const clone = el.cloneNode(true);
          clone.querySelectorAll('script, style, .ad, .share, .recommend, .related').forEach(n => n.remove());
          return clone.textContent.trim();
        }).filter(t => t.length > 30);
      });

      if (texts.length > 0) {
        const joined = texts.join('\n\n');
        if (joined.length > 100) return joined;
      }
    } catch {
      // selector not found, try next
    }
  }

  // Fallback: collect meaningful paragraphs
  return page.evaluate(() => {
    const paras = document.querySelectorAll('p');
    const texts = [];
    for (const p of paras) {
      const t = p.textContent.trim();
      // Skip short/nav paragraphs
      if (t.length > 30 && !/^(登录|注册|查看|相关|推荐|热门|举报|申请|返回)/.test(t)) {
        texts.push(t);
      }
    }
    return texts.join('\n\n');
  });
}

async function main() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  // Target: articles that were refetched and might have quality issues, plus ones that need it
  const idsToFix = [123, 145, 138]; // 123 got destroyed, 145 & 138 had no meaningful change

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  });

  for (const id of idsToFix) {
    const stmt = db.prepare('SELECT id, title, source, source_url, content FROM news WHERE id = ?');
    stmt.bind([id]);
    let row = null;
    while (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    if (!row) continue;

    console.log(`\n[ID ${id}] ${row.source} | ${row.title.substring(0, 60)}`);
    console.log(`  Old content: ${(row.content || '').length} chars`);

    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });
      const page = await context.newPage();
      await page.goto(row.source_url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);

      let text = await extractArticleText(page, row.source_url);
      await context.close();

      if (!text || text.length < 50) {
        console.log('  FAIL: extracted only ' + (text ? text.length : 0) + ' chars');
        continue;
      }

      // Clean up
      text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

      // Remove common junk lines
      text = text.replace(/^郑重声明[：:][^\n]*\n?/gm, '');
      text = text.replace(/^以上内容[^\n]*不构成投资建议[^\n]*\n?/gm, '');
      text = text.replace(/^股市有风险[，,][^\n]*\n?/gm, '');
      text = text.replace(/^来源[：:]\s*[^\n]+\n?/gm, '');
      text = text.replace(/^责任编辑[：:][^\n]*\n?/gm, '');
      text = text.trim();

      if (text.length > 50) {
        db.run('UPDATE news SET content = ? WHERE id = ?', [text, row.id]);

        // Fix summary
        const s = text.substring(0, 200);
        const lp = Math.max(s.lastIndexOf('。'), s.lastIndexOf('！'), s.lastIndexOf('？'));
        if (lp >= 80) {
          db.run('UPDATE news SET summary = ? WHERE id = ?', [s.substring(0, lp + 1), row.id]);
        }

        console.log(`  ✓ ${(row.content || '').length} → ${text.length} chars`);
        console.log(`  First 150: ${text.substring(0, 150)}`);
      }
    } catch (e) {
      console.log(`  ERROR: ${e.message ? e.message.substring(0, 80) : e}`);
    }
  }

  await browser.close();

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log('\nDone!');
  db.close();
}

main().catch(e => { console.error(e); process.exit(1); });

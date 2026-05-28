// 保留段落结构重新抓取
const { chromium } = require('playwright');
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'news.db');

async function extractParagraphs(page) {
  // 找到文章正文区域，然后逐个提取 <p> 或文本块
  return page.evaluate(() => {
    // 先找文章容器
    const containers = [
      '.article-content', '.article-body', '.article', '.news-content',
      '.content', '[class*="article"]', '.newstext', '.detail-content',
    ];

    let articleEl = null;
    for (const sel of containers) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 100) {
        articleEl = el;
        break;
      }
    }

    const root = articleEl || document.body;

    // 移除脚本和样式
    const clone = root.cloneNode(true);
    clone.querySelectorAll('script, style, nav, .nav, .share, .recommend, .related, .ad').forEach(n => n.remove());

    // 提取段落级元素
    const blockEls = clone.querySelectorAll('p, div, section, h1, h2, h3, h4, h5, h6, li, blockquote, pre');
    const paragraphs = [];

    if (blockEls.length > 0) {
      for (const el of blockEls) {
        const text = el.textContent.trim();
        // 过滤太短的、明显是导航/UI的
        if (text.length < 20) continue;
        if (/^(登录|注册|查看|推荐|热门|举报|申请|返回|更多|首页|关于)/.test(text)) continue;
        if (/^(版权所有|Copyright|隐私|服务条款|广告|合作)/.test(text)) continue;
        // 去重（相邻相同段落）
        if (paragraphs.length > 0 && paragraphs[paragraphs.length - 1] === text) continue;
        paragraphs.push(text);
      }
    }

    if (paragraphs.length < 2) {
      // 没有足够的块级元素，尝试按文本节点分割
      const walker = document.createTreeWalker(
        clone, NodeFilter.SHOW_TEXT,
        { acceptNode: node => node.textContent.trim().length > 30 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP }
      );
      const texts = [];
      while (walker.nextNode()) {
        const t = walker.currentNode.textContent.trim();
        if (t.length > 30 && !texts.includes(t)) texts.push(t);
      }
      return texts;
    }

    return paragraphs;
  });
}

async function main() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  // 没有段落分隔的文章
  const ids = [100, 104, 106, 108, 144];
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  });

  for (const id of ids) {
    const stmt = db.prepare('SELECT id, title, source, source_url, content FROM news WHERE id = ?');
    stmt.bind([id]);
    let row = null;
    while (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    if (!row) continue;

    console.log(`\n[ID ${id}] ${row.source} | ${row.title.substring(0, 50)}`);
    const oldLen = (row.content || '').length;

    try {
      const ctx = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });
      const page = await ctx.newPage();
      await page.goto(row.source_url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);

      const paragraphs = await extractParagraphs(page);
      await ctx.close();

      if (paragraphs.length < 2) {
        console.log(`  SKIP: only ${paragraphs.length} paragraphs found`);
        continue;
      }

      // Clean each paragraph
      const cleaned = paragraphs.map(p => {
        return p.replace(/\r\n/g, '\n').replace(/\n+/g, '').trim();
      }).filter(p => p.length > 0);

      const text = cleaned.join('\n\n');
      console.log(`  ${oldLen} chars → ${text.length} chars, ${cleaned.length} paragraphs`);

      if (text.length > 100) {
        db.run('UPDATE news SET content = ? WHERE id = ?', [text, row.id]);

        // Update summary
        const s = text.substring(0, 200);
        const lp = Math.max(s.lastIndexOf('。'), s.lastIndexOf('！'), s.lastIndexOf('？'));
        if (lp >= 80) {
          db.run('UPDATE news SET summary = ? WHERE id = ?', [s.substring(0, lp + 1), row.id]);
        }

        console.log(`  First para: ${cleaned[0].substring(0, 80)}`);
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

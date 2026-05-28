// Targeted clean for the 3 new scraped articles (143, 144, 145)
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'news.db');

function cleanArticle143(text) {
  // Normalize line endings first
  text = text.replace(/\r\n/g, '\n');

  // Remove CSS garbage at start
  text = text.replace(/^\.dynamic-ad-container[\s\S]*?\n\n/, '');
  // Remove date/author line
  text = text.replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}作者[：:][^\n]+\n\n/gm, '');
  // Remove share lines
  text = text.replace(/^分享到[：:]?\s*$/gm, '');
  text = text.replace(/^分享到微信\s*$/gm, '');
  text = text.replace(/^打开手机微信扫一扫\s*$/gm, '');
  // Remove JS var lines
  text = text.replace(/^var\s+\w+\s*=\s*'[^']*'\s*$/gm, '');
  // Remove empty lines with just whitespace
  text = text.replace(/^\s*$/gm, '');

  // Remove everything before "国家知识产权局信息显示" if needed
  const idx = text.indexOf('国家知识产权局信息显示');
  if (idx > 0) text = text.substring(idx);

  // Fix broken-up words (scraper artifact: "软通动力\n\n信息技术")
  text = text.replace(/软通动力\n\n信息技术/g, '软通动力信息技术');
  text = text.replace(/基于\n\n人工智能\n\n的/g, '基于人工智能的');

  // Normalize
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();
  return text;
}

function cleanArticle144(text) {
  text = text.replace(/\r\n/g, '\n');
  // Remove investment advice at end
  text = text.replace(/\n以上内容为证券之星据公开信息整理[^\n]*/g, '');
  text = text.replace(/\n数据来源[：:][^\n]*/g, '');
  // Remove "通过天眼查大数据分析..." parenthetical
  text = text.replace(/通过天眼查大数据分析[^。]+。/g, '');
  text = text.trim();
  return text;
}

function cleanArticle145(text) {
  text = text.replace(/\r\n/g, '\n');
  // Remove "证券日报网讯5月26日，" prefix
  text = text.replace(/^证券日报网讯\d{1,2}月\d{1,2}日[，,]\s*/g, '');
  text = text.trim();
  return text;
}

async function main() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  const cleaners = { 143: cleanArticle143, 144: cleanArticle144, 145: cleanArticle145 };

  for (const [idStr, cleaner] of Object.entries(cleaners)) {
    const id = parseInt(idStr);
    const stmt = db.prepare('SELECT id, title, content FROM news WHERE id = ?');
    stmt.bind([id]);
    let row = null;
    while (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    if (!row) continue;

    const before = row.content || '';
    const after = cleaner(before);
    console.log(`id=${id}: ${before.length} → ${after.length} chars`);
    console.log(`  Before start: ${before.substring(0, 80).replace(/\n/g, '\\n')}`);
    console.log(`  After start:  ${after.substring(0, 80).replace(/\n/g, '\\n')}`);

    if (after !== before && after.length > 50) {
      db.run('UPDATE news SET content = ? WHERE id = ?', [after, id]);
      // Also fix summary
      const summary = after.substring(0, 200);
      const lastPeriod = Math.max(summary.lastIndexOf('。'), summary.lastIndexOf('！'), summary.lastIndexOf('？'));
      const newSummary = lastPeriod >= 80 ? summary.substring(0, lastPeriod + 1) : summary;
      db.run('UPDATE news SET summary = ? WHERE id = ?', [newSummary, id]);
      console.log(`  Summary: ${newSummary.substring(0, 80)}...`);
    }
  }

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log('\nDone!');
  db.close();
}

main().catch(e => { console.error(e); process.exit(1); });

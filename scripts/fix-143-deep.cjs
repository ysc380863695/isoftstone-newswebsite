// Deep clean ID 143 (jrj patent article) - remove page chrome garbage
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'news.db');

async function main() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  const stmt = db.prepare('SELECT id, content FROM news WHERE id = 143');
  let row = null;
  while (stmt.step()) row = stmt.getAsObject();
  stmt.free();

  if (!row) { console.log('Article 143 not found'); db.close(); return; }

  let content = (row.content || '').replace(/\r\n/g, '\n');

  console.log('Before:', content.length, 'chars');
  console.log('Last 200 chars:', JSON.stringify(content.slice(-200)));

  // Cut at page chrome markers (jrj.com.cn UI elements)
  const cutMarkers = [
    '\n财经频道',
    "\n$('.keyword",
    '\nAI智能分析该文',
    '\n该AI功能处于试用',
  ];
  for (const marker of cutMarkers) {
    const idx = content.indexOf(marker);
    if (idx > 0) {
      content = content.substring(0, idx).trim();
      console.log('Cut at marker:', JSON.stringify(marker));
      break;
    }
  }

  // Fix: merge short intro line with next paragraph
  content = content.replace(/信息显示，\n\n/g, '信息显示，');

  // Fix broken word splits
  content = content.replace(/天眼查大\n\n数据分析/g, '天眼查大数据分析');
  content = content.replace(/财产线索方面有商标信息\n\n/g, '财产线索方面有商标信息');
  // Fix split: '天眼查大数据分析\n\n，软通动力'
  content = content.replace(/天眼查大数据分析\n\n，/g, '天眼查大数据分析，');

  // Cut trailing garbage
  const endMarkers = ['\n财经频道', '\n>>'];
  for (const marker of endMarkers) {
    const idx = content.indexOf(marker);
    if (idx > 0) {
      content = content.substring(0, idx).trim();
      break;
    }
  }

  // Truncate to last complete sentence
  const lastPeriod = Math.max(
    content.lastIndexOf('。'),
    content.lastIndexOf('！'),
    content.lastIndexOf('？')
  );
  if (lastPeriod > content.length - 30) {
    content = content.substring(0, lastPeriod + 1);
  }

  // Normalize whitespace
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.trim();

  db.run('UPDATE news SET content = ? WHERE id = 143', [content]);

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));

  console.log('After:', content.length, 'chars');
  console.log('Content:');
  console.log(content);
  db.close();
}

main().catch(e => { console.error(e); process.exit(1); });

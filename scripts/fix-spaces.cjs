const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

async function main() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(path.join(__dirname, '..', 'data', 'news.db')));

  const rows = [];
  const stmt = db.prepare('SELECT id, source, content FROM news');
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();

  const updateStmt = db.prepare('UPDATE news SET content = ? WHERE id = ?');

  for (const r of rows) {
    let c = r.content;

    // Remove spaces flanking short Chinese words (merge artifacts)
    // "据 软通动力 消息" -> "据软通动力消息"
    c = c.replace(/([\u4e00-\u9fff])\s{1,2}([\u4e00-\u9fff\w]{1,10})\s{1,2}([\u4e00-\u9fff])/g, '$1$2$3');

    // Remove leading whitespace on each line
    c = c.replace(/^[ \t]+/gm, '');

    // Remove spaces after newline
    c = c.replace(/\n\s+/g, '\n');

    // Normalize spaces
    c = c.replace(/  +/g, ' ');

    // Collapse 3+ newlines
    c = c.replace(/\n{3,}/g, '\n\n');

    c = c.trim();

    if (c !== r.content) {
      updateStmt.run([c, String(r.id)]);
      console.log('Fixed id=' + r.id + ' [' + r.source + ']');
    }
  }
  updateStmt.free();

  const data = db.export();
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'news.db'), Buffer.from(data));
  console.log('Done');
  db.close();
}

main().catch(e => { console.error(e); process.exit(1); });

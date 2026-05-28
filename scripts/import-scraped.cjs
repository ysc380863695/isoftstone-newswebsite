// 读取 Scrapling 抓取结果，导入数据库（替换旧文章）
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'news.db');
const jsonPath = path.join(__dirname, 'scraped_articles2.json');

async function main() {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`读取到 ${data.articles.length} 篇文章\n`);

  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  // 1. 只删除有截图/占位图的文章，保留真图文章
  const before = db.exec("SELECT COUNT(*) as cnt FROM news")[0]?.values[0]?.[0] || 0;
  // 保留的文章：cover_image 包含 http 的（远程真图），不包含 /images/news/ 的（非本地文件）
  db.run("DELETE FROM news WHERE cover_image LIKE '/images/news/%' OR cover_image = '' OR cover_image IS NULL");
  const after = db.exec("SELECT COUNT(*) as cnt FROM news")[0]?.values[0]?.[0] || 0;
  console.log(`删除截图/占位文章: ${before - after} 篇，保留真图文章: ${after} 篇`);

  // 2. 插入新文章
  let inserted = 0;
  const insertStmt = db.prepare(`
    INSERT INTO news (title, source_url, source, cover_image, publish_date, content, summary, category, tags, key_entities, sentiment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', '{}', 'neutral')
  `);

  for (const a of data.articles) {
    if (!a.title || !a.source_url) continue;

    // 从URL提取信源域名
    const domain = a.source || (() => {
      try { return new URL(a.source_url).hostname.replace('www.', ''); }
      catch { return ''; }
    })();

    // Fallback: 无图时用占位图，后续可用 Playwright 截图补充
    let cover = a.cover_image || '';
    if (!cover) {
      const catMap = {
        '公司动态': '/images/news/placeholder-company.svg',
        '合作签约': '/images/news/placeholder-deal.svg',
        '技术创新': '/images/news/placeholder-tech.svg',
        '产品发布': '/images/news/placeholder-product.svg',
        '生态合作': '/images/news/placeholder-eco.svg',
        '财报业绩': '/images/news/placeholder-finance.svg',
      };
      cover = catMap[a.category] || '/images/news/placeholder-company.svg';
    }

    insertStmt.run([
      a.title,
      a.source_url,
      domain,
      cover,
      a.publish_date,
      a.content || '',
      a.summary || (a.content || '').substring(0, 200),
      a.category || '公司动态',
    ]);
    inserted++;
    const imgStatus = a.cover_image ? '✓图' : '○占位';
    console.log(`  [${imgStatus}] ${a.title.substring(0, 55)}`);
  }
  insertStmt.free();

  // 保存
  const outData = db.export();
  fs.writeFileSync(dbPath, Buffer.from(outData));
  console.log(`\n导入完成: ${inserted} 篇`);
  db.close();
}

main().catch(e => { console.error(e); process.exit(1); });

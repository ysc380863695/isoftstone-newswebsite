// 从各新闻来源页抓取图片，更新数据库
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'news.db');

async function fetchImages(url) {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
    if (!resp.ok) return null;
    const html = await resp.text();

    // 1. og:image
    let m = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
    if (m) return m[1];

    // 2. twitter:image
    m = html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i);
    if (m) return m[1];

    // 3. 文章中第一张图片 (过滤小图/icon/logo/avatar)
    const imgMatch = html.match(/<img[^>]+src="([^"]+)"[^>]*>/gi);
    if (imgMatch) {
      for (const tag of imgMatch) {
        const srcM = tag.match(/src="([^"]+)"/i);
        if (!srcM) continue;
        const src = srcM[1];
        // 过滤明显的小图/icon
        if (/icon|logo|avatar|banner|qr_code|weixin|wx_logo|share_|btn_/i.test(src)) continue;
        // 过滤很小的图片
        if (/_(16|24|32|48|64)x(16|24|32|48|64)\./i.test(src)) continue;
        // 补全协议
        if (src.startsWith('//')) return 'https:' + src;
        if (src.startsWith('/')) {
          try {
            const u = new URL(url);
            return u.origin + src;
          } catch { return null; }
        }
        if (src.startsWith('http')) return src;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  // 查询占位图/无图文章
  const rows = [];
  const stmt = db.prepare("SELECT id, source_url, title FROM news WHERE cover_image LIKE '/images/news/%' OR cover_image = '' OR cover_image IS NULL");
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();

  console.log(`需要抓取图片: ${rows.length} 篇\n`);

  let updated = 0;
  for (const row of rows) {
    console.log(`抓取: ${row.title.substring(0, 60)}...`);
    const img = await fetchImages(row.source_url);
    if (img) {
      console.log(`  → ${img.substring(0, 90)}`);
      db.run('UPDATE news SET cover_image = ? WHERE id = ?', [img, row.id]);
      updated++;
    } else {
      console.log(`  → 无图片`);
    }
  }

  // 保存
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log(`\n更新完成: ${updated}/${rows.length} 篇获得图片`);
  db.close();
}

main().catch(e => { console.error(e); process.exit(1); });

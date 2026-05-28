// 用 Playwright + 系统 Edge 给每篇文章来源页截图作为封面
// 运行: node scripts/screenshot-covers.cjs

const { chromium } = require('playwright');
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'news.db');
const imgDir = path.join(__dirname, '..', 'client', 'images', 'news');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function screenshotPage(browser, url, outputPath) {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },  // og:image 标准尺寸
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    // 等页面渲染完
    await page.waitForTimeout(3000);

    // 尝试关掉可能的弹窗/广告
    try {
      await page.evaluate(() => {
        const overlays = document.querySelectorAll('[class*="popup"], [class*="modal"], [class*="overlay"], [class*="ad"], [id*="popup"], [id*="modal"]');
        overlays.forEach(el => el.remove());
      });
    } catch {}

    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`  ✓ 截图成功`);
  } catch (err) {
    console.log(`  ✗ 截图失败: ${err.message.substring(0, 80)}`);
    throw err;
  } finally {
    await context.close();
  }
}

async function main() {
  // 加载数据库
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  // 查询使用占位图的文章 (需要截图替换)
  const rows = [];
  const stmt = db.prepare("SELECT id, title, source_url, category FROM news WHERE cover_image LIKE '%placeholder%'");
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();

  console.log(`需要截图: ${rows.length} 篇\n`);

  if (rows.length === 0) {
    console.log('没有需要截图替换的文章');
    db.close();
    return;
  }

  // 确保图片目录存在
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  // 启动浏览器
  console.log('启动 Edge 浏览器...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: EDGE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let success = 0;
  let failed = 0;

  for (const row of rows) {
    const filename = `cover-${row.id}.png`;
    const outputPath = path.join(imgDir, filename);
    const localPath = `/images/news/${filename}`;

    console.log(`[${row.category}] ${row.title.substring(0, 60)}`);
    console.log(`  URL: ${row.source_url.substring(0, 80)}`);

    try {
      await screenshotPage(browser, row.source_url, outputPath);
      // 更新数据库
      db.run('UPDATE news SET cover_image = ? WHERE id = ?', [localPath, row.id]);
      success++;
    } catch {
      failed++;
      console.log(`  保留占位图`);
    }
  }

  await browser.close();

  // 保存数据库
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log(`\n截图完成: ${success} 张成功, ${failed} 张失败`);
  db.close();
}

main().catch(err => {
  console.error('执行失败:', err.message);
  process.exit(1);
});

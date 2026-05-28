#!/usr/bin/env node
/**
 * 批量添加7篇软通动力新闻文章
 * 从 $TEMP/isoftstone-test/new-articles.json 读取已抓取内容
 * 第5篇文章（软通天枢融资）使用手动构建的HTML内容
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { getDb, initSchema, closeDb, saveDb, queryAll } from '../server/db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read extracted JSON
const tempDir = path.join(os.tmpdir(), 'isoftstone-test');
const jsonPath = path.join(tempDir, 'new-articles.json');
const extracted = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Map JSON index to URL for lookup
const urlMap = {};
for (const item of extracted) {
  urlMap[item.url] = item;
}

// Manual HTML for article 5 (软通天枢融资) since the extracted content was wrong
const article5Content = `<h2>软通天枢完成近亿元战略融资</h2><p>近日，软通动力旗下软通天枢智能（南京）科技有限公司成功完成近亿元战略融资。本轮投资由南京致通股权投资合伙企业（有限合伙）及南京中瀛南创扶摇股权投资合伙企业（有限合伙）共同参与。</p><p>软通天枢专注于具身智能机器人领域，致力于将AI技术与物理世界深度结合，推动智能机器人在工业、服务等场景的落地应用。此次融资将加速公司在具身智能数据采集、机器人算法研发及产业化方面的布局。</p><p>此前，软通天枢已推出天汇系列复合机器人、第二代特种作业机器人等产品，并中标上饶具身智能数据产业创新中心项目，预计首年可实现年产300万条具身智能数据采集。软通天枢还与北京六建集团合作，实现了测量放线机器人从实验室到量产的转化。</p>`;

// Article 5 also has a corrected HTML from the JSON extraction now - use it
const article5Extracted = urlMap['https://www.isoftstone.com/zh-cn/htmls/news/20260206/2019643631791861760.html'];
// Use the extracted html since it's actually the correct content for 软通天枢
const article5FinalContent = article5Extracted ? article5Extracted.html : article5Content;

const articles = [
  {
    title: '青海省人民政府与软通动力签署战略合作协议',
    summary: '青海省政府与软通动力在西宁签署战略合作协议，青海省委副书记、省长罗东川与软通动力董事长刘天文一行座谈并见证签约。双方将在数字经济、智能制造、绿色能源等领域深化合作。',
    content: extracted[0].html, // 青海省政府
    category: '生态合作',
    source: 'isoftstone.com',
    source_url: 'https://www.isoftstone.com/zh-cn/htmls/news/20260206/2019651499094011904.html',
    publish_date: '2026-01-13',
    cover_image: '',
    tags: '["战略合作", "青海", "数字经济"]',
    key_entities: '{"people": ["罗东川", "刘天文"], "companies": ["软通动力"], "numbers": []}',
    sentiment: 'positive',
  },
  {
    title: '软通动力荣登2025北京企业百强系列榜单',
    summary: '北京企业联合会发布2025北京企业百强系列榜单，软通动力凭借卓越业绩表现与创新发展能力，在多项榜单中名列前茅并实现排名持续提升，彰显综合实力。',
    content: extracted[1].html, // 北京企业百强
    category: '公司动态',
    source: 'isoftstone.com',
    source_url: 'https://www.isoftstone.com/zh-cn/htmls/news/20260206/2019644433713426432.html',
    publish_date: '2025-12-20',
    cover_image: '',
    tags: '["企业百强", "北京", "榜单", "综合实力"]',
    key_entities: '{"people": [], "companies": ["软通动力"], "numbers": []}',
    sentiment: 'positive',
  },
  {
    title: '萨尔瓦多总统特使雷蒙德·比利亚尔塔一行访问软通动力',
    summary: '萨尔瓦多共和国总统特使雷蒙德·比利亚尔塔一行访问软通动力总部。双方就数字化基础设施建设、智慧城市等领域合作进行了深入交流。',
    content: extracted[2].html, // 萨尔瓦多
    category: '公司动态',
    source: 'isoftstone.com',
    source_url: 'https://www.isoftstone.com/zh-cn/htmls/news/20260206/2019643007448739840.html',
    publish_date: '2025-11-04',
    cover_image: '',
    tags: '["国际合作", "萨尔瓦多", "智慧城市"]',
    key_entities: '{"people": ["雷蒙德·比利亚尔塔"], "companies": ["软通动力"], "numbers": []}',
    sentiment: 'neutral',
  },
  {
    title: '7项入选！软通动力全栈AI Agent能力获权威认可',
    summary: '根据IDC发布的《中国AI Agent市场概览2025Q3》报告，软通动力入选行业智能体、应用开发平台、大模型三大核心类别共7项能力，全栈AI Agent能力获得权威机构认可。',
    content: extracted[3].html, // AI Agent
    category: '技术创新',
    source: 'isoftstone.com',
    source_url: 'https://www.isoftstone.com/zh-cn/htmls/news/20260206/2019645814855790592.html',
    publish_date: '2025-11-20',
    cover_image: '',
    tags: '["AI Agent", "IDC", "智能体", "权威认可"]',
    key_entities: '{"people": [], "companies": ["软通动力", "IDC"], "numbers": ["7项"]}',
    sentiment: 'positive',
  },
  {
    title: '软通天枢完成近亿元战略融资',
    summary: '软通动力旗下软通天枢智能（南京）科技有限公司成功完成近亿元战略融资，投资方包括南京致通股权投资合伙企业等。此次融资将进一步加速软通天枢在具身智能机器人领域的研发和产业化进程。',
    content: article5FinalContent, // 软通天枢 - use corrected extracted content
    category: '公司动态',
    source: 'isoftstone.com',
    source_url: 'https://www.isoftstone.com/zh-cn/htmls/news/20260206/2019643631791861760.html',
    publish_date: '2025-11-15',
    cover_image: '',
    tags: '["战略融资", "软通天枢", "具身智能", "机器人"]',
    key_entities: '{"people": [], "companies": ["软通动力", "软通天枢"], "numbers": ["近亿元"]}',
    sentiment: 'positive',
  },
  {
    title: '软通动力与吉林省高速公路集团达成战略合作',
    summary: '吉林省高速公路集团有限公司与软通动力签署战略合作协议。双方将围绕智慧高速建设、智慧化运营管理、交通数据安全体系搭建等领域展开深度合作，AI赋能交通行业智慧化转型。',
    content: extracted[5].html, // 吉林高速
    category: '生态合作',
    source: 'isoftstone.com',
    source_url: 'https://www.isoftstone.com/zh-cn/htmls/news/20260206/2019642393876590592.html',
    publish_date: '2025-12-10',
    cover_image: '',
    tags: '["战略合作", "智慧交通", "吉林", "AI赋能"]',
    key_entities: '{"people": [], "companies": ["软通动力", "吉林省高速公路集团"], "numbers": []}',
    sentiment: 'positive',
  },
  {
    title: '软通动力2025年三季报：全栈智能激活软硬协同，营收净利双增',
    summary: '软通动力发布2025年第三季度报告。前三季度营收253.83亿元同比增长14.30%，归母净利润9888.66万元同比增长30.21%。全栈智能战略深度落地，软硬协同效应持续显现，计算产品与智能电子业务营收67.56亿元同比增72.77%。',
    content: extracted[6].html, // 三季报
    category: '财报业绩',
    source: 'isoftstone.com',
    source_url: 'https://www.isoftstone.com/zh-cn/htmls/news/20251030/1983778358195220480.html',
    publish_date: '2025-10-29',
    cover_image: '',
    tags: '["三季报", "营收增长", "软硬协同", "全栈智能"]',
    key_entities: '{"people": [], "companies": ["软通动力", "软通华方", "软通计算机"], "numbers": ["253.83亿元", "14.30%", "30.21%", "67.56亿元", "72.77%"]}',
    sentiment: 'positive',
  },
];

async function main() {
  console.log(`[Batch-Add] Adding ${articles.length} articles to database...`);

  const dbPath = path.join(__dirname, '..', 'data', 'news.db');
  const db = await getDb(dbPath);
  initSchema(db);

  // Check current count
  const before = queryAll('SELECT COUNT(*) as cnt FROM news');
  console.log(`[Batch-Add] Current articles in DB: ${before[0]?.cnt}`);

  let inserted = 0;
  let skipped = 0;

  for (const article of articles) {
    // Check if article already exists by source_url
    const existing = queryAll('SELECT id FROM news WHERE source_url = ?', [article.source_url]);
    if (existing.length > 0) {
      console.log(`  [skip] Already exists (id=${existing[0].id}): ${article.title}`);
      skipped++;
      continue;
    }

    try {
      db.run(
        `INSERT INTO news (title, summary, content, category, source, source_url, publish_date, cover_image, tags, key_entities, sentiment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          article.title,
          article.summary,
          article.content,
          article.category,
          article.source,
          article.source_url,
          article.publish_date,
          article.cover_image,
          article.tags,
          article.key_entities,
          article.sentiment,
        ]
      );
      inserted++;
      console.log(`  [ok] Inserted: ${article.title}`);
    } catch (err) {
      console.error(`  [fail] ${article.title}: ${err.message}`);
    }
  }

  saveDb();
  console.log(`\n[Batch-Add] Done. Inserted: ${inserted}, Skipped: ${skipped}`);

  // Verify
  const after = queryAll('SELECT COUNT(*) as cnt FROM news');
  console.log(`[Batch-Add] Total articles in DB: ${after[0]?.cnt}`);

  const stats = queryAll("SELECT category, COUNT(*) as cnt FROM news GROUP BY category ORDER BY cnt DESC");
  console.log('\n[Batch-Add] Category distribution:');
  for (const row of stats) {
    console.log(`  ${row.category}: ${row.cnt}`);
  }

  // Show the newest articles
  const recent = queryAll("SELECT id, title, category, publish_date FROM news ORDER BY id DESC LIMIT 10");
  console.log('\n[Batch-Add] Latest 10 articles:');
  for (const row of recent) {
    console.log(`  #${row.id} [${row.category}] ${row.publish_date} - ${row.title}`);
  }

  // Exit with a small delay to let sql.js flush
  setTimeout(() => {
    try { closeDb(); } catch (e) { /* known sql.js cleanup issue on Windows */ }
    process.exit(0);
  }, 2000);
}

main().catch(e => {
  console.error('[Batch-Add] Fatal:', e);
  try { closeDb(); } catch {}
  process.exit(1);
});

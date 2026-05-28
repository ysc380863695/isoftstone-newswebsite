// 清理文章内容：去除无关文字、格式化优化
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'news.db');

// 垃圾文本匹配规则（按顺序应用）
const JUNK_PATTERNS = [
  // === 行首/行尾垃圾 ===

  // 来源声明行
  /^来源[：:]\s*[^\n]+$/gm,
  // （来源：xxx）行
  /^[（(]来源[：:][^)）]+[)）]\s*$/gm,
  // 独立 "NEWS" 行
  /^NEWS\s*$/gm,
  // 浮动的节号（如单独的 "1", "2", "3" 行）
  /^\d{1,2}\s*$/gm,
  // 责任编辑
  /^[（(]?编辑\s*[^\n）)]+[）)]?\s*$/gm,
  // 责任编辑（搜狐格式）
  /[（(]编辑[^)）]+[)）]\s*$/gm,
  // "返回搜狐，查看更多"
  /返回搜狐[，,]\s*查看更多\s*/g,
  // "点击查看公告原文>>" / "点击查看原文>>"
  /点击查看(公告)?原文[>＞]*\s*/g,
  // "声明：市场有风险..." 整段
  /声明[：:]\s*市场有风险[\s\S]*?(?=\n\n|$)/g,
  // "本文为AI大模型..." 整段
  /本文为AI大模型[\s\S]*?(?=\n\n|$)/g,
  // "如有出入请以实际公告为准..."
  /如有出入请以实际公告为准[^\n]*\n?/g,
  // "如有疑问，请联系..."
  /如有疑问[，,][^\n]*\n?/g,
  // "图片来源：xxx" 行
  /^图片来源[：:][^\n]+$/gm,
  // "*文中题图来自：xxx" 行
  /^\*?\s*文中(题图|图片)[^\n]*$/gm,
  // "文中未署名配图来自：xxx"
  /^文中[^\n]*配图[^\n]*$/gm,
  // 风险提示段（直到文章结束）
  /^风险提示[\s\S]*$/gm,
  // "（完）"
  /[（(]完[)）]\s*/g,

  // === 内联垃圾 ===
  // 股票代码注解：软通动力（301236） → 软通动力
  /[（(](301236|0\d{5}|3\d{5}|6\d{5}|8\d{5}|9\d{5})[)）]/g,
  // 板块代码：如 数字经济（885976）、佛山（883403）
  // 这些是金融网站的板块代码注解，保留概念名称，去掉代码
  /[（(](88\d{4})[)）]/g,
  // 同花顺代码
  /[（(](300033)[)）]/g,

  // === 多余空白 ===
  // 3+ 连续换行 → 2 个换行
  /\n{3,}/g,
];

function cleanContent(text) {
  if (!text) return '';

  let cleaned = text;

  for (const pattern of JUNK_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // 清理多余空白行
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 清理行首行尾空白
  cleaned = cleaned.trim();

  // 如果第一行是空行，移除
  while (cleaned.startsWith('\n')) {
    cleaned = cleaned.substring(1);
  }

  return cleaned;
}

async function main() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  const rows = [];
  const stmt = db.prepare('SELECT id, title, source, content FROM news ORDER BY id');
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();

  console.log(`Processing ${rows.length} articles...\n`);

  const updateStmt = db.prepare('UPDATE news SET content = ? WHERE id = ?');

  for (const r of rows) {
    const before = r.content || '';
    const after = cleanContent(before);

    const removed = before.length - after.length;
    const pct = before.length > 0 ? ((removed / before.length) * 100).toFixed(0) : 0;

    if (removed > 0) {
      updateStmt.run([after, r.id]);
      console.log(`id=${r.id} [${r.source}]: ${before.length} → ${after.length} chars (-${pct}%)`);
      // Show what was removed
      const diff = findRemovedText(before, after);
      if (diff) console.log(`  Removed: "${diff.substring(0, 80)}"`);
    } else {
      console.log(`id=${r.id} [${r.source}]: unchanged (${before.length} chars)`);
    }
  }

  updateStmt.free();

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log(`\nDone!`);
  db.close();
}

function findRemovedText(before, after) {
  // Find first difference
  for (let i = 0; i < Math.min(before.length, after.length); i++) {
    if (before[i] !== after[i]) {
      return before.substring(Math.max(0, i - 5), Math.min(before.length, i + 80));
    }
  }
  if (before.length > after.length) {
    return before.substring(after.length, after.length + 80);
  }
  return null;
}

main().catch(e => { console.error(e); process.exit(1); });

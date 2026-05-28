// Fix summaries (sentence-boundary truncation) and clean 3 new articles
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'news.db');

// Same junk patterns from clean-content.cjs
const JUNK_PATTERNS = [
  /^来源[：:]\\s*[^\\n]+$/gm,
  /^[（(]来源[：:][^)）]+[)）]\\s*$/gm,
  /^NEWS\\s*$/gm,
  /^\\d{1,2}\\s*$/gm,
  /[（(]编辑[^)）]+[)）]\\s*$/gm,
  /返回搜狐[，,]\\s*查看更多\\s*/g,
  /点击查看(公告)?原文[>＞]*\\s*/g,
  /声明[：:]\\s*市场有风险[\\s\\S]*?(?=\\n\\n|$)/g,
  /本文为AI大模型[\\s\\S]*?(?=\\n\\n|$)/g,
  /如有出入请以实际公告为准[^\\n]*\\n?/g,
  /如有疑问[，,][^\\n]*\\n?/g,
  /^图片来源[：:][^\\n]+$/gm,
  /^\\*?\\s*文中(题图|图片)[^\\n]*$/gm,
  /^文中[^\\n]*配图[^\\n]*$/gm,
  /^风险提示[\\s\\S]*$/gm,
  /[（(]完[)）]\\s*/g,
  /[（(](301236|0\\d{5}|3\\d{5}|6\\d{5}|8\\d{5}|9\\d{5})[)）]/g,
  /[（(](88\\d{4})[)）]/g,
  /[（(](300033)[)）]/g,
  /\\n{3,}/g,
];

// Additional patterns for the 3 new scraped articles (jrj, stockstar, 10jqka)
const EXTRA_JUNK = [
  // CSS blocks
  /\\.dynamic-ad-container[^{]*\\{[^}]*\\}\\s*/g,
  // "分享到:" lines
  /^分享到:\\s*$/gm,
  /^分享到微信\\s*$/gm,
  /^打开手机微信扫一扫\\s*$/gm,
  // JS var declarations
  /^var\\s+\\w+\\s*=\\s*['\"][^'\"]*['\"]\\s*$/gm,
  // Date/author stamps
  /^\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}作者[：:][^\\n]+$/gm,
  // "情报员" author lines
  /作者[：:]\\s*情报员\\s*$/gm,
  // Extra share text
  /打开手机微信扫一扫\\s*/g,
];

function cleanContent(text) {
  if (!text) return '';
  let cleaned = text;
  for (const pattern of [...JUNK_PATTERNS, ...EXTRA_JUNK]) {
    cleaned = cleaned.replace(pattern, '');
  }
  cleaned = cleaned.replace(/\\n{3,}/g, '\\n\\n');
  cleaned = cleaned.trim();
  while (cleaned.startsWith('\\n')) cleaned = cleaned.substring(1);
  return cleaned;
}

function fixSummary(content) {
  if (!content) return '';
  // Take content up to 200 chars, truncate at last sentence boundary
  let text = content.substring(0, 200);
  // Find last sentence-ending punctuation that gives us at least 80 chars
  const lastPeriod = Math.max(
    text.lastIndexOf('。'),
    text.lastIndexOf('！'),
    text.lastIndexOf('？')
  );
  if (lastPeriod >= 80) {
    text = text.substring(0, lastPeriod + 1);
  } else if (lastPeriod >= 30) {
    // Shorter but still acceptable
    text = text.substring(0, lastPeriod + 1);
  }
  // If no good sentence boundary, return first 200 chars as-is
  return text;
}

async function main() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  const rows = [];
  const stmt = db.prepare('SELECT id, title, source, summary, content FROM news ORDER BY id');
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();

  console.log(`Processing ${rows.length} articles...\\n`);

  const updateContent = db.prepare('UPDATE news SET content = ? WHERE id = ?');
  const updateSummary = db.prepare('UPDATE news SET summary = ? WHERE id = ?');

  for (const r of rows) {
    let changed = false;

    // 1. Clean content for the 3 new articles (143, 144, 145)
    if ([143, 144, 145].includes(r.id)) {
      const beforeLen = (r.content || '').length;
      const cleaned = cleanContent(r.content);
      if (cleaned !== r.content && cleaned.length > 50) {
        updateContent.run([cleaned, r.id]);
        r.content = cleaned;
        console.log(`id=${r.id} [${r.source}]: cleaned content ${beforeLen} → ${cleaned.length} chars`);
        changed = true;
      }
    }

    // 2. Fix summary if cut mid-sentence
    const currentSummary = r.summary || '';
    const lastChar = currentSummary.slice(-1);
    const endsWithCut = !/[。！？.!?」』]/.test(lastChar);

    if (endsWithCut && r.content) {
      const newSummary = fixSummary(r.content);
      if (newSummary && newSummary !== currentSummary) {
        updateSummary.run([newSummary, r.id]);
        console.log(`id=${r.id} [${r.source}]: fixed summary`);
        console.log(`  Old (${currentSummary.length}): ...${currentSummary.slice(-30)}`);
        console.log(`  New (${newSummary.length}): ...${newSummary.slice(-30)}`);
        changed = true;
      }
    }

    if (!changed && ![143, 144, 145].includes(r.id)) {
      // Silent - no changes needed
    }
  }

  updateContent.free();
  updateSummary.free();

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log(`\\nDone!`);
  db.close();
}

main().catch(e => { console.error(e); process.exit(1); });

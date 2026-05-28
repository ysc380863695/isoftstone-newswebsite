#!/usr/bin/env node
/**
 * 手动爬取脚本
 * 用法: node scripts/crawl.js [--query "软通动力"] [--max-results 20]
 */
import { getDb, initSchema, closeDb } from '../server/db/index.js';
import { runCrawl } from '../server/modules/crawler/crawler-service.js';
import config from '../server/config.js';

const args = process.argv.slice(2);
const overrides = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--query' && args[i + 1]) {
    overrides.query = args[++i];
  }
  if (args[i] === '--max-results' && args[i + 1]) {
    overrides.maxResults = parseInt(args[++i], 10);
  }
}

async function main() {
  console.log('[Crawl Script] Initializing database...');
  const db = await getDb(config.db.path);
  initSchema(db);

  console.log('[Crawl Script] Starting crawl...', overrides.query ? `query: ${overrides.query}` : '');
  const result = await runCrawl(overrides);

  console.log('[Crawl Script] Result:', JSON.stringify(result, null, 2));

  closeDb();
  process.exit(0);
}

main().catch(err => {
  console.error('[Crawl Script] Fatal error:', err);
  closeDb();
  process.exit(1);
});

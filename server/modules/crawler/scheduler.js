import { runCrawl } from './crawler-service.js';
import config from '../../config.js';

let timer = null;

/**
 * 启动定时爬取
 * 默认每 CRAWL_INTERVAL_HOURS 小时执行一次
 */
export function startScheduler() {
  const intervalMs = config.crawl.intervalHours * 60 * 60 * 1000;

  // 启动时延迟执行（5分钟，避免开发时频繁重启触发爬取）
  const initialDelay = 300_000;
  setTimeout(async () => {
    try {
      console.log('[Scheduler] Running initial crawl...');
      const result = await runCrawl();
      console.log('[Scheduler] Initial crawl done:', JSON.stringify(result));
    } catch (err) {
      console.error('[Scheduler] Initial crawl failed:', err.message);
    }
  }, initialDelay);

  // 定时执行
  timer = setInterval(async () => {
    try {
      console.log('[Scheduler] Running scheduled crawl...');
      const result = await runCrawl();
      console.log('[Scheduler] Scheduled crawl done:', JSON.stringify(result));
    } catch (err) {
      console.error('[Scheduler] Scheduled crawl failed:', err.message);
    }
  }, intervalMs);

  console.log(`[Scheduler] Started: interval = ${config.crawl.intervalHours}h, first run in ${initialDelay / 1000}s`);
}

/**
 * 停止定时爬取
 */
export function stopScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log('[Scheduler] Stopped');
  }
}

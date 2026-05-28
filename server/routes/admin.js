import { runCrawl } from '../modules/crawler/crawler-service.js';
import config from '../config.js';

/**
 * 管理员路由 — POST /api/admin/crawl
 * 契约: docs/api-contracts.md
 * 安全: INV-8 需要鉴权
 */
export default async function adminRoutes(fastify) {
  // POST /api/admin/crawl — 手动触发爬取
  fastify.post('/api/admin/crawl', async (request, reply) => {
    // INV-8: 鉴权检查（仅接受 Authorization header，不读 query string）
    const authHeader = request.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');

    if (!token || token !== config.admin.token) {
      reply.code(401);
      return { error: 'Unauthorized: invalid or missing admin token' };
    }

    // 异步执行爬取，立即返回
    runCrawl(request.body || {}).then(result => {
      console.log('[Admin] Manual crawl completed:', JSON.stringify(result));
    }).catch(err => {
      console.error('[Admin] Manual crawl failed:', err.message);
    });

    return { status: 'started', message: '爬取任务已启动' };
  });
}

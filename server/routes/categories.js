import { getCategoryStats, getStats } from '../db/news.repository.js';

/**
 * 分类和统计路由
 * 契约: docs/api-contracts.md
 */
export default async function categoryRoutes(fastify) {
  // GET /api/categories — 分类统计
  fastify.get('/api/categories', async () => {
    return getCategoryStats();
  });

  // GET /api/stats — 总览数据
  fastify.get('/api/stats', async () => {
    return getStats();
  });
}

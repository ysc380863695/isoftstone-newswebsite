import { queryOne } from '../db/index.js';

export default async function healthRoutes(fastify) {
  fastify.get('/api/health', async (request, reply) => {
    const newsCount = queryOne('SELECT COUNT(*) as count FROM news');

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        newsCount: newsCount ? newsCount.count : 0,
      },
    };
  });
}

import { listNews, getNewsById } from '../db/news.repository.js';

const VALID_CATEGORIES = [
  '公司动态', '行业报告', '产品发布', '合作签约',
  '财报业绩', '技术创新', '生态合作', '人才招聘',
];
const MAX_PAGE_SIZE = 50;
const MAX_KEYWORD_LENGTH = 100;

/**
 * 新闻路由 — GET /api/news, GET /api/news/:id
 * 契约: docs/api-contracts.md
 */
export default async function newsRoutes(fastify) {
  // GET /api/news — 新闻列表（分页、筛选）
  fastify.get('/api/news', async (request, reply) => {
    const { category, page, pageSize, range, keyword, source } = request.query;

    // 校验 category
    if (category && !VALID_CATEGORIES.includes(category)) {
      reply.code(400);
      return { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` };
    }

    // 校验 page
    let parsedPage = 1;
    if (page !== undefined) {
      parsedPage = parseInt(page, 10);
      if (isNaN(parsedPage) || parsedPage < 1) {
        reply.code(400);
        return { error: 'page must be a positive integer' };
      }
    }

    // 校验 pageSize (H-1: 上限 50)
    let parsedPageSize = 20;
    if (pageSize !== undefined) {
      parsedPageSize = parseInt(pageSize, 10);
      if (isNaN(parsedPageSize) || parsedPageSize < 1) {
        reply.code(400);
        return { error: 'pageSize must be a positive integer' };
      }
      parsedPageSize = Math.min(parsedPageSize, MAX_PAGE_SIZE);
    }

    // 校验 range
    if (range !== undefined) {
      const days = parseInt(range, 10);
      if (isNaN(days) || days < 1 || days > 365) {
        reply.code(400);
        return { error: 'range must be between 1 and 365 days' };
      }
    }

    // 校验 keyword
    if (keyword && keyword.length > MAX_KEYWORD_LENGTH) {
      reply.code(400);
      return { error: `keyword must not exceed ${MAX_KEYWORD_LENGTH} characters` };
    }

    // 校验 source
    if (source && !['official', 'media'].includes(source)) {
      reply.code(400);
      return { error: 'source must be "official" or "media"' };
    }

    const result = listNews({
      category,
      page: parsedPage,
      pageSize: parsedPageSize,
      range,
      keyword,
      source,
    });

    return result;
  });

  // GET /api/news/:id — 新闻详情
  fastify.get('/api/news/:id', async (request, reply) => {
    const { id } = request.params;
    const newsId = parseInt(id, 10);

    if (isNaN(newsId) || newsId < 1) {
      reply.code(400);
      return { error: 'Invalid news ID' };
    }

    const news = getNewsById(newsId);

    if (!news) {
      reply.code(404);
      return { error: 'News not found' };
    }

    return news;
  });
}

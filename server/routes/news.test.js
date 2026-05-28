import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import initSqlJs from 'sql.js';
import { __setDb, initSchema } from '../db/index.js';
import { insertNews, listNews } from '../db/news.repository.js';
import newsRoutes from './news.js';

describe('news routes', () => {
  let app;

  before(async () => {
    // Set up in-memory database
    const SQL = await initSqlJs();
    const mockDb = new SQL.Database();
    initSchema(mockDb);
    __setDb(mockDb);

    // Insert test data
    insertNews({
      title: '新闻一',
      summary: '摘要一',
      content: '内容一',
      category: '公司动态',
      source: 'isoftstone.com',
      sourceUrl: 'http://test.com/1',
      publishDate: '2026-05-01',
    });
    insertNews({
      title: '新闻二',
      summary: '摘要二',
      category: '行业报告',
      source: 'media',
      sourceUrl: 'http://test.com/2',
      publishDate: '2026-05-15',
    });
    insertNews({
      title: '新闻三',
      summary: '关于AI的讨论',
      category: '技术创新',
      sourceUrl: 'http://test.com/3',
      publishDate: '2026-05-20',
    });

    // Create Fastify instance and register routes
    app = Fastify();
    await app.register(newsRoutes);
  });

  after(async () => {
    await app.close();
  });

  describe('GET /api/news', () => {
    it('returns paginated news list with 200', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/news' });
      assert.equal(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assert.equal(body.total, 3);
      assert.equal(body.page, 1);
      assert.equal(body.pageSize, 20);
      assert.equal(body.data.length, 3);
    });

    it('returns 400 for invalid category', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/news?category=invalid' });
      assert.equal(res.statusCode, 400);
      const body = JSON.parse(res.body);
      assert.ok(body.error.includes('Invalid category'));
    });

    it('returns 400 for negative page', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/news?page=-1' });
      assert.equal(res.statusCode, 400);
      const body = JSON.parse(res.body);
      assert.ok(body.error.includes('page must be a positive integer'));
    });

    it('caps pageSize at 50', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/news?pageSize=100' });
      assert.equal(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assert.equal(body.pageSize, 50);
    });

    it('returns 400 for oversized keyword (>100)', async () => {
      const longKeyword = 'a'.repeat(101);
      const res = await app.inject({ method: 'GET', url: `/api/news?keyword=${longKeyword}` });
      assert.equal(res.statusCode, 400);
      const body = JSON.parse(res.body);
      assert.ok(body.error.includes('keyword'));
    });

    it('returns 400 for invalid source', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/news?source=invalid' });
      assert.equal(res.statusCode, 400);
      const body = JSON.parse(res.body);
      assert.ok(body.error.includes('source'));
    });
  });

  describe('GET /api/news/:id', () => {
    it('returns news detail for valid id', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/news/1' });
      assert.equal(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assert.equal(body.id, 1);
      assert.equal(body.title, '新闻一');
      assert.equal(body.sourceUrl, 'http://test.com/1');
    });

    it('returns 404 for non-existent id', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/news/9999' });
      assert.equal(res.statusCode, 404);
      const body = JSON.parse(res.body);
      assert.equal(body.error, 'News not found');
    });

    it('returns 400 for invalid id format', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/news/abc' });
      assert.equal(res.statusCode, 400);
      const body = JSON.parse(res.body);
      assert.ok(body.error.includes('Invalid news ID'));
    });
  });
});

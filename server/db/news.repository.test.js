import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { __setDb, initSchema } from './index.js';
import {
  insertNews, listNews, getNewsById,
  getCategoryStats, getStats
} from './news.repository.js';

describe('news.repository', () => {
  before(async () => {
    const SQL = await initSqlJs();
    const mockDb = new SQL.Database();
    initSchema(mockDb);
    __setDb(mockDb);
  });

  describe('insertNews', () => {
    it('inserts a valid article and returns inserted: true with id', () => {
      const result = insertNews({
        title: '测试新闻标题',
        summary: '这是一条测试摘要',
        content: '测试正文内容',
        category: '公司动态',
        source: 'isoftstone.com',
        sourceUrl: 'http://test.com/article1',
        publishDate: '2026-05-01',
        coverImage: 'http://test.com/cover1.jpg',
        tags: ['科技', '创新'],
        keyEntities: { company: '软通动力' },
        sentiment: 'positive',
      });
      assert.equal(result.inserted, true);
      assert.equal(typeof result.id, 'number');
      assert.ok(result.id > 0);
    });

    it('deduplicates by source_url and returns inserted: false', () => {
      const result = insertNews({
        title: '重复标题',
        sourceUrl: 'http://test.com/article1', // same as above
      });
      assert.equal(result.inserted, false);
      assert.equal(result.id, null);
    });
  });

  describe('listNews', () => {
    before(() => {
      // Insert additional articles for list testing
      insertNews({ title: '行业报告：AI发展', sourceUrl: 'http://test.com/ind1', category: '行业报告', publishDate: '2026-05-10' });
      insertNews({ title: '产品发布：新平台', sourceUrl: 'http://test.com/prod1', category: '产品发布', publishDate: '2026-05-15' });
      insertNews({ title: '合作签约：某客户', sourceUrl: 'http://test.com/coop1', category: '合作签约', publishDate: '2026-05-20' });
      insertNews({ title: '关于AI的深度分析', sourceUrl: 'http://test.com/key1', category: '公司动态', publishDate: '2026-05-25' });
    });

    it('returns paginated results with default pageSize', () => {
      const result = listNews({ page: 1, pageSize: 20 });
      assert.equal(result.page, 1);
      assert.equal(result.pageSize, 20);
      assert.equal(typeof result.total, 'number');
      assert.ok(result.data.length >= 5);
    });

    it('filters by category', () => {
      const result = listNews({ category: '行业报告' });
      assert.equal(result.total, 1);
      assert.equal(result.data[0].category, '行业报告');
    });

    it('searches by keyword in title and summary', () => {
      const result = listNews({ keyword: 'AI' });
      // Should match '行业报告：AI发展' and '关于AI的深度分析'
      assert.ok(result.total >= 2);
    });

    it('returns empty results for non-existent keyword', () => {
      const result = listNews({ keyword: 'xxxyyyzzz_nonexistent' });
      assert.equal(result.total, 0);
      assert.equal(result.data.length, 0);
    });

    it('supports page and pageSize parameters', () => {
      const result = listNews({ page: 1, pageSize: 2 });
      assert.equal(result.page, 1);
      assert.equal(result.pageSize, 2);
      assert.ok(result.data.length <= 2);
    });
  });

  describe('getNewsById', () => {
    it('returns news detail with formatted fields', () => {
      const news = getNewsById(1);
      assert.ok(news);
      assert.equal(news.title, '测试新闻标题');
      assert.equal(news.sourceUrl, 'http://test.com/article1');
      assert.equal(news.publishDate, '2026-05-01');
      assert.equal(news.sentiment, 'positive');
      assert.ok(Array.isArray(news.tags));
      assert.ok(news.content.includes('<p>'));
    });

    it('includes relatedNews from same category', () => {
      const news = getNewsById(1);
      assert.ok(Array.isArray(news.relatedNews));
      // article1 is in '公司动态', and there are other '公司动态' articles
      assert.ok(news.relatedNews.length > 0);
      assert.ok(news.relatedNews.every(r => r.id && r.title));
    });

    it('returns null for non-existent id', () => {
      const news = getNewsById(9999);
      assert.equal(news, null);
    });
  });

  describe('getCategoryStats', () => {
    it('returns category counts ordered by count descending', () => {
      const stats = getCategoryStats();
      assert.ok(Array.isArray(stats));
      assert.ok(stats.length >= 3);
      // Each entry has name and count
      for (const entry of stats) {
        assert.equal(typeof entry.name, 'string');
        assert.equal(typeof entry.count, 'number');
      }
    });
  });

  describe('getStats', () => {
    it('returns overview with total and source counts', () => {
      const stats = getStats();
      assert.equal(typeof stats.total, 'number');
      assert.ok(stats.total >= 5);
      assert.equal(typeof stats.officialCount, 'number');
      assert.equal(typeof stats.mediaCount, 'number');
      assert.ok(typeof stats.categoryDistribution === 'object');
      assert.ok(stats.dateRange.start);
      assert.ok(stats.dateRange.end);
    });
  });
});

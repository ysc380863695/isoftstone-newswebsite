import { queryAll, queryOne, run } from '../db/index.js';

// ========== 新闻 CRUD ==========

const VALID_CATEGORIES = [
  '公司动态', '行业报告', '产品发布', '合作签约',
  '财报业绩', '技术创新', '生态合作', '人才招聘',
];

/**
 * 分页查询新闻列表
 * 契约: GET /api/news
 */
export function listNews({ category, page = 1, pageSize = 20, range = '3650d', keyword, source } = {}) {
  const clauses = ['1=1'];
  const params = [];

  // 时间范围过滤 (INV-4: 只展示30天内)
  // range 格式: '30d' → SQLite modifier '-30 day'
  const days = parseInt(range, 10) || 3650;
  clauses.push("publish_date >= date('now', ? || ' day')");
  params.push(`-${days}`);

  if (category) {
    clauses.push('category = ?');
    params.push(category);
  }

  if (keyword) {
    clauses.push('(title LIKE ? OR summary LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (source) {
    clauses.push('source = ?');
    params.push(source);
  }

  const where = clauses.join(' AND ');

  // 总数
  const { count } = queryOne(`SELECT COUNT(*) as count FROM news WHERE ${where}`, params);

  // 分页数据
  const offset = (page - 1) * pageSize;
  const rows = queryAll(
    `SELECT id, title, summary, category, source, source_url, publish_date, cover_image, tags, key_entities
     FROM news WHERE ${where}
     ORDER BY publish_date DESC, id DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return {
    total: count,
    page,
    pageSize,
    data: rows.map(formatNewsRow),
  };
}

/**
 * 获取单条新闻详情
 * 契约: GET /api/news/:id
 */
export function getNewsById(id) {
  const row = queryOne('SELECT * FROM news WHERE id = ?', [id]);
  if (!row) return null;

  const news = formatNewsDetail(row);

  // 关联新闻：同分类取5条
  news.relatedNews = queryAll(
    'SELECT id, title, summary FROM news WHERE category = ? AND id != ? ORDER BY publish_date DESC LIMIT 5',
    [row.category, id]
  ).map(r => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
  }));

  return news;
}

/**
 * 插入新闻（去重 by source_url）
 */
export function insertNews(article) {
  try {
    const result = run(
      `INSERT INTO news (title, summary, content, category, source, source_url, publish_date, cover_image, tags, key_entities, sentiment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        article.title,
        article.summary || null,
        article.content || null,
        article.category || '公司动态',
        article.source || null,
        article.sourceUrl,
        article.publishDate || null,
        article.coverImage || null,
        JSON.stringify(article.tags || []),
        JSON.stringify(article.keyEntities || {}),
        article.sentiment || 'neutral',
      ]
    );
    return { inserted: true, id: result.lastInsertRowid };
  } catch (err) {
    // UNIQUE(source_url) 冲突 → 已存在
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return { inserted: false, id: null };
    }
    throw err;
  }
}

/**
 * 批量插入新闻，返回新增数量
 */
export function insertNewsBatch(articles) {
  let newCount = 0;
  for (const article of articles) {
    const result = insertNews(article);
    if (result.inserted) newCount++;
  }
  return newCount;
}

/**
 * 更新新闻的 AI 处理结果
 */
export function updateNewsAiFields(id, fields) {
  const sets = [];
  const params = [];

  if (fields.summary !== undefined) { sets.push('summary = ?'); params.push(fields.summary); }
  if (fields.category !== undefined) { sets.push('category = ?'); params.push(fields.category); }
  if (fields.tags !== undefined) { sets.push('tags = ?'); params.push(JSON.stringify(fields.tags)); }
  if (fields.keyEntities !== undefined) { sets.push('key_entities = ?'); params.push(JSON.stringify(fields.keyEntities)); }
  if (fields.sentiment !== undefined) { sets.push('sentiment = ?'); params.push(fields.sentiment); }
  if (fields.contentVector !== undefined) { sets.push('content_vector = ?'); params.push(JSON.stringify(fields.contentVector)); }

  if (sets.length === 0) return;

  sets.push("updated_at = datetime('now')");
  params.push(id);

  run(`UPDATE news SET ${sets.join(', ')} WHERE id = ?`, params);
}

/**
 * 删除超过365天的新闻 (INV-4)
 */
export function deleteOldNews() {
  const result = run("DELETE FROM news WHERE publish_date < date('now', '-365 day')");
  return result.changes;
}

// ========== 分类统计 ==========

/**
 * 分类统计
 * 契约: GET /api/categories
 */
export function getCategoryStats() {
  const rows = queryAll(
    "SELECT category as name, COUNT(*) as count FROM news GROUP BY category ORDER BY count DESC"
  );
  return rows;
}

/**
 * 总览统计
 * 契约: GET /api/stats
 */
export function getStats() {
  const total = queryOne("SELECT COUNT(*) as count FROM news");

  const official = queryOne("SELECT COUNT(*) as count FROM news WHERE source = 'isoftstone.com'");

  const media = queryOne("SELECT COUNT(*) as count FROM news WHERE source != 'isoftstone.com'");

  const distribution = {};
  for (const row of getCategoryStats()) {
    distribution[row.name] = row.count;
  }

  const dateRange = queryOne(
    "SELECT MIN(publish_date) as start, MAX(publish_date) as end FROM news"
  );

  return {
    total: total ? total.count : 0,
    officialCount: official ? official.count : 0,
    mediaCount: media ? media.count : 0,
    categoryDistribution: distribution,
    dateRange: dateRange || { start: null, end: null },
  };
}

// ========== 爬取日志 ==========

export function createCrawlLog() {
  const result = run("INSERT INTO crawl_log (status) VALUES ('running')");
  return result.lastInsertRowid;
}

export function updateCrawlLog(id, fields) {
  const sets = [];
  const params = [];

  if (fields.status !== undefined) { sets.push('status = ?'); params.push(fields.status); }
  if (fields.finishedAt !== undefined) { sets.push('finished_at = ?'); params.push(fields.finishedAt); }
  if (fields.articlesFound !== undefined) { sets.push('articles_found = ?'); params.push(fields.articlesFound); }
  if (fields.articlesNew !== undefined) { sets.push('articles_new = ?'); params.push(fields.articlesNew); }
  if (fields.error !== undefined) { sets.push('error = ?'); params.push(fields.error); }

  if (sets.length === 0) return;
  params.push(id);
  run(`UPDATE crawl_log SET ${sets.join(', ')} WHERE id = ?`, params);
}

// ========== 问答 ==========

export function createChatSession(sessionId) {
  run('INSERT OR IGNORE INTO chat_session (id) VALUES (?)', [sessionId]);
}

export function saveChatMessage(sessionId, role, content, sources = null) {
  run(
    'INSERT INTO chat_message (session_id, role, content, sources) VALUES (?, ?, ?, ?)',
    [sessionId, role, content, sources ? JSON.stringify(sources) : null]
  );
}

export function getChatHistory(sessionId, limit = 20) {
  return queryAll(
    'SELECT role, content, sources FROM chat_message WHERE session_id = ? ORDER BY created_at DESC LIMIT ?',
    [sessionId, limit]
  ).reverse();
}

// ========== 向量搜索 ==========

/**
 * 获取所有带向量的新闻（用于 RAG 检索）
 */
export function getAllNewsWithVectors() {
  return queryAll(
    'SELECT id, title, summary, content_vector FROM news WHERE content_vector IS NOT NULL'
  ).map(row => ({
    ...row,
    content_vector: JSON.parse(row.content_vector),
  }));
}

// ========== 格式化 ==========

function formatNewsRow(row) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    category: row.category,
    source: row.source,
    sourceUrl: row.source_url,
    publishDate: row.publish_date,
    coverImage: row.cover_image,
    tags: safeParseJSON(row.tags, []),
    keyEntities: safeParseJSON(row.key_entities, {}),
  };
}

function formatNewsDetail(row) {
  return {
    ...formatNewsRow(row),
    content: row.content,
    sentiment: row.sentiment,
    relatedNews: [],
  };
}

function safeParseJSON(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

import config from '../../config.js';

const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';
const TAVILY_EXTRACT_URL = 'https://api.tavily.com/extract';
const DEFAULT_TIMEOUT = 30_000;

function createTimeoutSignal(ms = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

/**
 * Tavily 搜索 — 返回新闻搜索结果
 * @param {string} query - 搜索关键词
 * @param {object} opts - 可选参数
 * @returns {Promise<Array>} 搜索结果数组
 */
export async function search(query, opts = {}) {
  const body = {
    query,
    search_depth: opts.searchDepth || 'basic',
    max_results: opts.maxResults || 10,
    include_raw_content: opts.includeRawContent !== false,
    include_domains: opts.includeDomains || [],
    exclude_domains: opts.excludeDomains || [],
    topic: opts.topic || 'news',
    days: opts.days || 30,
  };

  const response = await fetch(TAVILY_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: config.tavily.apiKey,
      ...body,
    }),
    signal: createTimeoutSignal(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tavily search error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Tavily 提取 — 从 URL 提取正文内容
 * @param {string[]} urls - 要提取的 URL 列表
 * @returns {Promise<Array>} 提取结果
 */
export async function extract(urls) {
  if (!urls || urls.length === 0) return [];

  const response = await fetch(TAVILY_EXTRACT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: config.tavily.apiKey,
      urls,
      extract_depth: 'advanced',
    }),
    signal: createTimeoutSignal(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tavily extract error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * 将 Tavily 搜索结果标准化为内部文章格式
 */
export function normalizeSearchResult(result) {
  return {
    title: result.title || '',
    content: result.raw_content || result.content || '',
    summary: result.content || '',
    sourceUrl: result.url || '',
    source: extractDomain(result.url),
    publishDate: result.published_date || null,
    coverImage: null,
  };
}

function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    // 把 www. 前缀去掉
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

import { search, normalizeSearchResult } from './tavily-client.js';
import { insertNews, deleteOldNews, createCrawlLog, updateCrawlLog } from '../../db/news.repository.js';
import { processAndSave } from '../ai/pipeline.js';
import config from '../../config.js';

/**
 * 判断文章是否中文且与软通动力相关
 */
function isChineseAndSoftStone(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  // 必须包含软通相关关键词
  const softstoneKw = ['软通', 'isoftstone', '301236', '软通动力'];
  const isSoftStone = softstoneKw.some(kw => text.includes(kw));
  // 必须包含中文字符
  const hasChinese = /[\u4e00-\u9fff]/.test(text);
  return isSoftStone && hasChinese;
}

/**
 * 执行一次完整的爬取流程:
 * 1. Tavily 搜索新闻
 * 2. 标准化 + 过滤空 URL (INV-5)
 * 3. 逐条入库 + AI 处理（去重 by source_url）
 * 4. 清理30天外数据 (INV-4)
 *
 * @param {object} [overrides] - 可选覆盖搜索参数
 * @returns {object} 爬取结果摘要
 */
export async function runCrawl(overrides = {}) {
  const logId = createCrawlLog();

  try {
    // Step 1: Tavily 搜索
    const query = overrides.query || config.crawl.query;
    const results = await search(query, {
      maxResults: overrides.maxResults || 15,
      days: overrides.days || 30,
      topic: 'news',
      includeRawContent: true,
    });

    // Step 2: 标准化 + 过滤（只保留中文+软通相关文章）
    const articles = results
      .map(normalizeSearchResult)
      .filter(a => a.title && a.sourceUrl) // INV-5: sourceUrl 不可为空
      .filter(a => isChineseAndSoftStone(a.title, a.content));

    // Step 3: 逐条入库 + AI 处理
    let newCount = 0;
    let aiProcessed = 0;
    let aiErrors = 0;

    for (const article of articles) {
      try {
        const { inserted, id } = insertNews(article);

        if (inserted && id) {
          newCount++;

          // AI 处理新文章（有足够内容的才处理）
          if (article.content && article.content.length >= 50) {
            try {
              await processAndSave(id, article.title, article.content);
              aiProcessed++;
            } catch (aiErr) {
              aiErrors++;
              console.error(`[Crawler] AI failed for "${article.title.slice(0, 50)}":`, aiErr.message);
            }
          }
        }
      } catch (err) {
        console.error(`[Crawler] Insert failed for "${article.title.slice(0, 50)}":`, err.message);
      }
    }

    // Step 4: 清理旧数据 (INV-4)
    const deleted = deleteOldNews();

    // 更新爬取日志
    updateCrawlLog(logId, {
      status: 'completed',
      finishedAt: new Date().toISOString(),
      articlesFound: articles.length,
      articlesNew: newCount,
    });

    return {
      status: 'completed',
      articlesFound: articles.length,
      articlesNew: newCount,
      aiProcessed,
      aiErrors,
      articlesDeleted: deleted,
    };
  } catch (err) {
    updateCrawlLog(logId, {
      status: 'failed',
      finishedAt: new Date().toISOString(),
      error: err.message,
    });

    throw err;
  }
}

import { chatCompletion, getEmbedding } from './llm-client.js';
import { updateNewsAiFields, getAllNewsWithVectors } from '../../db/news.repository.js';

const VALID_CATEGORIES = [
  '公司动态', '行业报告', '产品发布', '合作签约',
  '财报业绩', '技术创新', '生态合作', '人才招聘',
];

/**
 * AI 处理管道 — 对单条新闻进行：分类 + 摘要 + 实体提取 + 情感分析
 * 返回处理结果，不直接写库（调用方决定是否持久化）
 */
export async function processArticle(title, content) {
  const prompt = `你是一个新闻分析助手。请分析以下新闻，返回JSON格式的结果。

新闻标题：${title}
新闻正文：${(content || '').slice(0, 3000)}

请返回以下JSON格式：
{
  "summary": "150字以内的摘要",
  "category": "分类（必须是以下之一：${VALID_CATEGORIES.join('、')}）",
  "tags": ["标签1", "标签2", "标签3"],
  "keyEntities": {
    "people": ["人名"],
    "companies": ["公司名"],
    "numbers": ["关键数字"]
  },
  "sentiment": "positive/negative/neutral"
}`;

  const raw = await chatCompletion({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    maxTokens: 800,
    json: true,
  });

  try {
    const result = JSON.parse(raw);

    // 校验分类
    if (!VALID_CATEGORIES.includes(result.category)) {
      result.category = '公司动态';
    }

    // 校验摘要长度 (INV-6: 不超过200字)
    if (result.summary && result.summary.length > 200) {
      result.summary = result.summary.slice(0, 197) + '...';
    }

    // 校验情感
    if (!['positive', 'negative', 'neutral'].includes(result.sentiment)) {
      result.sentiment = 'neutral';
    }

    return result;
  } catch (err) {
    console.error('Failed to parse AI response:', raw?.slice(0, 200));
    throw new Error(`AI pipeline parse error: ${err.message}`);
  }
}

/**
 * 生成向量嵌入（用于 RAG）
 * 如果 embedding API 不可用，使用简单的 TF-IDF 风格关键词向量
 */
export async function generateEmbedding(text) {
  const embedding = await getEmbedding(text);
  if (embedding) return embedding;

  // Fallback: 简单哈希向量（128维）
  return simpleHashVector(text);
}

/**
 * 处理新闻并更新数据库
 */
export async function processAndSave(newsId, title, content) {
  const aiResult = await processArticle(title, content);

  const embedding = await generateEmbedding(`${title} ${content || ''}`.slice(0, 1000));

  updateNewsAiFields(newsId, {
    summary: aiResult.summary,
    category: aiResult.category,
    tags: aiResult.tags,
    keyEntities: aiResult.keyEntities,
    sentiment: aiResult.sentiment,
    contentVector: embedding,
  });

  return aiResult;
}

// ========== 向量搜索 ==========

/**
 * 余弦相似度
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * RAG 检索：根据查询向量找最相似的新闻
 */
export async function ragSearch(queryText, topK = 5) {
  const queryVector = await generateEmbedding(queryText);
  const allNews = getAllNewsWithVectors();

  const scored = allNews.map(news => ({
    id: news.id,
    title: news.title,
    summary: news.summary,
    score: cosineSimilarity(queryVector, news.content_vector),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter(s => s.score > 0.1);
}

// ========== 简单哈希向量 fallback ==========

function simpleHashVector(text) {
  const dim = 128;
  const vec = new Array(dim).fill(0);

  // 使用字符 bigram + unigram，适合中文
  const cleaned = text.replace(/[\s,，。.!！?？;；:：、\n\r]+/g, '');
  for (let i = 0; i < cleaned.length - 1; i++) {
    // bigram
    const bigram = cleaned[i] + cleaned[i + 1];
    const idx = Math.abs(hashStr(bigram)) % dim;
    vec[idx] += 1;
  }
  // unigram（权重较低）
  for (const ch of cleaned) {
    const idx = Math.abs(hashStr(ch)) % dim;
    vec[idx] += 0.3;
  }
  // 归一化
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return norm === 0 ? vec : vec.map(v => v / norm);
}

function hashStr(s) {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return hash;
}

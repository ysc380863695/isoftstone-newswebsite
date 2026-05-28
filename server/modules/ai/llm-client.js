import config from '../../config.js';

const DEFAULT_TIMEOUT = 30_000; // 30 秒
const STREAM_TIMEOUT = 60_000;  // 流式 60 秒

/**
 * LLM 客户端 — Anthropic Messages API 兼容
 * DeepSeek / Anthropic 协议：POST /v1/messages
 */

function createTimeoutSignal(ms = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

/**
 * 分离 system 消息和 user/assistant 消息（Anthropic 格式要求）
 */
function splitMessages(messages) {
  const systemMsgs = [];
  const conversation = [];
  for (const m of messages) {
    if (m.role === 'system') {
      systemMsgs.push(m.content);
    } else {
      conversation.push(m);
    }
  }
  return {
    system: systemMsgs.length > 0 ? systemMsgs.join('\n\n') : undefined,
    messages: conversation,
  };
}

/**
 * 非流式聊天
 */
export async function chatCompletion({ messages, temperature = 0.3, maxTokens = 1000, json = false }) {
  const { system, messages: conversation } = splitMessages(messages);
  const url = `${config.llm.baseUrl}/v1/messages`;

  const body = {
    model: config.llm.model,
    messages: conversation,
    max_tokens: maxTokens,
    temperature,
  };

  if (system) body.system = system;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.llm.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
    signal: createTimeoutSignal(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  // Anthropic 响应: content 数组，过滤出 text 类型（推理模型还有 thinking 类型）
  const textBlock = data.content?.find(c => c.type === 'text');
  const text = textBlock?.text || '';

  // 如果要求 JSON 输出，尝试提取 JSON 块
  if (json) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : text;
  }
  return text;
}

/**
 * LLM 嵌入向量 — Anthropic API 通常不提供 embedding，使用 fallback
 */
export async function getEmbedding(text) {
  // Anthropic 协议无 embedding 端点，直接使用 fallback
  console.warn('[LLM] Embedding API not available via Anthropic protocol, using fallback');
  return null;
}

/**
 * 流式聊天 — 返回 fetch Response（SSE 格式，Anthropic 协议）
 */
export function chatCompletionStream({ messages, temperature = 0.3 }) {
  const { system, messages: conversation } = splitMessages(messages);
  const url = `${config.llm.baseUrl}/v1/messages`;

  const body = {
    model: config.llm.model,
    messages: conversation,
    max_tokens: 8192,
    temperature,
    stream: true,
  };

  if (system) body.system = system;

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.llm.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
    signal: createTimeoutSignal(STREAM_TIMEOUT),
  });
}

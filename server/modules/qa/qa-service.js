import { chatCompletionStream } from '../ai/llm-client.js';

const SYSTEM_PROMPT = `你是软通动力(iSoftStone)新闻中心的AI助手。你可以帮助用户了解软通动力最新动态、解答相关问题。

软通动力是中国领先的软件与信息技术服务商，深交所上市（股票代码301236），业务涵盖咨询与解决方案、云智能、数字基础设施、人工智能、工业互联网等领域。

回答要求：
- 专业、友好、简洁
- 涉及新闻时尽量提供具体信息
- 不确定时诚实告知，不编造`;

/**
 * 流式问答 — 基础对话模式（RAG 待后续接入）
 * @param {string} userMessage 用户问题
 * @param {string} sessionId 会话ID
 * @returns {{ response: Response, sources: Array, sessionId: string }}
 */
export async function askQuestionStream(userMessage, sessionId) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ];

  const response = await chatCompletionStream({
    messages,
    temperature: 0.7,
  });

  return {
    response,
    sources: [],
    sessionId,
  };
}

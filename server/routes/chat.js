import websocket from '@fastify/websocket';
import { askQuestionStream } from '../modules/qa/qa-service.js';
import { saveChatMessage } from '../db/news.repository.js';

const RATE_LIMIT_WINDOW = 60_000; // 1 分钟
const RATE_LIMIT_MAX = 10;        // 每分钟最多 10 条

/**
 * WebSocket 聊天路由 — WS /api/chat
 * 契约: docs/api-contracts.md
 */
export default async function chatRoutes(fastify) {
  await fastify.register(websocket);

  fastify.register(async function (fastify) {
    fastify.get('/api/chat', { websocket: true }, (connection, req) => {
      fastify.log.info('[Chat] WebSocket client connected');

      // 每连接速率限制
      const messageTimestamps = [];
      let isProcessing = false;

      connection.on('message', async (rawMessage) => {
        try {
          // 速率限制: 滑动窗口
          const now = Date.now();
          const windowStart = now - RATE_LIMIT_WINDOW;
          while (messageTimestamps.length > 0 && messageTimestamps[0] < windowStart) {
            messageTimestamps.shift();
          }

          if (messageTimestamps.length >= RATE_LIMIT_MAX) {
            connection.send(JSON.stringify({
              type: 'error',
              content: 'Rate limit exceeded. Please wait before sending another message.',
            }));
            return;
          }

          // 并发保护: 上一条还在处理中
          if (isProcessing) {
            connection.send(JSON.stringify({
              type: 'error',
              content: 'Previous message is still being processed.',
            }));
            return;
          }

          const message = JSON.parse(rawMessage.toString());

          if (message.type !== 'message' || !message.content) {
            connection.send(JSON.stringify({
              type: 'error',
              content: 'Invalid message format',
            }));
            return;
          }

          const { content, sessionId } = message;

          messageTimestamps.push(now);
          isProcessing = true;

          // 流式问答
          const { response, sources, sessionId: sid } = await askQuestionStream(
            content,
            sessionId || generateSessionId()
          );

          // 发送来源
          if (sources.length > 0) {
            connection.send(JSON.stringify({
              type: 'sources',
              news: sources,
            }));
          }

          // 流式转发 LLM tokens
          if (!response.ok) {
            connection.send(JSON.stringify({
              type: 'error',
              content: 'LLM stream error',
            }));
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullAnswer = '';
          let buffer = '';
          let currentBlockType = null;  // 'thinking' | 'text' | null — 跳过推理块

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });

              // 解析 SSE data lines
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const data = line.slice(6).trim();

                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);

                  // 跟踪当前 block 类型（thinking vs text）
                  if (parsed.type === 'content_block_start') {
                    currentBlockType = parsed.content_block?.type || null;
                    continue;
                  }
                  if (parsed.type === 'content_block_stop') {
                    currentBlockType = null;
                    continue;
                  }

                  // 只转发 text 类型的 token，跳过 thinking
                  if (parsed.type === 'content_block_delta' && currentBlockType === 'text' && parsed.delta?.text) {
                    const token = parsed.delta.text;
                    fullAnswer += token;
                    connection.send(JSON.stringify({
                      type: 'token',
                      content: token,
                    }));
                  }
                } catch {
                  // 忽略解析错误
                }
              }
            }

            // 保存完整对话
            saveChatMessage(sid, 'user', content);
            saveChatMessage(sid, 'assistant', fullAnswer, sources);

            // 发送完成信号
            connection.send(JSON.stringify({
              type: 'done',
              sessionId: sid,
            }));
            isProcessing = false;
          } catch (streamErr) {
            isProcessing = false;
            fastify.log.error({ err: streamErr }, '[Chat] Stream read error');
            connection.send(JSON.stringify({
              type: 'error',
              content: 'Stream interrupted',
            }));
          }
        } catch (err) {
          isProcessing = false;
          fastify.log.error({ err }, '[Chat] Message handling error');
          connection.send(JSON.stringify({
            type: 'error',
            content: err.message,
          }));
        }
      });

      connection.on('close', () => {
        fastify.log.info('[Chat] WebSocket client disconnected');
      });
    });
  });
}

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

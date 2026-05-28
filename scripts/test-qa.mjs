import { askQuestionStream } from "../server/modules/qa/qa-service.js";

async function main() {
  console.log('[TEST] Starting QA pipeline test...');
  const startTime = Date.now();
  try {
    const result = await askQuestionStream("软通动力最近有什么合作？", "test_session");
    console.log(`[TEST] askQuestionStream returned after ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    console.log('[TEST] Response status:', result.response?.status);
    console.log('[TEST] Sources count:', result.sources?.length);

    if (!result.response?.ok) {
      console.log('[TEST] Response not OK, status:', result.response?.status);
      return;
    }

    // Read stream
    const reader = result.response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let tokenCount = 0;
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            tokenCount++;
            fullText += parsed.delta.text;
          }
        } catch {}
      }
    }
    console.log(`[TEST] Stream complete: ${tokenCount} tokens in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    console.log('[TEST] Full text:', fullText.slice(0, 500));
  } catch (err) {
    console.error(`[TEST] Error after ${((Date.now() - startTime) / 1000).toFixed(1)}s:`, err.message);
    console.error('[TEST] Stack:', err.stack?.split('\n').slice(0, 5).join('\n'));
  }
}

main();

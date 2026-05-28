import { chatCompletion } from "../server/modules/ai/llm-client.js";

try {
  const result = await chatCompletion({
    messages: [
      { role: "system", content: "你是一个测试助手。只回复'测试成功'两个字。" },
      { role: "user", content: "你好" },
    ],
    temperature: 0.3,
    maxTokens: 2000,
  });
  console.log("Result:", result);
  console.log("TEST", result.includes("成功") ? "PASSED" : "CHECK");
} catch (e) {
  console.error("Error:", e.message);
}

# Review: Backend (server/)

> 审查日期: 2026-05-27
> 审查范围: server/ 全部代码（15个文件）
> 审查依据: api-contracts.md, invariants.md, architecture.md

## 总结

| 级别 | 数量 |
|------|------|
| CRITICAL | 2 |
| HIGH | 5 |
| MEDIUM | 5 |

**Verdict: [BLOCK]**

存在 CRITICAL 级别安全/资源问题，且数据管道可靠性(RD-2)和资源效率(RD-3)维度为 WEAK。

---

## CRITICAL

### C-1: Chat WebSocket 无速率限制 — LLM API 滥用风险

**文件**: `server/routes/chat.js:16`
**不变量**: INV-2 (API响应<3s), 资源约束

WebSocket `/api/chat` 端点无鉴权、无速率限制。每次消息触发 RAG 检索 + LLM 流式调用，攻击者可快速发送大量消息：
- 消耗 LLM API 额度（按 token 计费）
- 触发 `getAllNewsWithVectors()` 全表加载，内存暴涨
- 占满服务器 4G 内存

**建议**: 添加每连接/每 IP 速率限制（如 10条/分钟），或在连接时做简单鉴权。

### C-2: sql.js 每次 write 全库写盘 — 阻塞事件循环

**文件**: `server/db/index.js:131-141`

```js
export function run(sql, params = []) {
  db.run(sql, params);
  // ...
  saveDb();  // ← fs.writeFileSync 全库序列化
}
```

每次 INSERT/UPDATE 都调用 `saveDb()` → `fs.writeFileSync`，将整个 SQLite 数据库序列化到磁盘。在爬取流程中，15条新闻 × 每条多次 write = 数十次同步写盘。

随着数据增长到 INV-3 上限 (100MB)：
- 每次 write 需要写 100MB 到磁盘
- 阻塞 Node.js 事件循环数百毫秒
- 所有 API 请求在此期间卡住

**建议**:
1. 改用 `better-sqlite3`（原生绑定，直接操作文件，无需手动序列化）
2. 或改为定时批量 saveDb（如每 5 秒一次），而非每次 write 都 save

---

## HIGH

### H-1: pageSize 无上限 — 可耗尽内存

**文件**: `server/routes/news.js:15`, `server/db/news.repository.js:14`

`pageSize` 直接从 query string 传入 `listNews`，无上限校验。客户端可传 `pageSize=100000`，导致：
- SQLite 返回巨大结果集
- 序列化为 JSON 消耗大量内存
- 3M 带宽下响应时间远超 INV-2 (3s)

**建议**: 在路由层 cap `pageSize` 为 `Math.min(parsed, 50)`。

### H-2: 外部 API 调用无超时和重试

**文件**: `server/modules/ai/llm-client.js:22-37`, `server/modules/crawler/tavily-client.js:24-41`

所有 `fetch` 调用无 `AbortController` 超时机制。如果 Tavily 或 LLM API 挂起：
- 爬取流程中，`processAndSave` 的 LLM 调用永远等待（`crawler-service.js:49`）
- 定时调度器的 `setInterval` 回调堆积
- WebSocket chat 的 LLM 流挂起

**建议**:
```js
const controller = new AbortController();
setTimeout(() => controller.abort(), 30000);
const response = await fetch(url, { ..., signal: controller.signal });
```

### H-3: console.log 残留 — 生产环境日志不结构化

**文件**: 多处
- `crawler-service.js:53,58` — console.error
- `scheduler.js:17-21,29-33` — console.log/error
- `pipeline.js:59-60` — console.error
- `llm-client.js:60` — console.warn
- `chat.js:14,101,108` — console.log/error

Fastify 已配置结构化 logger (`fastify.log`)，但所有模块使用 `console.*`。生产环境下日志丢失 request-id、timestamp 等关键信息。

**建议**: 将 `fastify.log` 通过装饰器注入到各模块，或使用独立 plogger。

### H-4: @fastify/static 已安装但未使用

**文件**: `package.json:16`

```json
"@fastify/static": "^8.1.0"
```

`server/index.js` 未注册 static 插件，前端静态文件无法通过 Node.js 直接访问。如果 Nginx 配置正确则无影响，但本地开发（`npm run dev`）无法同时提供前端页面。

**建议**: 如果 Nginx 负责静态文件，从 dependencies 中移除。如果需要本地开发，在 `index.js` 中注册。

### H-5: RAG 检索加载全量向量 — 内存线性增长

**文件**: `server/modules/ai/pipeline.js:118-128`, `server/db/news.repository.js:248-255`

```js
export function getAllNewsWithVectors() {
  return queryAll('SELECT id, title, summary, content_vector FROM news WHERE content_vector IS NOT NULL')
    .map(row => ({ ...row, content_vector: JSON.parse(row.content_vector) }));
}
```

每次 RAG 查询都执行全表扫描 + JSON.parse 全部向量。假设 1000 条新闻，每条 128 维向量：
- 解析 ~1000 个 JSON 字符串
- 在内存中创建 ~1000 个 128 元素数组
- 再做 O(n) 余弦计算

随数据增长，每次查询的延迟和内存占用线性增长。

**建议**: 缓存向量数据（内存中常驻），或使用增量检索。

---

## MEDIUM

### M-1: CORS 允许任意来源

**文件**: `server/index.js:33-35`

```js
await fastify.register(cors, { origin: true });
```

所有 API 端点允许任何域名跨域请求。生产环境应限制为前端域名。

### M-2: Admin Token 可通过 Query String 传递

**文件**: `server/routes/admin.js:14`

```js
const token = authHeader?.replace('Bearer ', '') || request.query?.token;
```

通过 URL query string 传递 token 会记录在 Nginx access log 和浏览器历史中。应只接受 Authorization header。

### M-3: Fallback 哈希向量质量差

**文件**: `server/modules/ai/pipeline.js:133-161`

128 维 bigram 哈希向量对中文文本区分度很低（碰撞频繁）。如果 embedding API 不可用，RAG 检索效果将严重下降，但不会报错告知用户。

**建议**: 如果 embedding 不可用，在响应中标记 `vectorQuality: 'fallback'`，或直接拒绝 RAG 查询并提示。

### M-4: getEmbedding 使用聊天模型名

**文件**: `server/modules/ai/llm-client.js:52`

```js
body: JSON.stringify({ model: config.llm.model, input: text })
```

嵌入接口通常需要专用的 embedding 模型（如 `text-embedding-3-small`），而非聊天模型（`glm-5`）。如果 `/embeddings` 端点不支持 `glm-5`，会静默 fallback 到哈希向量。

**建议**: 在 config 中增加 `LLM_EMBEDDING_MODEL` 配置项。

### M-5: 聊天历史方向问题

**文件**: `server/db/news.repository.js:236-241`

```js
return queryAll(
  'SELECT ... ORDER BY created_at DESC LIMIT ?',
  [sessionId, limit]
).reverse();
```

查询最新 N 条后 `.reverse()` 反转。如果消息总数 > limit，取到的是最近 N 条而非最早的，导致 LLM 上下文缺少早期对话。

---

## 项目维度评分

| 维度 | 评分 | 说明 |
|------|------|------|
| RD-1 视觉品质 | N/A | 后端无视觉相关 |
| RD-2 数据管道可靠性 | **WEAK** | 爬取链路完整，但无超时/重试/速率限制，外部API挂起会导致管道停滞 |
| RD-3 资源效率 | **WEAK** | sql.js 同步全库写盘 + 全量向量加载，随数据增长将违反 INV-1 和 INV-3 |
| RD-4 API一致性 | **STRONG** | 字段名与 api-contracts.md 完全一致，camelCase 映射正确 |

## API 一致性详细检查

| 端点 | 契约字段 | 实际字段 | 状态 |
|------|---------|---------|------|
| GET /api/news | total, page, pageSize, data | ✓ | OK |
| GET /api/news data[].sourceUrl | sourceUrl | ✓ (formatNewsRow: sourceUrl) | OK |
| GET /api/news data[].publishDate | publishDate | ✓ | OK |
| GET /api/news data[].coverImage | coverImage | ✓ | OK |
| GET /api/news data[].keyEntities | keyEntities | ✓ | OK |
| GET /api/news/:id | content, sentiment, relatedNews | ✓ | OK |
| GET /api/categories | name, count | ✓ | OK |
| GET /api/stats | total, officialCount, mediaCount, categoryDistribution, dateRange | ✓ | OK |
| WS /api/chat | message/token/sources/done types | ✓ | OK |
| POST /api/admin/crawl | status, message | ✓ | OK |

## 安全检查清单

- [x] 无硬编码密钥 — 所有敏感配置通过 .env + config.js
- [x] 无 SQL 注入 — 全部使用参数化查询
- [x] .env 在 .gitignore 中
- [ ] **速率限制缺失** — Chat 端点无限制 (C-1)
- [ ] **输入校验不足** — pageSize 无上限 (H-1)
- [ ] **Token 泄露风险** — admin token 可通过 query string (M-2)

# backend-dev - 任务计划

> 角色: 后端开发（Node.js 22 + Fastify + SQLite）
> 状态: 完成
> 分配的任务: B1-B8

## 任务

- [x] B1: 项目骨架 + Fastify + SQLite初始化 ✓
- [x] B2: 数据库Schema + CRUD (news.repository.js) ✓
- [x] B3: Tavily爬取服务 + 定时任务 ✓
- [x] B4: LLM客户端 + AI处理管道（摘要/分类/提取） ✓
- [x] B5: 新闻API路由 + 分类API + 统计API ✓
- [x] B6: 向量存储 + RAG问答服务 ✓
- [x] B7: WebSocket流式 + Chat API ✓
- [x] B8: Nginx配置 + pm2部署脚本 ✓

## 文件清单

| 文件 | 任务 | 描述 |
|------|------|------|
| server/config.js | B1 | 环境配置 |
| server/index.js | B1+B3+B5+B6 | Fastify 主服务器 |
| server/db/index.js | B1 | sql.js 封装 |
| server/db/news.repository.js | B2 | 新闻 CRUD + 统计 + 向量 |
| server/modules/crawler/tavily-client.js | B3 | Tavily API 封装 |
| server/modules/crawler/crawler-service.js | B3 | 爬取编排 |
| server/modules/crawler/scheduler.js | B3 | 定时调度 |
| server/modules/ai/llm-client.js | B4 | LLM 客户端 |
| server/modules/ai/pipeline.js | B4 | AI 处理管道 |
| server/modules/qa/qa-service.js | B6 | RAG 问答服务 |
| server/routes/health.js | B1 | 健康检查 |
| server/routes/news.js | B5 | 新闻列表+详情 |
| server/routes/categories.js | B5 | 分类+统计 |
| server/routes/admin.js | B5 | 管理爬取 |
| server/routes/chat.js | B7 | WebSocket 问答 |
| scripts/crawl.js | B3 | 手动爬取脚本 |
| ecosystem.config.js | B8 | pm2 配置 |
| nginx/isoftstone-news.conf | B8 | Nginx 反代 |

## 备注

- sql.js 替代 better-sqlite3（Windows 无编译工具）
- Tavily API 用于新闻搜索和内容提取
- AI 管道: 分类/摘要/实体提取/情感分析
- RAG: 纯 JS 余弦相似度检索（无向量库）
- WebSocket: 流式 LLM 回答 + SSE 解析

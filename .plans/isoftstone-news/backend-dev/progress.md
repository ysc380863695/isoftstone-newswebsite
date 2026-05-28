# backend-dev - 工作日志

## 2026-05-27 Session 1

- 读取项目文档（architecture, api-contracts, invariants, index）
- 项目目录为空，从零搭建 B1
- 完成 B1: 项目骨架搭建
  - better-sqlite3 → sql.js（Windows无VS编译工具）
  - Fastify 5 服务器 + CORS + 健康检查路由
  - SQLite Schema: news/crawl_log/chat_session/chat_message
  - DB辅助函数: queryAll/queryOne/run
  - 集成测试通过: 服务器启动 + /api/health 200

## 2026-05-27 Session 2

- 检查 B2 (news.repository.js) 和 B4 (llm-client.js, pipeline.js) 代码已完整
- 完成 B3: Tavily 爬取服务
  - tavily-client.js: 搜索+提取+结果标准化
  - crawler-service.js: 逐条入库+AI处理编排
  - scheduler.js: 30s延迟首次+6h定时
  - scripts/crawl.js: 手动爬取CLI
- 完成 B5: API 路由
  - news.js: GET /api/news (分页筛选) + GET /api/news/:id (详情+关联)
  - categories.js: GET /api/categories + GET /api/stats
  - admin.js: POST /api/admin/crawl (Bearer token 鉴权)
- 完成 B6+B7: 问答系统
  - qa-service.js: RAG检索+LLM流式/非流式问答
  - chat.js: WebSocket 流式聊天路由 (SSE→WS 转发)
- 完成 B8: 部署配置
  - ecosystem.config.js: pm2 进程管理
  - nginx/isoftstone-news.conf: 反代+gzip+WS升级
  - scripts/deploy.sh: rsync+npm+nginx+pm2 部署脚本
- API 测试全部通过: health/news/categories/stats/admin(401)

# isoftstone-news - 进度日志

> 按时间线记录。每条记录谁做了什么。

---

## 2026-05-27 Session 1 — 项目规划与团队搭建

### 已完成
- [x] 需求收集：新闻爬取+AI处理+展示+问答+未来扩展
- [x] 架构设计：单体Fastify+SQLite+Tavily+RAG
- [x] API契约定义：6个端点+完整字段表
- [x] 不变量定义：11条系统边界
- [x] 规划文件创建：docs/ + agent目录

### 待办
- [ ] 创建 CLAUDE.md
- [ ] 创建团队 + 生成智能体
- [ ] 阶段0任务下发

### 关键决策
- 技术栈：Node.js 22 + Fastify + SQLite（4G内存限制）
- 前端：React CDN + Pentagram设计风格（无构建步骤）
- AI：glm-5 via OpenAI兼容API
- 部署：腾讯云 4核4G3M + Nginx + pm2

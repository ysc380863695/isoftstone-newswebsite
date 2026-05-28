# isoftstone-news - 主计划

> 状态: PLANNING
> 创建: 2026-05-27
> 团队: isoftstone-news (frontend-dev, backend-dev, reviewer)
> 决策记录: .plans/isoftstone-news/decisions.md
> 部署目标: 腾讯云轻量服务器 4核4G3M (82.156.232.19, Ubuntu 24.04)

---

## 1. 项目概述

软通动力新闻展示网站——爬取30天公网新闻，AI分类/摘要/提取，精美前端展示，智能问答。
体现技术实力，未来扩展语音交互和数字人。

---

## 2. 文档索引

| 文档 | 位置 | 内容 |
|------|------|------|
| 架构 | docs/architecture.md | 系统组件、数据流、技术栈 |
| API 契约 | docs/api-contracts.md | 前后端接口定义 |
| 不变量 | docs/invariants.md | 不可违反的系统边界 |
| 实施方案 | ~/.claude/plans/immutable-hugging-sparrow.md | 完整技术方案（详细） |

---

## 3. 阶段概览

- 阶段 0: 骨架搭建 — 项目初始化 + Fastify最小服务器 + 前端骨架
- 阶段 1: 数据管道 — Tavily爬取 + SQLite存储 + AI处理
- 阶段 2: API + 前端 — 完整API路由 + 前端全部页面
- 阶段 3: 问答系统 — RAG + WebSocket + ChatWidget
- 阶段 4: 部署上线 — Nginx + pm2 + 腾讯云部署

前端（阶段0-2）和后端（阶段0-1）并行开发。

---

## 4. 任务汇总

### frontend-dev

| # | 任务 | 状态 | 计划文件 |
|---|------|------|----------|
| F1 | 设计系统令牌 + 页面骨架 | pending | frontend-dev/task-skeleton/ |
| F2 | 新闻卡片 + 列表组件 | pending | frontend-dev/task-news-components/ |
| F3 | 新闻详情弹层 + 关键信息侧栏 | pending | frontend-dev/task-news-detail/ |
| F4 | 分类筛选 + 搜索栏 | pending | frontend-dev/task-filters/ |
| F5 | 问答悬浮组件 | pending | frontend-dev/task-chat-widget/ |
| F6 | 动效 + 响应式 + 骨架屏 | pending | frontend-dev/task-polish/ |

### backend-dev

| # | 任务 | 状态 | 计划文件 |
|---|------|------|----------|
| B1 | 项目骨架 + Fastify + SQLite | pending | backend-dev/task-skeleton/ |
| B2 | 数据库Schema + CRUD | pending | backend-dev/task-database/ |
| B3 | Tavily爬取服务 + 定时任务 | pending | backend-dev/task-crawler/ |
| B4 | LLM客户端 + AI处理管道 | pending | backend-dev/task-ai-pipeline/ |
| B5 | 新闻API路由 + 分类API | pending | backend-dev/task-api-routes/ |
| B6 | 向量存储 + RAG问答服务 | pending | backend-dev/task-qa-service/ |
| B7 | WebSocket流式 + Chat API | pending | backend-dev/task-websocket/ |
| B8 | Nginx配置 + pm2部署 | pending | backend-dev/task-deploy/ |

### reviewer

按需审查 frontend-dev 和 backend-dev 的产出。

---

## 5. 当前阶段

阶段 0: 骨架搭建。frontend-dev 和 backend-dev 并行启动。

# B1: 项目骨架 + Fastify + SQLite

## 目标
搭建项目基础骨架：package.json、Fastify服务器、SQLite连接、配置管理、目录结构。

## 验收标准
- [x] package.json 配置完成（Fastify + sql.js + 依赖）
- [x] .env.example 包含所有必要环境变量
- [x] server/index.js Fastify 最小服务器启动
- [x] server/config.js 配置管理
- [x] server/db/index.js SQLite 连接和初始化
- [x] 目录结构创建（routes/, modules/crawler/, modules/ai/, modules/websocket/）
- [x] 服务器能启动并响应健康检查

## 实施记录

### 关键决策：sql.js 替代 better-sqlite3
- **原因**: Windows 本地无 VS C++ 构建工具，better-sqlite3 无法编译（Node.js 24 也无预编译二进制）
- **sql.js 优势**: 纯 WASM，零本地编译，跨平台
- **注意**: sql.js 是同步内存模式，每次写操作后 `saveDb()` 持久化。已封装 `queryAll/queryOne/run` 辅助函数
- **迁移路径**: 生产环境 Ubuntu 上可选择换回 better-sqlite3（WAL模式并发更优），接口通过辅助函数抽象

### 交付文件
| 文件 | 说明 |
|------|------|
| package.json | Fastify 5 + sql.js + CORS/Static/WebSocket 插件 |
| .env.example | 全部环境变量模板 |
| .gitignore | node_modules, data/, .env, *.db |
| server/index.js | Fastify 入口，CORS，DB初始化，路由注册，优雅关闭 |
| server/config.js | 环境变量配置管理（PORT, DB, Tavily, LLM, Admin） |
| server/db/index.js | SQLite(sql.js) 连接 + Schema初始化 + queryAll/queryOne/run 辅助 |
| server/routes/health.js | GET /api/health 健康检查 |

### 数据库 Schema
- `news` — 新闻主表（title, summary, content, category, source_url, tags, key_entities, sentiment）
- `crawl_log` — 爬取日志（started_at, finished_at, status, counts）
- `chat_session` — 问答会话
- `chat_message` — 问答消息（session_id, role, content, sources）

### 测试结果
- 服务器启动: OK (http://0.0.0.0:8080)
- GET /api/health: 200, {"status":"ok","database":{"connected":true,"newsCount":0}}
- CRUD 操作: INSERT/SELECT/DELETE 全部通过

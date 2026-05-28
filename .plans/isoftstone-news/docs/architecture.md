# isoftstone-news - 架构

> 维护者：team-lead, devs
> 更新：2026-05-27

## 系统概览

单体架构部署在腾讯云4核4G服务器上。Nginx托管前端静态文件并反代API到Node.js Fastify后端。
SQLite作为数据库，零运维。RAG问答使用内嵌向量+余弦检索。

## 组件图

```
用户浏览器 (前端 SPA)
    │
    ├─ HTTP ──→ Nginx (80) ──→ 静态前端文件
    │
    └─ /api ──→ Nginx 反代 ──→ Node.js Fastify (8080)
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
               新闻爬取服务     AI处理管道      问答服务(RAG)
                    │               │               │
               Tavily API     LLM API(glm-5)    向量检索+LLM
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                              SQLite (news.db)
```

## 技术栈

| 模块 | 技术 |
|------|------|
| 前端 | HTML/CSS/JS + React CDN (Babel standalone) |
| 前端风格 | Pentagram配方（专业杂志风）+ Vercel科技感 |
| 后端 | Node.js 22 + Fastify |
| 数据库 | SQLite (better-sqlite3) |
| 爬取 | Tavily REST API |
| AI | OpenAI兼容API (glm-5) |
| 向量 | 纯JS余弦搜索 |
| 流式 | WebSocket |
| 进程管理 | pm2 |
| 反代 | Nginx |

## 目录结构

```
软通新闻展示网站/
├── package.json
├── .env.example
├── server/              # 后端
│   ├── index.js
│   ├── config.js
│   ├── db/
│   ├── modules/
│   │   ├── crawler/
│   │   ├── ai/
│   │   └── websocket/
│   └── routes/
├── client/              # 前端
│   ├── index.html
│   ├── css/
│   └── js/components/
├── scripts/
└── nginx/
```

## 部署约束

- 服务器：腾讯云轻量 4核4G3M (82.156.232.19, Ubuntu 24.04)
- SSH：`ssh -i "D:/0工作/开发工作区/腾讯云/秘钥/tengxunyun123.pem" ubuntu@82.156.232.19`
- 已装环境：Node.js 22, git
- 内存有限：不用独立向量库、不用重框架
- 带宽3M：避免大静态资源，gzip压缩

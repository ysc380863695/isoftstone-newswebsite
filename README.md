# 软通动力新闻中心

AI 驱动的企业新闻智能展示平台 —— 自动爬取、AI 分类摘要、精美展示、智能问答。

![技术栈](https://img.shields.io/badge/Node.js-22-339933?logo=node.js)
![前端](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![后端](https://img.shields.io/badge/Fastify-5-000000?logo=fastify)
![数据库](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)
![部署](https://img.shields.io/badge/Ubuntu-24.04-E95420?logo=ubuntu)

## 功能特性

- **公网新闻自动聚合** — 搜索 30 天内软通动力相关新闻，自动去重入库
- **AI 智能处理** — LLM 自动生成摘要、分类（8类）、关键实体提取、情感分析
- **精美前端展示** — Pentagram 杂志风设计，卡片网格布局，Hero 精选轮播
- **智能问答 (RAG)** — 向量检索 + LLM 流式回复，回答带新闻引用
- **自动封面截图** — Playwright 截取原文页面作为卡片封面
- **响应式设计** — 桌面 + 移动端适配

## 技术架构

```
用户浏览器 (React CDN + Babel)
    │
    ├─ HTTP ──→ Nginx (80) ──→ 静态前端文件
    │
    └─ /api ──→ Nginx 反代 ──→ Fastify (8080)
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
               新闻爬取服务     AI 处理管道      RAG 问答
                    │               │               │
               Tavily API      LLM (OpenAI)     向量检索 + LLM
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                              SQLite (news.db)
```

| 模块 | 技术 | 说明 |
|------|------|------|
| 前端 | React 18 CDN + Babel | 无需构建，零配置 |
| 设计 | Pentagram 专业杂志风 | 大字标题、精致间距、卡片动效 |
| 后端 | Fastify 5 | 高性能 Node.js 框架 |
| 数据库 | SQLite (sql.js) | 零运维，内存加载 |
| 爬取 | Tavily REST API | 公网新闻搜索+提取 |
| AI | OpenAI 兼容 API (GLM) | 摘要/分类/关键信息提取 |
| 向量 | 纯 JS 余弦检索 | 轻量，无需独立向量库 |
| 部署 | pm2 + Nginx | Ubuntu 24.04 生产环境 |

## 新闻分类

公司动态 / 行业报告 / 产品发布 / 合作签约 / 财报业绩 / 技术创新 / 生态合作 / 人才招聘

## 快速开始

### 环境要求

- Node.js 22+
- npm 9+

### 安装

```bash
git clone https://github.com/ysc380863695/isoftstone-newswebsite.git
cd isoftstone-newswebsite
npm install
```

### 配置

```bash
cp .env.example .env
```

编辑 `.env`：

```env
PORT=8080
DB_PATH=./data/news.db
TAVILY_API_KEY=your_tavily_api_key    # Tavily 搜索 API
LLM_API_KEY=your_llm_api_key          # LLM API Key
LLM_BASE_URL=https://your-llm.com/v1  # LLM 兼容 OpenAI 的地址
LLM_MODEL=glm-5                       # 模型名称
CRAWL_QUERY=软通动力                   # 搜索关键词
```

### 初始化数据

```bash
# 种子数据（示例）
node scripts/seed-data.js

# 真实新闻爬取（需要 Tavily API Key）
node scripts/crawl.js
```

### 启动开发服务器

```bash
npm run dev    # 开发模式（文件变更自动重启）
npm start      # 生产模式
```

访问 `http://localhost:8080`

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/news?category=&page=1&pageSize=20&keyword=&source=` | 新闻列表（分页+筛选） |
| GET | `/api/news/:id` | 新闻详情（含关联推荐） |
| GET | `/api/categories` | 分类统计 |
| GET | `/api/stats` | 总览数据 |
| WS | `/api/chat` | 智能问答（WebSocket 流式） |
| POST | `/api/admin/crawl` | 手动触发爬取 |

## 部署

### 生产环境

```bash
# pm2 启动
pm2 start ecosystem.config.js

# Nginx 配置参考 nginx/isoftstone-news.conf
sudo cp nginx/isoftstone-news.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 部署脚本

```bash
bash scripts/deploy.sh
```

## 项目结构

```
├── server/                          # 后端
│   ├── index.js                     # Fastify 入口
│   ├── config.js                    # 配置加载
│   ├── db/                          # 数据库层
│   │   ├── schema.sql               # 建表语句
│   │   ├── index.js                 # sql.js 初始化
│   │   └── news.repository.js       # CRUD + 格式化
│   ├── modules/
│   │   ├── crawler/                 # 爬取服务
│   │   ├── ai/                      # LLM 客户端 + AI 处理
│   │   └── websocket/               # WebSocket 处理
│   └── routes/                      # API 路由
│       ├── news.js                  # 新闻接口
│       ├── categories.js            # 分类统计
│       ├── chat.js                  # 问答 WebSocket
│       └── admin.js                 # 管理接口
├── client/                          # 前端
│   ├── index.html                   # 入口
│   ├── css/                         # 样式（tokens + base）
│   └── js/components/               # React 组件
│       ├── App.jsx                  # 主应用 + 状态管理
│       ├── NewsCard.jsx             # 新闻卡片
│       ├── NewsDetail.js            # 新闻详情弹窗
│       ├── CategoryFilter.js        # 分类筛选
│       ├── ChatWidget.jsx           # 问答悬浮按钮
│       └── ChatWindow.jsx           # 对话窗口
├── scripts/                         # 工具脚本
│   ├── crawl.js                     # 主爬取脚本
│   ├── seed-data.js                 # 种子数据
│   ├── screenshot-covers.cjs        # 封面截图
│   ├── refetch-content.cjs          # JS 渲染页重抓
│   └── deploy.sh                    # 部署脚本
├── nginx/
│   └── isoftstone-news.conf         # Nginx 配置
├── ecosystem.config.js              # pm2 配置
└── .env.example                     # 环境变量模板
```

## 扩展预留

- **语音交互** — WebSocket `/api/voice` 端点预留，ChatWidget 麦克风按钮
- **数字人** — `<canvas id="digital-human">` 容器预留

## License

MIT

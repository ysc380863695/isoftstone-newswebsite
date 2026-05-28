# isoftstone-news - 架构决策记录

> 记录每个决策及其理由。

---

## D1: 单体架构 vs 微服务

- 日期: 2026-05-27
- 决策: 单体Fastify应用，所有模块在一个进程中
- 理由: 4G内存服务器，无法运行多个服务进程。SQLite零运维。
- 考虑过的替代方案: Docker Compose多容器（内存不够）、PM2多进程（复杂度过高）

## D2: React CDN vs 构建工具

- 日期: 2026-05-27
- 决策: React CDN (Babel standalone)，无构建步骤
- 理由: 简化部署，3M带宽下避免大bundle，Nginx直接托管静态文件
- 考虑过的替代方案: Vite构建（增加部署复杂度）、Next.js（SSR不需要）

## D3: 纯JS向量检索 vs 向量数据库

- 日期: 2026-05-27
- 决策: 纯JS余弦相似度搜索，暴力检索
- 理由: 新闻<1000条，暴力搜索<50ms，4G内存跑不动独立向量库
- 考虑过的替代方案: ChromaDB（内存不够）、FAISS（C++依赖复杂）

## D4: SQLite vs MySQL/PostgreSQL

- 日期: 2026-05-27
- 决策: SQLite (better-sqlite3)
- 理由: 零运维，同步API开发体验好，万级数据量足够
- 考虑过的替代方案: MySQL（需要额外内存运行守护进程）

## D5: Tavily API vs 自建爬虫

- 日期: 2026-05-27
- 决策: Tavily REST API (tavily_search + tavily_extract)
- 理由: 公网新闻无需处理反爬，Tavily已优化搜索质量
- 考虑过的替代方案: Puppeteer自建爬虫（内存消耗大、反爬处理复杂）

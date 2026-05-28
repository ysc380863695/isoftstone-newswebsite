# isoftstone-news - 知识库索引

> 动态导航地图。智能体需要在 docs/ 中查找信息时先 Read 此文件。

| 文档 | 关键 Sections | 最后更新 |
|------|-------------|---------|
| architecture.md | §系统概览: 组件图 · §技术栈: 框架选型 · §目录结构: 项目布局 · §部署约束: 服务器规格 | 2026-05-27 |
| api-contracts.md | §GET /api/news: 列表查询 · §GET /api/news/:id: 详情 · §WS /api/chat: 问答流式 · §POST /api/admin/crawl: 手动爬取 | 2026-05-27 |
| invariants.md | §资源约束: 内存/带宽/磁盘 · §数据边界: 30天/信源/摘要 · §安全: 密钥/鉴权 · §接口契约: 字段一致 | 2026-05-27 |

## 如何使用此索引

- 需要了解系统组件？→ 读 architecture.md §系统概览
- 需要API字段名？→ 读 api-contracts.md
- 需要检查变更是否违反边界？→ 读 invariants.md

## 新鲜度日志

| 文档 | 上次审计 | 状态 |
|------|---------|------|
| architecture.md | 2026-05-27 | [OK] |
| api-contracts.md | 2026-05-27 | [OK] |
| invariants.md | 2026-05-27 | [OK] |

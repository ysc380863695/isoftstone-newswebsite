# isoftstone-news - 系统不变量

> 不可违反的系统边界。违反 = CRITICAL Bug。

## 资源约束

- INV-1: 服务器内存使用不超过3.2G（4G总内存，留800M给系统） — 状态：无测试
- INV-2: 单次API响应时间不超过3秒（3M带宽下） — 状态：无测试
- INV-3: SQLite数据库文件不超过100MB — 状态：无测试

## 数据边界

- INV-4: 只展示30天内的新闻，超过30天的自动过滤 — 状态：无测试
- INV-5: 每条新闻必须有信源URL（sourceUrl字段不可为空） — 状态：无测试
- INV-6: AI摘要不超过200字 — 状态：无测试

## 安全边界

- INV-7: .env文件不提交到git（含API密钥） — 状态：人工检查
- INV-8: POST /api/admin/crawl 需要鉴权 — 状态：无测试

## 接口契约

- INV-9: 前后端API字段名必须与 api-contracts.md 一致 — 状态：人工检查

## 扩展预留

- INV-10: ChatWidget中预留麦克风按钮(disabled)用于未来语音交互 — 状态：无测试
- INV-11: 预留 /api/voice 和 /api/digital-human/session 端点 — 状态：无测试

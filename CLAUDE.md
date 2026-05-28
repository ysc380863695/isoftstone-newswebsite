# isoftstone-news - 团队运营手册

> 由 CCteam-creator-cn 自动生成，可按需修改。
> 此文件让 team-lead 的团队知识在上下文压缩后仍然保持。

## Team-Lead 控制平面

- team-lead = 主对话，不是生成的 agent
- team-lead 负责用户对齐、范围控制、任务分解和阶段推进
- team-lead 维护项目全局真相：主 `task_plan.md`、`decisions.md` 和此 `CLAUDE.md`
- **禁用独立子智能体**：团队存在后，所有工作通过 SendMessage 交给队友。不要启动独立的 Agent/子智能体——它们绕过团队的规划文件和协作体系。唯一例外：用 `team_name` 生成新队友加入团队

## 团队花名册

| 名称 | 角色 | 模型 | 核心能力 |
|------|------|------|---------|
| backend-dev | 后端开发 | glm-5-turbo | Node.js 22 + Fastify + SQLite + AI管道 + 部署 |
| frontend-dev | 前端开发 | glm-5-turbo | HTML/CSS/JS + React CDN + Pentagram设计风格 |
| reviewer | 代码审查 | glm-5-turbo | 安全/质量/性能/资源效率审查（只读源代码） |

## 任务下发协议

### 消息送达时序（关键）
`SendMessage` 只在接收方 idle 时送达——**无法**打断进行中的任务。初始派单必须前置上下文（没有中途追加），广播也没有抢占，实时状态靠直接读 `progress.md` / `findings.md`（**文件实时，消息不是**）。

### TaskCreate 描述格式（team-lead 上下文压缩后参考）

TaskCreate 描述：一句话范围 + 验收标准 + `.plans/` 路径。
通过 TaskUpdate 分配负责人和设置依赖。Teammate 可自行通过 TaskList 认领已解锁的任务。

### 大任务（功能开发、新模块）-- 停止检查后再发送

**在给任何智能体下发大任务前，检查消息中是否包含以下 4 项。如有缺失，先补上再发。**

1. **范围和目标**：要做什么、验收标准
2. **文档提醒**："请创建 `task-<名称>/` 任务文件夹（含 task_plan.md + findings.md + progress.md），并在你的根 findings.md 中添加索引条目"
3. **依赖说明**：依赖哪些调研/任务的结论，关键文件路径和行号
4. **审查预期**：完成后是否需要代码审查

各角色的任务文件夹前缀：
- backend-dev / frontend-dev：`task-<名称>/`
- reviewer：`review-<目标>/`

### 小任务（Bug 修复、配置变更）

直接发消息说明改动即可，不需要任务文件夹，也不需要审查。

## 通信速查

| 操作 | 命令 |
|------|------|
| 给单个智能体分配任务 | `SendMessage(to: "<名称>", message: "...")` |
| 广播给所有人（慎用） | `SendMessage(to: "*", message: "...")` |
| dev 请求代码审查 | dev 直接联系 reviewer（不经过 team-lead） |

## 状态检查

| 要检查什么 | 怎么做 |
|-----------|--------|
| 全局概览 | `TaskList` — 所有任务、负责人、阻塞情况一览 |
| 快速扫描 | 并行读取各 agent 的 `progress.md` |
| 深入了解 | 读 agent 的 `findings.md`（索引）→ 再看具体任务文件夹 |
| 方向检查 | 读 `.plans/isoftstone-news/task_plan.md` |
| 恢复项目 | 读 `team-snapshot.md` → 检查陈旧度 → 从缓存 prompt 启动智能体 → 读各 agent 的 `findings.md` 索引 → 重建 TaskCreate |

读取顺序：**progress**（到哪了）→ **findings**（遇到什么）→ **task_plan**（目标是什么）

## 文档索引（知识库）

> **导航地图**：`docs/index.md` 有各文档的 section 级导航。
> 需要在 docs/ 中查找信息时先 Read 它。

| 文档 | 位置 | 维护者 |
|------|------|--------|
| 导航地图 | .plans/isoftstone-news/docs/index.md | custodian（如启用） |
| 架构 | .plans/isoftstone-news/docs/architecture.md | team-lead, devs |
| API 契约 | .plans/isoftstone-news/docs/api-contracts.md | devs（API 变更时**必须**同步） |
| 不变量 | .plans/isoftstone-news/docs/invariants.md | team-lead, reviewer |

**Doc-Code Sync 规则**：当代码变更了 API 或架构时，对应的 docs/ 文件**必须**在同一个任务中同步更新。

## 审查维度

> 项目特定的审查维度。Reviewer 在每次审查时给各维度打分。

| # | 维度 | 权重 | STRONG 表现 | WEAK 表现 |
|---|------|------|-----------|---------|
| RD-1 | 视觉品质 | 高 | Pentagram杂志风设计，精致间距、大字标题、卡片3D倾斜动效、骨架屏加载，Dribbble水准 | 基础Bootstrap风格，无动效，间距粗糙，移动端布局错乱 |
| RD-2 | 数据管道可靠性 | 高 | 爬取→AI处理→存储链路完整，去重/过滤/错误处理健全，30天数据完整性保证 | 爬取经常失败无重试，AI处理缺少去重，数据丢失无感知 |
| RD-3 | 资源效率 | 高 | 内存使用<3.2G，API响应<3s，SQLite<100MB，gzip压缩，无内存泄漏 | 内存持续增长，大查询阻塞，静态资源未压缩，数据库膨胀 |
| RD-4 | API一致性 | 中 | 前后端字段名与api-contracts.md完全一致，类型匹配，分页/筛选/排序行为与文档一致 | 字段名前后端不一致，缺少字段，类型不匹配，分页行为与文档不符 |

## 核心协议

| 协议 | 触发时机 | 操作 |
|------|---------|------|
| 3-Strike 上报 | 智能体报告 3 次失败 | 读其 progress.md，给新方向或重新分配 |
| 代码审查 | 大功能/新模块完成 | dev 在 findings.md 写改动摘要，发给 reviewer |
| 阶段推进 | 阶段完成 | 读 findings 更新主计划。开发完：等 reviewer [OK]/[WARN] |
| 上下文溢出 | 智能体报告上下文过长 | 进度已存文件，恢复或生成后继者 |
| Doc-Code Sync | API或架构变更时 | dev 必须同步更新 docs/api-contracts.md 和 docs/architecture.md |
| 升级判断（dev 角色） | dev 遇到需求不清/范围膨胀/架构影响/不可逆选择 | 必须先问 team-lead，附上 2-3 个选项和倾向 |

### 任务下发：最小化信息损耗

智能体间的消息会丢失细节。每次任务下发必须自包含：
- 引用 findings/文档的文件路径（让智能体读文件，而不是读你的摘要）
- 消息中包含验收标准（让智能体知道何时算完成）

## 部署约束

- 服务器：腾讯云轻量 4核4G3M (82.156.232.19, Ubuntu 24.04)
- SSH：`ssh -i "D:/0工作/开发工作区/腾讯云/秘钥/tengxunyun123.pem" ubuntu@82.156.232.19`
- 内存限制：3.2G（留800M给系统）
- 带宽：3M（gzip压缩，避免大静态资源）
- 进程管理：pm2
- 反代：Nginx

## Known Pitfalls

（初始为空——team-lead 从 3-Strike 解决方案、reviewer [BLOCK] 修复或任何重复失败中添加条目）

## 风格决策

| # | 决策 | 来源 | 状态 |
|---|------|------|------|
| SD-1 | 前端使用 React CDN (Babel standalone)，不使用构建工具 | 用户确认 Session 1 | Manual |
| SD-2 | 设计风格：Pentagram配方 + Vercel科技感 | 用户确认 Session 1 | Manual |

## 文件结构

```
软通新闻展示网站/
├── CLAUDE.md                          # 团队运营手册（本文件）
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
├── nginx/
└── .plans/isoftstone-news/            # 规划文件
    ├── task_plan.md                    # 主计划
    ├── team-snapshot.md               # 团队快照
    ├── findings.md                    # 团队级发现
    ├── progress.md                    # 工作日志
    ├── decisions.md                   # 架构决策
    ├── docs/                          # 知识库
    ├── frontend-dev/                  # 前端开发
    ├── backend-dev/                   # 后端开发
    └── reviewer/                      # 代码审查
```

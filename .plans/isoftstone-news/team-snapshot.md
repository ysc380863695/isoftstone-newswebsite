# 团队快照

> 生成时间: 2026-05-27
> 项目: isoftstone-news（软通动力新闻展示网站）
> 语言: 中文（简体）
>
> Skill 源文件时间戳（用于陈旧检测）:
> - SKILL.md: 2026-05-27
> - onboarding.md: 2026-05-27
> - roles.md: 2026-05-27
> - templates.md: 2026-05-27

## 花名册

| 名称 | 角色 | 模型 | subagent_type | psmux session |
|------|------|------|---------------|---------------|
| backend-dev | 后端开发 | glm-5-turbo | general-purpose | isoftstone-news-backend-dev |
| frontend-dev | 前端开发 | glm-5-turbo | general-purpose | isoftstone-news-frontend-dev |
| reviewer | 代码审查 | glm-5-turbo | general-purpose | isoftstone-news-reviewer |

## 入职 Prompts

重要提示：下面的每个 prompt 都是**完整、未删节的入职 prompt**。恢复时，这些 prompt 直接用于重新启动智能体。

### backend-dev

Prompt 文件位置：`.plans/isoftstone-news/prompt-backend-dev.txt`

启动方式（短命令让智能体自己读取完整prompt）：
```
psmux send-keys -t "isoftstone-news-backend-dev" "请读取文件 .plans/isoftstone-news/prompt-backend-dev.txt 并执行其中的指令" Enter
```

### frontend-dev

Prompt 文件位置：`.plans/isoftstone-news/prompt-frontend-dev.txt`

启动方式：
```
psmux send-keys -t "isoftstone-news-frontend-dev" "请读取文件 .plans/isoftstone-news/prompt-frontend-dev.txt 并执行其中的指令" Enter
```

### reviewer

Prompt 文件位置：`.plans/isoftstone-news/prompt-reviewer.txt`

启动方式：
```
psmux send-keys -t "isoftstone-news-reviewer" "请读取文件 .plans/isoftstone-news/prompt-reviewer.txt 并执行其中的指令" Enter
```

## psmux 会话管理

```bash
# 查看所有会话
psmux list-sessions

# 查看智能体状态
psmux capture-pane -t "isoftstone-news-backend-dev" -p -S -50
psmux capture-pane -t "isoftstone-news-frontend-dev" -p -S -50
psmux capture-pane -t "isoftstone-news-reviewer" -p -S -50

# 发送消息
psmux send-keys -t "isoftstone-news-backend-dev" "消息内容" Enter

# 重启智能体（kill + 重建）
psmux kill-session -t "isoftstone-news-backend-dev"
psmux new-session -d -s "isoftstone-news-backend-dev" "claude --model glm-5-turbo --permission-mode bypassPermissions"
sleep 10
psmux send-keys -t "isoftstone-news-backend-dev" "请读取文件 .plans/isoftstone-news/prompt-backend-dev.txt 并执行其中的指令" Enter
```

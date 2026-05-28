# F2 Findings: 新闻卡片 + 列表组件

## 状态: DONE

## 交付物
- NewsCard: 对齐 api-contracts.md 全部字段（title/summary/category/source/sourceUrl/publishDate/coverImage/tags/keyEntities）
  - 图片懒加载 + shimmer 占位
  - 标签展示（最多3个 #tag）
  - 官方信源标记（橙色角标）
  - 3D 倾斜动效保留
  - ARIA role="button" + keyboard 支持
- SkeletonCard: 骨架屏加载状态（shimmer 动画）
- NewsGrid: 带分页（"加载更多"按钮追加模式）、结果统计、空状态
- Mock 数据扩充至 24 条，每条有独立标题/摘要/标签/实体

## 决策
- 分页用"加载更多"追加模式（非翻页），更适合新闻流场景
- keyEntities 暂不在卡片上直接渲染，留给 F3 详情弹层展示

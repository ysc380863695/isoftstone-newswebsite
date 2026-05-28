# F4 Findings: 分类筛选 + 搜索栏

## 状态: DONE

## 交付物
- useNewsFilters hook: 统一管理 filters state（category/keyword/source/range/page/pageSize）
- SearchBar: 防抖搜索（300ms），支持清除，对齐 API keyword 参数
- SourceFilter: 全部来源/官方发布/媒体报道 三态切换，对齐 API source 参数
- RangeFilter: 近7天/30天/90天，对齐 API range 参数
- CategoryBar: 重构为从 categories 数据驱动，对齐 API category 参数 + GET /api/categories 格式
- FilterBar: 组合栏，SearchBar + SourceFilter + RangeFilter 一行排列
- mockFetchNews: 模拟后端筛选逻辑（category/keyword/source/range 全支持）

## 决策
- 搜索用 300ms 防抖，避免频繁重渲染
- 筛选器切换自动重置 page=1
- "加载更多"用追加模式（page > 1 时 append data）

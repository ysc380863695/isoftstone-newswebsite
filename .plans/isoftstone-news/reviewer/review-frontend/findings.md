# Review: Frontend (client/)

> 审查日期: 2026-05-27
> 审查范围: client/ 全部代码（4个文件）
> 审查依据: api-contracts.md, invariants.md, architecture.md

## 总结

| 级别 | 数量 |
|------|------|
| CRITICAL | 1 |
| HIGH | 3 |
| MEDIUM | 5 |

**Verdict: [BLOCK]**

存在 CRITICAL 级别 XSS 安全漏洞，且前端完全使用 Mock 数据未接入后端 API。视觉品质(RD-1)为 ADEQUATE，但前端与后端完全断开。

---

## CRITICAL

### C-1: XSS — dangerouslySetInnerHTML 渲染未净化的外部 HTML

**文件**: `client/js/components/App.jsx:931`

```jsx
<div className="article-content" dangerouslySetInnerHTML={{ __html: news.content }} />
```

`news.content` 来源于后端 `content` 字段，该字段来自 Tavily 爬取的外部网页原始内容（`crawler/tavily-client.js:79`: `raw_content`）。后端**未做任何 HTML 净化**即存入数据库，前端直接 `dangerouslySetInnerHTML` 渲染。

攻击链路：外部网页注入 `<script>` 或 `onerror` → Tavily 爬取 → 存入 SQLite → 前端渲染 → XSS 执行。

**建议**:
1. 后端入库前用 DOMPurify 或 sanitize-html 净化 HTML
2. 或前端渲染前净化：`<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }} />`

---

## HIGH

### H-1: 前端完全使用 Mock 数据 — 未接入后端 API

**文件**: `client/js/components/App.jsx:200-234`

```js
function mockFetchNews(filters) { ... }
```

整个前端使用硬编码的 Mock 数据：
- `MOCK_HERO_NEWS` — 3条固定新闻
- `MOCK_NEWS_LIST` — 24条固定新闻
- `MOCK_CATEGORIES` — 8个固定分类
- `MOCK_STATS` — 固定统计数据
- `mockFetchNews()` — 客户端筛选，无 API 调用
- `getMockNewsDetail()` — 客户端拼接详情

没有任何 `fetch('/api/...')` 调用。前端是一个完全独立的原型，与后端 API 无任何集成。

**影响**: 前端无法展示真实数据，所有功能仅存在于 Mock 层面。

### H-2: Chat 组件使用 Mock 响应 — 未实现 WebSocket

**文件**: `client/js/components/App.jsx:1087-1122`

```js
const getMockResponse = (query) => {
  if (q.includes('合作') || q.includes('签约')) { ... }
  return { content: '...', sources: [...] };
};
```

ChatWidget 用关键词匹配返回固定 Mock 响应，而非连接 `ws://host/api/chat`。WebSocket 协议（message/token/sources/done）未实现。

### H-3: 单文件 1385 行 — 可维护性差

**文件**: `client/js/components/App.jsx`

所有组件（Header, HeroSection, NewsCard, NewsGrid, FilterBar, SearchBar, CategoryBar, SourceFilter, RangeFilter, NewsDetailModal, ChatWidget, Footer, App）+ Mock 数据 + Hooks 全在一个文件中。

- Babel standalone 需要在浏览器中实时编译整个文件
- 任何组件修改都需要重编译全部
- 无法复用、无法独立测试

**建议**: 至少拆分为 `data/mock.js`, `hooks/`, `components/` 三个目录。

---

## MEDIUM

### M-1: Hero 轮播 scroll 事件触发重渲染

**文件**: `client/js/components/App.jsx:757-760`

```js
useEffect(() => {
  const onScroll = () => setScrollY(window.scrollY);
  window.addEventListener('scroll', onScroll, { passive: true });
}, []);
```

每次 scroll 都 `setScrollY` → 触发 HeroSection 重渲染。虽然 Hero 区域有视差效果，但频繁 state 更新在低端设备上可能导致卡顿。

**建议**: 使用 `requestAnimationFrame` 节流，或用 CSS `transform` + `scroll-margin` 实现纯 CSS 视差。

### M-2: SearchBar debounce timer 未在 unmount 时清理

**文件**: `client/js/components/App.jsx:511-513`

```js
const handleChange = (e) => {
  clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => onChange(val), 300);
};
```

组件卸载时 `debounceRef.current` 的 timer 可能仍在运行，调用已卸载组件的 `onChange`。

**建议**: 在 useEffect cleanup 中 `clearTimeout(debounceRef.current)`。

### M-3: 移动端 Modal 布局可能错乱

**文件**: `client/js/components/App.jsx:953-955`

```jsx
<aside style={{ flex: '0 0 300px', borderLeft: '1px solid ...', padding: 'var(--space-6)' }}>
```

侧边栏固定 300px 宽度。在 < 768px 屏幕上，左右两栏挤压导致内容不可读。base.css:171-175 只隐藏了 `.nav-desktop` 和调整了 hero 字号，未处理 Modal 布局。

### M-4: Babel standalone 浏览器端编译 — 性能差

**文件**: `client/index.html:16`

```html
<script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

1385 行 JSX 在用户浏览器中实时编译。Babel standalone 本身 ~3MB，加上编译开销，首次加载时间在 3M 带宽下约 8-10 秒。违反 INV-2 (API<3s) 的用户体感目标。

**建议**: 构建时预编译（即使不引入打包工具，也可用 `npx babel` 预编译），或使用 HTM (Hyperscript Tagged Markup) 替代 JSX 以消除 Babel 依赖。

### M-5: 图片来自外部域 — 无 CSP 保护

**文件**: `client/js/components/App.jsx:34`

Mock 数据使用 `https://picsum.photos/seed/...`，生产数据可能来自任意 URL。页面无 Content-Security-Policy header 限制图片来源。

**建议**: 后端在 Nginx 层配置 `img-src` CSP 指令。

---

## 项目维度评分

| 维度 | 评分 | 说明 |
|------|------|------|
| RD-1 视觉品质 | **ADEQUATE** | 暗色主题 + 品牌蓝/强调橙配色系统完整；3D 卡片倾斜动效、shimmer 骨架屏、Hero 视差轮播；排版精致（clamp hero 字号、tight letter-spacing）；但全 inline style 缺乏复用性，移动端适配不完善 |
| RD-2 数据管道可靠性 | **WEAK** | 前端完全未接入后端，数据管道断裂；Mock 数据无法验证真实场景下的可靠性 |
| RD-3 资源效率 | **ADEQUATE** | 图片 lazy loading ✓；骨架屏 ✓；但 Babel standalone 浏览器编译 ~3MB；React CDN production build 可接受 |
| RD-4 API一致性 | **STRONG** | Mock 数据字段名与 api-contracts.md 完全一致（id/title/summary/category/source/sourceUrl/publishDate/coverImage/tags/keyEntities）；筛选参数名一致（category/keyword/source/range/page/pageSize） |

## 视觉品质详细评估 (RD-1)

### 达到 Pentagram 风格的方面
- 暗色主题 + 高对比度文字 ✓
- 精致的色彩系统（10步色阶 + 语义色 + 强调色）✓
- clamp-based hero 标题字号 ✓
- 卡片 3D 倾斜 hover 效果 ✓
- 骨架屏 shimmer 动效 ✓
- 圆润的 UI 元素（radius-full 按钮/输入框）✓
- 分层阴影系统（sm/md/lg/xl/glow）✓
- AI 摘要高亮区（左边框 + 浅蓝背景）✓

### 未达到的方面
- 全 inline style，无法实现 CSS 动画复用和主题切换
- 移动端 Modal 侧边栏固定 300px
- 缺少微交互细节（hover 状态变化少）
- 无暗/亮主题切换机制
- 字体栈中无 web font 加载（依赖系统字体，中文排版效果受限）

## API 字段一致性详细检查

| Mock 数据字段 | api-contracts.md | 状态 |
|-------------|-----------------|------|
| id | id | ✓ |
| title | title | ✓ |
| summary | summary | ✓ |
| category | category | ✓ |
| source | source | ✓ |
| sourceUrl | sourceUrl | ✓ |
| publishDate | publishDate | ✓ |
| coverImage | coverImage | ✓ |
| tags (array) | tags (array) | ✓ |
| keyEntities.people/companies/numbers | keyEntities.people/companies/numbers | ✓ |
| sentiment | sentiment | ✓ |
| relatedNews[].id/title/summary | relatedNews[].id/title/summary | ✓ |

## XSS 防护检查

- [ ] **dangerouslySetInnerHTML 未净化** — news.content 来自外部爬取 (C-1)
- [x] Mock 数据不包含恶意内容（但真实数据会）
- [ ] 无 CSP header
- [x] 链接使用 `target="_blank" rel="noopener noreferrer"` ✓ (App.jsx:1018)

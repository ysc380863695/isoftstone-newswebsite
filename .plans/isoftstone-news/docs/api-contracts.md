# isoftstone-news - API 契约

> 前后端接口定义。字段名和类型的真理源头。
> 维护者：devs（变更时必须更新）

## 端点

### GET /api/news

新闻列表（分页、筛选）

**Query 参数：**

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| category | string | 否 | 分类名（公司动态/行业报告/产品发布/合作签约/财报业绩/技术创新/生态合作/人才招聘） |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页条数，默认20 |
| range | string | 否 | 时间范围，默认30d |
| keyword | string | 否 | 搜索关键词 |
| source | string | 否 | 信源筛选（official/media） |

**Response:**

```json
{
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "data": [
    {
      "id": 1,
      "title": "软通动力与华为签署战略合作",
      "summary": "150字AI摘要...",
      "category": "合作签约",
      "source": "isoftstone.com",
      "sourceUrl": "https://...",
      "publishDate": "2026-05-20",
      "coverImage": "https://...",
      "tags": ["华为", "昇腾", "AI"],
      "keyEntities": {
        "people": ["刘某某"],
        "companies": ["华为", "软通动力"],
        "numbers": ["10亿元"]
      }
    }
  ]
}
```

### GET /api/news/:id

新闻详情

**Response:**

```json
{
  "id": 1,
  "title": "...",
  "summary": "...",
  "content": "原始正文HTML",
  "category": "...",
  "source": "...",
  "sourceUrl": "...",
  "publishDate": "...",
  "coverImage": "...",
  "tags": [],
  "keyEntities": {},
  "sentiment": "positive",
  "relatedNews": [
    { "id": 2, "title": "...", "summary": "..." }
  ]
}
```

### GET /api/categories

分类统计

**Response:**

```json
[
  { "name": "公司动态", "count": 15 },
  { "name": "合作签约", "count": 8 }
]
```

### GET /api/stats

总览数据

**Response:**

```json
{
  "total": 100,
  "officialCount": 30,
  "mediaCount": 70,
  "categoryDistribution": { "公司动态": 15, "合作签约": 8 },
  "dateRange": { "start": "2026-04-27", "end": "2026-05-27" }
}
```

### WS /api/chat

智能问答（WebSocket流式）

**Client 发送：**

```json
{ "type": "message", "content": "软通最近有什么合作？", "sessionId": "uuid" }
```

**Server 流式返回：**

```json
{ "type": "token", "content": "根据" }
{ "type": "token", "content": "新闻" }
{ "type": "sources", "news": [
  { "id": 1, "title": "...", "sourceUrl": "..." }
]}
{ "type": "done" }
```

### POST /api/admin/crawl

手动触发爬取（需鉴权）

**Response:**

```json
{ "status": "started", "message": "爬取任务已启动" }
```

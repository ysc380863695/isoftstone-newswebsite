# 真实新闻数据源索引

> 2026-05-27 通过 Tavily 搜索获取的真实软通动力新闻

## 真实新闻列表（按时间倒序）

| # | 标题 | 来源 | URL | 日期 |
|---|------|------|-----|------|
| 1 | 软通计算机中标中国移动17.53亿元服务器大单 | DoNews | https://www.donews.com/news/detail/8/6561823.html | 2026-05 |
| 2 | 软通动力2025年营收破350亿，AI业务贡献过半 | 财联社 | https://www.cls.cn/detail/2355867 | 2026-04-26 |
| 3 | 软通动力2026年一季报：增收不增利，应收账款体量较大 | 腾讯新闻/证券之星 | https://view.inews.qq.com/a/20260426A01XSK00 | 2026-04-26 |
| 4 | 软通动力与象帝先达成战略合作，共建芯片到场景协同新范式 | isoftstone.com | https://www.isoftstone.com | 2026-02-12 |
| 5 | 软通国际加入全球数字经济城市联盟(DEC40)，成为首批理事单位 | isoftstone.com | https://www.isoftstone.com | 2026-02-09 |
| 6 | 从副中心制造到亮相国家信创园，软通动力系列硬核产品展示科技实力 | isoftstone.com | https://www.isoftstone.com | 2026-02-09 |
| 7 | 软通动力子公司软通睿联通过ASPICE CL2评估 | isoftstone.com | https://www.isoftstone.com/zh-cn/htmls/news/list-1.html | 2026-02-03 |
| 8 | 从软件服务到全栈智能：软通动力在京港数字经济合作论坛分享转型实践 | isoftstone.com | https://www.isoftstone.com | 2026-01-30 |
| 9 | 软通动力×金盘科技联合发布：软通天璇AI Factory智能制造解决方案 | isoftstone.com | https://www.isoftstone.com | 2026-01-26 |
| 10 | 软通动力与沈阳水务集团战略合作：鸿蒙+AI重塑智能水务 | isoftstone.com | https://www.isoftstone.com | 2026-01-22 |
| 11 | 软通动力与居然之家开启战略合作2.0 | isoftstone.com | https://www.isoftstone.com | 2026-01-20 |
| 12 | 软通动力联合工信部电子五所中标国家AI应用首个操作系统中试项目 | isoftstone.com | https://www.isoftstone.com | 2026-01-15 |
| 13 | 软通国际CES 2026：以"全栈智能"打破边界 | 搜狐 | https://www.sohu.com/a/975660937_114838 | 2026-01 |
| 14 | 软通动力2025半年报：营收稳步攀升，全栈智能点亮发展新局 | 美通社 | https://www.prnasia.com/story/501239-1.shtml | 2025-08-28 |
| 15 | 软通动力上半年营收同比增长约26%，软硬一体化初见成效 | 证券时报 | https://www.stcn.com/article/detail/3290972.html | 2025-08-28 |

## 官方新闻列表页

- https://www.isoftstone.com/zh-cn/htmls/news/list-1.html （软通动力官网新闻中心）

## 数据状态

- **data/news.db**：当前包含 23 条模拟数据（scripts/seed-data.js 生成）
- **模拟数据**：标题和内容基于真实新闻风格编写，但 URL 全部是虚构的
- **下一步**：需要用 Tavily Extract 抓取上述真实 URL 的正文+图片，保存为本地 HTML 文件

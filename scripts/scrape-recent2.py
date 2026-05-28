"""Targeted approach: scrape from proven sources with better date extraction"""
import json, re, time
from urllib.parse import urlparse
from scrapling.fetchers import Fetcher

EXISTING_URLS = [
    "163.com/dy/article/", "sohu.com/a/", "finance.sina.com.cn/",
    "10jqka.com.cn/", "prnasia.com", "kylinos.cn", "zol.com.cn",
    "stcn.com/article/", "stockstar.com/", "jrj.com.cn/", "eastmoney.com/a/",
]

def extract_date(page, url):
    # 1. Meta tags
    for sel in ['meta[property="article:published_time"]::attr(content)',
                'meta[name="pubdate"]::attr(content)']:
        d = page.css(sel).get()
        if d:
            m = re.search(r'(\d{4}-\d{2}-\d{2})', d)
            if m: return m.group(1)

    # 2. Full HTML search for dates
    html = page.html_content or ''
    # "2026-05-27"
    m = re.search(r'(\d{4}-\d{2}-\d{2})', html)
    if m:
        d = m.group(1)
        if '2026-04-28' <= d <= '2026-06-30':
            return d

    # 3. Chinese date
    m = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', html)
    if m:
        d = f'{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}'
        if d >= '2026-04-28': return d

    # 4. URL patterns - various formats
    for pat in [
        r'/(\d{4})/(\d{2})/(\d{2})\D',  # 2026/05/27/...
        r'/(\d{4})(\d{2})(\d{2})/',       # 20260527/
        r'(\d{4})[-/](\d{2})[-/](\d{2})',  # general
    ]:
        m = re.search(pat, str(url))
        if m:
            return f'{m.group(1)}-{m.group(2)}-{m.group(3)}'

    return None

def extract_cover(page):
    og = page.css('meta[property="og:image"]::attr(content)').get()
    if og and not any(x in (og or '').lower() for x in ['logo', 'icon', 'avatar']):
        if og.startswith('//'): og = 'https:' + og
        if og.startswith('http'): return og
    return None

def extract_content(page):
    for sel in ['article', '.article', '.article-body', '.content',
                '.article-content', '.news-content', '[class*="article"]']:
        el = page.css(sel)
        if el:
            text = el[0].css('::text').getall()
            text = [t.strip() for t in text if t.strip()]
            if text: return '\n\n'.join(text)[:8000]
    text = page.css('body::text').getall()
    text = [t.strip() for t in text if t.strip() and len(t) > 20]
    return '\n\n'.join(text)[:8000]

def classify(title, content):
    t = (title + content[:500]).lower()
    if any(k in t for k in ['签约', '中标', '合作', '携手', '合同', '订单']): return '合作签约'
    if any(k in t for k in ['发布', '推出', '品牌']): return '产品发布'
    if any(k in t for k in ['营收', '利润', '财报', '同比', '业绩', '回购', '减持', '担保', '定增']): return '财报业绩'
    if any(k in t for k in ['技术', '专利', '研发', '算法', '算力', 'ai', '智能', 'cpu', '鸿蒙', '昇腾']): return '技术创新'
    if any(k in t for k in ['生态', '开源', '入驻', '峰会', '论坛', '大会']): return '生态合作'
    return '公司动态'

def main():
    results = []

    # Direct fetch of candidates from previous search
    # Each has (url, expected_date_from_url)
    candidates = [
        'https://m.jrj.com.cn/madapter/finance/2026/05/27185257226440.shtml',
        'https://finance.eastmoney.com/a/202605283752416763.html',
        'https://www.cls.cn/detail/2066183',
        'https://www.cls.cn/detail/2065321',
        'https://www.cls.cn/detail/2063807',
        # Try more eastmoney
        'https://finance.eastmoney.com/a/202605273752167891.html',
        'https://finance.eastmoney.com/a/202605263751890234.html',
        'https://finance.eastmoney.com/a/202605253751543210.html',
    ]

    # Also search cls.cn
    print('Searching cls.cn...')
    try:
        cls_url = 'https://www.cls.cn/searchPage?keyword=%E8%BD%AF%E9%80%9A%E5%8A%A8%E5%8A%9B&type=all'
        page = Fetcher.get(cls_url, impersonate='chrome', stealthy_headers=True)
        links = page.css('a::attr(href)').getall()
        for l in links:
            if l and '/detail/' in l and l not in candidates:
                candidates.append(l)
        print(f'  Got {len(links)} links, total candidates: {len(candidates)}')
    except Exception as e:
        print(f'  cls.cn error: {e}')

    print(f'\nFetching {len(candidates)} candidates...\n')

    seen_urls = set()
    for url in candidates:
        if url in seen_urls: continue
        seen_urls.add(url)
        print(f'Fetch: {url[:80]}')
        try:
            page = Fetcher.get(url, impersonate='chrome', stealthy_headers=True)
            title = (page.css('meta[property="og:title"]::attr(content)').get()
                     or page.css('title::text').get() or '').strip()
            title = re.sub(r'[-_|]\s*(网易|同花顺|证券之星|新浪|搜狐|凤凰|百度|东方财富).*$', '', title)
            title = re.sub(r'\s+', ' ', title).strip()[:200]

            if not title or len(title) < 5:
                print(f'  SKIP: bad title')
                continue
            if '软通' not in title:
                print(f'  SKIP: not about 软通')
                continue

            date = extract_date(page, url)
            if not date:
                print(f'  SKIP: no date')
                continue
            if date < '2026-04-28':
                print(f'  SKIP: too old ({date})')
                continue

            content = extract_content(page)
            if not content or len(content) < 100:
                print(f'  SKIP: no content ({len(content)} chars)')
                continue

            cover = extract_cover(page)
            domain = urlparse(url).netloc.replace('www.', '')
            cat = classify(title, content)

            print(f'  ✓ {date} [{cat}] {title[:50]}')
            results.append({
                'title': title,
                'source_url': url,
                'cover_image': cover or '',
                'publish_date': date,
                'content': content,
                'source': domain,
                'category': cat,
                'summary': content[:200],
                'tags': [],
            })
        except Exception as e:
            print(f'  FAIL: {type(e).__name__}: {str(e)[:80]}')
        time.sleep(0.3)

    with open('scripts/scraped_recent.json', 'w', encoding='utf-8') as f:
        json.dump({'count': len(results), 'articles': results}, f, ensure_ascii=False, indent=2)
    print(f'\nDone: {len(results)} articles')

if __name__ == '__main__':
    main()

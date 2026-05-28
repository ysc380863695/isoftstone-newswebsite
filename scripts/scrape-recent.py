"""从 Baidu News + 东方财富 + cls.cn 搜索近30天软通动力文章"""
import json, re, time
from urllib.parse import urlparse
from scrapling.fetchers import Fetcher

# 已存在的文章 URL（精确去重）
EXISTING_URLS = {
    "stock.10jqka.com.cn/20260527/c677024775",
    "stock.10jqka.com.cn/20260410/c675905690",
    "stock.10jqka.com.cn/20260416/c676046819",
    "stock.10jqka.com.cn/20260425/c676278929",
    "stock.10jqka.com.cn/20260512/c676635368",
    "stock.10jqka.com.cn/20260527/c677024769",
    "stock.10jqka.com.cn/20260502/c676442479",
    "stock.10jqka.com.cn/20260509/c676571222",
    "stock.10jqka.com.cn/20260513/c676667244",
    "yuanchuang.10jqka.com.cn/20260525/c676958082",
    "163.com/dy/article/KTVM5KCT",
    "163.com/dy/article/KRVGV7R0",
    "163.com/dy/article/KS0JDS6U",
    "163.com/dy/article/KRTN72A4",
    "163.com/dy/article/KSHE5Q8T",
    "163.com/dy/article/KT9OBTNV",
    "163.com/dy/article/KQ911R1O",
    "163.com/dy/article/KO9P6GQO",
    "163.com/dy/article/KOMVR9PU",
    "163.com/dy/article/KQOH9QFP",
    "163.com/dy/article/KT7T96Q5",
    "sohu.com/a/1025714940",
    "sohu.com/a/1020413763",
    "sohu.com/a/1024559800",
    "sohu.com/a/989535397",
    "sohu.com/a/989613997",
    "sohu.com/a/996159499",
    "sohu.com/a/1024824534",
    "finance.sina.com.cn/stock/relnews/cn/2026-04-16",
    "prnasia.com",
    "kylinos.cn/about/news/2058722986681274370",
    "biz.zol.com.cn",
}

def extract_date(page, url):
    for sel in ['meta[property="article:published_time"]::attr(content)',
                'meta[name="pubdate"]::attr(content)',
                'meta[name="publish_date"]::attr(content)']:
        d = page.css(sel).get()
        if d:
            m = re.match(r'(\d{4}-\d{2}-\d{2})', d)
            if m: return m.group(1)
    # Chinese date in text
    txt = page.css('body::text').get() or ''
    m = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', txt)
    if m: return f'{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}'
    # URL patterns
    m = re.search(r'/(\d{4})(\d{2})(\d{2})/', url)
    if m: return f'{m.group(1)}-{m.group(2)}-{m.group(3)}'
    m = re.search(r'/(\d{4})/(\d{2})/(\d{2})/', url)
    if m: return f'{m.group(1)}-{m.group(2)}-{m.group(3)}'
    return None

def extract_cover(page):
    og = page.css('meta[property="og:image"]::attr(content)').get()
    if og and 'logo' not in (og or '').lower() and 'icon' not in (og or '').lower():
        if og.startswith('//'): og = 'https:' + og
        if og.startswith('http'): return og
    for sel in ['article img::attr(src)', '.article img::attr(src)',
                '.content img::attr(src)', '[class*="article"] img::attr(src)']:
        imgs = page.css(sel).getall()
        for img in imgs:
            if not img: continue
            if any(x in img.lower() for x in ['icon', 'avatar', 'logo', 'qr_code', 'weixin', 'topapp']):
                continue
            if img.startswith('//'): img = 'https:' + img
            if img.startswith('http'): return img
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
    if any(k in t for k in ['发布', '推出', '上市', '新品', '品牌']): return '产品发布'
    if any(k in t for k in ['营收', '利润', '财报', '同比', '业绩', '回购', '减持', '担保', '定增']): return '财报业绩'
    if any(k in t for k in ['技术', '专利', '平台', '研发', '算法', '算力', 'ai', '智能', 'cpu', '鸿蒙', '昇腾']): return '技术创新'
    if any(k in t for k in ['生态', '开源', '入驻', '峰会', '论坛', '大会']): return '生态合作'
    return '公司动态'

def main():
    results = []
    seen_urls = set()

    # Search Baidu News - 3 pages
    article_candidates = []
    for pn in [0, 20, 40]:
        url = f'https://news.baidu.com/ns?word=%E8%BD%AF%E9%80%9A%E5%8A%A8%E5%8A%9B&pn={pn}&cl=2&ct=0&tn=news&rn=20'
        print(f'Search Baidu News pn={pn}...')
        try:
            page = Fetcher.get(url, impersonate='chrome', stealthy_headers=True)
            links = page.css('h3 a::attr(href)').getall()
            for l in links:
                if l and l.startswith('http') and 'baidu.com' not in l:
                    # Check if we already have this article
                    is_dup = False
                    for eu in EXISTING_URLS:
                        if eu in l:
                            is_dup = True
                            break
                    if not is_dup and l not in seen_urls:
                        seen_urls.add(l)
                        article_candidates.append(l)
            print(f'  Got {len(links)} results, {len(article_candidates)} new candidates so far')
        except Exception as e:
            print(f'  Error: {e}')
        time.sleep(0.5)

    # Also try Eastmoney search
    print('\nSearch Eastmoney...')
    try:
        em_url = 'https://searchapi.eastmoney.com/bussiness/Web/GetCMSSearchResult?type=8198&pageindex=1&pagesize=20&keyword=软通动力&name=zixun'
        import urllib.request
        import urllib.error
        req = urllib.request.Request(em_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.eastmoney.com/'
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            if data.get('Data'):
                for item in data['Data']:
                    url = item.get('Url', '')
                    if url and url.startswith('http') and url not in seen_urls:
                        seen_urls.add(url)
                        article_candidates.append(url)
                print(f'  Found {len(data["Data"])} results')
    except Exception as e:
        print(f'  Error: {e}')

    print(f'\nTotal candidates to fetch: {len(article_candidates)}')

    for i, url in enumerate(article_candidates):
        print(f'[{i+1}/{len(article_candidates)}] {url[:80]}')
        try:
            page = Fetcher.get(url, impersonate='chrome', stealthy_headers=True)
            title = (page.css('meta[property="og:title"]::attr(content)').get()
                     or page.css('title::text').get() or '').strip()
            title = re.sub(r'[-_|]\s*(网易|同花顺|证券之星|新浪|搜狐|凤凰|百度).*$', '', title)
            title = re.sub(r'\s+', ' ', title).strip()[:200]

            if not title or len(title) < 5:
                print('  SKIP: bad title')
                continue

            # Must mention 软通
            if '软通' not in title:
                print(f'  SKIP: not about 软通动力')
                continue

            date = extract_date(page, url)
            if not date:
                print('  SKIP: no date')
                continue

            if date < '2026-04-28':
                print(f'  SKIP: too old ({date})')
                continue

            content = extract_content(page)
            if not content or len(content) < 100:
                print(f'  SKIP: no content')
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

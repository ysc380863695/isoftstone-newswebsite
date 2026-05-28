"""用 Scrapling 批量抓取 25 篇软通动力文章"""
import json, re, sys
from urllib.parse import urlparse
from scrapling.fetchers import Fetcher

URLS = [
    # 事件/活动类 (大概率有图)
    ("公司动态", "https://www.163.com/dy/article/KTVM5KCT05568W0A.html"),
    ("合作签约", "http://njna.nanjing.gov.cn/xwzx/xqyw/202605/t20260515_5840434.html"),
    ("合作签约", "https://www.stcn.com/article/detail/3903486.html"),
    ("合作签约", "https://stock.stockstar.com/RB2026052700023681.shtml"),
    ("生态合作", "https://www.kylinos.cn/about/news/2058722986681274370.html"),
    ("技术创新", "http://yuanchuang.10jqka.com.cn/20260525/c676958082.shtml"),
    ("公司动态", "http://stock.10jqka.com.cn/20260410/c675905690.shtml"),
    ("公司动态", "http://stock.10jqka.com.cn/20260416/c676046819.shtml"),
    ("合作签约", "https://www.163.com/dy/article/KRVGV7R005568W0A.html"),
    ("生态合作", "http://stock.10jqka.com.cn/20260512/c676635368.shtml"),
    ("产品发布", "https://stcn.com/article/detail/3843908.html"),
    ("技术创新", "https://www.donews.com/news/detail/8/6463177.html"),
    ("公司动态", "https://www.isoftstone.com/zh-cn/htmls/news/20260206/2019652086342709248.html"),
    ("生态合作", "https://www.163.com/dy/article/KS0JDS6U05568W0A.html"),
    ("合作签约", "https://finance.sina.com.cn/stock/relnews/cn/2026-04-16/doc-inhusenh2919443.shtml"),
    ("技术创新", "https://www.zqrb.cn/gscy/gongsi/2026-05-21/A1779354803597.html"),
    ("公司动态", "https://www.sohu.com/a/1024824534_121857546"),
    ("财报业绩", "https://www.stcn.com/article/detail/3815897.html"),
    ("公司动态", "https://api3.cls.cn/share/article/2355867"),
    ("公司动态", "https://finance.cnr.cn/ycbd/20260423/t20260423_527596713.shtml"),
    ("公司动态", "http://stock.10jqka.com.cn/20260527/c677024769.shtml"),
    ("技术创新", "http://jjckb.xinhuanet.com/20260312/9a1156072fc9490faedb70b800b678e0/c.html"),
    ("合作签约", "https://www.egsea.com/news/detail/2287681.html"),
    ("公司动态", "http://www.zqrb.cn/gscy/gongsi/2026-04-28/A1777368857284.html"),
    ("公司动态", "http://www.zqrb.cn/gscy/ggkx/2026-03-13/A1773390112867.html"),
    # 备用
    ("合作签约", "https://finance.ifeng.com/c/8t2pW1ZUDDs"),
    ("技术创新", "https://www.isoftstone.com/zh-cn/htmls/news/20260502/2019652086342709248.html"),
    ("生态合作", "http://stock.10jqka.com.cn/20260425/c676278929.shtml"),
]

def clean_title(t):
    """清理标题，去掉来源后缀"""
    t = re.sub(r'[-_|]\s*(网易订阅|同花顺|证券之星|新浪|搜狐|凤凰).*$', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t[:200]

def extract_date(page):
    """从页面提取发布日期"""
    for sel in [
        'meta[property="article:published_time"]::attr(content)',
        'meta[name="pubdate"]::attr(content)',
        'meta[name="publish_date"]::attr(content)',
        'meta[name="weibo:article:create_at"]::attr(content)',
    ]:
        d = page.css(sel).get()
        if d:
            m = re.match(r'(\d{4}-\d{2}-\d{2})', d)
            if m:
                return m.group(1)
    # 从URL中尝试提取日期
    url = page.url or ''
    m = re.search(r'(\d{4})[-/](\d{2})[-/](\d{2})', url)
    if m:
        return f'{m.group(1)}-{m.group(2)}-{m.group(3)}'
    # 从页面文本中找
    txt = page.css('body::text').get() or ''
    m = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', txt)
    if m:
        return f'{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}'
    return None

def extract_cover(page):
    """提取封面图URL"""
    # 1. og:image
    og = page.css('meta[property="og:image"]::attr(content)').get()
    if og and not any(x in (og or '').lower() for x in ['logo', 'icon', 'avatar']):
        if og.startswith('//'): og = 'https:' + og
        if og.startswith('http'): return og

    # 2. 文章区第一张大图
    for sel in ['article img::attr(src)', '.post_body img::attr(src)',
                '.article-body img::attr(src)', '.post-content img::attr(src)',
                '.article-content img::attr(src)', '.news-content img::attr(src)']:
        imgs = page.css(sel).getall()
        for img in imgs:
            if not img: continue
            if any(x in img.lower() for x in ['icon', 'avatar', 'logo', 'banner', 'qr_code', 'weixin', 'wx_', 'share_', 'btn_', 'loading', 'placeholder', 'default']):
                continue
            if img.startswith('//'): img = 'https:' + img
            if img.startswith('http'):
                return img

    # 3. 降级：全页第一张非logo图片
    all_imgs = page.css('img::attr(src)').getall()
    for img in all_imgs:
        if not img: continue
        if any(x in img.lower() for x in ['icon', 'avatar', 'logo', 'banner', 'qr_code', 'weixin', 'wx_', 'share_', 'btn_', 'loading', 'placeholder', 'default', 'topapp', 'location']):
            continue
        if '/videoimg/' in img or '/cover/' in img: continue  # 视频封面
        if img.startswith('//'): img = 'https:' + img
        if img.startswith('http'):
            return img
    return None

def extract_content(page):
    """提取文章正文，转markdown"""
    # 找主内容区
    for sel in ['article', '.post_body', '.article-body', '.post-content',
                '.article-content', '.news-content', '.content', '#article',
                '.post_text', '.entry-content', '[class*="article"]']:
        el = page.css(sel)
        if el:
            text = el[0].css('::text').getall()
            text = [t.strip() for t in text if t.strip()]
            return '\n\n'.join(text)[:8000]
    # Fallback: body text
    text = page.css('body::text').getall()
    text = [t.strip() for t in text if t.strip() and len(t) > 20]
    return '\n\n'.join(text)[:8000]

def extract_domain(url):
    try:
        return urlparse(url).netloc.replace('www.', '')
    except:
        return ''

def main():
    success = 0
    failed = 0
    results = []

    for i, (cat, url) in enumerate(URLS):
        print(f'[{i+1}/{len(URLS)}] {cat} | {url[:80]}')
        try:
            page = Fetcher.get(url, impersonate='chrome', stealthy_headers=True)

            title = (page.css('meta[property="og:title"]::attr(content)').get()
                     or page.css('title::text').get()
                     or '').strip()
            title = clean_title(title)
            if not title or len(title) < 5:
                print(f'  SKIP: title too short')
                failed += 1
                continue

            cover = extract_cover(page)
            date = extract_date(page)
            content = extract_content(page)
            domain = extract_domain(url)

            print(f'  TITLE: {title[:60]}')
            print(f'  IMG: {cover}')
            print(f'  DATE: {date}')
            print(f'  CONTENT: {len(content)} chars')

            results.append({
                'title': title,
                'source_url': url,
                'cover_image': cover or '',
                'publish_date': date,
                'content': content,
                'source': domain,
                'category': cat,
                'summary': content[:200] if content else '',
                'tags': [],
            })
            success += 1
        except Exception as e:
            print(f'  FAIL: {e}')
            failed += 1
            results.append({'error': str(e), 'url': url, 'category': cat})

    # 保存
    out = {
        'count': len(results),
        'success': success,
        'failed': failed,
        'articles': results,
    }
    with open('scripts/scraped_articles.json', 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f'\n=== DONE: {success} OK, {failed} FAIL ===')

if __name__ == '__main__':
    main()

"""用 Scrapling 批量抓取 163.com + sohu.com 的软通动力文章"""
import json, re
from urllib.parse import urlparse
from scrapling.fetchers import Fetcher

URLS = [
    # === 163.com 文章 (已验证有真实图片) ===
    ("公司动态", "https://www.163.com/dy/article/KTVM5KCT05568W0A.html", "香港国际运营中心启动"),
    ("合作签约", "https://www.163.com/dy/article/KRVGV7R005568W0A.html", "携手华为发布OPC方案"),
    ("生态合作", "https://www.163.com/dy/article/KS0JDS6U05568W0A.html", "开源鸿蒙+昇腾双生态"),
    ("公司动态", "https://www.163.com/dy/article/KRTN72A405568W0A.html", "33亿定增猛攻硬件"),
    ("产品发布", "https://www.163.com/dy/article/KSHE5Q8T05568W0A.html", "睿动×睿宝AI解决方案"),
    ("合作签约", "https://www.163.com/dy/article/KT9OBTNV0534A4SC.html", "中标中国移动PC服务器"),
    ("公司动态", "https://www.163.com/dy/article/KQ911R1O05568W0A.html", "中标千万级集成供应项目"),
    ("公司动态", "https://www.163.com/dy/article/KO9P6GQO05568W0A.html", "发布MerakAI品牌"),
    ("技术创新", "https://www.163.com/dy/article/KOMVR9PU05568W0A.html", "AI终端商业化提速"),
    ("公司动态", "https://www.163.com/dy/article/KQOH9QFP05568W0A.html", "完成首次股份回购"),
    ("公司动态", "https://www.163.com/dy/article/KT7T96Q505568W0A.html", "实控人减持及经营分析"),

    # === sohu.com 文章 ===
    ("技术创新", "https://www.sohu.com/a/1025714940_121857546", "筑牢国产AI算力底座"),
    ("公司动态", "https://www.sohu.com/a/1020413763_122014422", "福布斯论坛全栈智能"),
    ("合作签约", "https://www.sohu.com/a/1024559800_313745", "中标中国移动集采"),
    ("合作签约", "https://www.sohu.com/a/989535397_121857546", "ASDM平台签约近亿元"),
    ("公司动态", "https://m.sohu.com/a/989613997_122014422", "33.48亿元定增完成"),
    ("公司动态", "https://www.sohu.com/a/996159499_121857546", "服务内涵转型智能能力"),

    # === 其他已验证站点 ===
    ("合作签约", "https://finance.sina.com.cn/stock/relnews/cn/2026-04-16/doc-inhusenh2919443.shtml", "中标千万级集成供应"),
    ("公司动态", "http://stock.10jqka.com.cn/20260527/c677024769.shtml", "香港国际运营中心"),
    ("公司动态", "http://stock.10jqka.com.cn/20260410/c675905690.shtml", "Japan IT Week 2026"),
    ("公司动态", "http://stock.10jqka.com.cn/20260416/c676046819.shtml", "香港国际创科展"),
    ("公司动态", "http://stock.10jqka.com.cn/20260425/c676278929.shtml", "营收利润双增AI过半"),
    ("技术创新", "http://yuanchuang.10jqka.com.cn/20260525/c676958082.shtml", "国产CPU全覆盖"),
    ("生态合作", "http://stock.10jqka.com.cn/20260512/c676635368.shtml", "入驻华为佛山中心"),
    ("合作签约", "https://www.sohu.com/a/1024824534_121857546", "中标17.53亿AI增长"),
    ("技术创新", "https://www.kylinos.cn/about/news/2058722986681274370.html", "麒麟软件合作"),
    ("公司动态", "http://stock.10jqka.com.cn/20260527/c677024775.shtml", "香港启动加速全球化"),
]

def clean_title(t):
    t = re.sub(r'[-_|]\s*(网易订阅|同花顺|证券之星|新浪|搜狐|凤凰|网易).*$', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t[:200]

def extract_date(page, url):
    for sel in ['meta[property="article:published_time"]::attr(content)',
                'meta[name="pubdate"]::attr(content)',
                'meta[name="publish_date"]::attr(content)']:
        d = page.css(sel).get()
        if d:
            m = re.match(r'(\d{4}-\d{2}-\d{2})', d)
            if m: return m.group(1)
    m = re.search(r'(\d{4})[-/](\d{2})[-/](\d{2})', url)
    if m: return f'{m.group(1)}-{m.group(2)}-{m.group(3)}'
    txt = page.css('body::text').get() or ''
    m = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', txt)
    if m: return f'{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}'
    return None

def extract_cover(page):
    og = page.css('meta[property="og:image"]::attr(content)').get()
    if og and not any(x in (og or '').lower() for x in ['logo', 'icon', 'avatar']):
        if og.startswith('//'): og = 'https:' + og
        if og.startswith('http'): return og
    for sel in ['article img::attr(src)', '.post_body img::attr(src)',
                '.article-body img::attr(src)', '.post-content img::attr(src)']:
        imgs = page.css(sel).getall()
        for img in imgs:
            if not img: continue
            if any(x in img.lower() for x in ['icon', 'avatar', 'logo', 'banner', 'qr_code', 'weixin', 'wx_', 'share_', 'btn_', 'code', 'loading', 'placeholder', 'default', 'topapp', 'location']):
                continue
            if '/videoimg/' in img or '/cover/' in img: continue
            if img.startswith('//'): img = 'https:' + img
            if img.startswith('http'): return img
    # Fallback: og:image even if it might be a logo
    if og:
        if og.startswith('//'): og = 'https:' + og
        return og
    return None

def extract_content(page):
    for sel in ['article', '.post_body', '.article-body', '.post-content',
                '.article-content', '.news-content', '[class*="article"]']:
        el = page.css(sel)
        if el:
            text = el[0].css('::text').getall()
            text = [t.strip() for t in text if t.strip()]
            if text: return '\n\n'.join(text)[:8000]
    text = page.css('body::text').getall()
    text = [t.strip() for t in text if t.strip() and len(t) > 20]
    return '\n\n'.join(text)[:8000]

def main():
    results = []
    seen_titles = set()

    for i, (cat, url, label) in enumerate(URLS):
        print(f'[{i+1}/{len(URLS)}] {cat} | {label}')
        try:
            page = Fetcher.get(url, impersonate='chrome', stealthy_headers=True)
            title = (page.css('meta[property="og:title"]::attr(content)').get()
                     or page.css('title::text').get() or '').strip()
            title = clean_title(title)
            if not title or len(title) < 5:
                print(f'  SKIP: bad title')
                continue
            if title in seen_titles:
                print(f'  SKIP: duplicate')
                continue
            seen_titles.add(title)

            cover = extract_cover(page)
            date = extract_date(page, url) or f'2026-{i:02d}-01'  # fallback
            content = extract_content(page)
            domain = urlparse(url).netloc.replace('www.', '')

            print(f'  "{title[:60]}"')
            print(f'  IMG: {cover}')
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
        except Exception as e:
            print(f'  FAIL: {e}')

    with open('scripts/scraped_articles2.json', 'w', encoding='utf-8') as f:
        json.dump({'count': len(results), 'articles': results}, f, ensure_ascii=False, indent=2)
    print(f'\nDone: {len(results)} articles')

if __name__ == '__main__':
    main()

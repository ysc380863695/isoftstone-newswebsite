const { useState, useEffect, useCallback, useMemo, useRef } = React;

/* ============================================
   API 层 — 对齐 api-contracts.md
   ============================================ */
async function fetchAPI(path, options = {}) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function buildQueryString(filters) {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.keyword) params.set('keyword', filters.keyword);
  params.set('page', filters.page);
  params.set('pageSize', filters.pageSize);
  return params.toString();
}

/* ============================================
   筛选状态 Hook
   ============================================ */
function useNewsFilters() {
  const [filters, setFilters] = useState({
    category: '',
    keyword: '',
    page: 1,
    pageSize: 12,
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  return { filters, updateFilter, setPage };
}

/* ============================================
   SkeletonCard 组件
   ============================================ */
function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        width: '100%', height: '180px',
        background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-secondary) 50%, var(--bg-elevated) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
      <div style={{ padding: 'var(--space-4)' }}>
        <div style={{
          height: 18, width: '80%', borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-elevated)', marginBottom: 'var(--space-3)',
        }} />
        <div style={{
          height: 14, width: '100%', borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-elevated)', marginBottom: 'var(--space-2)',
        }} />
        <div style={{
          height: 14, width: '60%', borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-elevated)', marginBottom: 'var(--space-4)',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ height: 12, width: 60, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }} />
          <div style={{ height: 12, width: 80, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }} />
        </div>
      </div>
    </div>
  );
}

/* ============================================
   NewsCard 组件 — 对齐 api-contracts.md
   ============================================ */
function NewsCard({ news, onClick, index }) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(news.id)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(news.id)}
      aria-label={news.title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
        transform: hovered
          ? 'perspective(800px) rotateY(-2deg) rotateX(1deg) translateY(-4px)'
          : 'none',
        transition: 'transform var(--duration-normal) var(--ease-spring), box-shadow var(--duration-normal)',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        outline: 'none',
        animation: `cardEnter 0.4s ${Math.min(index || 0, 11) * 0.04}s both cubic-bezier(0, 0, 0.2, 1)`,
      }}
    >
      {/* 封面图 */}
      <div style={{
        width: '100%', height: '180px', position: 'relative', overflow: 'hidden',
      }}>
        {!imgLoaded && <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-secondary) 50%, var(--bg-elevated) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />}
        <img
          src={news.coverImage}
          alt=""
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: imgLoaded ? 1 : 0,
            transition: 'opacity var(--duration-normal)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 50%, rgba(10,10,10,0.85))',
        }} />
        {/* 分类标签 */}
        <span style={{
          position: 'absolute', bottom: 'var(--space-2)', left: 'var(--space-3)',
          background: 'rgba(0,75,141,0.9)',
          color: '#fff', padding: '2px var(--space-2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)', fontWeight: 600,
        }}>{news.category}</span>
        {/* 信源标记 */}
        {news.source === 'isoftstone.com' && (
          <span style={{
            position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)',
            background: 'rgba(255,107,53,0.9)',
            color: '#fff', padding: '2px var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)', fontWeight: 600,
          }}>官方</span>
        )}
      </div>

      {/* 内容区 */}
      <div style={{ padding: 'var(--space-4)' }}>
        <h3 style={{
          fontSize: 'var(--text-base)', fontWeight: 600,
          lineHeight: 'var(--leading-snug)', marginBottom: 'var(--space-2)',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{news.title}</h3>

        <p style={{
          fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)',
          lineHeight: 'var(--leading-relaxed)',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 'var(--space-3)',
        }}>{news.summary}</p>

        {/* 标签 */}
        {news.tags && news.tags.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)',
            marginBottom: 'var(--space-3)',
          }}>
            {news.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                padding: '1px var(--space-2)',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
              }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* 底栏：信源 + 日期 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingTop: 'var(--space-2)',
        }}>
          <span>{news.source}</span>
          <time dateTime={news.publishDate}>{news.publishDate}</time>
        </div>
      </div>
    </article>
  );
}

/* ============================================
   NewsGrid 组件 — 带分页和骨架屏
   ============================================ */
function NewsGrid({ response, loading, onLoadMore, onCardClick }) {
  const { total, page, pageSize, data } = response;
  const hasMore = page * pageSize < total;

  return (
    <main className="container" style={{ padding: 'var(--space-8) 0', minHeight: '50vh' }}>
      {/* 结果统计 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 'var(--space-6)',
      }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          共 {total} 条结果
          {total > 0 && ` · 第 ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} 条`}
        </span>
      </div>

      {/* 网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-6)',
      }}>
        {loading ? (
          Array.from({ length: pageSize }, (_, i) => <SkeletonCard key={`sk-${i}`} />)
        ) : (
          data.map((item, i) => (
            <NewsCard key={item.id} news={item} onClick={onCardClick} index={i} />
          ))
        )}
      </div>

      {/* 加载更多 */}
      {!loading && hasMore && (
        <div style={{
          display: 'flex', justifyContent: 'center',
          marginTop: 'var(--space-10)',
        }}>
          <button onClick={() => onLoadMore(page + 1)} style={{
            padding: 'var(--space-3) var(--space-8)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-sm)', fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all var(--duration-fast) var(--ease-default)',
            cursor: 'pointer',
          }}>
            加载更多
          </button>
        </div>
      )}

      {/* 空状态 */}
      {!loading && data.length === 0 && (
        <div style={{
          textAlign: 'center', padding: 'var(--space-16) 0',
          color: 'var(--text-tertiary)',
        }}>
          <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)', opacity: 0.3 }}>
            📰
          </div>
          <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>暂无匹配的新闻</p>
          <p style={{ fontSize: 'var(--text-sm)' }}>试试调整筛选条件</p>
        </div>
      )}
    </main>
  );
}

/* ============================================
   SearchBar 组件
   ============================================ */
function SearchBar({ value, onChange }) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(val), 300);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 480 }}>
      <svg
        style={{
          position: 'absolute', left: 'var(--space-3)', top: '50%',
          transform: 'translateY(-50%)', opacity: 0.4,
        }}
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder="搜索新闻标题、摘要、标签..."
        aria-label="搜索新闻"
        style={{
          width: '100%',
          padding: 'var(--space-2) var(--space-4) var(--space-2) var(--space-10)',
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-sm)',
          outline: 'none',
          transition: 'border-color var(--duration-fast)',
        }}
      />
      {localValue && (
        <button
          onClick={handleClear}
          aria-label="清除搜索"
          style={{
            position: 'absolute', right: 'var(--space-3)', top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)',
          }}
        >&times;</button>
      )}
    </div>
  );
}

/* ============================================
   CategoryFilter 组件 — 分类筛选标签
   ============================================ */
function CategoryFilter({ value, onChange, categories }) {
  return (
    <div style={{
      display: 'flex', gap: 6, flexShrink: 0,
    }}>
      <button onClick={() => onChange('')} style={{
        padding: '4px 14px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)', fontWeight: 500,
        background: !value ? 'var(--color-brand-500)' : 'transparent',
        color: !value ? '#fff' : 'var(--text-secondary)',
        border: '1px solid ' + (!value ? 'var(--color-brand-500)' : 'rgba(255,255,255,0.1)'),
        transition: 'all var(--duration-fast)',
        cursor: 'pointer', whiteSpace: 'nowrap',
        lineHeight: '20px',
      }}>全部</button>
      {(categories || []).map(cat => (
        <button key={cat} onClick={() => onChange(value === cat ? '' : cat)} style={{
          padding: '4px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-xs)', fontWeight: 500,
          background: value === cat ? 'var(--color-brand-500)' : 'transparent',
          color: value === cat ? '#fff' : 'var(--text-secondary)',
          border: '1px solid ' + (value === cat ? 'var(--color-brand-500)' : 'rgba(255,255,255,0.1)'),
          transition: 'all var(--duration-fast)',
          cursor: 'pointer', whiteSpace: 'nowrap',
          lineHeight: '20px',
        }}>{cat}</button>
      ))}
    </div>
  );
}

/* ============================================
   Header 组件 — Logo + 搜索 + 分类标签
   ============================================ */
function Header({ filters, updateFilter, categories }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 'var(--z-sticky)',
      height: 'var(--header-height)',
      background: 'rgba(10, 10, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        width: '100%',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-300))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 'var(--text-sm)', color: '#fff',
          }}>iS</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'var(--text-lg)', letterSpacing: '-0.02em',
          }}>isoftstone</span>
          <span style={{
            color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)',
          }}>新闻中心</span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, minWidth: 0 }} />

        {/* Search + Category tags */}
        <SearchBar value={filters.keyword} onChange={(v) => updateFilter('keyword', v)} />
        <CategoryFilter
          value={filters.category}
          onChange={(v) => updateFilter('category', v)}
          categories={categories}
        />
      </div>
    </header>
  );
}

/* ============================================
   Hero 轮播
   ============================================ */
function HeroSection({ heroNews }) {
  const [current, setCurrent] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (heroNews.length === 0) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % heroNews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroNews.length]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (heroNews.length === 0) return null;
  const hero = heroNews[current];

  // Create a shorter, polished excerpt for the Hero (truncate at sentence boundary ~100 chars)
  const text = hero.summary || '';
  let heroExcerpt = text;
  if (text.length > 100) {
    const chunk = text.substring(0, 100);
    const lastPeriod = Math.max(chunk.lastIndexOf('。'), chunk.lastIndexOf('！'), chunk.lastIndexOf('？'));
    if (lastPeriod >= 40) {
      heroExcerpt = chunk.substring(0, lastPeriod + 1);
    } else {
      const nextPeriod = text.indexOf('。', 100);
      if (nextPeriod > 0 && nextPeriod < 150) {
        heroExcerpt = text.substring(0, nextPeriod + 1);
      } else {
        heroExcerpt = chunk + '...';
      }
    }
  }

  return (
    <section aria-label="精选新闻" style={{
      position: 'relative', height: 'clamp(300px, 50vh, 500px)', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${hero.coverImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        transform: `translateY(${scrollY * 0.3}px)`,
        willChange: 'transform',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, var(--bg-primary) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.3) 100%)',
        }} />
      </div>

      <div className="container" style={{
        position: 'relative', zIndex: 1, height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', paddingBottom: 'var(--space-10)',
      }}>
        <span style={{
          display: 'inline-block', background: 'var(--color-accent-500)',
          color: '#fff', padding: 'var(--space-1) var(--space-3)',
          borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)',
          fontWeight: 600, marginBottom: 'var(--space-3)', width: 'fit-content',
        }}>{hero.category}</span>
        <h1 className="hero-title" style={{
          fontSize: 'var(--text-hero)', fontWeight: 800,
          maxWidth: '800px', lineHeight: 1.15, marginBottom: 'var(--space-4)',
        }}>{hero.title}</h1>
        {heroExcerpt && (
          <p className="hero-summary" style={{
            fontSize: 'var(--text-base)', color: 'var(--text-secondary)',
            maxWidth: '560px', lineHeight: 'var(--leading-relaxed)',
            opacity: 0.85,
          }}>{heroExcerpt}</p>
        )}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
          {heroNews.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              aria-label={`切换到第${i + 1}条新闻`}
              style={{
                width: i === current ? '32px' : '8px', height: '8px',
                borderRadius: 'var(--radius-full)',
                background: i === current ? 'var(--color-brand-400)' : 'rgba(255,255,255,0.3)',
                transition: 'all var(--duration-normal) var(--ease-default)',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   NewsDetailModal — 对齐 GET /api/news/:id
   ============================================ */
function NewsDetailModal({ news, relatedNews, onClose, onRelatedClick }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  // ESC 关闭 + body 滚动锁定
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const sentimentMap = {
    positive: { color: 'var(--color-success)', bg: 'rgba(34,197,94,0.1)', label: '正面' },
    neutral:  { color: 'var(--text-tertiary)', bg: 'rgba(160,160,160,0.1)', label: '中性' },
    negative: { color: 'var(--color-error)',   bg: 'rgba(239,68,68,0.1)',   label: '负面' },
  };
  const sentiment = sentimentMap[news.sentiment] || sentimentMap.neutral;

  const sectionTitle = {
    fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)',
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={news.title}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 'var(--z-modal)',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn var(--duration-fast)',
      }}
    >
      {/* Modal container */}
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 1100, maxHeight: '90vh',
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        animation: 'slideUp var(--duration-normal) var(--ease-spring)',
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>新闻详情</span>
          <button onClick={onClose} aria-label="关闭" style={{
            color: 'var(--text-tertiary)', fontSize: 'var(--text-xl)',
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-md)', transition: 'background var(--duration-fast)',
          }}>&times;</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* ── LEFT: Main content ── */}
            <div style={{ flex: '1 1 500px', minWidth: 0 }}>
              {news.coverImage && (
                <div style={{ width: '100%', height: 280, position: 'relative', overflow: 'hidden' }}>
                  <img src={news.coverImage} alt="" onLoad={() => setImgLoaded(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity var(--duration-normal)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, var(--bg-surface))' }} />
                </div>
              )}

              <div style={{ padding: 'var(--space-6) var(--space-8)' }}>
                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '2px var(--space-2)', background: 'rgba(0,75,141,0.9)',
                    color: '#fff', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', fontWeight: 600,
                  }}>{news.category}</span>
                  <time dateTime={news.publishDate} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{news.publishDate}</time>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>· {news.source}</span>
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: 'var(--text-3xl)', fontWeight: 800, lineHeight: 'var(--leading-tight)',
                  marginBottom: 'var(--space-6)', letterSpacing: '-0.02em',
                }}>{news.title}</h2>

                {/* AI Summary highlighted */}
                <div style={{
                  padding: 'var(--space-4) var(--space-5)',
                  background: 'rgba(0,75,141,0.08)',
                  borderLeft: '3px solid var(--color-brand-500)',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  marginBottom: 'var(--space-6)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-brand-400)">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-brand-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI 摘要</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{news.summary}</p>
                </div>

                {/* Content body */}
                {news.content && (
                  <div className="article-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content || '') }} />
                )}

                {/* Tags */}
                {news.tags && news.tags.length > 0 && (
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)',
                    marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {news.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '2px var(--space-2)', background: 'rgba(255,255,255,0.06)',
                        borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
                      }}>#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Key info sidebar ── */}
            <aside style={{
              flex: '0 0 300px', borderLeft: '1px solid rgba(255,255,255,0.06)',
              padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)',
            }}>
              {/* Sentiment */}
              <div>
                <h4 style={sectionTitle}>情感分析</h4>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: sentiment.bg, borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-sm)', fontWeight: 500, color: sentiment.color,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: sentiment.color }} />
                  {sentiment.label}
                </span>
              </div>

              {/* Key entities */}
              <div>
                <h4 style={sectionTitle}>关键信息</h4>
                {news.keyEntities.people && news.keyEntities.people.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-1)' }}>人物</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                      {news.keyEntities.people.map(p => (
                        <span key={p} style={{
                          padding: '1px var(--space-2)', background: 'rgba(255,255,255,0.06)',
                          borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                        }}>{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {news.keyEntities.companies && news.keyEntities.companies.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-1)' }}>企业</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                      {news.keyEntities.companies.map(c => (
                        <span key={c} style={{
                          padding: '1px var(--space-2)', background: 'rgba(255,255,255,0.06)',
                          borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                        }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {news.keyEntities.numbers && news.keyEntities.numbers.length > 0 && (
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-1)' }}>数据</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                      {news.keyEntities.numbers.map(n => (
                        <span key={n} style={{
                          padding: '1px var(--space-2)', background: 'rgba(255,107,53,0.1)',
                          borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)', color: 'var(--color-accent-400)', fontWeight: 500,
                        }}>{n}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Source link */}
              <div>
                <h4 style={sectionTitle}>来源</h4>
                <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                  fontSize: 'var(--text-sm)', color: 'var(--color-brand-400)',
                }}>
                  查看原文
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              </div>

              {/* Related news */}
              {relatedNews && relatedNews.length > 0 && (
                <div>
                  <h4 style={sectionTitle}>相关推荐</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {relatedNews.map(rn => (
                      <div key={rn.id} role="button" tabIndex={0}
                        onClick={() => onRelatedClick(rn.id)}
                        onKeyDown={(e) => e.key === 'Enter' && onRelatedClick(rn.id)}
                        style={{
                          padding: 'var(--space-3)', background: 'var(--bg-elevated)',
                          borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          transition: 'background var(--duration-fast)',
                        }}
                      >
                        <h5 style={{
                          fontSize: 'var(--text-sm)', fontWeight: 600, lineHeight: 'var(--leading-snug)',
                          marginBottom: 'var(--space-1)',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{rn.title}</h5>
                        <p style={{
                          fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{rn.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   ChatWidget — 对齐 WS /api/chat
   ============================================ */
function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, role: 'assistant', content: '你好！我是软通新闻AI助手，可以帮你查询新闻、回答问题。有什么想了解的？', sources: [] }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const msgEndRef = useRef(null);
  const inputRef = useRef(null);
  const nextId = useRef(1);
  const wsRef = useRef(null);
  const sessionIdRef = useRef(null);
  const currentAssistantIdRef = useRef(null);

  useEffect(() => {
    if (open) {
      msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, thinking, open]);

  // WebSocket 连接管理 — 返回 Promise，确保连接已打开
  const getWs = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return Promise.resolve(wsRef.current);
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${proto}//${location.host}/api/chat`);
    wsRef.current = ws;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        wsRef.current = null;
        reject(new Error('WebSocket 连接超时'));
      }, 5000);
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'token') {
            const aid = currentAssistantIdRef.current;
            if (aid !== null) {
              setMessages(prev => prev.map(m =>
                m.id === aid ? { ...m, content: (m.content || '') + data.content } : m
              ));
            }
          } else if (data.type === 'sources') {
            const aid = currentAssistantIdRef.current;
            if (aid !== null) {
              setMessages(prev => prev.map(m =>
                m.id === aid ? { ...m, sources: data.news } : m
              ));
            }
          } else if (data.type === 'done') {
            if (data.sessionId) sessionIdRef.current = data.sessionId;
            setThinking(false);
            currentAssistantIdRef.current = null;
          } else if (data.type === 'error') {
            setThinking(false);
            currentAssistantIdRef.current = null;
          }
        };
        ws.onerror = () => { setThinking(false); };
        resolve(ws);
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        wsRef.current = null;
        reject(new Error('WebSocket 连接失败'));
      };
    });
  }, []);

  // 清理 WebSocket
  useEffect(() => {
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    const uid = nextId.current++;
    const aid = nextId.current++;
    currentAssistantIdRef.current = aid;
    setMessages(prev => [...prev,
      { id: uid, role: 'user', content: text },
      { id: aid, role: 'assistant', content: '', sources: [] },
    ]);
    setInput('');
    setThinking(true);
    try {
      const ws = await getWs();
      ws.send(JSON.stringify({
        type: 'message',
        content: text,
        sessionId: sessionIdRef.current || undefined,
      }));
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === aid ? { ...m, content: '连接失败，请稍后重试。' } : m
      ));
      setThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(!open)} aria-label="智能问答" style={{
        position: 'fixed', bottom: 'var(--space-6)', right: 'var(--space-6)',
        width: 56, height: 56, borderRadius: 'var(--radius-full)',
        background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-400))',
        boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 'var(--z-overlay)',
        transition: 'transform var(--duration-fast) var(--ease-spring)',
        transform: open ? 'scale(0.9)' : 'scale(1)',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 'calc(var(--space-6) + 72px)', right: 'var(--space-6)',
          width: 360, height: 500,
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'var(--shadow-xl)', zIndex: 'var(--z-modal)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp var(--duration-normal) var(--ease-spring)',
        }}>
          {/* Header */}
          <div style={{
            padding: 'var(--space-4)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>智能问答</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="关闭对话" style={{
              color: 'var(--text-tertiary)', fontSize: 'var(--text-lg)',
            }}>&times;</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflow: 'auto', padding: 'var(--space-4)',
            display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%', padding: 'var(--space-3) var(--space-4)',
                  borderRadius: msg.role === 'user'
                    ? 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)'
                    : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                  background: msg.role === 'user' ? 'var(--color-brand-500)' : 'var(--bg-elevated)',
                  fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)',
                }}>
                  {msg.role === 'assistant' ? (
                    <div className="chat-markdown"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(msg.content)) }}
                    />
                  ) : msg.content}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {msg.sources.map(src => (
                        <a key={src.id} href={src.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                          display: 'block', padding: 'var(--space-2) var(--space-3)',
                          background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)', color: 'var(--color-brand-300)',
                          textDecoration: 'none', lineHeight: 'var(--leading-snug)',
                        }}>📄 {src.title}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)',
                        animation: `typingDot 1.4s ${i * 0.2}s infinite ease-in-out`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 'var(--space-2)', flexShrink: 0,
          }}>
            <input ref={inputRef} type="text" value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="输入问题..." disabled={thinking} aria-label="输入问题"
              style={{
                flex: 1, padding: 'var(--space-2) var(--space-3)',
                background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', outline: 'none',
              }}
            />
            <button onClick={handleSend} disabled={thinking || !input.trim()} aria-label="发送"
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-full)',
                background: input.trim() && !thinking ? 'var(--color-brand-500)' : 'var(--bg-elevated)',
                color: input.trim() && !thinking ? '#fff' : 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all var(--duration-fast)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================
   Footer
   ============================================ */
function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: 'var(--space-8) 0', marginTop: 'var(--space-8)',
    }}>
      <div className="container" style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)',
      }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          &copy; 2026 iSoftStone News. All rights reserved.
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Powered by AI</div>
      </div>
    </footer>
  );
}

/* ============================================
   App 根组件
   ============================================ */
function App() {
  const { filters, updateFilter, setPage } = useNewsFilters();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({ total: 0, page: 1, pageSize: 12, data: [] });
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [detailData, setDetailData] = useState(null);
  const [heroNews, setHeroNews] = useState([]);

  // 加载分类
  useEffect(() => {
    fetchAPI('/api/categories')
      .then(cats => setCategories(cats.map(c => c.name)))
      .catch(() => {});
  }, []);

  // 加载固定 Hero 文章
  useEffect(() => {
    const heroIds = [71, 118, 141];
    Promise.all(heroIds.map(id => fetchAPI('/api/news/' + id).catch(() => null)))
      .then(results => setHeroNews(results.filter(Boolean)));
  }, []);

  // 真实 API 请求新闻列表
  useEffect(() => {
    setLoading(true);
    fetchAPI('/api/news?' + buildQueryString(filters))
      .then(result => setResponse(result))
      .catch(() => setResponse({ total: 0, page: 1, pageSize: 12, data: [] }))
      .finally(() => setLoading(false));
  }, [filters]);

  // 加载更多（不更新 filters.page，避免触发 useEffect 重新拉取覆盖数据）
  const handleLoadMore = useCallback((page) => {
    setLoading(true);
    const newFilters = { ...filters, page };
    fetchAPI('/api/news?' + buildQueryString(newFilters))
      .then(result => {
        setResponse(prev => ({
          ...result,
          data: [...prev.data, ...result.data],
          page, // 更新合并后的页码
        }));
      })
      .catch(() => { /* 静默失败，按钮自然隐藏 */ })
      .finally(() => setLoading(false));
  }, [filters]);

  // 加载详情
  useEffect(() => {
    if (!selectedNewsId) { setDetailData(null); return; }
    fetchAPI('/api/news/' + selectedNewsId)
      .then(data => setDetailData(data))
      .catch(() => setDetailData(null));
  }, [selectedNewsId]);

  const handleCardClick = useCallback((id) => {
    setSelectedNewsId(id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedNewsId(null);
  }, []);

  const handleRelatedClick = useCallback((id) => {
    setSelectedNewsId(id);
  }, []);

  // Hero 使用固定精选文章
  return (
    <div id="app-root">
      <Header filters={filters} updateFilter={updateFilter} categories={categories} />
      {heroNews.length > 0 && <HeroSection heroNews={heroNews} />}
      <NewsGrid
        response={response}
        loading={loading}
        onLoadMore={handleLoadMore}
        onCardClick={handleCardClick}
      />
      <Footer />
      <ChatWidget />
      {detailData && (
        <NewsDetailModal
          news={detailData}
          relatedNews={detailData.relatedNews}
          onClose={handleCloseDetail}
          onRelatedClick={handleRelatedClick}
        />
      )}
    </div>
  );
}

/* ── 挂载 ── */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

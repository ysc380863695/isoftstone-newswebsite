const { useState, useEffect, useCallback, useMemo, useRef } = React;

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

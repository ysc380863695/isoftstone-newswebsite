const { useState, useEffect, useCallback, useMemo, useRef } = React;

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

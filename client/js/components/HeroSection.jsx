const { useState, useEffect, useCallback, useMemo, useRef } = React;

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
      position: 'relative', height: 'clamp(364px, calc(50vh + 64px), 564px)', overflow: 'hidden',
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

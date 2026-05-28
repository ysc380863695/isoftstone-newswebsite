const { useState, useEffect, useCallback, useMemo, useRef } = React;

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

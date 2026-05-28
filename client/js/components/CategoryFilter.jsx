const { useState, useEffect, useCallback, useMemo, useRef } = React;

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

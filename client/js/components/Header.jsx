const { useState, useEffect, useCallback, useMemo, useRef } = React;

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

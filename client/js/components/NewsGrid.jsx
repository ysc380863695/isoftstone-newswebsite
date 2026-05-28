const { useState, useEffect, useCallback, useMemo, useRef } = React;

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

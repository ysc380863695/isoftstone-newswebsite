const { useState, useEffect, useCallback, useMemo, useRef } = React;

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

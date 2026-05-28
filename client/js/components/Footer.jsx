const { useState, useEffect, useCallback, useMemo, useRef } = React;

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

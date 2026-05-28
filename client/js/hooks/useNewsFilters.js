const { useState, useEffect, useCallback, useMemo, useRef } = React;

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

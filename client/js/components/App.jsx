const { useState, useEffect, useCallback, useMemo, useRef } = React;

/* ============================================
   App 根组件
   ============================================ */
function App() {
  const { filters, updateFilter, setPage } = useNewsFilters();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({ total: 0, page: 1, pageSize: 12, data: [] });
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [detailData, setDetailData] = useState(null);
  const [heroNews, setHeroNews] = useState([]);

  // 加载分类
  useEffect(() => {
    fetchAPI('/api/categories')
      .then(cats => setCategories(cats.map(c => c.name)))
      .catch(() => {});
  }, []);

  // 加载固定 Hero 文章
  useEffect(() => {
    const heroIds = [71, 118, 141];
    Promise.all(heroIds.map(id => fetchAPI('/api/news/' + id).catch(() => null)))
      .then(results => setHeroNews(results.filter(Boolean)));
  }, []);

  // 真实 API 请求新闻列表
  useEffect(() => {
    setLoading(true);
    fetchAPI('/api/news?' + buildQueryString(filters))
      .then(result => setResponse(result))
      .catch(() => setResponse({ total: 0, page: 1, pageSize: 12, data: [] }))
      .finally(() => setLoading(false));
  }, [filters]);

  // 加载更多（不更新 filters.page，避免触发 useEffect 覆盖数据）
  const handleLoadMore = useCallback((page) => {
    setLoading(true);
    const newFilters = { ...filters, page };
    fetchAPI('/api/news?' + buildQueryString(newFilters))
      .then(result => {
        setResponse(prev => ({
          ...result,
          data: [...prev.data, ...result.data],
          page,
        }));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [filters]);

  // 加载详情
  useEffect(() => {
    if (!selectedNewsId) { setDetailData(null); return; }
    fetchAPI('/api/news/' + selectedNewsId)
      .then(data => setDetailData(data))
      .catch(() => setDetailData(null));
  }, [selectedNewsId]);

  const handleCardClick = useCallback((id) => {
    setSelectedNewsId(id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedNewsId(null);
  }, []);

  const handleRelatedClick = useCallback((id) => {
    setSelectedNewsId(id);
  }, []);

  return (
    <div id="app-root">
      <Header filters={filters} updateFilter={updateFilter} categories={categories} />
      {heroNews.length > 0 && <HeroSection heroNews={heroNews} />}
      <NewsGrid
        response={response}
        loading={loading}
        onLoadMore={handleLoadMore}
        onCardClick={handleCardClick}
      />
      <Footer />
      <ChatWidget />
      {detailData && (
        <NewsDetailModal
          news={detailData}
          relatedNews={detailData.relatedNews}
          onClose={handleCloseDetail}
          onRelatedClick={handleRelatedClick}
        />
      )}
    </div>
  );
}

/* ── 挂载 ── */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

/* ============================================
   API 层 — 对齐 api-contracts.md
   ============================================ */
// 本地开发用 ''，部署到子路径时改为 '/ysc'
const BASE = '';

async function fetchAPI(path, options = {}) {
  const res = await fetch(BASE + path, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function buildQueryString(filters) {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.keyword) params.set('keyword', filters.keyword);
  params.set('page', filters.page);
  params.set('pageSize', filters.pageSize);
  return params.toString();
}

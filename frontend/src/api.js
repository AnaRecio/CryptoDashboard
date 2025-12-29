const BASE = import.meta.env.VITE_API_BASE_URL

async function http(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
    return res.json();
}

export const api = {
    health: () => http('/health'),
    ingestMarket: () => http('/ingest/market', { method: 'POST' }),
    topMarket: (limit = 20) => http(`/market/top?limit=${limit}`),
    coinSnapshot: (coingeckoId, limit = 100) => http(`/coins/${coingeckoId}/snapshots?limit=${limit}`),
};
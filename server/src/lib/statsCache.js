const TTL_MS = 30_000;
const MAX_ENTRIES = 50;
const cache = new Map();

export function getCachedStats(key = 'all') {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < TTL_MS) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

export function setCachedStats(key, data) {
  cache.set(key, { data, at: Date.now() });
  if (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

export function invalidateStatsCache() {
  cache.clear();
}

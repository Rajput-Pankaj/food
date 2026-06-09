let cached = null;
let cachedAt = 0;
const TTL_MS = 30_000;

export function getCachedStats() {
  if (cached && Date.now() - cachedAt < TTL_MS) {
    return cached;
  }
  return null;
}

export function setCachedStats(data) {
  cached = data;
  cachedAt = Date.now();
}

export function invalidateStatsCache() {
  cached = null;
  cachedAt = 0;
}

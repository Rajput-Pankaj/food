import { describe, expect, it, beforeEach } from 'vitest';
import { getCachedStats, setCachedStats, invalidateStatsCache } from './statsCache.js';

describe('statsCache', () => {
  beforeEach(() => {
    invalidateStatsCache();
  });

  it('returns null when empty', () => {
    expect(getCachedStats()).toBeNull();
  });

  it('stores and returns cached stats', () => {
    const data = { totalOrders: 5, revenue: 1000 };
    setCachedStats(data);
    expect(getCachedStats()).toEqual(data);
  });

  it('invalidates cache', () => {
    setCachedStats({ totalOrders: 1 });
    invalidateStatsCache();
    expect(getCachedStats()).toBeNull();
  });
});

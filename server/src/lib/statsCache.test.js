import { describe, expect, it, beforeEach } from 'vitest';
import { getCachedStats, setCachedStats, invalidateStatsCache } from './statsCache.js';

describe('statsCache', () => {
  beforeEach(() => {
    invalidateStatsCache();
  });

  it('returns null when empty', () => {
    expect(getCachedStats('any-key')).toBeNull();
  });

  it('stores and returns cached stats per key', () => {
    const data = { totalOrders: 5, revenue: 1000 };
    setCachedStats('range-a', data);
    expect(getCachedStats('range-a')).toEqual(data);
    expect(getCachedStats('range-b')).toBeNull();
  });

  it('invalidates all cached entries', () => {
    setCachedStats('key-1', { totalOrders: 1 });
    setCachedStats('key-2', { totalOrders: 2 });
    invalidateStatsCache();
    expect(getCachedStats('key-1')).toBeNull();
    expect(getCachedStats('key-2')).toBeNull();
  });
});

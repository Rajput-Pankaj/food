import { describe, expect, it } from 'vitest';
import { hashToken } from './tokenHash.js';

describe('hashToken', () => {
  it('returns deterministic sha256 hex', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
    expect(hashToken('abc')).not.toBe(hashToken('abcd'));
  });
});

import { describe, expect, it } from 'vitest';
import { findUserRank, toFiniteScore } from '../src/lib/leaderboard';

describe('toFiniteScore', () => {
  it('returns the number when given a number', () => {
    expect(toFiniteScore(85.5)).toBe(85.5);
    expect(toFiniteScore(0)).toBe(0);
    expect(toFiniteScore(100)).toBe(100);
  });

  it('parses numeric strings', () => {
    expect(toFiniteScore('85.5')).toBe(85.5);
    expect(toFiniteScore('100')).toBe(100);
    expect(toFiniteScore('0')).toBe(0);
  });

  it('returns 0 for null, undefined, and unparseable strings', () => {
    expect(toFiniteScore(null)).toBe(0);
    expect(toFiniteScore(undefined)).toBe(0);
    expect(toFiniteScore('')).toBe(0);
    expect(toFiniteScore('not-a-number')).toBe(0);
  });

  it('clamps to [0, 100]', () => {
    expect(toFiniteScore(150)).toBe(100);
    expect(toFiniteScore(-10)).toBe(0);
    expect(toFiniteScore('999')).toBe(100);
  });
});

describe('findUserRank', () => {
  const entries = [
    { user_id: 'u-1' },
    { user_id: 'u-2' },
    { user_id: 'u-3' },
  ];

  it('returns 1-indexed rank for a matching user', () => {
    expect(findUserRank(entries, 'u-1')?.rank).toBe(1);
    expect(findUserRank(entries, 'u-2')?.rank).toBe(2);
    expect(findUserRank(entries, 'u-3')?.rank).toBe(3);
  });

  it('returns null when the user is not in the list', () => {
    expect(findUserRank(entries, 'u-9')).toBeNull();
  });

  it('returns null when userId is null/empty', () => {
    expect(findUserRank(entries, null)).toBeNull();
    expect(findUserRank(entries, '')).toBeNull();
  });

  it('handles an empty entries list', () => {
    expect(findUserRank([], 'u-1')).toBeNull();
  });

  it('returns the matching entry object', () => {
    const result = findUserRank(entries, 'u-2');
    expect(result?.entry).toEqual({ user_id: 'u-2' });
  });
});

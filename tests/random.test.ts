import { describe, expect, it } from 'vitest';
import { generateSeed, seededShuffle } from '../src/utils/random';

describe('seededShuffle', () => {
  it('same seed → identical order (determinism)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(seededShuffle(arr, 12345)).toEqual(seededShuffle(arr, 12345));
  });

  it('different seeds → different orders (with high probability)', () => {
    const arr = Array.from({ length: 20 }, (_, i) => i);
    expect(seededShuffle(arr, 1)).not.toEqual(seededShuffle(arr, 2));
  });

  it('preserves every element exactly once', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const shuffled = seededShuffle(arr, 42);
    expect(shuffled).toHaveLength(arr.length);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(arr);
  });

  it('does not mutate the input array', () => {
    const arr = [1, 2, 3, 4, 5];
    const snapshot = [...arr];
    seededShuffle(arr, 99);
    expect(arr).toEqual(snapshot);
  });

  it('handles an empty array', () => {
    expect(seededShuffle([], 0)).toEqual([]);
  });

  it('handles a single-element array', () => {
    expect(seededShuffle([42], 0)).toEqual([42]);
  });

  it('handles the full 150-item professional bank', () => {
    const arr = Array.from({ length: 150 }, (_, i) => i);
    const shuffled = seededShuffle(arr, 7777);
    expect(shuffled).toHaveLength(150);
    expect(new Set(shuffled)).toEqual(new Set(arr));
  });

  it('seed 0 still produces a non-trivial shuffle', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = seededShuffle(arr, 0);
    expect(shuffled).not.toEqual(arr);
  });

  it('negative seed is treated as unsigned 32-bit', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(seededShuffle(arr, -1)).toEqual(seededShuffle(arr, 0xffffffff));
  });
});

describe('generateSeed', () => {
  it('returns a non-negative integer within 32-bit range', () => {
    for (let i = 0; i < 200; i++) {
      const s = generateSeed();
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(0xffffffff);
      expect(Number.isInteger(s)).toBe(true);
    }
  });

  it('produces many distinct values across 100 calls', () => {
    const seeds = new Set<number>();
    for (let i = 0; i < 100; i++) seeds.add(generateSeed());
    expect(seeds.size).toBeGreaterThan(50);
  });
});

import { describe, expect, it } from 'vitest';
import { generateSeed, groupedShuffle, seededShuffle } from '../src/utils/random';

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

describe('groupedShuffle', () => {
  type Item = { id: string; topic: string };
  const make = (n: number, topic: string, prefix: string): Item[] =>
    Array.from({ length: n }, (_, i) => ({ id: `${prefix}-${i}`, topic }));

  const GROUP_ORDER = ['Verbal', 'Analytical', 'Numerical', 'General'];
  const keyBy = (it: Item): string => it.topic;

  it('same seed produces identical ordering within each group', () => {
    const arr: Item[] = [
      ...make(3, 'Verbal', 'v'),
      ...make(2, 'Analytical', 'a'),
      ...make(3, 'Numerical', 'n'),
      ...make(2, 'General', 'g'),
    ];
    const a = groupedShuffle(arr, 42, keyBy, GROUP_ORDER);
    const b = groupedShuffle(arr, 42, keyBy, GROUP_ORDER);
    expect(a).toEqual(b);
  });

  it('different seeds produce different orderings (with high probability)', () => {
    const arr: Item[] = [
      ...make(10, 'Verbal', 'v'),
      ...make(10, 'Analytical', 'a'),
      ...make(10, 'Numerical', 'n'),
      ...make(10, 'General', 'g'),
    ];
    const a = groupedShuffle(arr, 1, keyBy, GROUP_ORDER);
    const b = groupedShuffle(arr, 2, keyBy, GROUP_ORDER);
    expect(a).not.toEqual(b);
  });

  it('preserves every element exactly once', () => {
    const arr: Item[] = [
      ...make(45, 'Verbal', 'v'),
      ...make(30, 'Analytical', 'a'),
      ...make(45, 'Numerical', 'n'),
      ...make(20, 'General', 'g'),
    ];
    const out = groupedShuffle(arr, 99, keyBy, GROUP_ORDER);
    expect(out).toHaveLength(arr.length);
    expect(new Set(out.map((x) => x.id))).toEqual(new Set(arr.map((x) => x.id)));
  });

  it('preserves the topic distribution of the input', () => {
    const arr: Item[] = [
      ...make(5, 'Verbal', 'v'),
      ...make(4, 'Analytical', 'a'),
      ...make(5, 'Numerical', 'n'),
      ...make(2, 'General', 'g'),
    ];
    const out = groupedShuffle(arr, 7, keyBy, GROUP_ORDER);
    const counts: Record<string, number> = { Verbal: 0, Analytical: 0, Numerical: 0, General: 0 };
    for (const it of out) counts[it.topic] += 1;
    expect(counts).toEqual({ Verbal: 5, Analytical: 4, Numerical: 5, General: 2 });
  });

  it('emits groups in the order specified by groupOrder', () => {
    const arr: Item[] = [
      ...make(2, 'Verbal', 'v'),
      ...make(2, 'Analytical', 'a'),
      ...make(2, 'Numerical', 'n'),
      ...make(2, 'General', 'g'),
    ];
    const out = groupedShuffle(arr, 5, keyBy, GROUP_ORDER);
    expect(out.map((x) => x.topic)).toEqual([
      ...Array(2).fill('Verbal'),
      ...Array(2).fill('Analytical'),
      ...Array(2).fill('Numerical'),
      ...Array(2).fill('General'),
    ]);
  });

  it('skips groups that are not present in groupOrder (does not emit them)', () => {
    const arr: Item[] = [
      ...make(2, 'Verbal', 'v'),
      ...make(2, 'Orphan', 'o'),
    ];
    const out = groupedShuffle(arr, 1, keyBy, ['Verbal']);
    expect(out.every((x) => x.topic === 'Verbal')).toBe(true);
    expect(out).toHaveLength(2);
  });

  it('does not mutate the input array', () => {
    const arr: Item[] = [
      ...make(3, 'Verbal', 'v'),
      ...make(3, 'Analytical', 'a'),
    ];
    const snapshot = [...arr];
    groupedShuffle(arr, 1, keyBy, GROUP_ORDER);
    expect(arr).toEqual(snapshot);
  });

  it('handles the full 150-item professional bank (Verbal 55 / Analytical 30 / Numerical 45 / General 20)', () => {
    const arr: Item[] = [
      ...make(55, 'Verbal', 'v'),
      ...make(30, 'Analytical', 'a'),
      ...make(45, 'Numerical', 'n'),
      ...make(20, 'General', 'g'),
    ];
    const out = groupedShuffle(arr, 123456, keyBy, GROUP_ORDER);
    expect(out).toHaveLength(150);
    expect(new Set(out.map((x) => x.id))).toEqual(new Set(arr.map((x) => x.id)));
    const counts: Record<string, number> = { Verbal: 0, Analytical: 0, Numerical: 0, General: 0 };
    for (const it of out) counts[it.topic] += 1;
    expect(counts).toEqual({ Verbal: 55, Analytical: 30, Numerical: 45, General: 20 });
  });

  it('shuffles within each group (not just the input order)', () => {
    const arr: Item[] = [
      ...make(8, 'Verbal', 'v'),
    ];
    const out = groupedShuffle(arr, 11, keyBy, ['Verbal']);
    expect(out.map((x) => x.id)).not.toEqual(arr.map((x) => x.id));
  });
});

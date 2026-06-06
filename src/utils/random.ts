/**
 * Deterministic PRNG (mulberry32) and a Fisher-Yates shuffle driven by it.
 * Used to randomize question order on each mock exam start while keeping the
 * result reproducible from a stored seed (so resume and review stay consistent).
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  if (arr.length <= 1) return arr.slice();
  const rng = mulberry32(seed);
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}

export function groupedShuffle<T>(arr: T[], seed: number, groupKey: (item: T) => string, groupOrder: string[]): T[] {
  const rng = mulberry32(seed);
  const groups = new Map<string, T[]>();
  for (const item of arr) {
    const key = groupKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  for (const group of groups.values()) {
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = group[i]!;
      group[i] = group[j]!;
      group[j] = tmp;
    }
  }
  const result: T[] = [];
  for (const key of groupOrder) {
    const group = groups.get(key);
    if (group) result.push(...group);
  }
  return result;
}

export function generateSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

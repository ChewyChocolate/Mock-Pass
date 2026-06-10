import { describe, expect, it } from 'vitest';
import {
  PROFESSIONAL_SECTIONS,
  PROFESSIONAL_TOPIC_WEIGHTS,
  calculateScore,
  getQuestionsForLevel,
  migrateSessionScore,
  PROFESSIONAL_QUESTION_COUNT,
} from '../src/data/questions';
import type { TopicStat } from '../src/types';

const W = PROFESSIONAL_TOPIC_WEIGHTS;

describe('PROFESSIONAL_TOPIC_WEIGHTS', () => {
  it('weights sum to exactly 1.0 (spec compliance)', () => {
    const sum = W['Verbal Ability'] + W['Analytical Reasoning'] + W['Numerical Ability'] + W['General Information'];
    expect(sum).toBeCloseTo(1.0, 9);
  });

  it('matches spec: 30% verbal, 35% analytical, 30% numerical, 5% general', () => {
    expect(W['Verbal Ability']).toBe(0.30);
    expect(W['Analytical Reasoning']).toBe(0.35);
    expect(W['Numerical Ability']).toBe(0.30);
    expect(W['General Information']).toBe(0.05);
  });
});

describe('PROFESSIONAL_SECTIONS', () => {
  it('has 4 entries', () => {
    expect(PROFESSIONAL_SECTIONS).toHaveLength(4);
  });

  it('counts sum to the total question count', () => {
    const sum = PROFESSIONAL_SECTIONS.reduce((a, s) => a + s.count, 0);
    expect(sum).toBe(PROFESSIONAL_QUESTION_COUNT);
  });

  it('weights sum to 1.0 (guarded at module load)', () => {
    const sum = PROFESSIONAL_SECTIONS.reduce((a, s) => a + s.weight, 0);
    expect(sum).toBeCloseTo(1.0, 9);
  });

  it('preserves display order: verbal, analytical, numerical, general', () => {
    expect(PROFESSIONAL_SECTIONS.map((s) => s.topic)).toEqual([
      'Verbal Ability',
      'Analytical Reasoning',
      'Numerical Ability',
      'General Information',
    ]);
  });
});

function makeStats(spec: Partial<Record<keyof typeof W, { correct: number; total: number }>>): Record<string, TopicStat> {
  return { ...spec } as Record<string, TopicStat>;
}

describe('calculateScore — professional weighted formula', () => {
  it('all-correct → 100', () => {
    const stats = makeStats({
      'Verbal Ability': { correct: 45, total: 45 },
      'Analytical Reasoning': { correct: 40, total: 40 },
      'Numerical Ability': { correct: 45, total: 45 },
      'General Information': { correct: 20, total: 20 },
    });
    expect(calculateScore('professional', stats)).toBe(100);
  });

  it('all-zero → 0', () => {
    const stats = makeStats({
      'Verbal Ability': { correct: 0, total: 45 },
      'Analytical Reasoning': { correct: 0, total: 40 },
      'Numerical Ability': { correct: 0, total: 45 },
      'General Information': { correct: 0, total: 20 },
    });
    expect(calculateScore('professional', stats)).toBe(0);
  });

  it('all unanswered → 0', () => {
    expect(calculateScore('professional', {})).toBe(0);
  });

  it('isolated verbal-perfect (rest 0) = 30', () => {
    const stats = makeStats({
      'Verbal Ability': { correct: 45, total: 45 },
      'Analytical Reasoning': { correct: 0, total: 40 },
      'Numerical Ability': { correct: 0, total: 45 },
      'General Information': { correct: 0, total: 20 },
    });
    expect(calculateScore('professional', stats)).toBe(30);
  });

  it('isolated analytical-perfect (rest 0) = 35', () => {
    const stats = makeStats({
      'Verbal Ability': { correct: 0, total: 45 },
      'Analytical Reasoning': { correct: 40, total: 40 },
      'Numerical Ability': { correct: 0, total: 45 },
      'General Information': { correct: 0, total: 20 },
    });
    expect(calculateScore('professional', stats)).toBe(35);
  });

  it('isolated numerical-perfect (rest 0) = 30', () => {
    const stats = makeStats({
      'Verbal Ability': { correct: 0, total: 45 },
      'Analytical Reasoning': { correct: 0, total: 40 },
      'Numerical Ability': { correct: 45, total: 45 },
      'General Information': { correct: 0, total: 20 },
    });
    expect(calculateScore('professional', stats)).toBe(30);
  });

  it('isolated general-info-perfect (rest 0) = 5', () => {
    const stats = makeStats({
      'Verbal Ability': { correct: 0, total: 45 },
      'Analytical Reasoning': { correct: 0, total: 40 },
      'Numerical Ability': { correct: 0, total: 45 },
      'General Information': { correct: 20, total: 20 },
    });
    expect(calculateScore('professional', stats)).toBe(5);
  });

  it('general-info-zero but rest perfect = 95 (no renormalization)', () => {
    const stats = makeStats({
      'Verbal Ability': { correct: 45, total: 45 },
      'Analytical Reasoning': { correct: 40, total: 40 },
      'Numerical Ability': { correct: 45, total: 45 },
      'General Information': { correct: 0, total: 20 },
    });
    expect(calculateScore('professional', stats)).toBe(95);
  });

  it('rounds to nearest integer (~50% case)', () => {
    const stats = makeStats({
      'Verbal Ability': { correct: 22, total: 45 },
      'Analytical Reasoning': { correct: 20, total: 40 },
      'Numerical Ability': { correct: 22, total: 45 },
      'General Information': { correct: 10, total: 20 },
    });
    const expected = (22 / 45) * 30 + (20 / 40) * 35 + (22 / 45) * 30 + (10 / 20) * 5;
    expect(calculateScore('professional', stats)).toBe(Math.round(expected));
  });
});

describe('calculateScore — sub-professional simple percentage', () => {
  it('100% across arbitrary topics = 100', () => {
    expect(
      calculateScore('sub-professional', {
        Verbal: { correct: 50, total: 50 },
        Numerical: { correct: 30, total: 30 },
        Clerical: { correct: 20, total: 20 },
      }),
    ).toBe(100);
  });

  it('0% = 0', () => {
    expect(calculateScore('sub-professional', { X: { correct: 0, total: 10 } })).toBe(0);
  });

  it('~50% = 50', () => {
    expect(
      calculateScore('sub-professional', {
        A: { correct: 25, total: 50 },
        B: { correct: 15, total: 30 },
        C: { correct: 10, total: 20 },
      }),
    ).toBe(50);
  });

  it('empty stats = 0', () => {
    expect(calculateScore('sub-professional', {})).toBe(0);
  });
});

describe('getQuestionsForLevel', () => {
  it('returns the 150-item professional pool', () => {
    expect(getQuestionsForLevel('professional')).toHaveLength(150);
  });

  it('returns the empty sub-professional pool', () => {
    expect(getQuestionsForLevel('sub-professional')).toHaveLength(0);
  });
});

describe('migrateSessionScore (legacy ×100 bug migration)', () => {
  it('passes through valid in-range scores unchanged', () => {
    expect(migrateSessionScore(0)).toBe(0);
    expect(migrateSessionScore(50)).toBe(50);
    expect(migrateSessionScore(80)).toBe(80);
    expect(migrateSessionScore(100)).toBe(100);
  });

  it('does NOT divide scores in the valid range (idempotent on first call)', () => {
    // The prior bug: a real `score = 100.0001` (from rounding edge)
    // got divided to 1 because the old threshold was `> 100`. The new
    // threshold is `> 1000`, so anything ≤ 1000 is treated as in-range
    // and clamped to [0, 100] (100.0001 → 100, 100.5 → 100).
    expect(migrateSessionScore(100.0001)).toBe(100);
    expect(migrateSessionScore(99.9999)).toBe(99.9999);
    expect(migrateSessionScore(100.5)).toBe(100);
  });

  it('divides clearly-impossible scores (3881, 5000, 10000) by 100 to recover the real value', () => {
    expect(migrateSessionScore(3881)).toBe(39);
    expect(migrateSessionScore(10000)).toBe(100);
    expect(migrateSessionScore(5000)).toBe(50);
  });

  it('rounds the divided score to the nearest integer', () => {
    expect(migrateSessionScore(3885)).toBe(39);
    expect(migrateSessionScore(3849)).toBe(38);
    expect(migrateSessionScore(3850)).toBe(39);
  });

  it('is idempotent: running it twice on a legacy value gives the same answer', () => {
    // The 3881 → 39 migration; running again on 39 must NOT re-divide.
    const once = migrateSessionScore(3881);
    expect(once).toBe(39);
    const twice = migrateSessionScore(once);
    expect(twice).toBe(39);
    const thrice = migrateSessionScore(twice);
    expect(thrice).toBe(39);
  });

  it('is idempotent on already-valid values across many re-runs', () => {
    for (const score of [0, 50, 80, 100, 99.5]) {
      let v = score;
      for (let i = 0; i < 5; i++) v = migrateSessionScore(v);
      expect(v).toBe(Math.max(0, Math.min(100, score)));
    }
  });

  it('collapses negative scores to 0', () => {
    expect(migrateSessionScore(-5)).toBe(0);
    expect(migrateSessionScore(-1000)).toBe(0);
  });

  it('coerces non-finite scores to 0', () => {
    expect(migrateSessionScore(NaN)).toBe(0);
    expect(migrateSessionScore(Infinity)).toBe(0);
    expect(migrateSessionScore(-Infinity)).toBe(0);
  });

  it('end-to-end: average of three legacy 3881 sessions becomes 39, not 100', () => {
    const sessions = [3881, 3881, 3881].map(migrateSessionScore);
    const avg = Math.round(sessions.reduce((a, s) => a + s, 0) / sessions.length);
    expect(avg).toBe(39);
  });

  it('handles the exact 100.5 rounding edge that the old `> 100` rule broke', () => {
    // 100.5 used to divide to 1 under the old rule. Now it clamps to
    // 100 (the valid range ceiling).
    expect(migrateSessionScore(100.5)).toBe(100);
  });
});

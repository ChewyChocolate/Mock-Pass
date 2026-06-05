import { describe, expect, it } from 'vitest';
import {
  PROFESSIONAL_SECTIONS,
  PROFESSIONAL_TOPIC_WEIGHTS,
  calculateScore,
  getQuestionsForLevel,
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

import { describe, expect, it } from 'vitest';
import { calculateScore, getQuestionsForLevel } from '../src/data/questions';
import type { Question, QuestionOption, TopicStat } from '../src/types';

function simulateSubmission(
  answerFn: (q: Question) => QuestionOption['id'],
): { stats: Record<string, TopicStat>; correct: number } {
  const questions = getQuestionsForLevel('professional');
  const stats: Record<string, TopicStat> = {};
  let correct = 0;
  for (const q of questions) {
    const entry = stats[q.topic] ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answerFn(q) === q.correctOptionId) {
      entry.correct += 1;
      correct += 1;
    }
    stats[q.topic] = entry;
  }
  return { stats, correct };
}

describe('End-to-end submission simulation', () => {
  it('answering everything correctly yields a 100% weighted score', () => {
    const { stats, correct } = simulateSubmission((q) => q.correctOptionId);
    expect(correct).toBe(150);
    expect(calculateScore('professional', stats)).toBe(100);
  });

  it('answering everything incorrectly yields a 0% weighted score', () => {
    const { stats, correct } = simulateSubmission((q) => {
      const wrong = (['A', 'B', 'C', 'D'] as const).find((o) => o !== q.correctOptionId)!;
      return wrong;
    });
    expect(correct).toBe(0);
    expect(calculateScore('professional', stats)).toBe(0);
  });

  it('only verbal correct yields exactly 30 (proves weight is 30% for verbal)', () => {
    const { stats } = simulateSubmission((q) =>
      q.topic === 'Verbal Ability' ? q.correctOptionId : (['A', 'B', 'C', 'D'] as const).find((o) => o !== q.correctOptionId)!,
    );
    expect(calculateScore('professional', stats)).toBe(30);
  });

  it('only analytical correct yields exactly 35 (proves weight is 35% for analytical)', () => {
    const { stats } = simulateSubmission((q) =>
      q.topic === 'Analytical Reasoning' ? q.correctOptionId : (['A', 'B', 'C', 'D'] as const).find((o) => o !== q.correctOptionId)!,
    );
    expect(calculateScore('professional', stats)).toBe(35);
  });

  it('only numerical correct yields exactly 30 (proves weight is 30% for numerical)', () => {
    const { stats } = simulateSubmission((q) =>
      q.topic === 'Numerical Ability' ? q.correctOptionId : (['A', 'B', 'C', 'D'] as const).find((o) => o !== q.correctOptionId)!,
    );
    expect(calculateScore('professional', stats)).toBe(30);
  });

  it('only general-info correct yields exactly 5 (proves weight is 5% for general)', () => {
    const { stats } = simulateSubmission((q) =>
      q.topic === 'General Information' ? q.correctOptionId : (['A', 'B', 'C', 'D'] as const).find((o) => o !== q.correctOptionId)!,
    );
    expect(calculateScore('professional', stats)).toBe(5);
  });

  it('weighted score stays within [0, 100] for arbitrary answer patterns', () => {
    let seed = 1;
    for (let trial = 0; trial < 25; trial++) {
      const { stats } = simulateSubmission((q) => {
        seed = (seed * 9301 + 49297) % 233280;
        const r = seed / 233280;
        return r < 0.5 ? q.correctOptionId : (['A', 'B', 'C', 'D'] as const).find((o) => o !== q.correctOptionId)!;
      });
      const score = calculateScore('professional', stats);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

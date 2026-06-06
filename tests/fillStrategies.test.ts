import { describe, expect, it } from 'vitest';
import { fillRandomly, fillBelowPassing, fillToPass } from '../src/utils/fillStrategies';
import { calculateScore, getQuestionsForLevel, PASSING_SCORE } from '../src/data/questions';
import type { ExamLevel, QuestionOption } from '../src/types';

const OPTIONS: QuestionOption['id'][] = ['A', 'B', 'C', 'D'];

function isValidOption(id: string): id is QuestionOption['id'] {
  return OPTIONS.includes(id as QuestionOption['id']);
}

function computeScore(answers: Record<string, QuestionOption['id']>, level: ExamLevel) {
  const questions = getQuestionsForLevel(level);
  const stats: Record<string, { correct: number; total: number }> = {};
  for (const q of questions) {
    const entry = stats[q.topic] ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answers[q.id] === q.correctOptionId) entry.correct += 1;
    stats[q.topic] = entry;
  }
  return calculateScore(level, stats);
}

function validateAnswers(
  answers: Record<string, QuestionOption['id']>,
  questions: readonly { id: string }[],
): string[] {
  const errors: string[] = [];
  const ids = new Set(questions.map((q) => q.id));
  for (const qId of ids) {
    if (!answers[qId]) errors.push(`Missing answer for ${qId}`);
    else if (!isValidOption(answers[qId])) errors.push(`Invalid option ${answers[qId]} for ${qId}`);
  }
  for (const qId of Object.keys(answers)) {
    if (!ids.has(qId)) errors.push(`Unexpected answer for ${qId}`);
  }
  return errors;
}

describe('fillRandomly', () => {
  const proQs = getQuestionsForLevel('professional');

  it('returns an answer for every question', () => {
    const answers = fillRandomly(proQs);
    expect(Object.keys(answers)).toHaveLength(proQs.length);
  });

  it('all answers are valid A/B/C/D options', () => {
    const answers = fillRandomly(proQs);
    for (const opt of Object.values(answers)) {
      expect(isValidOption(opt)).toBe(true);
    }
  });

  it('produces varying results across multiple calls', () => {
    const results = Array.from({ length: 5 }, () => fillRandomly(proQs));
    const allSame = results.every(
      (r) => JSON.stringify(r) === JSON.stringify(results[0]),
    );
    expect(allSame).toBe(false);
  });

  it('handles an empty question list', () => {
    expect(fillRandomly([])).toEqual({});
  });
});

describe('fillBelowPassing', () => {
  const level: ExamLevel = 'professional';
  const proQs = getQuestionsForLevel(level);

  it('score is strictly below the passing threshold', () => {
    const answers = fillBelowPassing(proQs, level);
    const score = computeScore(answers, level);
    expect(score).toBeLessThan(PASSING_SCORE);
  });

  it('returns a valid answer for every question', () => {
    const answers = fillBelowPassing(proQs, level);
    const errors = validateAnswers(answers, proQs);
    expect(errors).toEqual([]);
  });

  it('works for sub-professional level (empty bank - still returns empty)', () => {
    const subQs = getQuestionsForLevel('sub-professional');
    const answers = fillBelowPassing(subQs, 'sub-professional');
    expect(answers).toEqual({});
  });

  it('score is deterministic given the same inputs', () => {
    const a1 = fillBelowPassing(proQs, level);
    const a2 = fillBelowPassing(proQs, level);
    const s1 = computeScore(a1, level);
    const s2 = computeScore(a2, level);
    expect(s1).toBeLessThan(PASSING_SCORE);
    expect(s2).toBeLessThan(PASSING_SCORE);
  });
});

describe('fillToPass', () => {
  const level: ExamLevel = 'professional';
  const proQs = getQuestionsForLevel(level);

  it('score is at or above the passing threshold', () => {
    const answers = fillToPass(proQs, level);
    const score = computeScore(answers, level);
    expect(score).toBeGreaterThanOrEqual(PASSING_SCORE);
  });

  it('returns a valid answer for every question', () => {
    const answers = fillToPass(proQs, level);
    const errors = validateAnswers(answers, proQs);
    expect(errors).toEqual([]);
  });

  it('works for sub-professional level (empty bank - still returns empty)', () => {
    const subQs = getQuestionsForLevel('sub-professional');
    const answers = fillToPass(subQs, 'sub-professional');
    expect(answers).toEqual({});
  });

  it('repeated calls both pass', () => {
    for (let i = 0; i < 10; i++) {
      const answers = fillToPass(proQs, level);
      const score = computeScore(answers, level);
      expect(score).toBeGreaterThanOrEqual(PASSING_SCORE);
    }
  });
});

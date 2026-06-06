import type { ExamLevel, Question, QuestionOption } from '../types';
import { calculateScore, PASSING_SCORE, WEIGHTED_SECTION_TOPICS } from '../data/questions';

const OPTIONS: QuestionOption['id'][] = ['A', 'B', 'C', 'D'];

function wrongOptions(correctId: QuestionOption['id']): QuestionOption['id'][] {
  return OPTIONS.filter((o) => o !== correctId);
}

function pickWrong(
  correctId: QuestionOption['id'],
  rng: () => number,
): QuestionOption['id'] {
  const wrong = wrongOptions(correctId);
  return wrong[Math.floor(rng() * wrong.length)];
}

export function fillRandomly(
  questions: readonly Question[],
): Record<string, QuestionOption['id']> {
  const answers: Record<string, QuestionOption['id']> = {};
  for (const q of questions) {
    answers[q.id] = OPTIONS[Math.floor(Math.random() * OPTIONS.length)];
  }
  return answers;
}

export function fillBelowPassing(
  questions: readonly Question[],
  level: ExamLevel,
): Record<string, QuestionOption['id']> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const answers = fillToTarget(questions, level, PASSING_SCORE - 15);
    const stats = computeStats(questions, answers);
    const score = calculateScore(level, stats);
    if (score < PASSING_SCORE) return answers;
  }
  return fillToTarget(questions, level, 0);
}

export function fillToPass(
  questions: readonly Question[],
  level: ExamLevel,
): Record<string, QuestionOption['id']> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const answers = fillToTarget(questions, level, Math.max(PASSING_SCORE + 10, 90));
    const stats = computeStats(questions, answers);
    const score = calculateScore(level, stats);
    if (score >= PASSING_SCORE) return answers;
  }
  return fillToTarget(questions, level, 100);
}

function fillToTarget(
  questions: readonly Question[],
  level: ExamLevel,
  targetPct: number,
): Record<string, QuestionOption['id']> {
  const answers: Record<string, QuestionOption['id']> = {};
  const rng = () => Math.random();

  if (level === 'professional') {
    for (const topic of WEIGHTED_SECTION_TOPICS) {
      const topicQs = questions.filter((q) => q.topic === topic);
      fillTopic(topicQs, targetPct, rng, answers);
    }
  } else {
    fillTopic([...questions], targetPct, rng, answers);
  }

  return answers;
}

function fillTopic(
  questions: readonly Question[],
  targetPct: number,
  rng: () => number,
  out: Record<string, QuestionOption['id']>,
): void {
  const total = questions.length;
  const correctCount = Math.round((total * targetPct) / 100);
  let correctSoFar = 0;

  for (let i = 0; i < total; i++) {
    const q = questions[i];
    const remaining = total - i;
    const stillNeeded = correctCount - correctSoFar;
    const isCorrect = rng() < stillNeeded / remaining;

    if (isCorrect) {
      out[q.id] = q.correctOptionId;
      correctSoFar++;
    } else {
      out[q.id] = pickWrong(q.correctOptionId, rng);
    }
  }
}

function computeStats(
  questions: readonly Question[],
  answers: Record<string, QuestionOption['id']>,
): Record<string, { correct: number; total: number }> {
  const stats: Record<string, { correct: number; total: number }> = {};
  for (const q of questions) {
    const entry = stats[q.topic] ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answers[q.id] === q.correctOptionId) entry.correct += 1;
    stats[q.topic] = entry;
  }
  return stats;
}

import type { ExamLevel, Question, QuestionOption, QuestionTopic, TopicStat } from '../types';
import PROFESSIONAL_QUESTIONS from './questions/professionalQuestions';
import SUB_PROFESSIONAL_QUESTIONS from './questions/subProfessionalQuestions';

export const PASSING_SCORE = 80;
export const PRO_DURATION_SECONDS = 2 * 3600 + 44 * 60 + 55;     // 2h 44m 55s
export const SUB_PRO_DURATION_SECONDS = 2 * 3600 + 5 * 60;        // 2h 5m

export const PROFESSIONAL_QUESTION_COUNT = PROFESSIONAL_QUESTIONS.length;
export const SUB_PROFESSIONAL_QUESTION_COUNT = SUB_PROFESSIONAL_QUESTIONS.length;

export const PROFESSIONAL_TOPIC_WEIGHTS: Record<QuestionTopic, number> = {
  'Verbal Ability': 0.30,
  'Analytical Reasoning': 0.35,
  'Numerical Ability': 0.30,
  'General Information': 0.05,
  'Clerical Ability': 0,
};

export const WEIGHTED_SECTION_TOPICS: QuestionTopic[] = [
  'Verbal Ability',
  'Analytical Reasoning',
  'Numerical Ability',
  'General Information',
];

export const PROFESSIONAL_SECTIONS: {
  topic: QuestionTopic;
  count: number;
  weight: number;
}[] = WEIGHTED_SECTION_TOPICS.map((topic) => ({
  topic,
  count: PROFESSIONAL_QUESTIONS.filter((q) => q.topic === topic).length,
  weight: PROFESSIONAL_TOPIC_WEIGHTS[topic],
}));

const weightedTotal = PROFESSIONAL_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
if (Math.abs(weightedTotal - 1.0) > 1e-9) {
  throw new Error(
    `PROFESSIONAL_SECTIONS weights must sum to 1.0, got ${weightedTotal}. ` +
      'Update PROFESSIONAL_TOPIC_WEIGHTS or WEIGHTED_SECTION_TOPICS.',
  );
}

const totalItemsAcrossSections = PROFESSIONAL_SECTIONS.reduce((sum, s) => sum + s.count, 0);
if (totalItemsAcrossSections !== PROFESSIONAL_QUESTIONS.length) {
  throw new Error(
    `PROFESSIONAL_SECTIONS counts (${totalItemsAcrossSections}) do not match ` +
      `PROFESSIONAL_QUESTIONS.length (${PROFESSIONAL_QUESTIONS.length}). ` +
      'Some questions are assigned to a topic outside WEIGHTED_SECTION_TOPICS, ' +
      'or the bank has duplicates/missing items.',
  );
}

export function durationForLevel(level: ExamLevel): number {
  return level === 'professional' ? PRO_DURATION_SECONDS : SUB_PRO_DURATION_SECONDS;
}

export function getQuestionsForLevel(level: ExamLevel): Question[] {
  return level === 'professional' ? PROFESSIONAL_QUESTIONS : SUB_PROFESSIONAL_QUESTIONS;
}

/**
 * Walk the question set once and produce per-topic correct/total tallies.
 * Shared by the live `useMemo` in `ExamProvider` and the reducer's `SUBMIT`
 * case so the two paths cannot drift.
 */
export function buildTopicStats(
  questions: readonly Question[],
  answers: Readonly<Record<string, QuestionOption['id']>>,
): Record<string, TopicStat> {
  const stats: Record<string, TopicStat> = {};
  for (const q of questions) {
    const entry = stats[q.topic] ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answers[q.id] === q.correctOptionId) entry.correct += 1;
    stats[q.topic] = entry;
  }
  return stats;
}

export function calculateScore(
  level: ExamLevel,
  topicStats: Record<string, TopicStat>,
): number {
  if (level === 'sub-professional') {
    let total = 0;
    let correct = 0;
    for (const stat of Object.values(topicStats)) {
      correct += stat.correct;
      total += stat.total;
    }
    return total === 0 ? 0 : Math.round((correct / total) * 100);
  }

  let weightedSum = 0;
  for (const topic of WEIGHTED_SECTION_TOPICS) {
    const stat = topicStats[topic];
    if (!stat || stat.total === 0) continue;
    const pct = (stat.correct / stat.total) * 100;
    weightedSum += pct * PROFESSIONAL_TOPIC_WEIGHTS[topic];
  }
  return Math.round(weightedSum);
}

/**
 * Defensive migration for persisted session scores. Two cases are handled:
 *   1. Legacy scores from the pre-fix ×100 bug (e.g. 3881) are corrected by
 *      dividing by 100, so a real 38.81% reads back as 39.
 *   2. Any non-finite or negative value collapses to 0.
 * Scores already in [0, 100] are returned unchanged.
 */
export function migrateSessionScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score > 100) return Math.round(score / 100);
  return Math.max(0, Math.min(100, score));
}

/**
 * Canonical pass/fail predicate. Single source of truth for the
 * "is this score a pass?" check across UI, stats, and color helpers,
 * so the threshold can never drift between call sites.
 */
export function didPass(score: number): boolean {
  return Number.isFinite(score) && score >= PASSING_SCORE;
}

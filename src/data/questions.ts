import type { ExamLevel, Question, QuestionTopic, TopicStat } from '../types';
import PROFESSIONAL_QUESTIONS from './questions/professionalQuestions';
import SUB_PROFESSIONAL_QUESTIONS from './questions/subProfessionalQuestions';

export const PASSING_SCORE = 80;
export const PRO_DURATION_SECONDS = 60 * 60 * 2 + 60 * 44 + 55;
export const SUB_PRO_DURATION_SECONDS = 60 * 60 * 2 + 60 * 5;

export const PROFESSIONAL_QUESTION_COUNT = PROFESSIONAL_QUESTIONS.length;
export const SUB_PROFESSIONAL_QUESTION_COUNT = SUB_PROFESSIONAL_QUESTIONS.length;

export const PROFESSIONAL_TOPIC_WEIGHTS: Record<QuestionTopic, number> = {
  'Verbal Ability': 0.30,
  'Analytical Reasoning': 0.35,
  'Numerical Ability': 0.30,
  'General Information': 0.05,
  'Clerical Ability': 0,
};

const WEIGHTED_SECTION_TOPICS: QuestionTopic[] = [
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

export function durationForLevel(level: ExamLevel): number {
  return level === 'professional' ? PRO_DURATION_SECONDS : SUB_PRO_DURATION_SECONDS;
}

export function getQuestionsForLevel(level: ExamLevel): Question[] {
  return level === 'professional' ? PROFESSIONAL_QUESTIONS : SUB_PROFESSIONAL_QUESTIONS;
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

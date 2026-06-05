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

export const PROFESSIONAL_SECTIONS: {
  topic: QuestionTopic;
  count: number;
  weight: number;
}[] = (
  ['Verbal Ability', 'Analytical Reasoning', 'Numerical Ability', 'General Information'] as QuestionTopic[]
).map((topic) => ({
  topic,
  count: PROFESSIONAL_QUESTIONS.filter((q) => q.topic === topic).length,
  weight: PROFESSIONAL_TOPIC_WEIGHTS[topic],
}));

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
  let totalWeight = 0;
  for (const [topic, weight] of Object.entries(PROFESSIONAL_TOPIC_WEIGHTS)) {
    if (weight <= 0) continue;
    const stat = topicStats[topic];
    if (!stat || stat.total === 0) continue;
    const pct = (stat.correct / stat.total) * 100;
    weightedSum += pct * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return 0;
  const normalized = (weightedSum / totalWeight) * 100;
  return Math.round(normalized);
}

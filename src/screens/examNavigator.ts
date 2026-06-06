import type { Question, QuestionOption, QuestionTopic } from '../types';

export type TopicFilter = 'all' | QuestionTopic;

export function filterByTopic(questions: readonly Question[], filter: TopicFilter): Question[] {
  if (filter === 'all') return questions.slice();
  return questions.filter((q) => q.topic === filter);
}

export interface TopicProgress {
  answered: number;
  total: number;
}

export function topicProgress(
  questions: readonly Question[],
  answers: Readonly<Record<string, QuestionOption['id']>>,
): Record<QuestionTopic, TopicProgress> {
  const empty = (): TopicProgress => ({ answered: 0, total: 0 });
  const map: Record<QuestionTopic, TopicProgress> = {
    'Verbal Ability': empty(),
    'Analytical Reasoning': empty(),
    'Numerical Ability': empty(),
    'General Information': empty(),
    'Clerical Ability': empty(),
  };
  for (const q of questions) {
    const entry = map[q.topic];
    if (!entry) continue;
    entry.total += 1;
    if (answers[q.id]) entry.answered += 1;
  }
  return map;
}

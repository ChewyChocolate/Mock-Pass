import { describe, expect, it } from 'vitest';
import PROFESSIONAL_QUESTIONS from '../src/data/questions/professionalQuestions';
import { filterByTopic, topicProgress, type TopicFilter } from '../src/screens/examNavigator';
import type { Question, QuestionOption, QuestionTopic } from '../src/types';

const PRO = PROFESSIONAL_QUESTIONS as Question[];
type AnswerMap = Record<string, QuestionOption['id']>;

describe('filterByTopic', () => {
  it("'all' returns a copy of every question", () => {
    const result = filterByTopic(PRO, 'all');
    expect(result).toHaveLength(150);
    expect(result).not.toBe(PRO);
    expect(result).toEqual(PRO);
  });

  it('Verbal Ability returns only the 55 verbal questions', () => {
    const result = filterByTopic(PRO, 'Verbal Ability');
    expect(result).toHaveLength(55);
    expect(result.every((q) => q.topic === 'Verbal Ability')).toBe(true);
  });

  it('Analytical Reasoning returns only the 30 analytical questions', () => {
    const result = filterByTopic(PRO, 'Analytical Reasoning');
    expect(result).toHaveLength(30);
    expect(result.every((q) => q.topic === 'Analytical Reasoning')).toBe(true);
  });

  it('Numerical Ability returns only the 45 numerical questions', () => {
    const result = filterByTopic(PRO, 'Numerical Ability');
    expect(result).toHaveLength(45);
    expect(result.every((q) => q.topic === 'Numerical Ability')).toBe(true);
  });

  it('General Information returns only the 20 general-information questions', () => {
    const result = filterByTopic(PRO, 'General Information');
    expect(result).toHaveLength(20);
    expect(result.every((q) => q.topic === 'General Information')).toBe(true);
  });

  it('all four filtered lists together equal the full set', () => {
    const topics: QuestionTopic[] = [
      'Verbal Ability',
      'Analytical Reasoning',
      'Numerical Ability',
      'General Information',
    ];
    const concatenated = topics.flatMap((t) => filterByTopic(PRO, t).map((q) => q.id));
    expect(new Set(concatenated)).toEqual(new Set(PRO.map((q) => q.id)));
  });

  it('filterToTopic does not mutate the input array', () => {
    const snapshot = [...PRO];
    filterByTopic(PRO, 'Verbal Ability');
    expect(PRO).toEqual(snapshot);
  });
});

describe('topicProgress', () => {
  it('returns 0 / 0 per topic for an empty question list', () => {
    const result = topicProgress([], {});
    expect(result['Verbal Ability']).toEqual({ answered: 0, total: 0 });
    expect(result['Analytical Reasoning']).toEqual({ answered: 0, total: 0 });
    expect(result['Numerical Ability']).toEqual({ answered: 0, total: 0 });
    expect(result['General Information']).toEqual({ answered: 0, total: 0 });
  });

  it('returns totals but 0 answered for an empty answers map', () => {
    const result = topicProgress(PRO, {});
    expect(result['Verbal Ability']).toEqual({ answered: 0, total: 55 });
    expect(result['Analytical Reasoning']).toEqual({ answered: 0, total: 30 });
    expect(result['Numerical Ability']).toEqual({ answered: 0, total: 45 });
    expect(result['General Information']).toEqual({ answered: 0, total: 20 });
  });

  it('counts only answers whose id is present in the answers map', () => {
    const firstVerbal = PRO.find((q) => q.topic === 'Verbal Ability')!;
    const firstAnalytical = PRO.find((q) => q.topic === 'Analytical Reasoning')!;
    const answers: AnswerMap = { [firstVerbal.id]: 'A', [firstAnalytical.id]: 'B' };
    const result = topicProgress(PRO, answers);
    expect(result['Verbal Ability']).toEqual({ answered: 1, total: 55 });
    expect(result['Analytical Reasoning']).toEqual({ answered: 1, total: 30 });
    expect(result['Numerical Ability']).toEqual({ answered: 0, total: 45 });
    expect(result['General Information']).toEqual({ answered: 0, total: 20 });
  });

  it('answering every question yields answered = total for each topic', () => {
    const answers: AnswerMap = {};
    for (const q of PRO) answers[q.id] = q.correctOptionId;
    const result = topicProgress(PRO, answers);
    expect(result['Verbal Ability']).toEqual({ answered: 55, total: 55 });
    expect(result['Analytical Reasoning']).toEqual({ answered: 30, total: 30 });
    expect(result['Numerical Ability']).toEqual({ answered: 45, total: 45 });
    expect(result['General Information']).toEqual({ answered: 20, total: 20 });
  });
});

describe('integration: filter + progress agree', () => {
  it('progress.total per topic matches the filtered list length', () => {
    const progress = topicProgress(PRO, {});
    const topics: QuestionTopic[] = [
      'Verbal Ability',
      'Analytical Reasoning',
      'Numerical Ability',
      'General Information',
    ];
    for (const t of topics) {
      const filtered = filterByTopic(PRO, t satisfies TopicFilter);
      expect(progress[t].total).toBe(filtered.length);
    }
  });

  it('progress.answered for "all" equals the sum of per-topic answered', () => {
    const firstVerbal = PRO.find((q) => q.topic === 'Verbal Ability')!;
    const firstNumerical = PRO.find((q) => q.topic === 'Numerical Ability')!;
    const answers: AnswerMap = { [firstVerbal.id]: 'A', [firstNumerical.id]: 'C' };
    const progress = topicProgress(PRO, answers);
    const totalAnswered = (
      ['Verbal Ability', 'Analytical Reasoning', 'Numerical Ability', 'General Information'] as QuestionTopic[]
    ).reduce((sum, t) => sum + progress[t].answered, 0);
    expect(totalAnswered).toBe(2);
  });
});

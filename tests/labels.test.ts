import { describe, expect, it } from 'vitest';
import {
  LEVEL_LABELS,
  LEVEL_LABELS_SHORT,
  TOPIC_SHORT_LABELS,
  type ExamLevel,
  type QuestionTopic,
} from '../src/types';

const ALL_LEVELS: ExamLevel[] = ['sub-professional', 'professional'];
const ALL_TOPICS: QuestionTopic[] = [
  'Verbal Ability',
  'Numerical Ability',
  'Analytical Reasoning',
  'General Information',
  'Clerical Ability',
];

describe('LEVEL_LABELS', () => {
  it('has an entry for every ExamLevel', () => {
    for (const level of ALL_LEVELS) {
      expect(LEVEL_LABELS[level]).toBeTruthy();
    }
  });

  it('matches the spec ("Sub-Professional", "Professional")', () => {
    expect(LEVEL_LABELS['sub-professional']).toBe('Sub-Professional');
    expect(LEVEL_LABELS['professional']).toBe('Professional');
  });
});

describe('LEVEL_LABELS_SHORT', () => {
  it('has an entry for every ExamLevel', () => {
    for (const level of ALL_LEVELS) {
      expect(LEVEL_LABELS_SHORT[level]).toBeTruthy();
    }
  });

  it('uses the short form for sub-professional and the full form otherwise', () => {
    expect(LEVEL_LABELS_SHORT['sub-professional']).toBe('Sub-Pro');
    expect(LEVEL_LABELS_SHORT['professional']).toBe('Professional');
  });
});

describe('TOPIC_SHORT_LABELS', () => {
  it('has an entry for every QuestionTopic', () => {
    for (const topic of ALL_TOPICS) {
      expect(TOPIC_SHORT_LABELS[topic]).toBeTruthy();
    }
  });

  it('strips " Ability" / " Reasoning" and special-cases "General Information"', () => {
    expect(TOPIC_SHORT_LABELS['Verbal Ability']).toBe('Verbal');
    expect(TOPIC_SHORT_LABELS['Numerical Ability']).toBe('Numerical');
    expect(TOPIC_SHORT_LABELS['Analytical Reasoning']).toBe('Analytical');
    expect(TOPIC_SHORT_LABELS['General Information']).toBe('General');
    expect(TOPIC_SHORT_LABELS['Clerical Ability']).toBe('Clerical');
  });
});

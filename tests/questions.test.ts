import { describe, expect, it } from 'vitest';
import PROFESSIONAL_QUESTIONS from '../src/data/questions/professionalQuestions';
import SUB_PROFESSIONAL_QUESTIONS from '../src/data/questions/subProfessionalQuestions';
import type { Question } from '../src/types';

const PRO = PROFESSIONAL_QUESTIONS as Question[];
const SUB = SUB_PROFESSIONAL_QUESTIONS as Question[];

function expectedProIds(): string[] {
  return Array.from({ length: 150 }, (_, i) => `q-${String(i + 1).padStart(3, '0')}`);
}

describe('Question bank — counts and distribution', () => {
  it('has exactly 150 professional questions', () => {
    expect(PRO.length).toBe(150);
  });

  it('sub-professional array is empty (placeholder)', () => {
    expect(SUB.length).toBe(0);
  });

  it('professional topic distribution matches spec', () => {
    const counts: Record<string, number> = {};
    for (const q of PRO) counts[q.topic] = (counts[q.topic] ?? 0) + 1;
    expect(counts['Verbal Ability']).toBe(55);
    expect(counts['Numerical Ability']).toBe(45);
    expect(counts['Analytical Reasoning']).toBe(30);
    expect(counts['General Information']).toBe(20);
  });

  it('topic set is exactly the spec set (no extras, no missing)', () => {
    const seen = new Set(PRO.map((q) => q.topic));
    expect(seen).toEqual(
      new Set(['Verbal Ability', 'Numerical Ability', 'Analytical Reasoning', 'General Information']),
    );
  });

  it('ids are exactly q-001 through q-150 with no gaps and no duplicates', () => {
    const ids = PRO.map((q) => q.id).sort();
    expect(ids).toEqual(expectedProIds());
  });

  it('every professional question is level=professional', () => {
    for (const q of PRO) expect(q.level).toBe('professional');
  });
});

describe('Question bank — structural integrity', () => {
  it.each(PRO.map((q, i) => [q.id, i] as const))(
    '%s has a non-empty prompt',
    (id) => {
      const q = PRO.find((x) => x.id === id);
      expect(q?.prompt?.trim().length ?? 0).toBeGreaterThan(0);
    },
  );

  it.each(PRO.map((q) => q.id))('%s has 4 options with unique A/B/C/D ids', (id) => {
    const q = PRO.find((x) => x.id === id);
    expect(q).toBeDefined();
    expect(q!.options).toHaveLength(4);
    const ids = q!.options.map((o) => o.id);
    expect(new Set(ids).size).toBe(4);
    for (const want of ['A', 'B', 'C', 'D'] as const) {
      expect(ids).toContain(want);
    }
  });

  it.each(PRO.map((q) => q.id))('%s has a non-empty explanation', (id) => {
    const q = PRO.find((x) => x.id === id);
    expect(q?.explanation?.trim().length ?? 0).toBeGreaterThan(0);
  });

  it.each(PRO.map((q) => q.id))('%s has a correctOptionId that resolves to an existing option', (id) => {
    const q = PRO.find((x) => x.id === id);
    expect(q).toBeDefined();
    expect(['A', 'B', 'C', 'D']).toContain(q!.correctOptionId);
    expect(q!.options.find((o) => o.id === q!.correctOptionId)).toBeDefined();
  });

  it.each(PRO.map((q) => q.id))('%s has a recognised topic', (id) => {
    const q = PRO.find((x) => x.id === id);
    expect([
      'Verbal Ability',
      'Numerical Ability',
      'Analytical Reasoning',
      'General Information',
      'Clerical Ability',
    ]).toContain(q!.topic);
  });
});

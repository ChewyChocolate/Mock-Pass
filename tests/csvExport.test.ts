import { describe, expect, it } from 'vitest';
import { questionsToCsv } from '../src/utils/csvExport';
import type { AdminQuestion } from '../src/lib/questions';

function makeRow(overrides: Partial<AdminQuestion> = {}): AdminQuestion {
  return {
    id: 'q-1',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Pick the synonym of "happy".',
    options: { A: 'sad', B: 'joyful', C: 'angry', D: 'tired' },
    correct_option_id: 'B',
    explanation: 'Joyful is a synonym of happy.',
    is_active: true,
    ...overrides,
  };
}

describe('questionsToCsv', () => {
  it('emits a header row followed by one row per question', () => {
    const csv = questionsToCsv([makeRow(), makeRow({ id: 'q-2' })]);
    const lines = csv.split('\r\n').filter(Boolean);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(
      'id,level,topic,prompt,option_a,option_b,option_c,option_d,correct_option_id,explanation,is_active',
    );
    expect(lines[1]).toContain('q-1');
    expect(lines[1]).toContain('professional');
    // The default prompt contains a literal double-quote (the
    // example word "happy") so it gets CSV-quoted and the inner
    // quote is doubled.
    expect(lines[1]).toContain('"Pick the synonym of ""happy""."');
    expect(lines[1]).toContain(',true');
    expect(lines[2]).toContain('q-2');
  });

  it('quotes and escapes cells that contain commas, double-quotes, or newlines', () => {
    const csv = questionsToCsv([
      makeRow({
        prompt: 'Comma, here',
        options: { A: 'has "quote"', B: '', C: '', D: '' },
        explanation: 'line1\nline2\r\nline3',
      }),
    ]);
    // prompt with comma is wrapped in quotes
    expect(csv).toContain('"Comma, here"');
    // option A's quote is doubled
    expect(csv).toContain('"has ""quote"""');
    // explanation's newlines force the cell to be quoted; the
    // embedded \n and \r\n pass through unchanged inside the
    // quotes (they are valid in CSV quoted fields per RFC 4180).
    expect(csv).toContain('"line1\nline2\r\nline3"');
  });

  it('returns a header-only string for an empty list', () => {
    const csv = questionsToCsv([]);
    const lines = csv.split('\r\n').filter(Boolean);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('id,level,topic');
  });

  it('serializes is_active as the literal strings "true" or "false"', () => {
    const csv = questionsToCsv([makeRow({ is_active: true }), makeRow({ id: 'q-2', is_active: false })]);
    const lines = csv.split('\r\n').filter(Boolean);
    expect(lines[1].endsWith(',true')).toBe(true);
    expect(lines[2].endsWith(',false')).toBe(true);
  });
});

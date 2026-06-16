import { describe, expect, it } from 'vitest';
import { parseQuestionsCsv } from '../src/utils/parseQuestionsCsv';

const VALID_HEADER =
  'id,level,topic,prompt,option_a,option_b,option_c,option_d,correct_option_id,explanation,is_active,difficulty,tags';

function validRow(overrides: Record<string, string> = {}): string {
  const fields: Record<string, string> = {
    id: '',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'What is the largest island in the Philippines?',
    option_a: 'Luzon',
    option_b: 'Mindanao',
    option_c: 'Palawan',
    option_d: 'Visayas',
    correct_option_id: 'A',
    explanation: 'Luzon is the largest island.',
    is_active: 'true',
    difficulty: '2',
    tags: 'geography,trivia',
  };
  for (const [k, v] of Object.entries(overrides)) fields[k] = v;
  // CSV-encode each cell
  const csvEscape = (s: string) =>
    /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  return VALID_HEADER.split(',').map((h) => csvEscape(fields[h] ?? '')).join(',');
}

describe('parseQuestionsCsv', () => {
  it('parses a minimal valid CSV', () => {
    const csv = [VALID_HEADER, validRow()].join('\n');
    const result = parseQuestionsCsv(csv);
    expect(result.headerOk).toBe(true);
    expect(result.hasRequiredColumns).toBe(true);
    expect(result.detectedColumns).toEqual([
      'id',
      'level',
      'topic',
      'prompt',
      'option_a',
      'option_b',
      'option_c',
      'option_d',
      'correct_option_id',
      'explanation',
      'is_active',
      'difficulty',
      'tags',
    ]);
    const valid = result.rows.filter((r) => r.values);
    expect(valid).toHaveLength(1);
    expect(valid[0].values?.correct_option_id).toBe('A');
    expect(valid[0].values?.difficulty).toBe(2);
    expect(valid[0].values?.tags).toEqual(['geography', 'trivia']);
    expect(valid[0].values?.is_active).toBe(true);
  });

  it('reports missing required columns on the header', () => {
    const csv = 'prompt,option_a,option_b,option_c,option_d,correct_option_id,explanation\nfoo,a,b,c,d,A,bar';
    const result = parseQuestionsCsv(csv);
    expect(result.headerOk).toBe(true);
    expect(result.hasRequiredColumns).toBe(false);
    expect(result.rows[0].errors[0]).toMatch(/level/);
  });

  it('rejects an invalid level', () => {
    const csv = [VALID_HEADER, validRow({ level: 'expert' })].join('\n');
    const result = parseQuestionsCsv(csv);
    const errorRow = result.rows.find((r) => r.errors.length > 0);
    expect(errorRow?.errors.join(' ')).toMatch(/Invalid level/);
  });

  it('rejects a topic not in the level\'s allow-list', () => {
    const csv = [VALID_HEADER, validRow({ level: 'sub-professional', topic: 'Analytical Reasoning' })].join('\n');
    const result = parseQuestionsCsv(csv);
    const errorRow = result.rows.find((r) => r.errors.length > 0);
    expect(errorRow?.errors.join(' ')).toMatch(/Invalid topic/);
  });

  it('rejects an empty option', () => {
    const csv = [VALID_HEADER, validRow({ option_b: '' })].join('\n');
    const result = parseQuestionsCsv(csv);
    const errorRow = result.rows.find((r) => r.errors.length > 0);
    expect(errorRow?.errors.join(' ')).toMatch(/Option B is empty/);
  });

  it('rejects an out-of-range difficulty', () => {
    const csv = [VALID_HEADER, validRow({ difficulty: '9' })].join('\n');
    const result = parseQuestionsCsv(csv);
    const errorRow = result.rows.find((r) => r.errors.length > 0);
    expect(errorRow?.errors.join(' ')).toMatch(/difficulty must be an integer 1-5/);
  });

  it('rejects a prompt under 10 chars', () => {
    const csv = [VALID_HEADER, validRow({ prompt: 'short' })].join('\n');
    const result = parseQuestionsCsv(csv);
    const errorRow = result.rows.find((r) => r.errors.length > 0);
    expect(errorRow?.errors.join(' ')).toMatch(/at least 10 characters/);
  });

  it('honors quoted newlines inside fields', () => {
    const csv = [
      VALID_HEADER,
      [
        '',
        'professional',
        'Verbal Ability',
        'What is the capital of France?',
        'Berlin',
        'Paris',
        'Madrid',
        'Rome',
        'B',
        // Explanation with embedded newline and a quoted comma.
        '"Line 1, line 2\nLine 3"',
        'true',
        '',
        '',
      ].join(','),
    ].join('\n');
    const result = parseQuestionsCsv(csv);
    const valid = result.rows.filter((r) => r.values);
    expect(valid).toHaveLength(1);
    expect(valid[0].values?.explanation).toBe('Line 1, line 2\nLine 3');
  });

  it('treats empty is_active / difficulty as defaults (true / null)', () => {
    const row = validRow({ is_active: '', difficulty: '' });
    const csv = [VALID_HEADER, row].join('\n');
    const result = parseQuestionsCsv(csv);
    const valid = result.rows.filter((r) => r.values);
    expect(valid[0].values?.is_active).toBe(true);
    expect(valid[0].values?.difficulty).toBeNull();
  });

  it('skips empty lines between rows', () => {
    const csv = [VALID_HEADER, validRow(), '', validRow({ id: '' })].join('\n');
    const result = parseQuestionsCsv(csv);
    // The blank line is skipped; we should have 2 data rows
    // (header is not counted as a data row).
    expect(result.rows.length).toBe(2);
  });
});

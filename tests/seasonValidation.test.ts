import { describe, expect, it } from 'vitest';
import {
  defaultSeasonValues,
  validateSeasonForm,
} from '../src/lib/seasonValidation';
import type { SeasonFormValues } from '../src/types';

function makeValues(overrides: Partial<SeasonFormValues> = {}): SeasonFormValues {
  return {
    label: 'August 2026 CSE',
    examDate: '2026-08-15',
    startsAt: '2026-06-16T00:00',
    endsAt: '2026-08-16T00:00',
    ...overrides,
  };
}

describe('validateSeasonForm', () => {
  it('accepts a well-formed season', () => {
    expect(validateSeasonForm(makeValues()).ok).toBe(true);
  });

  it('rejects an empty label', () => {
    const result = validateSeasonForm(makeValues({ label: '' }));
    expect(result.ok).toBe(false);
  });

  it('rejects a too-short label', () => {
    const result = validateSeasonForm(makeValues({ label: 'ab' }));
    expect(result.ok).toBe(false);
  });

  it('rejects a too-long label', () => {
    const result = validateSeasonForm(makeValues({ label: 'a'.repeat(61) }));
    expect(result.ok).toBe(false);
  });

  it('trims the label before checking length', () => {
    const result = validateSeasonForm(makeValues({ label: '   August 2026 CSE   ' }));
    expect(result.ok).toBe(true);
  });

  it('rejects an invalid exam date', () => {
    const result = validateSeasonForm(makeValues({ examDate: 'not-a-date' }));
    expect(result.ok).toBe(false);
  });

  it('rejects an invalid start date', () => {
    const result = validateSeasonForm(makeValues({ startsAt: 'not-a-date' }));
    expect(result.ok).toBe(false);
  });

  it('rejects an invalid end date', () => {
    const result = validateSeasonForm(makeValues({ endsAt: 'not-a-date' }));
    expect(result.ok).toBe(false);
  });

  it('rejects when end is on or before start', () => {
    const result = validateSeasonForm(
      makeValues({ startsAt: '2026-08-16T00:00', endsAt: '2026-08-16T00:00' }),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects when exam is before start', () => {
    const result = validateSeasonForm(
      makeValues({ startsAt: '2026-08-10T00:00', examDate: '2026-08-05' }),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects when exam is after end', () => {
    const result = validateSeasonForm(
      makeValues({ endsAt: '2026-08-14T00:00', examDate: '2026-08-20' }),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects a window longer than 365 days', () => {
    const result = validateSeasonForm(
      makeValues({
        startsAt: '2026-01-01T00:00',
        endsAt: '2027-01-02T00:00',
        examDate: '2027-01-01',
      }),
    );
    expect(result.ok).toBe(false);
  });

  it('accepts a window of exactly 1 day', () => {
    const result = validateSeasonForm(
      makeValues({
        startsAt: '2026-08-15T00:00',
        endsAt: '2026-08-16T00:00',
        examDate: '2026-08-15',
      }),
    );
    expect(result.ok).toBe(true);
  });
});

describe('defaultSeasonValues', () => {
  it('produces a window 1-365 days long', () => {
    const v = defaultSeasonValues(new Date('2026-06-01T00:00:00Z'));
    const start = Date.parse(v.startsAt);
    const end = Date.parse(v.endsAt);
    const days = (end - start) / 86_400_000;
    expect(days).toBeGreaterThanOrEqual(1);
    expect(days).toBeLessThanOrEqual(365);
  });

  it('places the exam date 1 day before endsAt (day after exam convention)', () => {
    const v = defaultSeasonValues(new Date('2026-06-01T00:00:00Z'));
    const exam = Date.parse(v.examDate);
    const end = Date.parse(v.endsAt);
    expect(Math.abs(end - exam - 86_400_000)).toBeLessThan(86_400_000);
  });

  it('returns an empty label so the user must fill it in', () => {
    const v = defaultSeasonValues();
    expect(v.label).toBe('');
  });
});

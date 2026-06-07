import { describe, expect, it } from 'vitest';
import {
  computeSeasonCountdown,
  findUserRank,
  formatSeasonCountdown,
  toFiniteScore,
} from '../src/lib/leaderboard';
import type { ExamSeason } from '../src/types';

function makeSeason(overrides: Partial<ExamSeason> = {}): ExamSeason {
  return {
    id: 'season-1',
    label: 'August 2026 CSE',
    exam_date: '2026-08-15',
    starts_at: '2026-06-16T00:00:00.000Z',
    ends_at: '2026-08-16T00:00:00.000Z',
    ...overrides,
  };
}

describe('toFiniteScore', () => {
  it('returns the number when given a number', () => {
    expect(toFiniteScore(85.5)).toBe(85.5);
    expect(toFiniteScore(0)).toBe(0);
    expect(toFiniteScore(100)).toBe(100);
  });

  it('parses numeric strings', () => {
    expect(toFiniteScore('85.5')).toBe(85.5);
    expect(toFiniteScore('100')).toBe(100);
    expect(toFiniteScore('0')).toBe(0);
  });

  it('returns 0 for null, undefined, and unparseable strings', () => {
    expect(toFiniteScore(null)).toBe(0);
    expect(toFiniteScore(undefined)).toBe(0);
    expect(toFiniteScore('')).toBe(0);
    expect(toFiniteScore('not-a-number')).toBe(0);
  });

  it('clamps to [0, 100]', () => {
    expect(toFiniteScore(150)).toBe(100);
    expect(toFiniteScore(-10)).toBe(0);
    expect(toFiniteScore('999')).toBe(100);
  });
});

describe('findUserRank', () => {
  const entries = [
    { user_id: 'u-1' },
    { user_id: 'u-2' },
    { user_id: 'u-3' },
  ];

  it('returns 1-indexed rank for a matching user', () => {
    expect(findUserRank(entries, 'u-1')?.rank).toBe(1);
    expect(findUserRank(entries, 'u-2')?.rank).toBe(2);
    expect(findUserRank(entries, 'u-3')?.rank).toBe(3);
  });

  it('returns null when the user is not in the list', () => {
    expect(findUserRank(entries, 'u-9')).toBeNull();
  });

  it('returns null when userId is null/empty', () => {
    expect(findUserRank(entries, null)).toBeNull();
    expect(findUserRank(entries, '')).toBeNull();
  });

  it('handles an empty entries list', () => {
    expect(findUserRank([], 'u-1')).toBeNull();
  });

  it('returns the matching entry object', () => {
    const result = findUserRank(entries, 'u-2');
    expect(result?.entry).toEqual({ user_id: 'u-2' });
  });
});

describe('computeSeasonCountdown', () => {
  it('counts days to the exam', () => {
    const season = makeSeason({ exam_date: '2026-08-15', ends_at: '2026-08-16T00:00:00.000Z' });
    const now = new Date('2026-08-10T12:00:00Z');
    const result = computeSeasonCountdown(season, now);
    expect(result.daysUntilExam).toBe(5);
    expect(result.daysUntilReset).toBe(6);
    expect(result.isLastDay).toBe(false);
  });

  it('returns 0 days when the exam is today (isLastDay=true)', () => {
    const season = makeSeason({ exam_date: '2026-08-15', ends_at: '2026-08-16T00:00:00.000Z' });
    const now = new Date('2026-08-15T08:00:00Z');
    const result = computeSeasonCountdown(season, now);
    expect(result.daysUntilExam).toBe(0);
    expect(result.daysUntilReset).toBe(1);
    expect(result.isLastDay).toBe(true);
  });

  it('clamps to 0 when the exam is in the past', () => {
    const season = makeSeason({ exam_date: '2026-01-15', ends_at: '2026-01-16T00:00:00.000Z' });
    const now = new Date('2026-06-01T00:00:00Z');
    const result = computeSeasonCountdown(season, now);
    expect(result.daysUntilExam).toBe(0);
    expect(result.daysUntilReset).toBe(0);
    expect(result.isLastDay).toBe(false);
  });
});

describe('formatSeasonCountdown', () => {
  it('shows "Resets tonight" on the day of the exam', () => {
    const season = makeSeason({ exam_date: '2026-08-15' });
    const now = new Date('2026-08-15T08:00:00Z');
    expect(formatSeasonCountdown(season, now)).toBe('Resets tonight');
  });

  it('shows "Resets tonight" on exam day', () => {
    const season = makeSeason({ exam_date: '2026-08-15' });
    const now = new Date('2026-08-15T08:00:00Z');
    expect(formatSeasonCountdown(season, now)).toBe('Resets tonight');
  });

  it('shows singular "1 day to exam"', () => {
    const season = makeSeason({ exam_date: '2026-08-15' });
    const now = new Date('2026-08-14T08:00:00Z');
    expect(formatSeasonCountdown(season, now)).toBe('1 day to exam');
  });

  it('shows plural "N days to exam"', () => {
    const season = makeSeason({ exam_date: '2026-08-15' });
    const now = new Date('2026-08-10T08:00:00Z');
    expect(formatSeasonCountdown(season, now)).toBe('5 days to exam');
  });

  it('falls back to a generic "N days to exam" for distant dates', () => {
    const season = makeSeason({ exam_date: '2026-12-25' });
    const now = new Date('2026-06-01T00:00:00Z');
    expect(formatSeasonCountdown(season, now)).toBe('207 days to exam');
  });
});

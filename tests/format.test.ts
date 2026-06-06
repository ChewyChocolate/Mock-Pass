import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDuration,
  formatDurationLong,
  formatHours,
  formatTime,
} from '../src/utils/format';

describe('formatDate', () => {
  const ts = new Date('2026-06-06T12:00:00Z').getTime();

  it('defaults to "Mon D" (no year)', () => {
    const out = formatDate(ts);
    expect(out).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
    expect(out).not.toMatch(/\d{4}/);
  });
  it('appends the year when includeYear is true', () => {
    expect(formatDate(ts, { includeYear: true })).toMatch(/\b2026\b/);
  });
  it('appends HH:MM when includeTime is true', () => {
    const out = formatDate(ts, { includeTime: true });
    expect(out).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatTime', () => {
  it('zero-pads to HH:MM:SS', () => {
    expect(formatTime(0)).toBe('00:00:00');
    expect(formatTime(65)).toBe('00:01:05');
    expect(formatTime(3661)).toBe('01:01:01');
  });
  it('clamps negative input to zero', () => {
    expect(formatTime(-100)).toBe('00:00:00');
  });
});

describe('formatDuration', () => {
  it('renders "Xm" for under an hour', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(59 * 60)).toBe('59m');
  });
  it('renders "Xh Ym" for an hour or more', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(5400)).toBe('1h 30m');
  });
  it('clamps negative input', () => {
    expect(formatDuration(-10)).toBe('0m');
  });
});

describe('formatDurationLong', () => {
  it('renders MM:SS for under an hour', () => {
    expect(formatDurationLong(0)).toBe('00:00');
    expect(formatDurationLong(65)).toBe('01:05');
  });
  it('renders H:MM:SS for an hour or more', () => {
    expect(formatDurationLong(3600)).toBe('1:00:00');
    expect(formatDurationLong(3661)).toBe('1:01:01');
  });
});

describe('formatHours', () => {
  it('always shows one decimal place with the "h" suffix', () => {
    expect(formatHours(0)).toBe('0.0h');
    expect(formatHours(3600)).toBe('1.0h');
    expect(formatHours(5400)).toBe('1.5h');
    expect(formatHours(1800)).toBe('0.5h');
  });
});

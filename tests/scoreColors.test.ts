import { describe, expect, it } from 'vitest';
import {
  dotColorClass,
  pctBarClass,
  pctBarTextClass,
  pctColorClass,
} from '../src/utils/scoreColors';
import { PASSING_SCORE } from '../src/data/questions';

describe('pctColorClass', () => {
  it('returns text-tertiary at or above 80', () => {
    expect(pctColorClass(80)).toBe('text-tertiary');
    expect(pctColorClass(95)).toBe('text-tertiary');
    expect(pctColorClass(100)).toBe('text-tertiary');
  });
  it('returns text-primary at or above 60', () => {
    expect(pctColorClass(60)).toBe('text-primary');
    expect(pctColorClass(79)).toBe('text-primary');
  });
  it('returns text-error below 60', () => {
    expect(pctColorClass(0)).toBe('text-error');
    expect(pctColorClass(59)).toBe('text-error');
  });
});

describe('dotColorClass', () => {
  it('matches the 3-tier boundary at 80 and 60', () => {
    expect(dotColorClass(80)).toMatch(/^bg-tertiary/);
    expect(dotColorClass(60)).toMatch(/^bg-primary/);
    expect(dotColorClass(0)).toMatch(/^bg-error/);
  });
});

describe('pctBarClass / pctBarTextClass', () => {
  it('cuts at PASSING_SCORE (binary pass/fail)', () => {
    expect(pctBarClass(PASSING_SCORE)).toBe('bg-primary');
    expect(pctBarClass(PASSING_SCORE - 1)).toBe('bg-error');
    expect(pctBarTextClass(PASSING_SCORE)).toBe('text-primary');
    expect(pctBarTextClass(PASSING_SCORE - 1)).toBe('text-error');
  });
});

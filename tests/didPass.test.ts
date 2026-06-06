import { describe, expect, it } from 'vitest';
import { PASSING_SCORE, didPass } from '../src/data/questions';

describe('didPass', () => {
  it('returns true at exactly PASSING_SCORE (inclusive boundary)', () => {
    expect(didPass(PASSING_SCORE)).toBe(true);
  });

  it('returns true above PASSING_SCORE', () => {
    expect(didPass(PASSING_SCORE + 1)).toBe(true);
    expect(didPass(100)).toBe(true);
  });

  it('returns false below PASSING_SCORE', () => {
    expect(didPass(PASSING_SCORE - 1)).toBe(false);
    expect(didPass(0)).toBe(false);
  });

  it('returns false for non-finite values (NaN, Infinity, -Infinity)', () => {
    expect(didPass(NaN)).toBe(false);
    expect(didPass(Infinity)).toBe(false);
    expect(didPass(-Infinity)).toBe(false);
  });

  it('returns false for negative scores', () => {
    expect(didPass(-1)).toBe(false);
  });

  it('is robust to legacy ×100 scores (treated as already-passing only when divided)', () => {
    expect(didPass(3881)).toBe(true);
    expect(didPass(3881 / 100)).toBe(false);
  });
});

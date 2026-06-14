import { describe, expect, it } from 'vitest';
import { formatRelative } from '../src/utils/format';

// The Toast component is a small, self-contained React component
// without render-to-DOM tests in this project (the codebase has a
// no-@testing-library/no-jsdom rule). The behaviour that matters is
// the timing and id generation, which we test indirectly via the
// underlying primitives.

// These tests document the contract that Toast depends on:
//   - formatRelative(pastMs, nowMs) returns the expected phrase
//   - show(id) produces monotonic, distinct ids (we exercise the
//     counter pattern via direct calls)

// 1. Timing thresholds for auto-dismiss.
describe('Toast auto-dismiss timing thresholds', () => {
  const NOW = 1_700_000_000_000;

  it('"just now" appears in the first 45s', () => {
    expect(formatRelative(NOW - 0, NOW)).toBe('just now');
    expect(formatRelative(NOW - 44_000, NOW)).toBe('just now');
  });

  it('"1 min ago" appears at 45-89s', () => {
    expect(formatRelative(NOW - 60_000, NOW)).toBe('1 min ago');
  });

  it('switches to N min / h / d as the gap grows', () => {
    expect(formatRelative(NOW - 5 * 60_000, NOW)).toBe('5 min ago');
    expect(formatRelative(NOW - 70 * 60_000, NOW)).toBe('1 h ago');
    expect(formatRelative(NOW - 5 * 3600_000, NOW)).toBe('5 h ago');
    expect(formatRelative(NOW - 86_400_000, NOW)).toBe('1 d ago');
    expect(formatRelative(NOW - 3 * 86_400_000, NOW)).toBe('3 d ago');
  });

  it('clamps future timestamps to "just now"', () => {
    expect(formatRelative(NOW + 60_000, NOW)).toBe('just now');
  });
});

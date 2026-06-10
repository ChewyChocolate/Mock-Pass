import { describe, expect, it } from 'vitest';
import {
  buildHandleBaseFromEmail,
  formatNameSubtitle,
  HANDLE_REGEX,
  MAX_HANDLE_LENGTH,
  MIN_HANDLE_LENGTH,
  RESERVED_HANDLES,
  validateHandle,
  withNumericSuffix,
} from '../src/lib/handle';

describe('HANDLE_REGEX', () => {
  it('accepts 3-20 lowercase alphanumerics + underscores', () => {
    expect(HANDLE_REGEX.test('abc')).toBe(true);
    expect(HANDLE_REGEX.test('chewy_choc')).toBe(true);
    expect(HANDLE_REGEX.test('a_b_c_1_2_3_4_5_6_7_8_9'.slice(0, 20))).toBe(true);
    expect(HANDLE_REGEX.test('a'.repeat(20))).toBe(true);
  });

  it('rejects too short, too long, uppercase, spaces, and special chars', () => {
    expect(HANDLE_REGEX.test('ab')).toBe(false);
    expect(HANDLE_REGEX.test('a'.repeat(21))).toBe(false);
    expect(HANDLE_REGEX.test('Abc')).toBe(false);
    expect(HANDLE_REGEX.test('abc def')).toBe(false);
    expect(HANDLE_REGEX.test('abc-def')).toBe(false);
    expect(HANDLE_REGEX.test('abc.def')).toBe(false);
    expect(HANDLE_REGEX.test('abc!')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(HANDLE_REGEX.test('')).toBe(false);
  });
});

describe('validateHandle', () => {
  it('accepts a well-formed handle', () => {
    expect(validateHandle('chewy_choc')).toEqual({ ok: true });
    expect(validateHandle('user_42')).toEqual({ ok: true });
  });

  it('trims whitespace and lowercases before validating', () => {
    expect(validateHandle('  Chewy_Choc  ')).toEqual({ ok: true });
  });

  it('rejects empty / non-string input', () => {
    expect(validateHandle('').ok).toBe(false);
    expect(validateHandle('   ').ok).toBe(false);
    expect(validateHandle(null as unknown as string).ok).toBe(false);
    expect(validateHandle(undefined as unknown as string).ok).toBe(false);
  });

  it('rejects handles below the minimum length', () => {
    const result = validateHandle('ab');
    expect(result.ok).toBe(false);
    expect(result.error).toContain(String(MIN_HANDLE_LENGTH));
  });

  it('rejects handles above the maximum length', () => {
    const result = validateHandle('a'.repeat(21));
    expect(result.ok).toBe(false);
    expect(result.error).toContain(String(MAX_HANDLE_LENGTH));
  });

  it('rejects invalid characters', () => {
    const result = validateHandle('hello-world');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/lowercase|underscore/);
  });

  it('rejects reserved handles (case-insensitive — every entry)', () => {
    // Iterate over the actual set so a future PR that adds or removes a
    // reserved handle can't silently break this test.
    for (const reserved of RESERVED_HANDLES) {
      const result = validateHandle(reserved);
      expect(result.ok, `expected "${reserved}" to be rejected`).toBe(false);
      expect(result.error, `expected "${reserved}" error to mention "reserved"`).toMatch(
        /reserved/,
      );
      // Case-insensitive matching.
      const upperResult = validateHandle(reserved.toUpperCase());
      expect(upperResult.ok, `expected "${reserved.toUpperCase()}" to be rejected`).toBe(false);
    }
  });

  it('rejects reserved handles with a numeric suffix', () => {
    // "admin_42" should be allowed (not reserved). Make sure the reserved
    // check uses exact equality, not a prefix match.
    expect(validateHandle('admin_42').ok).toBe(true);
    expect(validateHandle('the_admin').ok).toBe(true);
  });

  it('exposes the reserved handle set so we know what is blocked', () => {
    expect(RESERVED_HANDLES.size).toBeGreaterThan(0);
    expect(RESERVED_HANDLES.has('admin')).toBe(true);
    expect(RESERVED_HANDLES.has('root')).toBe(true);
    expect(RESERVED_HANDLES.has('chewy')).toBe(false);
  });
});

describe('buildHandleBaseFromEmail', () => {
  it('strips the domain and lowercases the local part', () => {
    expect(buildHandleBaseFromEmail('Chewy.Choc@Gmail.com')).toBe('chewy_choc');
  });

  it('replaces disallowed characters with underscores', () => {
    expect(buildHandleBaseFromEmail('maria.delacruz@example.com')).toBe('maria_delacruz');
    expect(buildHandleBaseFromEmail('jane-doe@example.com')).toBe('jane_doe');
    expect(buildHandleBaseFromEmail('user+tag@example.com')).toBe('user_tag');
  });

  it('trims leading and trailing underscores, then pads to minimum length', () => {
    expect(buildHandleBaseFromEmail('___hi___@example.com')).toBe('hi0');
  });

  it('truncates long local parts to 16 chars', () => {
    const long = 'a'.repeat(40) + '@example.com';
    expect(buildHandleBaseFromEmail(long)).toHaveLength(16);
  });

  it('pads very short local parts up to the minimum length', () => {
    expect(buildHandleBaseFromEmail('a@b.com')).toHaveLength(MIN_HANDLE_LENGTH);
    expect(buildHandleBaseFromEmail('')).toBe('user');
  });

  it('handles null / undefined / missing @ gracefully', () => {
    expect(buildHandleBaseFromEmail(null)).toBe('user');
    expect(buildHandleBaseFromEmail(undefined)).toBe('user');
    expect(buildHandleBaseFromEmail('noatsign')).toBe('noatsign');
  });
});

describe('withNumericSuffix', () => {
  it('appends a 2+ digit numeric suffix', () => {
    expect(withNumericSuffix('chewy_choc', 42)).toBe('chewy_choc_42');
    expect(withNumericSuffix('user', 7)).toBe('user_07');
  });

  it('truncates the combined value to MAX_HANDLE_LENGTH', () => {
    const long = 'a'.repeat(MAX_HANDLE_LENGTH - 2);
    const result = withNumericSuffix(long, 99);
    expect(result.length).toBeLessThanOrEqual(MAX_HANDLE_LENGTH);
    expect(result).toMatch(HANDLE_REGEX);
  });

  it('uses absolute value for negative seeds', () => {
    expect(withNumericSuffix('user', -42)).toBe('user_42');
  });
});

describe('formatNameSubtitle', () => {
  it('formats a typical name', () => {
    expect(formatNameSubtitle('Maria', 'Dela Cruz')).toBe('MA...A D');
  });

  it('trims surrounding whitespace', () => {
    expect(formatNameSubtitle('  Maria  ', '  Cruz  ')).toBe('MA...A C');
  });

  it('handles 1-char first name', () => {
    expect(formatNameSubtitle('A', 'B')).toBe('A...A B');
  });

  it('handles 2-char first name', () => {
    expect(formatNameSubtitle('Li', 'Smith')).toBe('LI...I S');
  });

  it('handles 3-char first name', () => {
    expect(formatNameSubtitle('Ana', 'Vega')).toBe('AN...A V');
  });

  it('uppercases the result', () => {
    expect(formatNameSubtitle('maria', 'cruz')).toBe('MA...A C');
  });

  it('returns null when first or last is missing', () => {
    expect(formatNameSubtitle(null, 'Cruz')).toBeNull();
    expect(formatNameSubtitle('Maria', null)).toBeNull();
    expect(formatNameSubtitle(undefined, undefined)).toBeNull();
  });

  it('returns null when either name is empty / whitespace', () => {
    expect(formatNameSubtitle('', 'Cruz')).toBeNull();
    expect(formatNameSubtitle('Maria', '')).toBeNull();
    expect(formatNameSubtitle('   ', 'Cruz')).toBeNull();
    expect(formatNameSubtitle('Maria', '   ')).toBeNull();
  });
});

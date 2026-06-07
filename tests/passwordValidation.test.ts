import { describe, expect, it } from 'vitest';
import { MIN_PASSWORD_LENGTH, validateNewPassword } from '../src/utils/passwordValidation';

describe('validateNewPassword', () => {
  it('returns null for a valid matching pair', () => {
    expect(validateNewPassword('validpw1', 'validpw1')).toBeNull();
  });

  it('flags an empty password with field "password"', () => {
    const err = validateNewPassword('', 'whatever');
    expect(err?.field).toBe('password');
    expect(err?.message).toMatch(/enter/i);
  });

  it('flags a too-short password with field "password" and includes the minimum length', () => {
    const err = validateNewPassword('short', 'short');
    expect(err?.field).toBe('password');
    expect(err?.message).toContain(String(MIN_PASSWORD_LENGTH));
  });

  it('accepts a password that is exactly the minimum length', () => {
    const pw = 'a'.repeat(MIN_PASSWORD_LENGTH);
    expect(validateNewPassword(pw, pw)).toBeNull();
  });

  it('flags a missing confirmation with field "confirm"', () => {
    const err = validateNewPassword('validpw1', '');
    expect(err?.field).toBe('confirm');
    expect(err?.message).toMatch(/re-enter/i);
  });

  it('flags a mismatched confirmation with field "confirm"', () => {
    const err = validateNewPassword('validpw1', 'validpw2');
    expect(err?.field).toBe('confirm');
    expect(err?.message).toMatch(/match/i);
  });

  it('checks length before confirmation so the message is about length, not match', () => {
    const err = validateNewPassword('short', 'different');
    expect(err?.field).toBe('password');
    expect(err?.message).toContain(String(MIN_PASSWORD_LENGTH));
  });
});

import { describe, expect, it } from 'vitest';
import { ALLOWED_ADMIN_EMAILS, isAdminEmail } from '../src/lib/admin';

describe('ALLOWED_ADMIN_EMAILS', () => {
  it('contains at least one entry', () => {
    expect(ALLOWED_ADMIN_EMAILS.size).toBeGreaterThan(0);
  });
});

describe('isAdminEmail', () => {
  it('matches an email in the allowlist', () => {
    const [first] = Array.from(ALLOWED_ADMIN_EMAILS);
    expect(first).toBeDefined();
    expect(isAdminEmail(first)).toBe(true);
  });

  it('is case-insensitive', () => {
    const [first] = Array.from(ALLOWED_ADMIN_EMAILS);
    expect(first).toBeDefined();
    expect(isAdminEmail(first!.toUpperCase())).toBe(true);
    expect(isAdminEmail(first!.toLowerCase())).toBe(true);
  });

  it('rejects an email not in the allowlist', () => {
    expect(isAdminEmail('user@example.com')).toBe(false);
    expect(isAdminEmail('chewy.choc@gmail.com')).toBe(false);
  });

  it('rejects null, undefined, and empty string', () => {
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail('')).toBe(false);
  });

  it('rejects partial matches (no substring trickery)', () => {
    const [first] = Array.from(ALLOWED_ADMIN_EMAILS);
    expect(first).toBeDefined();
    expect(isAdminEmail(`x${first}`)).toBe(false);
    expect(isAdminEmail(`${first}x`)).toBe(false);
  });
});

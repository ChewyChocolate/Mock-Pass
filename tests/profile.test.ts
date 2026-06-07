import { describe, expect, it } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { deriveDisplayName, type ProfileMetadata } from '../src/lib/profile';

function fakeUser(metadata: ProfileMetadata | undefined): User {
  return {
    id: 'test-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'juan@example.com',
    user_metadata: (metadata ?? {}) as User['user_metadata'],
    app_metadata: {},
    created_at: '2025-01-01T00:00:00.000Z',
  } as User;
}

describe('deriveDisplayName', () => {
  it('returns null for null user', () => {
    expect(deriveDisplayName(null)).toBeNull();
  });

  it('returns null for undefined user', () => {
    expect(deriveDisplayName(undefined)).toBeNull();
  });

  it('returns null when user_metadata is empty', () => {
    expect(deriveDisplayName(fakeUser({}))).toBeNull();
  });

  it('returns null when all candidate fields are empty strings', () => {
    expect(deriveDisplayName(fakeUser({ first_name: '', full_name: '', name: '' }))).toBeNull();
  });

  it('returns null when all candidate fields are whitespace', () => {
    expect(deriveDisplayName(fakeUser({ first_name: '   ', name: '\t\n' }))).toBeNull();
  });

  it('prefers first_name over full_name and name', () => {
    expect(
      deriveDisplayName(fakeUser({ first_name: 'Juan', full_name: 'Juan Dela Cruz', name: 'Google Name' })),
    ).toBe('Juan');
  });

  it('falls back to full_name when first_name is missing', () => {
    expect(deriveDisplayName(fakeUser({ full_name: 'Maria Santos' }))).toBe('Maria');
  });

  it('falls back to name (Google OAuth default) when first_name and full_name are missing', () => {
    expect(deriveDisplayName(fakeUser({ name: 'Pedro Penduko' }))).toBe('Pedro');
  });

  it('returns the first whitespace-separated word of a full name', () => {
    expect(deriveDisplayName(fakeUser({ full_name: 'Maria Clara Santos' }))).toBe('Maria');
  });

  it('trims surrounding whitespace from the candidate', () => {
    expect(deriveDisplayName(fakeUser({ first_name: '   Juan   ' }))).toBe('Juan');
  });

  it('caps the result at 30 characters', () => {
    const longName = 'A'.repeat(50);
    const result = deriveDisplayName(fakeUser({ first_name: longName }));
    expect(result).toBe('A'.repeat(30));
    expect(result?.length).toBe(30);
  });

  it('handles Unicode names without corruption', () => {
    expect(deriveDisplayName(fakeUser({ first_name: 'José' }))).toBe('José');
    expect(deriveDisplayName(fakeUser({ first_name: 'Müller' }))).toBe('Müller');
    expect(deriveDisplayName(fakeUser({ first_name: 'Mãria' }))).toBe('Mãria');
  });

  it('returns null when first_name is whitespace and no other fields are set', () => {
    expect(deriveDisplayName(fakeUser({ first_name: '   ' }))).toBeNull();
  });

  it('handles a single-character name', () => {
    expect(deriveDisplayName(fakeUser({ first_name: 'A' }))).toBe('A');
  });
});

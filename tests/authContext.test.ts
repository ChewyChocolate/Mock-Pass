import { describe, it, expect } from 'vitest';
import {
  deriveAuthStatus,
  buildInitialAuthState,
  type AuthState,
} from '../src/context/AuthContext';
import type { Session, User } from '@supabase/supabase-js';

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    access_token: 'access',
    refresh_token: 'refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: { id: 'user-1' } as User,
    ...overrides,
  };
}

describe('deriveAuthStatus', () => {
  it('returns "unconfigured" when env is missing', () => {
    expect(deriveAuthStatus(false, null, false)).toBe('unconfigured');
    expect(deriveAuthStatus(false, makeSession(), true)).toBe('unconfigured');
  });

  it('returns "loading" while the SDK is resolving the initial session', () => {
    expect(deriveAuthStatus(true, null, true)).toBe('loading');
    expect(deriveAuthStatus(true, makeSession(), true)).toBe('loading');
  });

  it('returns "signed-in" when configured and a session exists', () => {
    expect(deriveAuthStatus(true, makeSession(), false)).toBe('signed-in');
  });

  it('returns "signed-out" when configured and no session', () => {
    expect(deriveAuthStatus(true, null, false)).toBe('signed-out');
  });
});

describe('buildInitialAuthState', () => {
  it('returns unconfigured state when not configured, regardless of session', () => {
    const state: AuthState = buildInitialAuthState(false, makeSession());
    expect(state.status).toBe('unconfigured');
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.error).toBeNull();
  });

  it('returns signed-in state with user/session when configured + session', () => {
    const session = makeSession();
    const state = buildInitialAuthState(true, session);
    expect(state.status).toBe('signed-in');
    expect(state.session).toBe(session);
    expect(state.user).toBe(session.user);
  });

  it('returns signed-out state when configured but no session', () => {
    const state = buildInitialAuthState(true, null);
    expect(state.status).toBe('signed-out');
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
  });
});

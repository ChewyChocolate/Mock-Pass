import { createClient, type PostgrestError, type SupabaseClient } from '@supabase/supabase-js';
import { STORAGE_KEYS } from './storageKeys';

export const SESSION_EXPIRED_EVENT = 'mockpass:session-expired';

export type SessionExpiredDetail = { reason: 'refresh_failed' | 'jwt_expired' };

function emitSessionExpired(detail: SessionExpiredDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<SessionExpiredDetail>(SESSION_EXPIRED_EVENT, { detail }));
}

export const SUPABASE_URL_ENV = 'VITE_SUPABASE_URL';
export const SUPABASE_ANON_KEY_ENV = 'VITE_SUPABASE_ANON_KEY';

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

const PLACEHOLDER_VALUES = new Set(['', 'undefined', 'null']);

export function readSupabaseEnv(source: Record<string, unknown> = import.meta.env): SupabaseEnv | null {
  const rawUrl = source[SUPABASE_URL_ENV];
  const rawKey = source[SUPABASE_ANON_KEY_ENV];
  const url = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  const anonKey = typeof rawKey === 'string' ? rawKey.trim() : '';
  if (PLACEHOLDER_VALUES.has(url) || PLACEHOLDER_VALUES.has(anonKey)) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  if (anonKey.length < 20) return null;
  return { url, anonKey };
}

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigError';
  }
}

let cachedClient: SupabaseClient | null = null;
let cachedEnv: SupabaseEnv | null = null;
let missingLogged = false;

const REFRESH_LEEWAY_SECONDS = 60;

export function getSupabaseConfig(): SupabaseEnv {
  if (cachedEnv) return cachedEnv;
  const env = readSupabaseEnv();
  if (!env) {
    if (!missingLogged && typeof console !== 'undefined') {
      missingLogged = true;
      console.warn(
        '[mockpass] Supabase env vars are missing. Auth and cross-device sync are disabled. ' +
          `Set ${SUPABASE_URL_ENV} and ${SUPABASE_ANON_KEY_ENV} in .env.local.`,
      );
    }
    throw new SupabaseConfigError(
      `Missing ${SUPABASE_URL_ENV} or ${SUPABASE_ANON_KEY_ENV}. ` +
        'Auth and cross-device sync are disabled until these are set.',
    );
  }
  cachedEnv = env;
  return env;
}

export function isSupabaseConfigured(): boolean {
  return readSupabaseEnv() !== null;
}

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const env = getSupabaseConfig();
  cachedClient = createClient(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: STORAGE_KEYS.supabaseAuth,
      flowType: 'pkce',
    },
  });
  return cachedClient;
}

export type TokenCheck =
  | { ok: true }
  | { ok: false; reason: 'no_session' | 'refresh_failed' };

/**
 * Ensure the current access token is fresh before issuing a request.
 * Supabase's auto-refresh runs on a timer that can lag behind the first
 * query after a tab regains focus or after a long pause; calling this
 * first makes a "JWT expired" response from PostgREST structurally
 * impossible. Emits `SESSION_EXPIRED_EVENT` when the refresh token is
 * itself rejected so the UI can prompt the user to sign in again.
 */
export async function ensureFreshToken(): Promise<TokenCheck> {
  let client: SupabaseClient;
  try {
    client = getSupabaseClient();
  } catch {
    return { ok: false, reason: 'no_session' };
  }
  const { data, error } = await client.auth.getSession();
  if (error || !data.session) return { ok: false, reason: 'no_session' };

  const expiresAt = data.session.expires_at ?? 0;
  const nowSec = Math.floor(Date.now() / 1000);
  if (expiresAt - nowSec > REFRESH_LEEWAY_SECONDS) return { ok: true };

  const { data: refreshed, error: refreshErr } = await client.auth.refreshSession();
  if (refreshErr || !refreshed.session) {
    emitSessionExpired({ reason: 'refresh_failed' });
    return { ok: false, reason: 'refresh_failed' };
  }
  return { ok: true };
}

/**
 * Single chokepoint for any read/write against the database. It:
 *  1. Forces a token refresh if the access token is near expiry.
 *  2. Runs the caller's query.
 *  3. If the response is still a "JWT expired" error (refresh-token race),
 *     emits the session-expired event so the UI can react.
 *
 * Use this everywhere instead of calling `client.from(...).select(...)`
 * directly to make "JWT expired" warnings structurally impossible.
 */
export async function query<T>(
  fn: (client: SupabaseClient) => Promise<{ data: T; error: PostgrestError | null }>,
): Promise<{ data: T; error: PostgrestError | null }> {
  const check = await ensureFreshToken();
  if (!check.ok) {
    return {
      data: null as T,
      error: { message: 'session_expired', details: '', hint: '', code: 'PGRST301' } as PostgrestError,
    };
  }
  const client = getSupabaseClient();
  const result = await fn(client);
  if (result.error && /jwt expired/i.test(result.error.message)) {
    emitSessionExpired({ reason: 'jwt_expired' });
  }
  return result;
}

export function __resetSupabaseClientForTests(): void {
  cachedClient = null;
  cachedEnv = null;
  missingLogged = false;
}

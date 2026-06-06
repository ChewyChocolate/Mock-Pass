import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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
      storageKey: 'mockpass:supabase-auth',
    },
  });
  return cachedClient;
}

export function __resetSupabaseClientForTests(): void {
  cachedClient = null;
  cachedEnv = null;
  missingLogged = false;
}

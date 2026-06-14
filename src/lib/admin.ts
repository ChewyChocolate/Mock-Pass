/**
 * Admin gating. The allowlist lives in `public.admin_allowlist` (see
 * supabase/leaderboard.sql). The single source of truth is the DB; the
 * client fetches the current user's status via the
 * `is_email_in_admin_allowlist(email)` RPC and caches it in localStorage
 * for the session.
 */
import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from './supabase';
import { useAuth } from '../context/AuthContext';

const CACHE_KEY = 'mockpass.adminCheck';

interface CachedAdminCheck {
  email: string;
  isAdmin: boolean;
  expiresAt: number;
}

const CACHE_TTL_MS = 60_000; // 1 minute

function readCache(email: string): boolean | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedAdminCheck;
    if (parsed.email !== email) return null;
    if (parsed.expiresAt < Date.now()) return null;
    return parsed.isAdmin;
  } catch {
    return null;
  }
}

function writeCache(email: string, isAdmin: boolean): void {
  try {
    const payload: CachedAdminCheck = {
      email,
      isAdmin,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be unavailable (SSR, private mode); ignore.
  }
}

export function clearAdminCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Ask Supabase whether the given email is in the admin allowlist.
 * Caches the result for 60s. Returns false on any error (safe default).
 */
export async function fetchIsAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const cached = readCache(email);
  if (cached !== null) return cached;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client.rpc('is_email_in_admin_allowlist', {
      email,
    });
    if (error) {
      console.warn('[mockpass] is_email_in_admin_allowlist failed:', error.message);
      return false;
    }
    const isAdmin = data === true;
    writeCache(email, isAdmin);
    return isAdmin;
  } catch (err) {
    console.warn('[mockpass] admin check error:', err);
    return false;
  }
}

/**
 * Hook: returns true when the current user's email is in the admin
 * allowlist. Starts false (loading) and updates after the async check
 * completes. Cache TTL is 60s; pass `refresh()` to force a re-check.
 */
/**
 * React hook that reports whether the current user is an admin. Starts
 * at `isLoading: true, isAdmin: false` so a freshly-mounted admin
 * section can render a spinner instead of flashing the "no access"
 * panel during the ~200 ms RPC. After the check resolves,
 * `isLoading` is false and `isAdmin` reflects the allowlist.
 */
export function useAdmin(): { isAdmin: boolean; isLoading: boolean } {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    (async () => {
      const result = await fetchIsAdmin(user?.email);
      if (active) {
        setIsAdmin(result);
        setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.email, tick]);

  return { isAdmin, isLoading };
}

/**
 * Hook variant that also returns a `refresh` function for callers that
 * need to force a re-check (e.g. after the admin grants themselves access
 * via the SQL editor). Used by the Admin screen.
 */
export function useAdminWithRefresh(): { isAdmin: boolean; refresh: () => void } {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    clearAdminCache();
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await fetchIsAdmin(user?.email);
      if (active) setIsAdmin(result);
    })();
    return () => {
      active = false;
    };
  }, [user?.email, tick]);

  return { isAdmin, refresh };
}

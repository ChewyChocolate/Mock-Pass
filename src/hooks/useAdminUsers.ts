import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import {
  deleteUser,
  getUserSessions,
  searchUsers,
  type DeleteUserResult,
  type GetUserSessionsResult,
  type SearchUsersResult,
} from '../lib/adminUsers';
import type { AdminUserSearchResult, AdminUserSession } from '../types';

export type AdminUsersStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseAdminUsersResult {
  status: AdminUsersStatus;
  users: AdminUserSearchResult[];
  error: string | null;
  search: (q: string) => void;
  refresh: () => void;
}

/**
 * Debounced user search. The hook debounces on `searchTerm` so we
 * don't fire an RPC on every keystroke; the latest pending search is
 * what gets sent.
 */
export function useAdminUsers(enabled: boolean): UseAdminUsersResult {
  const [status, setStatus] = useState<AdminUsersStatus>('idle');
  const [users, setUsers] = useState<AdminUserSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [debouncedTerm, setDebouncedTerm] = useState<string>('');

  const search = useCallback((q: string) => {
    setSearchTerm(q);
  }, []);

  const refresh = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    if (!enabled) {
      setUsers([]);
      setStatus('idle');
      return;
    }
    let active = true;
    setStatus('loading');
    setError(null);
    (async () => {
      try {
        const client = getSupabaseClient();
        const result: SearchUsersResult = await searchUsers(client, debouncedTerm);
        if (!active) return;
        if (!result.ok) {
          setError(result.error ?? 'Search failed.');
          setStatus('error');
          return;
        }
        setUsers(result.users);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Search failed.');
        setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [enabled, debouncedTerm, refreshTick]);

  return { status, users, error, search, refresh };
}

export interface UseUserSessionsResult {
  status: AdminUsersStatus;
  sessions: AdminUserSession[];
  error: string | null;
  load: (userId: string) => void;
  refresh: () => void;
  currentUserId: string | null;
}

export function useUserSessions(enabled: boolean): UseUserSessionsResult {
  const [status, setStatus] = useState<AdminUsersStatus>('idle');
  const [sessions, setSessions] = useState<AdminUserSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const load = useCallback((userId: string) => {
    setCurrentUserId(userId);
  }, []);

  const refresh = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !currentUserId) {
      setSessions([]);
      setStatus('idle');
      return;
    }
    let active = true;
    setStatus('loading');
    setError(null);
    (async () => {
      try {
        const client = getSupabaseClient();
        const result: GetUserSessionsResult = await getUserSessions(
          client,
          currentUserId,
        );
        if (!active) return;
        if (!result.ok) {
          setError(result.error ?? 'Failed to load sessions.');
          setStatus('error');
          return;
        }
        setSessions(result.sessions);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load sessions.');
        setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [enabled, currentUserId, refreshTick]);

  return { status, sessions, error, load, refresh, currentUserId };
}

export function useDeleteUser(): {
  remove: (userId: string) => Promise<DeleteUserResult>;
  busy: boolean;
} {
  const [busy, setBusy] = useState(false);
  const remove = useCallback(
    async (userId: string): Promise<DeleteUserResult> => {
      setBusy(true);
      try {
        const client = getSupabaseClient();
        return await deleteUser(client, userId);
      } finally {
        setBusy(false);
      }
    },
    [],
  );
  return { remove, busy };
}

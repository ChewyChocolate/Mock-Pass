import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { fetchAdminStats, type AdminStats } from '../lib/adminStats';

export type AdminStatsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseAdminStatsResult {
  status: AdminStatsStatus;
  stats: AdminStats | null;
  error: string | null;
  refresh: () => void;
}

export function useAdminStats(enabled: boolean = true): UseAdminStatsResult {
  const [status, setStatus] = useState<AdminStatsStatus>('idle');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }
    let active = true;
    setStatus('loading');
    setError(null);
    (async () => {
      try {
        const client = getSupabaseClient();
        const result = await fetchAdminStats(client);
        if (!active) return;
        if (!result.ok) {
          setError(result.error ?? 'Failed to load stats.');
          setStatus('error');
          return;
        }
        setStats(result.stats);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load stats.');
        setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [enabled, refreshTick]);

  return { status, stats, error, refresh };
}

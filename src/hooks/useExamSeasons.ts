import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import type { ExamSeason, SeasonFormValues } from '../types';

export type SeasonsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseExamSeasonsResult {
  status: SeasonsStatus;
  seasons: ExamSeason[];
  error: string | null;
  refresh: () => void;
  save: (values: SeasonFormValues, id?: string) => Promise<void>;
  setActive: (id: string, isActive: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useExamSeasons(): UseExamSeasonsResult {
  const [status, setStatus] = useState<SeasonsStatus>('idle');
  const [seasons, setSeasons] = useState<ExamSeason[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError(null);
    (async () => {
      try {
        const client = getSupabaseClient();
        const { data, error: rpcError } = await client
          .from('admin_seasons')
          .select('*')
          .order('starts_at', { ascending: false });
        if (!active) return;
        if (rpcError) {
          setError(rpcError.message);
          setStatus('error');
          return;
        }
        setSeasons((data ?? []) as ExamSeason[]);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load seasons.');
        setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshTick]);

  const save = useCallback(
    async (values: SeasonFormValues, id?: string) => {
      const client = getSupabaseClient();
      const row = {
        label: values.label.trim(),
        exam_date: values.examDate,
        starts_at: new Date(values.startsAt).toISOString(),
        ends_at: new Date(values.endsAt).toISOString(),
        is_active: true,
      };
      let result;
      if (id) {
        result = await client.from('exam_seasons').update(row).eq('id', id);
      } else {
        result = await client.from('exam_seasons').insert(row);
      }
      if (result.error) throw new Error(result.error.message);
      refresh();
    },
    [refresh],
  );

  const setActive = useCallback(
    async (id: string, isActive: boolean) => {
      const client = getSupabaseClient();
      const { error: updateError } = await client
        .from('exam_seasons')
        .update({ is_active: isActive })
        .eq('id', id);
      if (updateError) throw new Error(updateError.message);
      refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      const client = getSupabaseClient();
      const { error: deleteError } = await client.from('exam_seasons').delete().eq('id', id);
      if (deleteError) throw new Error(deleteError.message);
      refresh();
    },
    [refresh],
  );

  return { status, seasons, error, refresh, save, setActive, remove };
}

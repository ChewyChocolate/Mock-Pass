import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import {
  fetchCurrentSeason,
  fetchLeaderboardSeason,
  fetchLeaderboardSeasonTopic,
  fetchLeaderboardSeasonWeek,
  findUserRank,
  type FetchCurrentSeasonResult,
  type FetchLeaderboardResult,
  type FetchLeaderboardTopicResult,
} from '../lib/leaderboard';
import type {
  ExamLevel,
  ExamSeason,
  LeaderboardEntry,
  LeaderboardTab,
  LeaderboardTopicEntry,
} from '../types';

export type LeaderboardStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface LeaderboardView {
  tab: LeaderboardTab;
  level: ExamLevel;
  topic: string | null;
}

export interface UseLeaderboardResult {
  status: LeaderboardStatus;
  entries: LeaderboardEntry[] | LeaderboardTopicEntry[];
  userRank: number | null;
  error: string | null;
  season: ExamSeason | null;
  seasonError: string | null;
  refresh: () => void;
}

export function useLeaderboard(view: LeaderboardView, currentUserId: string | null): UseLeaderboardResult {
  const [status, setStatus] = useState<LeaderboardStatus>('idle');
  const [entries, setEntries] = useState<UseLeaderboardResult['entries']>([]);
  const [error, setError] = useState<string | null>(null);
  const [season, setSeason] = useState<ExamSeason | null>(null);
  const [seasonError, setSeasonError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const client = getSupabaseClient();
        const r: FetchCurrentSeasonResult = await fetchCurrentSeason(client);
        if (!active) return;
        if (!r.ok) {
          setSeason(null);
          setSeasonError(r.error ?? 'Could not load current season.');
        } else {
          setSeason(r.season);
          setSeasonError(null);
        }
      } catch (err) {
        if (!active) return;
        setSeason(null);
        setSeasonError(err instanceof Error ? err.message : 'Could not load current season.');
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshTick]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError(null);

    const load = async () => {
      let result: FetchLeaderboardResult | FetchLeaderboardTopicResult;
      try {
        const client = getSupabaseClient();
        if (view.tab === 'all-time') {
          result = await fetchLeaderboardSeason(client, view.level);
        } else if (view.tab === 'week') {
          result = await fetchLeaderboardSeasonWeek(client, view.level);
        } else {
          if (!view.topic) {
            if (!active) return;
            setEntries([]);
            setStatus('ready');
            return;
          }
          result = await fetchLeaderboardSeasonTopic(client, view.level, view.topic);
        }
      } catch (err) {
        if (!active) return;
        setEntries([]);
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard.');
        setStatus('error');
        return;
      }
      if (!active) return;
      if (!result.ok) {
        setEntries([]);
        setError(result.error ?? 'Failed to load leaderboard.');
        setStatus('error');
        return;
      }
      setEntries(result.entries);
      setStatus('ready');
    };

    void load();
    return () => {
      active = false;
    };
  }, [view.tab, view.level, view.topic, refreshTick]);

  const rankedEntries = entries as { user_id: string }[];
  const rank = findUserRank(rankedEntries, currentUserId);

  return {
    status,
    entries,
    userRank: rank ? rank.rank : null,
    error,
    season,
    seasonError,
    refresh,
  };
}

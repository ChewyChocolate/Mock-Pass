import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ExamLevel,
  LeaderboardEntry,
  LeaderboardTopicEntry,
} from '../types';

/**
 * Supabase returns numeric/decimal columns as strings to preserve precision.
 * Coerce to a JS number for client use; clamp to a sane [0, 100] range so a
 * server bug can't crash the UI.
 */
export function toFiniteScore(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

const DEFAULT_LIMIT = 100;

interface LeaderboardBestRow {
  user_id: string;
  handle: string;
  subtitle: string | null;
  level: ExamLevel;
  best_score: number | string;
  best_submitted_at: number;
  attempts?: number;
}

interface LeaderboardTopicRow {
  user_id: string;
  handle: string;
  subtitle: string | null;
  level: ExamLevel;
  topic: string;
  best_topic_pct: number | string;
  best_submitted_at: number;
}

export interface FetchLeaderboardResult {
  ok: boolean;
  entries: LeaderboardEntry[];
  error?: string;
}

export interface FetchLeaderboardTopicResult {
  ok: boolean;
  entries: LeaderboardTopicEntry[];
  error?: string;
}

export async function fetchLeaderboardBest(
  client: SupabaseClient,
  level: ExamLevel,
  limit: number = DEFAULT_LIMIT,
): Promise<FetchLeaderboardResult> {
  const { data, error } = await client
    .from('leaderboard_best')
    .select('*')
    .eq('level', level)
    .order('best_score', { ascending: false })
    .order('best_submitted_at', { ascending: true })
    .limit(limit);
  if (error) {
    return { ok: false, entries: [], error: error.message };
  }
  const entries = (data ?? []).map((row): LeaderboardEntry => {
    const r = row as LeaderboardBestRow;
    return {
      user_id: r.user_id,
      handle: r.handle,
      subtitle: r.subtitle ?? null,
      level: r.level,
      best_score: toFiniteScore(r.best_score),
      best_submitted_at: Number(r.best_submitted_at) || 0,
      attempts: r.attempts,
    };
  });
  return { ok: true, entries };
}

export async function fetchLeaderboardWeek(
  client: SupabaseClient,
  level: ExamLevel,
  limit: number = DEFAULT_LIMIT,
): Promise<FetchLeaderboardResult> {
  const { data, error } = await client
    .from('leaderboard_week')
    .select('*')
    .eq('level', level)
    .order('best_score', { ascending: false })
    .order('best_submitted_at', { ascending: true })
    .limit(limit);
  if (error) {
    return { ok: false, entries: [], error: error.message };
  }
  const entries = (data ?? []).map((row): LeaderboardEntry => {
    const r = row as LeaderboardBestRow;
    return {
      user_id: r.user_id,
      handle: r.handle,
      subtitle: r.subtitle ?? null,
      level: r.level,
      best_score: toFiniteScore(r.best_score),
      best_submitted_at: Number(r.best_submitted_at) || 0,
      attempts: r.attempts,
    };
  });
  return { ok: true, entries };
}

export async function fetchLeaderboardTopic(
  client: SupabaseClient,
  level: ExamLevel,
  topic: string,
  limit: number = DEFAULT_LIMIT,
): Promise<FetchLeaderboardTopicResult> {
  const { data, error } = await client
    .from('leaderboard_topic')
    .select('*')
    .eq('level', level)
    .eq('topic', topic)
    .order('best_topic_pct', { ascending: false })
    .order('best_submitted_at', { ascending: true })
    .limit(limit);
  if (error) {
    return { ok: false, entries: [], error: error.message };
  }
  const entries = (data ?? []).map((row): LeaderboardTopicEntry => {
    const r = row as LeaderboardTopicRow;
    return {
      user_id: r.user_id,
      handle: r.handle,
      subtitle: r.subtitle ?? null,
      level: r.level,
      topic: r.topic,
      best_topic_pct: toFiniteScore(r.best_topic_pct),
      best_submitted_at: Number(r.best_submitted_at) || 0,
    };
  });
  return { ok: true, entries };
}

/**
 * Find the current user's rank within a list of entries.
 * Returns null when the user is not in the list (e.g. they have no sessions yet).
 * Rank is 1-indexed.
 */
export function findUserRank(
  entries: { user_id: string }[],
  userId: string | null,
): { rank: number; entry: { user_id: string } } | null {
  if (!userId) return null;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].user_id === userId) {
      return { rank: i + 1, entry: entries[i] };
    }
  }
  return null;
}

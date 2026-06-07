import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ExamLevel,
  ExamSeason,
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

interface SeasonRow {
  id: string;
  label: string;
  exam_date: string;
  starts_at: string;
  ends_at: string;
}

interface LeaderboardSeasonRow {
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

export interface FetchCurrentSeasonResult {
  ok: boolean;
  season: ExamSeason | null;
  error?: string;
}

export async function fetchCurrentSeason(
  client: SupabaseClient,
): Promise<FetchCurrentSeasonResult> {
  const { data, error } = await client.from('current_season').select('*').maybeSingle();
  if (error) {
    return { ok: false, season: null, error: error.message };
  }
  if (!data) {
    return { ok: true, season: null };
  }
  const row = data as SeasonRow;
  return {
    ok: true,
    season: {
      id: row.id,
      label: row.label,
      exam_date: row.exam_date,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
    },
  };
}

export async function fetchLeaderboardSeason(
  client: SupabaseClient,
  level: ExamLevel,
  limit: number = DEFAULT_LIMIT,
): Promise<FetchLeaderboardResult> {
  const { data, error } = await client
    .from('leaderboard_season')
    .select('*')
    .eq('level', level)
    .order('best_score', { ascending: false })
    .order('best_submitted_at', { ascending: true })
    .limit(limit);
  if (error) {
    return { ok: false, entries: [], error: error.message };
  }
  const entries = (data ?? []).map((row): LeaderboardEntry => {
    const r = row as LeaderboardSeasonRow;
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

export async function fetchLeaderboardSeasonWeek(
  client: SupabaseClient,
  level: ExamLevel,
  limit: number = DEFAULT_LIMIT,
): Promise<FetchLeaderboardResult> {
  const { data, error } = await client
    .from('leaderboard_season_week')
    .select('*')
    .eq('level', level)
    .order('best_score', { ascending: false })
    .order('best_submitted_at', { ascending: true })
    .limit(limit);
  if (error) {
    return { ok: false, entries: [], error: error.message };
  }
  const entries = (data ?? []).map((row): LeaderboardEntry => {
    const r = row as LeaderboardSeasonRow;
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

export async function fetchLeaderboardSeasonTopic(
  client: SupabaseClient,
  level: ExamLevel,
  topic: string,
  limit: number = DEFAULT_LIMIT,
): Promise<FetchLeaderboardTopicResult> {
  const { data, error } = await client
    .from('leaderboard_season_topic')
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

export interface SeasonCountdown {
  daysUntilExam: number;
  daysUntilReset: number;
  isLastDay: boolean;
}

/**
 * Compute the countdown to a season's exam and reset moments.
 *
 *   daysUntilExam  - whole days from now() to exam_date (midnight UTC).
 *   daysUntilReset - whole days from now() to ends_at (midnight after exam).
 *   isLastDay      - true if `now` is the same calendar day as exam_date.
 *
 * Negative values are returned as 0 for display (we don't say "-3 days").
 */
export function computeSeasonCountdown(
  season: ExamSeason,
  now: Date = new Date(),
): SeasonCountdown {
  const exam = new Date(season.exam_date);
  const ends = new Date(season.ends_at);
  const dayMs = 86_400_000;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfExam = new Date(exam.getUTCFullYear(), exam.getUTCMonth(), exam.getUTCDate());
  const startOfEnds = new Date(ends.getUTCFullYear(), ends.getUTCMonth(), ends.getUTCDate());

  const daysUntilExam = Math.max(0, Math.round((startOfExam.getTime() - startOfToday.getTime()) / dayMs));
  const daysUntilReset = Math.max(0, Math.round((startOfEnds.getTime() - startOfToday.getTime()) / dayMs));

  return {
    daysUntilExam,
    daysUntilReset,
    isLastDay: startOfExam.getTime() === startOfToday.getTime(),
  };
}

export function formatSeasonCountdown(season: ExamSeason, now: Date = new Date()): string {
  const { daysUntilExam, daysUntilReset, isLastDay } = computeSeasonCountdown(season, now);
  if (isLastDay) return 'Resets tonight';
  if (daysUntilReset === 0) return 'Resets at midnight';
  if (daysUntilExam === 0) return 'Exam day';
  if (daysUntilExam === 1) return '1 day to exam';
  if (daysUntilReset === 1) return '1 day to reset';
  return `${daysUntilExam} days to exam`;
}

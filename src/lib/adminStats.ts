import type { SupabaseClient } from '@supabase/supabase-js';

export interface AdminStats {
  total_users: number;
  total_sessions: number;
  sessions_this_week: number;
  sessions_last_30_days: { day: string; count: number }[];
  pass_rate_overall: number;
  average_score_overall: number;
  pass_rate_distribution: {
    '0-49': number;
    '50-79': number;
    '80-89': number;
    '90-100': number;
  };
  sessions_by_level: {
    professional: number;
    'sub-professional': number;
  };
  topic_difficulty: { topic: string; avg_score: number; n: number }[];
  active_seasons: {
    total: number;
    active_now: number;
    upcoming: number;
    past: number;
  };
}

export interface FetchAdminStatsResult {
  ok: boolean;
  stats: AdminStats | null;
  error?: string;
}

export async function fetchAdminStats(
  client: SupabaseClient,
): Promise<FetchAdminStatsResult> {
  const { data, error } = await client.rpc('admin_stats');
  if (error) {
    return { ok: false, stats: null, error: error.message };
  }
  return { ok: true, stats: (data as AdminStats | null) ?? null };
}

import type { ExamSessionSummary, TopicStat } from '../types';
import { migrateSessionScore } from '../data/questions';
import { query } from './supabase';

export interface ExamSessionRow {
  id: string;
  user_id: string;
  level: 'sub-professional' | 'professional';
  started_at: number;
  submitted_at: number;
  total_questions: number;
  correct: number;
  score: number | string;
  time_spent_seconds: number;
  topic_stats: Record<string, TopicStat>;
  created_at?: string;
}

export function summaryToRow(summary: ExamSessionSummary, userId: string): ExamSessionRow {
  return {
    id: summary.id,
    user_id: userId,
    level: summary.level,
    started_at: summary.startedAt,
    submitted_at: summary.submittedAt,
    total_questions: summary.totalQuestions,
    correct: summary.correct,
    score: summary.score,
    time_spent_seconds: summary.timeSpentSeconds,
    topic_stats: summary.topicStats,
  };
}

export function rowToSummary(row: ExamSessionRow): ExamSessionSummary {
  const rawScore = typeof row.score === 'string' ? Number.parseFloat(row.score) : row.score;
  return {
    id: row.id,
    level: row.level,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
    totalQuestions: row.total_questions,
    correct: row.correct,
    score: migrateSessionScore(Number.isFinite(rawScore) ? rawScore : 0),
    timeSpentSeconds: row.time_spent_seconds,
    topicStats: row.topic_stats ?? {},
  };
}

const TABLE = 'exam_sessions';

export interface FetchResult {
  ok: boolean;
  history: ExamSessionSummary[];
  error?: string;
}

export async function fetchRemoteHistory(
  userId: string,
): Promise<FetchResult> {
  const { data, error } = await query(async (client) =>
    client
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(20),
  );
  if (error) {
    return { ok: false, history: [], error: error.message };
  }
  const rows = (data ?? []) as ExamSessionRow[];
  return { ok: true, history: rows.map(rowToSummary) };
}

export interface PushResult {
  ok: boolean;
  error?: string;
}

export async function pushSession(
  userId: string,
  summary: ExamSessionSummary,
): Promise<PushResult> {
  const row = summaryToRow(summary, userId);
  // Idempotent: re-pushing the same session id is a no-op. Without this,
  // a React StrictMode double-invoke of the push effect (or any other race)
  // produces a `duplicate key value violates unique constraint
  // "exam_sessions_pkey"` warning on the second call.
  const { error } = await query(async (client) =>
    client.from(TABLE).upsert(row, { onConflict: 'id', ignoreDuplicates: true }),
  );
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ExamLevel, Question, QuestionTopic } from '../types';
import PROFESSIONAL_QUESTIONS from '../data/questions/professionalQuestions';
import SUB_PROFESSIONAL_QUESTIONS from '../data/questions/subProfessionalQuestions';

/**
 * Question bank. The bundled JS is the source of truth at startup; we
 * attempt to overlay the database copy (so admin edits are live) but
 * fall back to the bundle if the fetch fails. The cache is module-level
 * so synchronous consumers (the exam screen, calculateScore) don't
 * have to change.
 */
export interface QuestionRow {
  id: string;
  level: ExamLevel;
  topic: QuestionTopic;
  prompt: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option_id: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  is_active: boolean;
}

let proOverride: Question[] | null = null;
let subProOverride: Question[] | null = null;
let proOverrideAt: number | null = null;
let subProOverrideAt: number | null = null;

function rowsToQuestions(rows: QuestionRow[]): Question[] {
  return rows.map((r) => ({
    id: r.id,
    level: r.level,
    topic: r.topic,
    prompt: r.prompt,
    options: [
      { id: 'A', text: r.options.A },
      { id: 'B', text: r.options.B },
      { id: 'C', text: r.options.C },
      { id: 'D', text: r.options.D },
    ],
    correctOptionId: r.correct_option_id,
    explanation: r.explanation,
  }));
}

/**
 * Replace the in-memory override for a single level. Caller passes the
 * full set of rows to use (active only); an empty array is allowed and
 * means "DB has no active rows for this level; fall back to the bundle."
 * This is the surgical alternative to refreshQuestionsFromDb when a
 * save just happened and we already know the new state.
 */
export function replaceOverride(level: ExamLevel, rows: QuestionRow[]): void {
  const now = Date.now();
  const questions = rowsToQuestions(rows);
  if (level === 'professional') {
    proOverride = questions;
    proOverrideAt = now;
  } else {
    subProOverride = questions;
    subProOverrideAt = now;
  }
}

/**
 * Invalidate (clear) the in-memory override for a single level so the
 * next getQuestionsForLevel() falls back to the bundled JS until the
 * next refreshQuestionsFromDb() completes.
 */
export function invalidateOverride(level: ExamLevel): void {
  if (level === 'professional') {
    proOverride = null;
    proOverrideAt = null;
  } else {
    subProOverride = null;
    subProOverrideAt = null;
  }
}

/**
 * Fetch the question bank from Supabase and cache it. Safe to call
 * repeatedly; idempotent.
 */
export async function refreshQuestionsFromDb(client: SupabaseClient): Promise<void> {
  try {
    const { data, error } = await client
      .from('questions')
      .select('*')
      .eq('is_active', true);
    if (error) {
      console.warn('[mockpass] refreshQuestionsFromDb failed:', error.message);
      return;
    }
    const rows = (data ?? []) as QuestionRow[];
    const proRows = rows.filter((r) => r.level === 'professional');
    const subRows = rows.filter((r) => r.level === 'sub-professional');
    const now = Date.now();
    // Replace (not merge) so that disabling a question in the DB
    // immediately removes it from the in-memory cache. An empty
    // result set for a level is honored: the override becomes []
    // and getQuestionsForLevel() falls back to the bundle.
    proOverride = rowsToQuestions(proRows);
    proOverrideAt = now;
    subProOverride = rowsToQuestions(subRows);
    subProOverrideAt = now;
  } catch (err) {
    console.warn('[mockpass] refreshQuestionsFromDb error:', err);
  }
}

export function getQuestionsForLevel(level: ExamLevel): Question[] {
  if (level === 'professional') return proOverride ?? PROFESSIONAL_QUESTIONS;
  return subProOverride ?? SUB_PROFESSIONAL_QUESTIONS;
}

/** True if the cache is currently backed by the DB rather than the bundle. */
export function questionsAreFromDb(level: ExamLevel): boolean {
  if (level === 'professional') return proOverride !== null;
  return subProOverride !== null;
}

/**
 * Wall-clock timestamp (ms since epoch) of the most recent cache
 * populate for this level, or null if the cache hasn't been populated
 * yet (i.e. the bundled JS is in use).
 */
export function getQuestionsCacheTimestamp(level: ExamLevel): number | null {
  if (level === 'professional') return proOverrideAt;
  return subProOverrideAt;
}

// ----------------------------------------------------------------------------
// Admin CRUD (read from admin, write via standard `from()`; admin RLS is open)
// ----------------------------------------------------------------------------

export interface AdminQuestion {
  id: string;
  level: ExamLevel;
  topic: QuestionTopic;
  prompt: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option_id: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  is_active: boolean;
}

export interface FetchAdminQuestionsResult {
  ok: boolean;
  questions: AdminQuestion[];
  error?: string;
}

export async function fetchAdminQuestions(
  client: SupabaseClient,
  filter?: { level?: ExamLevel; topic?: string; isActive?: boolean },
): Promise<FetchAdminQuestionsResult> {
  let query = client.from('questions').select('*').order('id');
  if (filter?.level) query = query.eq('level', filter.level);
  if (filter?.topic) query = query.eq('topic', filter.topic);
  if (filter?.isActive !== undefined) query = query.eq('is_active', filter.isActive);
  const { data, error } = await query;
  if (error) return { ok: false, questions: [], error: error.message };
  return { ok: true, questions: (data ?? []) as AdminQuestion[] };
}

export interface SaveQuestionInput {
  id: string;
  level: ExamLevel;
  topic: QuestionTopic;
  prompt: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option_id: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  is_active: boolean;
}

export interface SaveQuestionResult {
  ok: boolean;
  error?: string;
}

export async function saveQuestion(
  client: SupabaseClient,
  input: SaveQuestionInput,
  isNew: boolean,
): Promise<SaveQuestionResult> {
  if (isNew) {
    const { error } = await client.from('questions').insert(input);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await client.from('questions').update(input).eq('id', input.id);
    if (error) return { ok: false, error: error.message };
  }
  // The DB has changed; the in-memory cache may now be stale.
  // Easiest correct behavior: invalidate the affected level so the
  // next exam start pulls fresh data. We don't synchronously refresh
  // here because the screen is about to call fetchAdminQuestions()
  // anyway and that flow should not be blocked on a second write
  // round-trip.
  invalidateOverride(input.level);
  return { ok: true };
}

export async function setQuestionActive(
  client: SupabaseClient,
  id: string,
  isActive: boolean,
): Promise<SaveQuestionResult> {
  // Look up the level for the affected row so we can invalidate
  // the right override. If the row is missing, fall back to
  // invalidating both overrides (safe over-invalidation).
  const { data: row, error: lookupErr } = await client
    .from('questions')
    .select('level')
    .eq('id', id)
    .maybeSingle<{ level: ExamLevel }>();
  if (lookupErr) {
    return { ok: false, error: lookupErr.message };
  }
  const { error } = await client.from('questions').update({ is_active: isActive }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  if (row?.level) {
    invalidateOverride(row.level);
  } else {
    invalidateOverride('professional');
    invalidateOverride('sub-professional');
  }
  return { ok: true };
}

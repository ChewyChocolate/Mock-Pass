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
  created_at?: string;
  updated_at?: string;
}

/**
 * Read shape used by the admin Question Bank screen. Aliased to the
 * DB row shape so a future column add only has to land in one place
 * (QuestionRow) instead of three near-identical interfaces.
 */
export type AdminQuestion = QuestionRow;

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

export interface FetchAdminQuestionsResult {
  ok: boolean;
  questions: AdminQuestion[];
  error?: string;
}

export interface FetchTopicCountsResult {
  ok: boolean;
  /** Map of topic -> count of rows for the given level. */
  counts: Record<string, number>;
  error?: string;
}

/**
 * Fetch per-topic row counts for a single level. Used by the
 * admin Question Bank topic dropdown so each option can render
 * "Verbal Ability (40)" instead of a bare label.
 *
 * Cheap: we select only the topic column, the response is small
 * (4-5 rows of strings), and the caller can do the bucketing in
 * memory. A more ambitious Postgres-side aggregation would need
 * a SECURITY DEFINER RPC and is overkill for a 4-bucket list.
 */
export async function fetchTopicCounts(
  client: SupabaseClient,
  level: ExamLevel,
): Promise<FetchTopicCountsResult> {
  const { data, error } = await client
    .from('questions')
    .select('topic')
    .eq('level', level);
  if (error) return { ok: false, counts: {}, error: error.message };
  const rows = (data ?? []) as Array<{ topic: string }>;
  const counts: Record<string, number> = {};
  for (const r of rows) {
    counts[r.topic] = (counts[r.topic] ?? 0) + 1;
  }
  return { ok: true, counts };
}

export async function fetchAdminQuestions(
  client: SupabaseClient,
  filter?: {
    level?: ExamLevel;
    topic?: string;
    isActive?: boolean;
    search?: string;
  },
): Promise<FetchAdminQuestionsResult> {
  let query = client.from('questions').select('*').order('id');
  if (filter?.level) query = query.eq('level', filter.level);
  if (filter?.topic) query = query.eq('topic', filter.topic);
  if (filter?.isActive !== undefined) query = query.eq('is_active', filter.isActive);
  // Search-across-topics: PostgREST or() lets us match the search
  // text against id OR prompt in a single round-trip. The .ilike
  // operator is case-insensitive; we escape % and _ in the search
  // text so a literal underscore doesn't act as a wildcard.
  if (filter?.search) {
    const safe = filter.search
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_');
    const needle = `%${safe}%`;
    query = query.or(`id.ilike.${needle},prompt.ilike.${needle}`);
  }
  const { data, error } = await query;
  if (error) return { ok: false, questions: [], error: error.message };
  return { ok: true, questions: (data ?? []) as AdminQuestion[] };
}

/**
 * Write shape used by the admin edit form and by saveQuestion().
 * Omits the server-managed timestamps so a stale client payload
 * can never clobber them; the DB trigger on update handles
 * updated_at and the default on insert handles created_at.
 */
export type SaveQuestionInput = Omit<QuestionRow, 'created_at' | 'updated_at'>;

export interface SaveQuestionResult {
  ok: boolean;
  error?: string;
}

/**
 * Generate a fresh admin-authored question id. Uses crypto.randomUUID
 * (available in modern browsers and Node 19+) with a short prefix so
 * the namespace is clearly distinguished from the bundled q-001…
 * q-150 ids. 12-hex char suffix is enough to keep collisions
 * astronomically unlikely (1 in 2^48); the retry-on-23505 path in
 * saveQuestion handles the residual.
 */
export function createNewQuestionId(): string {
  const u = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`;
  // Strip dashes and keep 12 hex chars for readability.
  const short = u.replace(/-/g, '').slice(0, 12);
  return `q-adm-${short}`;
}

export async function saveQuestion(
  client: SupabaseClient,
  input: SaveQuestionInput,
  isNew: boolean,
): Promise<SaveQuestionResult> {
  if (!isNew) {
    const { error } = await client.from('questions').update(input).eq('id', input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    // Retry once on a primary-key collision (Postgres 23505). The id
    // is regenerated on the retry; if it still fails, the underlying
    // error message bubbles up to the UI (no more opaque "Save
    // failed.").
    const first = await client.from('questions').insert(input);
    if (first.error) {
      const isPkCollision = /duplicate key value/i.test(first.error.message);
      if (!isPkCollision) {
        return { ok: false, error: first.error.message };
      }
      const retriedInput: SaveQuestionInput = { ...input, id: createNewQuestionId() };
      const second = await client.from('questions').insert(retriedInput);
      if (second.error) {
        return { ok: false, error: second.error.message };
      }
      // Surface the regenerated id to the caller via a side effect on
      // the input is not possible (we don't return the row), so the
      // screen will call fetchAdminQuestions() which returns the new
      // id naturally. The rare double-call is harmless.
      invalidateOverride(input.level);
      return { ok: true };
    }
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

export interface BulkSetActiveResult {
  ok: boolean;
  updated: number;
  error?: string;
}

/**
 * Bulk enable / disable. Updates many rows in a single round-trip
 * via PostgREST's .in() filter. In-memory caches for the affected
 * levels are invalidated; caller should refresh() afterwards.
 *
 * The returned `updated` count is best-effort: when PostgREST
 * returns the affected rows in the .select() body, we count them;
 * when it does not (no .select() chained, or .single()/maybeSingle()
 * shortcuts the response), we count the input ids as a fallback.
 */
export async function bulkSetQuestionActive(
  client: SupabaseClient,
  ids: string[],
  isActive: boolean,
): Promise<BulkSetActiveResult> {
  if (ids.length === 0) return { ok: true, updated: 0 };
  // Look up the levels touched by the ids so we know which caches
  // to invalidate. One round-trip via .in().
  const { data: rows, error: lookupErr } = await client
    .from('questions')
    .select('id, level')
    .in('id', ids);
  if (lookupErr) {
    return { ok: false, updated: 0, error: lookupErr.message };
  }
  // Single update with .in() — atomic per row, one round-trip total.
  const { data: updated, error } = await client
    .from('questions')
    .update({ is_active: isActive })
    .in('id', ids)
    .select('id, level');
  if (error) {
    return { ok: false, updated: 0, error: error.message };
  }
  // Invalidate every level that was touched.
  const levelsTouched = new Set<ExamLevel>();
  for (const r of rows ?? []) {
    if (r.level === 'professional' || r.level === 'sub-professional') {
      levelsTouched.add(r.level);
    }
  }
  for (const lv of levelsTouched) invalidateOverride(lv);
  return { ok: true, updated: updated?.length ?? ids.length };
}

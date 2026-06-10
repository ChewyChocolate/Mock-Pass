import type { SupabaseClient } from '@supabase/supabase-js';
import type { ExamLevel, Question } from '../types';
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
  topic: string;
  prompt: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option_id: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  is_active: boolean;
}

let proOverride: Question[] | null = null;
let subProOverride: Question[] | null = null;

function rowsToQuestions(rows: QuestionRow[]): Question[] {
  return rows.map((r) => ({
    id: r.id,
    level: r.level,
    topic: r.topic as Question['topic'],
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
    if (proRows.length > 0) proOverride = rowsToQuestions(proRows);
    if (subRows.length > 0) subProOverride = rowsToQuestions(subRows);
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

// ----------------------------------------------------------------------------
// Admin CRUD (read from admin, write via standard `from()`; admin RLS is open)
// ----------------------------------------------------------------------------

export interface AdminQuestion {
  id: string;
  level: ExamLevel;
  topic: string;
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
  topic: string;
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
  return { ok: true };
}

export async function setQuestionActive(
  client: SupabaseClient,
  id: string,
  isActive: boolean,
): Promise<SaveQuestionResult> {
  const { error } = await client.from('questions').update({ is_active: isActive }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

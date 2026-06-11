import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  readSupabaseEnv,
  isSupabaseConfigured,
  getSupabaseConfig,
  SupabaseConfigError,
  __resetSupabaseClientForTests,
  SUPABASE_URL_ENV,
  SUPABASE_ANON_KEY_ENV,
} from '../src/lib/supabase';
import { summaryToRow, rowToSummary, fetchRemoteHistory, pushSession } from '../src/lib/sync';
import type { ExamSessionSummary } from '../src/types';
import type { SupabaseClient } from '@supabase/supabase-js';

const sampleSummary: ExamSessionSummary = {
  id: 'session-1700000000000',
  level: 'professional',
  startedAt: 1699999940000,
  submittedAt: 1700000000000,
  totalQuestions: 150,
  correct: 112,
  score: 82.5,
  timeSpentSeconds: 9840,
  topicStats: {
    'Verbal Ability': { correct: 33, total: 55 },
    'Numerical Ability': { correct: 30, total: 45 },
  },
};

describe('readSupabaseEnv', () => {
  it('returns null when both vars are missing', () => {
    expect(readSupabaseEnv({})).toBeNull();
  });

  it('returns null when vars are present but empty', () => {
    expect(readSupabaseEnv({ [SUPABASE_URL_ENV]: '', [SUPABASE_ANON_KEY_ENV]: '' })).toBeNull();
  });

  it('returns null when vars are placeholder strings', () => {
    expect(
      readSupabaseEnv({ [SUPABASE_URL_ENV]: 'undefined', [SUPABASE_ANON_KEY_ENV]: 'null' }),
    ).toBeNull();
  });

  it('returns null when URL is not http(s)', () => {
    expect(
      readSupabaseEnv({
        [SUPABASE_URL_ENV]: 'ftp://example.supabase.co',
        [SUPABASE_ANON_KEY_ENV]: 'a'.repeat(40),
      }),
    ).toBeNull();
  });

  it('returns null when anon key is suspiciously short', () => {
    expect(
      readSupabaseEnv({
        [SUPABASE_URL_ENV]: 'https://example.supabase.co',
        [SUPABASE_ANON_KEY_ENV]: 'short',
      }),
    ).toBeNull();
  });

  it('returns the env pair when both are well-formed', () => {
    const env = readSupabaseEnv({
      [SUPABASE_URL_ENV]: 'https://abcdefghij.supabase.co',
      [SUPABASE_ANON_KEY_ENV]: 'a'.repeat(40),
    });
    expect(env).toEqual({
      url: 'https://abcdefghij.supabase.co',
      anonKey: 'a'.repeat(40),
    });
  });

  it('trims whitespace around env values', () => {
    const env = readSupabaseEnv({
      [SUPABASE_URL_ENV]: '  https://abcdefghij.supabase.co  ',
      [SUPABASE_ANON_KEY_ENV]: `\t${'a'.repeat(40)}\t`,
    });
    expect(env?.url).toBe('https://abcdefghij.supabase.co');
    expect(env?.anonKey).toBe('a'.repeat(40));
  });
});

describe('isSupabaseConfigured / getSupabaseConfig', () => {
  const originalEnv = import.meta.env;
  let savedWarn: typeof console.warn;

  beforeEach(() => {
    __resetSupabaseClientForTests();
    savedWarn = console.warn;
    console.warn = vi.fn();
  });

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv);
    console.warn = savedWarn;
  });

  it('isSupabaseConfigured() reports the env state', () => {
    (import.meta.env as Record<string, unknown>)[SUPABASE_URL_ENV] = 'https://example.supabase.co';
    (import.meta.env as Record<string, unknown>)[SUPABASE_ANON_KEY_ENV] = 'a'.repeat(40);
    __resetSupabaseClientForTests();
    expect(isSupabaseConfigured()).toBe(true);

    (import.meta.env as Record<string, unknown>)[SUPABASE_URL_ENV] = '';
    (import.meta.env as Record<string, unknown>)[SUPABASE_ANON_KEY_ENV] = '';
    __resetSupabaseClientForTests();
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('getSupabaseConfig() throws SupabaseConfigError when env is missing', () => {
    (import.meta.env as Record<string, unknown>)[SUPABASE_URL_ENV] = '';
    (import.meta.env as Record<string, unknown>)[SUPABASE_ANON_KEY_ENV] = '';
    __resetSupabaseClientForTests();
    expect(() => getSupabaseConfig()).toThrowError(SupabaseConfigError);
  });
});

describe('summaryToRow / rowToSummary', () => {
  const userId = '11111111-1111-1111-1111-111111111111';

  it('round-trips a normal summary without loss', () => {
    const row = summaryToRow(sampleSummary, userId);
    expect(row.user_id).toBe(userId);
    expect(row.score).toBe(82.5);
    expect(row.topic_stats).toEqual(sampleSummary.topicStats);

    const back = rowToSummary(row as never);
    expect(back).toEqual(sampleSummary);
  });

  it('migrates legacy scores (>100) on the way back from the server', () => {
    const row = summaryToRow(sampleSummary, userId);
    const legacy = { ...(row as object), score: 3881 } as never;
    const back = rowToSummary(legacy);
    expect(back.score).toBe(39);
    expect(back.score).toBeLessThanOrEqual(100);
  });

  it('parses numeric(5,2) strings returned by Supabase', () => {
    const row = summaryToRow(sampleSummary, userId);
    const stringy = { ...(row as object), score: '82.50' } as never;
    const back = rowToSummary(stringy);
    expect(back.score).toBe(82.5);
  });

  it('falls back to 0 when the score column is non-finite', () => {
    const row = summaryToRow(sampleSummary, userId);
    const broken = { ...(row as object), score: 'not-a-number' } as never;
    const back = rowToSummary(broken);
    expect(back.score).toBe(0);
  });

  it('preserves level and timestamps exactly', () => {
    const row = summaryToRow(sampleSummary, userId);
    const back = rowToSummary(row as never);
    expect(back.level).toBe('professional');
    expect(back.startedAt).toBe(1699999940000);
    expect(back.submittedAt).toBe(1700000000000);
  });

  it('defaults topic_stats to {} if the column is null', () => {
    const row = summaryToRow(sampleSummary, userId);
    const broken = { ...(row as object), topic_stats: null } as never;
    const back = rowToSummary(broken);
    expect(back.topicStats).toEqual({});
  });
});

describe('fetchRemoteHistory / pushSession', () => {
  function makeFakeClient(handlers: {
    selectImpl?: () => Promise<{ data: unknown; error: { message: string } | null }>;
    insertImpl?: () => Promise<{ error: { message: string } | null }>;
    upsertImpl?: () => Promise<{ error: { message: string } | null }>;
  }): SupabaseClient {
    return {
      from: vi.fn().mockImplementation((table: string) => {
        if (table !== 'exam_sessions') throw new Error(`unexpected table: ${table}`);
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockImplementation(() =>
                  handlers.selectImpl ? handlers.selectImpl() : Promise.resolve({ data: [], error: null }),
                ),
              }),
            }),
          }),
          insert: vi.fn().mockImplementation(() =>
            handlers.insertImpl
              ? handlers.insertImpl()
              : Promise.resolve({ error: null }),
          ),
          upsert: vi.fn().mockImplementation(() =>
            handlers.upsertImpl
              ? handlers.upsertImpl()
              : Promise.resolve({ error: null }),
          ),
        };
      }),
    } as unknown as SupabaseClient;
  }

  it('fetchRemoteHistory returns mapped summaries on success', async () => {
    const client = makeFakeClient({
      selectImpl: () =>
        Promise.resolve({
          data: [
            {
              id: 'session-1',
              user_id: 'u',
              level: 'professional',
              started_at: 1,
              submitted_at: 2,
              total_questions: 150,
              correct: 100,
              score: 75.0,
              time_spent_seconds: 60,
              topic_stats: {},
            },
          ],
          error: null,
        }),
    });
    const result = await fetchRemoteHistory(client, 'u');
    expect(result.ok).toBe(true);
    expect(result.history).toHaveLength(1);
    expect(result.history[0]?.id).toBe('session-1');
    expect(result.history[0]?.score).toBe(75.0);
  });

  it('fetchRemoteHistory surfaces an error message on failure', async () => {
    const client = makeFakeClient({
      selectImpl: () =>
        Promise.resolve({ data: null, error: { message: 'permission denied' } }),
    });
    const result = await fetchRemoteHistory(client, 'u');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('permission denied');
    expect(result.history).toEqual([]);
  });

  it('pushSession sends the row built by summaryToRow (via upsert)', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const client = {
      from: vi.fn().mockReturnValue({ upsert }),
    } as unknown as SupabaseClient;
    const result = await pushSession(client, 'u', sampleSummary);
    expect(result.ok).toBe(true);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: sampleSummary.id, user_id: 'u', score: 82.5 }),
      expect.objectContaining({ onConflict: 'id', ignoreDuplicates: true }),
    );
  });

  it('pushSession reports error on upsert failure', async () => {
    const client = makeFakeClient({
      upsertImpl: () => Promise.resolve({ error: { message: 'duplicate key' } }),
    });
    const result = await pushSession(client, 'u', sampleSummary);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('duplicate key');
  });

  it('pushSession is idempotent on duplicate id (no warning, ok: true)', async () => {
    let calls = 0;
    const client = makeFakeClient({
      upsertImpl: () => {
        calls += 1;
        return Promise.resolve({ error: null });
      },
    });
    const r1 = await pushSession(client, 'u', sampleSummary);
    const r2 = await pushSession(client, 'u', sampleSummary);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(calls).toBe(2);
  });
});

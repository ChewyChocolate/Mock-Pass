import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// localStorage stub (jsdom is intentionally not enabled in this project).
const memory = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => {
    memory.set(k, v);
  },
  removeItem: (k: string) => {
    memory.delete(k);
  },
  clear: () => memory.clear(),
  key: (i: number) => Array.from(memory.keys())[i] ?? null,
  get length() {
    return memory.size;
  },
});

const rpcMock = vi.fn();
vi.mock('../src/lib/supabase', () => ({
  getSupabaseClient: () => ({ rpc: rpcMock }),
}));

const { fetchAdminStats } = await import('../src/lib/adminStats');

describe('fetchAdminStats', () => {
  beforeEach(() => {
    memory.clear();
    rpcMock.mockReset();
  });
  afterEach(() => {
    memory.clear();
  });

  it('returns the parsed JSON blob on success', async () => {
    const payload = {
      total_users: 12,
      total_sessions: 100,
      sessions_this_week: 7,
      sessions_last_30_days: [{ day: '2025-06-01', count: 5 }],
      pass_rate_overall: 65,
      average_score_overall: 71.4,
      pass_rate_distribution: { '0-49': 20, '50-79': 30, '80-89': 40, '90-100': 10 },
      sessions_by_level: { profesional: 100, 'sub-professional': 0 },
      topic_difficulty: [
        { topic: 'Verbal Ability', avg_score: 75, n: 80 },
        { topic: 'Analytical Reasoning', avg_score: 68, n: 50 },
      ],
      active_seasons: { total: 3, active_now: 1, upcoming: 1, past: 1 },
    };
    rpcMock.mockResolvedValueOnce({ data: payload, error: null });

    const result = await fetchAdminStats({ rpc: rpcMock } as never);
    expect(result.ok).toBe(true);
    expect(result.stats).toEqual(payload);
    expect(rpcMock).toHaveBeenCalledWith('admin_stats');
  });

  it('returns null stats when RPC returns null data (no rows)', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });
    const result = await fetchAdminStats({ rpc: rpcMock } as never);
    expect(result.ok).toBe(true);
    expect(result.stats).toBeNull();
  });

  it('returns an error when the RPC fails', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'forbidden' } });
    const result = await fetchAdminStats({ rpc: rpcMock } as never);
    expect(result.ok).toBe(false);
    expect(result.stats).toBeNull();
    expect(result.error).toBe('forbidden');
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

const { searchUsers, getUserSessions, deleteUser } = await import(
  '../src/lib/adminUsers'
);

describe('adminUsers lib', () => {
  beforeEach(() => {
    memory.clear();
    rpcMock.mockReset();
  });
  afterEach(() => {
    memory.clear();
  });

  describe('searchUsers', () => {
    it('returns parsed user list on success', async () => {
      const payload = [
        {
          user_id: 'u-1',
          user_email: 'admin@x.com',
          handle: 'admin_42',
          created_at: '2025-01-01T00:00:00Z',
          sessions_count: 7,
        },
      ];
      rpcMock.mockResolvedValueOnce({ data: payload, error: null });
      const result = await searchUsers({ rpc: rpcMock } as never, 'admin');
      expect(result.ok).toBe(true);
      expect(result.users).toEqual(payload);
      expect(rpcMock).toHaveBeenCalledWith('admin_search_users', { search: 'admin' });
    });

    it('returns empty list on error', async () => {
      rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'forbidden' } });
      const result = await searchUsers({ rpc: rpcMock } as never, 'x');
      expect(result.ok).toBe(false);
      expect(result.users).toEqual([]);
    });
  });

  describe('getUserSessions', () => {
    it('returns sessions for a target user', async () => {
      const payload = [
        {
          id: 's-1',
          level: 'professional',
          score: 85,
          correct: 128,
          total_questions: 150,
          submitted_at: 1234567890,
          time_spent_seconds: 600,
        },
      ];
      rpcMock.mockResolvedValueOnce({ data: payload, error: null });
      const result = await getUserSessions({ rpc: rpcMock } as never, 'u-1');
      expect(result.ok).toBe(true);
      expect(result.sessions).toEqual(payload);
      expect(rpcMock).toHaveBeenCalledWith('admin_get_user_sessions', {
        target_user_id: 'u-1',
      });
    });
  });

  describe('deleteUser', () => {
    it('calls the RPC and returns ok on success', async () => {
      rpcMock.mockResolvedValueOnce({ data: null, error: null });
      const result = await deleteUser({ rpc: rpcMock } as never, 'u-1');
      expect(result.ok).toBe(true);
      expect(rpcMock).toHaveBeenCalledWith('admin_delete_user', {
        target_user_id: 'u-1',
      });
    });

    it('returns the error on failure', async () => {
      rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'forbidden' } });
      const result = await deleteUser({ rpc: rpcMock } as never, 'u-1');
      expect(result.ok).toBe(false);
      expect(result.error).toBe('forbidden');
    });
  });
});

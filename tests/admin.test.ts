import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// jsdom is intentionally not enabled in this project (see vite.config.ts),
// so we stub localStorage with an in-memory implementation.
const memory = new Map<string, string>();
const localStorageStub = {
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
};
vi.stubGlobal('localStorage', localStorageStub);

// Mock the supabase client getter so the admin module can call .rpc
// against a stub we control per-test.
const rpcMock = vi.fn();
vi.mock('../src/lib/supabase', () => ({
  getSupabaseClient: () => ({ rpc: rpcMock }),
}));

// Import AFTER the mock is registered.
const { clearAdminCache, fetchIsAdmin } = await import('../src/lib/admin');

const TRUE = { data: true, error: null };
const FALSE = { data: false, error: null };

describe('fetchIsAdmin', () => {
  beforeEach(() => {
    memory.clear();
    rpcMock.mockReset();
  });
  afterEach(() => {
    memory.clear();
  });

  it('returns false for null / undefined / empty', async () => {
    expect(await fetchIsAdmin(null)).toBe(false);
    expect(await fetchIsAdmin(undefined)).toBe(false);
    expect(await fetchIsAdmin('')).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('calls is_email_in_admin_allowlist RPC and returns the result', async () => {
    rpcMock.mockResolvedValueOnce(TRUE);
    expect(await fetchIsAdmin('admin@example.com')).toBe(true);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('is_email_in_admin_allowlist', {
      email: 'admin@example.com',
    });
  });

  it('returns false when RPC returns false', async () => {
    rpcMock.mockResolvedValueOnce(FALSE);
    expect(await fetchIsAdmin('user@example.com')).toBe(false);
  });

  it('returns false (safe default) on RPC error', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'oh no' } });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await fetchIsAdmin('admin@example.com')).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('caches a true result for 60 seconds', async () => {
    rpcMock.mockResolvedValue(TRUE);
    expect(await fetchIsAdmin('admin@example.com')).toBe(true);
    expect(await fetchIsAdmin('admin@example.com')).toBe(true);
    expect(rpcMock).toHaveBeenCalledTimes(1);
  });

  it('caches a false result too (avoids hammering the RPC)', async () => {
    rpcMock.mockResolvedValue(FALSE);
    expect(await fetchIsAdmin('user@example.com')).toBe(false);
    expect(await fetchIsAdmin('user@example.com')).toBe(false);
    expect(rpcMock).toHaveBeenCalledTimes(1);
  });

  it('does not reuse the cache for a different email', async () => {
    rpcMock.mockImplementation((_fn: string, args: { email: string }) =>
      args.email === 'admin@example.com' ? TRUE : FALSE,
    );
    expect(await fetchIsAdmin('admin@example.com')).toBe(true);
    expect(await fetchIsAdmin('user@example.com')).toBe(false);
    expect(rpcMock).toHaveBeenCalledTimes(2);
  });

  it('clearAdminCache() forces a re-fetch', async () => {
    rpcMock.mockResolvedValue(TRUE);
    expect(await fetchIsAdmin('admin@example.com')).toBe(true);
    clearAdminCache();
    expect(await fetchIsAdmin('admin@example.com')).toBe(true);
    expect(rpcMock).toHaveBeenCalledTimes(2);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// localStorage stub (jsdom not enabled in this project).
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

const fromSpy = vi.fn();
vi.mock('../src/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: fromSpy }),
}));

const { createTicket, closeTicket, updateTicket, fetchMyTickets, fetchAllTickets } =
  await import('../src/lib/support');

function makeChainable(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.insert = vi.fn(() => chain);
  chain.update = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.single = vi.fn(async () => result);
  chain.then = (resolve: (v: unknown) => void) => resolve(result);
  return chain;
}

describe('support lib', () => {
  beforeEach(() => {
    memory.clear();
    fromSpy.mockReset();
  });
  afterEach(() => {
    memory.clear();
  });

  describe('createTicket', () => {
    it('rejects too-short subjects without making a network call', async () => {
      const result = await createTicket({ from: fromSpy } as never, 'a', 'long enough body');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('3-200');
      expect(fromSpy).not.toHaveBeenCalled();
    });

    it('rejects too-short messages without making a network call', async () => {
      const result = await createTicket(
        { from: fromSpy } as never,
        'valid subject',
        '',
      );
      expect(result.ok).toBe(false);
      expect(result.error).toContain('1-5000');
      expect(fromSpy).not.toHaveBeenCalled();
    });

    it('trims whitespace before validating', async () => {
      const result = await createTicket(
        { from: fromSpy } as never,
        '   ab   ', // 'ab' is too short
        'message body here',
      );
      expect(result.ok).toBe(false);
    });

    it('returns the new ticket id on success', async () => {
      const chain = makeChainable({ data: { id: 'new-id' }, error: null });
      fromSpy.mockReturnValue(chain);

      const result = await createTicket(
        { from: fromSpy } as never,
        'My subject',
        'My message body that is long enough.',
      );
      expect(result.ok).toBe(true);
      expect(result.id).toBe('new-id');
    });

    it('surfaces a Supabase error', async () => {
      const chain = makeChainable({ data: null, error: { message: 'forbidden' } });
      fromSpy.mockReturnValue(chain);

      const result = await createTicket(
        { from: fromSpy } as never,
        'Valid subject',
        'Long enough body text',
      );
      expect(result.ok).toBe(false);
      expect(result.error).toBe('forbidden');
    });
  });

  describe('closeTicket', () => {
    it('calls update with status: closed', async () => {
      const chain = makeChainable({ data: null, error: null });
      fromSpy.mockReturnValue(chain);
      const result = await closeTicket({ from: fromSpy } as never, 'ticket-1');
      expect(result.ok).toBe(true);
      expect(chain.update).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalled();
    });
  });

  describe('updateTicket', () => {
    it('patches both status and admin_note when provided', async () => {
      const chain = makeChainable({ data: null, error: null });
      const updateMock = chain.update as ReturnType<typeof vi.fn>;
      fromSpy.mockReturnValue(chain);
      const result = await updateTicket(
        { from: fromSpy } as never,
        't-1',
        { status: 'closed', admin_note: 'Fixed in v1.2' },
      );
      expect(result.ok).toBe(true);
      expect(updateMock).toHaveBeenCalledWith({ status: 'closed', admin_note: 'Fixed in v1.2' });
    });
  });

  describe('fetchMyTickets', () => {
    it('returns the ticket list on success', async () => {
      const tickets = [
        { id: 't-1', subject: 'a', message: 'b', status: 'open' },
      ];
      const chain = makeChainable({ data: tickets, error: null });
      fromSpy.mockReturnValue(chain);
      const result = await fetchMyTickets({ from: fromSpy } as never);
      expect(result.ok).toBe(true);
      expect(result.tickets).toHaveLength(1);
    });

    it('returns the error on failure', async () => {
      const chain = makeChainable({ data: null, error: { message: 'oh no' } });
      fromSpy.mockReturnValue(chain);
      const result = await fetchMyTickets({ from: fromSpy } as never);
      expect(result.ok).toBe(false);
    });
  });

  describe('fetchAllTickets', () => {
    it('returns tickets with user_id mapped to user_email (UUID, v1)', async () => {
      const tickets = [
        {
          id: 't-1',
          subject: 'a',
          message: 'b',
          status: 'open',
          user_id: '11111111-2222-3333-4444-555555555555',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          admin_note: null,
        },
      ];
      const chain = makeChainable({ data: tickets, error: null });
      fromSpy.mockReturnValue(chain);
      const result = await fetchAllTickets({ from: fromSpy } as never);
      expect(result.ok).toBe(true);
      expect(result.tickets[0]!.user_email).toBe('11111111-2222-3333-4444-555555555555');
    });
  });
});

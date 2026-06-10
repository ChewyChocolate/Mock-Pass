import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import {
  createTicket,
  fetchAllTickets,
  fetchMyTickets,
  updateTicket,
  type CreateTicketResult,
  type FetchAllTicketsRpcResult,
  type FetchMyTicketsResult,
  type UpdateTicketResult,
} from '../lib/support';
import type { SupportTicket, SupportTicketStatus, SupportTicketWithEmail } from '../types';

export type SupportStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseMyTicketsResult {
  status: SupportStatus;
  tickets: SupportTicket[];
  error: string | null;
  refresh: () => void;
}

export function useMyTickets(userId: string | null): UseMyTicketsResult {
  const [status, setStatus] = useState<SupportStatus>('idle');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      setTickets([]);
      setStatus('idle');
      return;
    }
    let active = true;
    setStatus('loading');
    setError(null);
    (async () => {
      try {
        const client = getSupabaseClient();
        const result: FetchMyTicketsResult = await fetchMyTickets(client);
        if (!active) return;
        if (!result.ok) {
          setError(result.error ?? 'Failed to load tickets.');
          setStatus('error');
          return;
        }
        setTickets(result.tickets);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load tickets.');
        setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, refreshTick]);

  return { status, tickets, error, refresh };
}

export interface UseAllTicketsResult {
  status: SupportStatus;
  tickets: SupportTicketWithEmail[];
  error: string | null;
  refresh: () => void;
}

export function useAllTickets(enabled: boolean): UseAllTicketsResult {
  const [status, setStatus] = useState<SupportStatus>('idle');
  const [tickets, setTickets] = useState<SupportTicketWithEmail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setTickets([]);
      setStatus('idle');
      return;
    }
    let active = true;
    setStatus('loading');
    setError(null);
    (async () => {
      try {
        const client = getSupabaseClient();
        const result: FetchAllTicketsRpcResult = await fetchAllTickets(client);
        if (!active) return;
        if (!result.ok) {
          setError(result.error ?? 'Failed to load tickets.');
          setStatus('error');
          return;
        }
        setTickets(result.tickets);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load tickets.');
        setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [enabled, refreshTick]);

  return { status, tickets, error, refresh };
}

export interface SubmitTicketInput {
  subject: string;
  message: string;
}

export function useSubmitTicket(): {
  submit: (input: SubmitTicketInput) => Promise<CreateTicketResult>;
  busy: boolean;
} {
  const [busy, setBusy] = useState(false);
  const submit = useCallback(
    async (input: SubmitTicketInput): Promise<CreateTicketResult> => {
      setBusy(true);
      try {
        const client = getSupabaseClient();
        return await createTicket(client, input.subject, input.message);
      } finally {
        setBusy(false);
      }
    },
    [],
  );
  return { submit, busy };
}

export function useUpdateTicket(): {
  update: (
    id: string,
    patch: { status?: SupportTicketStatus; admin_note?: string | null },
  ) => Promise<UpdateTicketResult>;
  busy: boolean;
} {
  const [busy, setBusy] = useState(false);
  const update = useCallback(
    async (
      id: string,
      patch: { status?: SupportTicketStatus; admin_note?: string | null },
    ): Promise<UpdateTicketResult> => {
      setBusy(true);
      try {
        const client = getSupabaseClient();
        return await updateTicket(client, id, patch);
      } finally {
        setBusy(false);
      }
    },
    [],
  );
  return { update, busy };
}

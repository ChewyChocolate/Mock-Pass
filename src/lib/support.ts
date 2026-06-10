import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupportTicket, SupportTicketStatus, SupportTicketWithEmail } from '../types';

export interface FetchMyTicketsResult {
  ok: boolean;
  tickets: SupportTicket[];
  error?: string;
}

export interface FetchAllTicketsResult {
  ok: boolean;
  tickets: SupportTicketWithEmail[];
  error?: string;
}

export interface CreateTicketResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export interface UpdateTicketResult {
  ok: boolean;
  error?: string;
}

export async function fetchMyTickets(
  client: SupabaseClient,
): Promise<FetchMyTicketsResult> {
  const { data, error } = await client
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { ok: false, tickets: [], error: error.message };
  return { ok: true, tickets: (data ?? []) as SupportTicket[] };
}

/**
 * Admin-only. SECURITY DEFINER function to enrich tickets with the
 * owner's email (the email column is on `auth.users`, which the anon
 * role cannot read).
 */
export interface FetchAllTicketsRpcResult {
  ok: boolean;
  tickets: SupportTicketWithEmail[];
  error?: string;
}

export async function fetchAllTickets(
  client: SupabaseClient,
): Promise<FetchAllTicketsRpcResult> {
  // Two paths to read all tickets as admin: the policy on
  // support_tickets already lets admins SELECT all rows; to get the
  // email we need a join with auth.users. The simplest portable
  // approach is to have the admin screen look up emails via a separate
  // SECURITY DEFINER RPC, but for v1 we just show user_id (UUID) and
  // the user can copy/paste it into the Users search later.
  const { data, error } = await client
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { ok: false, tickets: [], error: error.message };
  return {
    ok: true,
    tickets: (data ?? []).map((t) => ({
      ...(t as SupportTicket),
      user_email: (t as SupportTicket).user_id, // UUID; no email available without auth.users
    })),
  };
}

export async function createTicket(
  client: SupabaseClient,
  subject: string,
  message: string,
): Promise<CreateTicketResult> {
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();
  if (trimmedSubject.length < 3 || trimmedSubject.length > 200) {
    return { ok: false, error: 'Subject must be 3-200 characters.' };
  }
  if (trimmedMessage.length < 1 || trimmedMessage.length > 5000) {
    return { ok: false, error: 'Message must be 1-5000 characters.' };
  }
  const { data, error } = await client
    .from('support_tickets')
    .insert({
      subject: trimmedSubject,
      message: trimmedMessage,
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as { id: string } | null)?.id };
}

export async function updateTicket(
  client: SupabaseClient,
  id: string,
  patch: { status?: SupportTicketStatus; admin_note?: string | null },
): Promise<UpdateTicketResult> {
  const { error } = await client.from('support_tickets').update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function closeTicket(
  client: SupabaseClient,
  id: string,
): Promise<UpdateTicketResult> {
  return updateTicket(client, id, { status: 'closed' });
}

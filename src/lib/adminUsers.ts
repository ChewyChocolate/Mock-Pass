import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminUserSearchResult, AdminUserSession } from '../types';

export interface SearchUsersResult {
  ok: boolean;
  users: AdminUserSearchResult[];
  error?: string;
}

export interface GetUserSessionsResult {
  ok: boolean;
  sessions: AdminUserSession[];
  error?: string;
}

export interface DeleteUserResult {
  ok: boolean;
  error?: string;
}

export async function searchUsers(
  client: SupabaseClient,
  search: string,
): Promise<SearchUsersResult> {
  const { data, error } = await client.rpc('admin_search_users', { search });
  if (error) return { ok: false, users: [], error: error.message };
  return { ok: true, users: (data ?? []) as AdminUserSearchResult[] };
}

export async function getUserSessions(
  client: SupabaseClient,
  userId: string,
): Promise<GetUserSessionsResult> {
  const { data, error } = await client.rpc('admin_get_user_sessions', {
    target_user_id: userId,
  });
  if (error) return { ok: false, sessions: [], error: error.message };
  return { ok: true, sessions: (data ?? []) as AdminUserSession[] };
}

export async function deleteUser(
  client: SupabaseClient,
  userId: string,
): Promise<DeleteUserResult> {
  const { error } = await client.rpc('admin_delete_user', {
    target_user_id: userId,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

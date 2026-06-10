/**
 * Admin gating. The allowlist is duplicated in two places — this file
 * (for client-side checks) and the `is_admin_email` function in
 * supabase/leaderboard.sql (for RLS). Keep both in sync.
 */
import { useAuth } from '../context/AuthContext';

export const ALLOWED_ADMIN_EMAILS: ReadonlySet<string> = new Set([
  'deguzmanchristianearl1@gmail.com',
]);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.has(email.toLowerCase());
}

/**
 * Hook: returns true when the current user is in the admin allowlist.
 * Use in admin-only screens to gate renders.
 */
export function useAdmin(): boolean {
  const { user } = useAuth();
  return isAdminEmail(user?.email);
}

import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

export type { UserProfile };

/**
 * The shape of `user.user_metadata` fields we read for personalization.
 * Supabase's `user_metadata` is schemaless JSONB, so we cast through this
 * narrow interface instead of trusting the raw `unknown`.
 */
export interface ProfileMetadata {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  name?: string;
}

const MAX_DISPLAY_NAME_LENGTH = 30;

/**
 * Derive a friendly first-name greeting from a Supabase user. Returns
 * `null` if no usable name field is set; callers should fall back to a
 * generic greeting in that case.
 *
 * Precedence: `first_name` (new sign-up form) → `full_name` (legacy /
 * manual) → `name` (Google OAuth default).
 *
 * Returns the first whitespace-separated word, capped at 30 chars to
 * prevent layout blowup from malformed metadata.
 */
export function deriveDisplayName(user: User | null | undefined): string | null {
  const meta = user?.user_metadata as ProfileMetadata | undefined;
  const candidate = (meta?.first_name ?? meta?.full_name ?? meta?.name ?? '').trim();
  if (!candidate) return null;
  return candidate.split(/\s+/)[0]?.slice(0, MAX_DISPLAY_NAME_LENGTH) || null;
}

/**
 * Build the `options.data` payload for `supabase.auth.signUp` /
 * `supabase.auth.updateUser`. Trims whitespace, drops empty fields, and
 * returns a plain object suitable for spreading into `options.data`.
 *
 * Empty fields are omitted (not written as `""`) so that the JSONB
 * metadata never stores empty strings — Supabase's signUp accepts `""`
 * and the resulting user would later see the empty value in
 * `user_metadata`.
 */
export function normalizeProfile(profile: UserProfile | undefined): Record<string, string> {
  const data: Record<string, string> = {};
  if (!profile) return data;
  const first = profile.first_name?.trim();
  const last = profile.last_name?.trim();
  if (first) data.first_name = first;
  if (last) data.last_name = last;
  return data;
}

import type { User } from '@supabase/supabase-js';

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

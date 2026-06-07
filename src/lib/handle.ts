/**
 * Handle and subtitle helpers for the public leaderboard.
 *
 *  - Handles: 3-20 chars, lowercase alphanumerics + underscore. Unique across
 *    all profiles (enforced by a UNIQUE constraint in supabase/leaderboard.sql).
 *  - Subtitle: privacy-preserving projection of the user's real name
 *    (e.g. "Maria Dela Cruz" -> "MA...A D"). Mirrors the SQL in
 *    public.leaderboard_best / leaderboard_week / leaderboard_topic.
 *  - Reserved handles are blocked to avoid impersonation of staff.
 */

export const HANDLE_REGEX = /^[a-z0-9_]{3,20}$/;

export const MIN_HANDLE_LENGTH = 3;
export const MAX_HANDLE_LENGTH = 20;

export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  'admin',
  'administrator',
  'support',
  'system',
  'mockpass',
  'moderator',
  'mod',
  'root',
  'staff',
  'official',
  'null',
  'undefined',
  'anonymous',
  'test',
  'help',
]);

export interface HandleValidation {
  ok: boolean;
  error?: string;
}

export function validateHandle(raw: string): HandleValidation {
  if (typeof raw !== 'string') return { ok: false, error: 'Handle is required.' };
  const handle = raw.trim().toLowerCase();
  if (handle.length === 0) return { ok: false, error: 'Handle is required.' };
  if (handle.length < MIN_HANDLE_LENGTH) {
    return { ok: false, error: `Handle must be at least ${MIN_HANDLE_LENGTH} characters.` };
  }
  if (handle.length > MAX_HANDLE_LENGTH) {
    return { ok: false, error: `Handle must be at most ${MAX_HANDLE_LENGTH} characters.` };
  }
  if (!HANDLE_REGEX.test(handle)) {
    return { ok: false, error: 'Use lowercase letters, numbers, and underscores only.' };
  }
  if (RESERVED_HANDLES.has(handle)) {
    return { ok: false, error: 'That handle is reserved. Please choose another.' };
  }
  return { ok: true };
}

/**
 * Build a default handle from an email address. Pure function (no I/O, no RNG),
 * so callers should append a short suffix client-side if collisions are a concern.
 *
 *   "chewy.choc@gmail.com"  -> "chewy_choc"
 *   "a@b.com"               -> "a"
 *   ""                      -> "user"
 */
export function buildHandleBaseFromEmail(email: string | null | undefined): string {
  if (!email) return 'user';
  const at = email.indexOf('@');
  const local = at >= 0 ? email.slice(0, at) : email;
  const cleaned = local
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 16);
  return cleaned.length >= MIN_HANDLE_LENGTH ? cleaned : cleaned.padEnd(MIN_HANDLE_LENGTH, '0');
}

/**
 * Append a short numeric suffix. Pass a deterministic seed for testability
 * (e.g. `Date.now() % 1000`).
 */
export function withNumericSuffix(base: string, seed: number): string {
  const suffix = String(Math.abs(Math.floor(seed)) % 1000).padStart(2, '0');
  const combined = `${base}_${suffix}`;
  if (combined.length > MAX_HANDLE_LENGTH) {
    return combined.slice(0, MAX_HANDLE_LENGTH);
  }
  return combined;
}

/**
 * Privacy-preserving subtitle: first 2 chars + "..." + last char of first name,
 * followed by the first char of last name. All uppercase.
 *
 *   formatNameSubtitle("Maria",  "Dela Cruz") -> "MA...A D"
 *   formatNameSubtitle("Li",    "Smith")     -> "LI...I S"
 *   formatNameSubtitle("A",     "B")         -> "A...A B"
 *   formatNameSubtitle(null,    "Smith")     -> null
 *   formatNameSubtitle("Maria", "")          -> null
 *   formatNameSubtitle("Maria", null)        -> null
 */
export function formatNameSubtitle(
  first: string | null | undefined,
  last: string | null | undefined,
): string | null {
  if (!first || !last) return null;
  const f = first.trim();
  const l = last.trim();
  if (f.length < 1 || l.length < 1) return null;
  const start = f.slice(0, 2);
  const end = f.slice(-1);
  const lastInitial = l.slice(0, 1);
  return `${start}...${end} ${lastInitial}`.toUpperCase();
}

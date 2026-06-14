/**
 * Single registry of every localStorage key the app writes. Adding a new
 * persistent value? Add its key here so devtools, tests, and migrations
 * can find it without grep.
 */
export const STORAGE_KEYS = {
  /** Current exam-state blob (v2 schema). */
  exam: 'mockpass:exam:v2',
  /** Legacy v1 schema; one-shot migration target on first read. */
  examLegacy: 'mockpass:exam:v1',
  /** Supabase auth session storage (consumed by @supabase/supabase-js). */
  supabaseAuth: 'mockpass:supabase-auth',
  /** Last-viewed screen. Restored on hard refresh so the user lands
   *  where they left off. Cleared on sign-out. */
  screen: 'mockpass:screen',
  /** Active admin-console section. Restored on hard refresh so admins
   *  don't get bounced back to the default "Exam Seasons" tab. */
  adminSection: 'mockpass:admin-section',
  /** User-selected theme. */
  theme: 'mockpass:theme',
} as const;

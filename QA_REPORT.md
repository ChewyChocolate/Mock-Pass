# Mock Pass — QA Report

A prioritized audit of the codebase as of `0109c39`. Severity legend:
- **P0** — broken in production or will surface immediately
- **P1** — will break under realistic conditions
- **P2** — should fix
- **P3** — nits worth knowing

## P0 — broken / will surface immediately

### P0-1. `cross join public.current_season` makes the leaderboard silently empty when no season is active
- **File**: `supabase/leaderboard.sql:195, 225, 245`
- **What's wrong**: All three leaderboard views `cross join public.current_season s`. The view is `where is_active = true and now() between starts_at and ends_at limit 1`. When no row matches (no active season, or all disabled, or `now()` is outside every window), the view returns 0 rows and the cross join makes the leaderboard views return 0 rows even if the table has thousands of submissions.
- **Why it matters**: Between exam windows the entire app looks empty. Users report "my data disappeared."
- **Recommended fix**: Show an explicit "Leaderboard paused between seasons" empty state. The leaderboard views are correct; the UI just needs to distinguish "no submissions yet" from "no active season."

### P0-2. `auth.jwt() ->> 'email'` is not guaranteed to be populated in default Supabase JWTs
- **File**: `supabase/leaderboard.sql:145`
- **What's wrong**: The `is_admin_email()` function reads `lower(coalesce(auth.jwt() ->> 'email', ''))`. With GoTrue's default JWT, the `email` claim is not present — Supabase puts `sub`, `role`, `aud`, `exp`, `iat`. The email is only there if a custom access-token hook injects it.
- **Why it matters**: The admin can sign in, click "Admin Console", but every CRUD call fails with 403. Admin console is read-only / dead in production. **The single most likely real-world break.**
- **Recommended fix**: Use `auth.email()` (Supabase built-in that reads from `auth.users` via the JWT's `sub`). Requires `grant usage on schema auth to authenticated;` in Supabase.

### P0-3. `setHandle` TOCTOU race — concurrent claim can lose
- **File**: `src/context/AuthContext.tsx:308-335`, `supabase/leaderboard.sql:276-286`
- **What's wrong**: `setHandle` does (1) `is_handle_available` RPC, (2) UPDATE profile with the new handle. Between the RPC and the update, another user can claim the handle. The UNIQUE constraint saves us from corruption but the user sees a raw "duplicate key value violates unique constraint" error.
- **Why it matters**: A race-condition 500-ish error message is visible to users who try to claim a popular name.
- **Recommended fix**: Pass the current user_id to the RPC (`is_handle_available(handle text, exclude_user uuid default null)`) and have the SQL exclude that row. Also makes "claim your own handle" safe at the API level.

### P0-5. `migrateSessionScore` is not idempotent at the `100`/`200` boundary
- **File**: `src/data/questions.ts:113-117`
- **What's wrong**: The migration is `if (score > 100) return Math.round(score / 100)`. A score of `100.0001` (from rounding edge) re-divides to `1`; a real 101 (impossible per CHECK but possible via direct SQL) becomes `1`; `200` becomes `2`. The migration is also called on every read with no `migrated` flag.
- **Why it matters**: Edge cases at the upper bound can flip a passing score to a failing one or to 0/1/2.
- **Recommended fix**: Add a `migrated: true` flag on the session blob, or use a sentinel (e.g. negative) as the only "pre-fix" signal. *(Deferred from this fix batch — needs design decision.)*

### P0-6. `ensureProfileRow` entropy is predictable; can produce 21-char handles
- **File**: `src/context/AuthContext.tsx:128`
- **What's wrong**: `(Date.now() + attempt * 997) % 100000` is predictable. Two users signing up in the same millisecond get the same handle. The combined string can also exceed the 20-char regex limit (e.g. `aaaaaaaaaaaaaaaa_99999` = 21 chars), silently failing the unique-handle path.
- **Why it matters**: Predictable handles leak sign-up timing; some users hit "could not allocate a unique handle."
- **Recommended fix**: Use `crypto.getRandomValues` and truncate properly. *(Deferred from this fix batch — needs design decision.)*

## P1 — will break under realistic conditions

### P1-1. Sign-in `DISCARD_HISTORY` race destroys an in-flight locally-submitted session
- **File**: `src/context/ExamContext.tsx:318-361`
- **What's wrong**: The earlier race fix (the `historyLengthRef` guard) only protects against clobbering with empty remote, not against `DISCARD_HISTORY` destroying the in-flight local session. If a user submits offline on a fresh device, then comes online: the sign-in effect runs `DISCARD_HISTORY` synchronously, the local session is wiped, the fetch returns empty, the guard skips re-hydration, the push effect sees no `state.history[0]` and never pushes.
- **Why it matters**: A real user signs up on device A, completes an exam without an internet connection, then comes back online — the session is lost instead of being pushed.
- **Recommended fix**: Don't unconditionally `DISCARD_HISTORY` on first sign-in if there's a freshly-submitted local session. Capture the latest summary *before* discarding, then re-insert it after the remote fetch resolves, then let the push effect take over.

### P1-2. Admin allowlist duplicated in JS + SQL with no drift detection
- **File**: `src/lib/admin.ts:8-10`, `supabase/leaderboard.sql:145-147`
- **What's wrong**: `ALLOWED_ADMIN_EMAILS` is a hard-coded `Set` in JS, and the SQL function has its own list. Adding/removing an admin requires editing two files. If the two lists ever drift, the UI says "Admin Console" but RLS denies everything, or vice versa.
- **Recommended fix**: Move both allowlists to a `admin_allowlist` table and have both the client and the RLS function read from it.

### P1-3. Non-admin visiting `/admin` flashes a network error before the redirect
- **File**: `src/screens/AdminSeasonsScreen.tsx:78-121`
- **What's wrong**: The `useExamSeasons()` hook fires on mount before the `useEffect` redirect runs, so a non-admin triggers a Supabase query that gets denied by RLS, and they see the "Could not load seasons" error UI *briefly* before the redirect lands.
- **Recommended fix**: Skip the data fetch when `!isAdmin`. Rely solely on the empty state; remove the `onNavigate` redirect.

### P1-4. No index on `(submitted_at, level)` → leaderboard views do full table scans
- **File**: `supabase/schema.sql:19-20`
- **What's wrong**: The only index on `exam_sessions` is `exam_sessions_user_submitted_idx` on `(user_id, submitted_at desc)`. The leaderboard views filter on `submitted_at` *without* a user predicate (the join is `cross join current_season s`). Every leaderboard read does a sequential scan.
- **Recommended fix**: Add `create index exam_sessions_submitted_level_idx on public.exam_sessions (submitted_at, level);` in `schema.sql`.

### P1-5. `useExamSeasons` has no in-flight guard
- **File**: `src/hooks/useExamSeasons.ts:23-55`
- **What's wrong**: Rapid `refresh()` calls can race; the eventual `setSeasons(data ?? [])` is not ordered by completion time, so an older query can clobber a newer one.
- **Recommended fix**: Use a `useRef` request counter and abort the in-flight request before issuing a new one.

### P1-6. `setHandle` reads `userIdRef.current` from closure
- **File**: `src/context/AuthContext.tsx:308-335`
- **What's wrong**: If the user changes their handle in the same JS turn as signing in (rare but possible), the `setHandle` call uses a stale `userIdRef.current` from the previous sign-in.
- **Recommended fix**: Re-validate `userIdRef.current` after the RPC succeeds.

### P1-7. E2E test hard-codes a `mockpass.test` email but doesn't handle `Confirm email`
- **File**: `tests/e2e/sync.spec.ts:52-55`
- **What's wrong**: The test signs up and immediately tries to fill the exam. If the deployed Supabase has `Confirm email` on, `signUp` returns a user with no session and the dashboard never appears. The test does not document this assumption.
- **Recommended fix**: Document that the E2E suite requires `Confirm email` off, or use the Supabase admin API token in CI.

### P1-8. (Removed — was a non-bug after re-reading.)

## P2 — should fix

| # | Issue | File |
|---|---|---|
| P2-1 | `RESERVED_HANDLES` not exhaustively tested | `tests/handle.test.ts:71-77` |
| P2-2 | `formatSeasonCountdown` "Exam day" branch is dead code | `src/lib/leaderboard.ts:239-247` |
| P2-3 | `formatDate(season.exam_date)` off-by-one for non-PH users (UTC midnight parsed as local) | `LeaderboardWidget.tsx:90`, `LeaderboardScreen.tsx:84` |
| P2-4 | `current_season` has no fallback to "most recent past season" | `supabase/leaderboard.sql:125-131` |
| P2-5 | No "season has ended, board archived" state | `src/lib/leaderboard.ts:217-237` |
| P2-7 | `id = session-${Date.now()}` collides on same-ms devtools double-submit | `src/context/ExamContext.tsx:170` |
| P2-8 | `LIMITS.maxLocalHistory = 20` duplicated in `fetchRemoteHistory` and `ExamContext` | `src/lib/sync.ts:61-66` |
| P2-9 | `entries as never` cast in `LeaderboardScreen` hides type unsoundness | `src/screens/LeaderboardScreen.tsx:225` |
| P2-10 | "Per Topic" tab for sub-professional uses 'Verbal Ability' → permanently empty | `src/screens/LeaderboardScreen.tsx:33-35` |
| P2-11 | `now()` (DB) vs `Date.now()` (client) near season boundary | `supabase/leaderboard.sql:129` |
| P2-16 | `fetchRemoteHistory` hard-codes limit 20, doesn't use `LIMITS.maxLocalHistory` | `src/lib/sync.ts:61-66` |
| P2-17 | `migrateLegacy` is a silent no-op (reads v1 localStorage and deletes it) | `src/context/ExamContext.tsx:262-270` |
| P2-19 | Sign-out failure logs to console but no Sentry capture | `src/components/MainLayout.tsx:54-63` |
| P2-20 | `ErrorBoundary` shows raw `error.message` to the user (info disclosure) | `src/components/ErrorBoundary.tsx:51-55` |
| P2-21 | **Sentry replays will capture the email input on the login screen** (DOM mutation, not subject to `sendDefaultPii: false`) | `src/lib/sentry.ts:26-31` |
| P2-22 | Sentry source-map upload not configured in repo; README claims it works via Vercel integration | `vite.config.ts` |

## P3 — nits

| # | Issue | File |
|---|---|---|
| P3-3 | `pctColorClass` uses unrounded value but display rounds → borderline color flips | `LeaderboardWidget.tsx:179-181`, `LeaderboardScreen.tsx:318-320` |
| P3-4 | `RESERVED_HANDLES` test only covers 5 of 15 entries | `tests/handle.test.ts:71-77` |
| P3-5 | `attempts` column unused in JS | `supabase/leaderboard.sql:192, 222` |
| P3-6 | `v2.5.0 Sync-Build` literal in LoginScreen (undocumented version) | `LoginScreen.tsx:326` |
| P3-8 | README doesn't mention the `(submitted_at, level)` index that should be added | `README.md` |
| P3-9 | README says "v1 ships with a single section" but sidebar shows 5 (1 enabled + 4 "soon") | `README.md:155` |
| P3-10 | No test for the sign-in race fix (regression risk) | `tests/authContext.test.ts` |

## Test coverage gaps

- No test for the sign-in race fix
- No test for `useExamSeasons` (103 lines uncovered)
- No test for `AdminSeasonsScreen`, `LeaderboardScreen`, `ProfileScreen`
- No integration test against real Supabase (the only way to catch P0-2)
- No exhaustive `RESERVED_HANDLES` test
- No `migrateSessionScore` idempotency test
- No E2E for the admin flow

## Fix priority order

1. **P0-2** — switch `auth.jwt() ->> 'email'` to `auth.email()` so admin RLS works
2. **P0-1** — "Board paused" empty state when no active season
3. **P1-1** — fix the "other" sign-in race
4. **P0-3** — close the handle-claim TOCTOU
5. **P2-10** — hide "Per Topic" for sub-professional

Deferred to a future batch: P0-5 (idempotent score migration), P0-6 (predictable entropy), P1-2 (admin allowlist table), P1-3 (admin redirect race), P1-4 (DB index), P1-5/6/7 (other P1s), all P2/P3.

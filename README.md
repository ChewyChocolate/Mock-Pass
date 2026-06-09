<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Mock Pass — Civil Service Exam Reviewer

A React + Vite single-page app for practicing the Philippine Civil Service
Commission exam (Professional level). Includes a 150-item timed mock, weighted
section scoring, persistent local history, and a topic-by-topic breakdown.

## Features

- **Auth + cross-device sync** — sign in with email + password; completed exam
  sessions sync to Supabase so you can resume across devices.
- **Public leaderboard (Active Exam Season)** — the board resets the day after
  each major Civil Service exam, so reviewers compete against the current
  batch cramming for the same test date (not against users who already sat
  and passed a previous one). Three boards: **Active Season** (best score
  this season), **This Week** (best score in the last 7 days, within the
  active season), and **Per-Topic** (best per-topic accuracy, within the
  active season). Each user gets a unique public handle and a
  privacy-preserving name subtitle (e.g. `chewy_choc` over `MA...A D`).
- **150-item timed mock** with weighted section scoring (Verbal 30%, Analytical
  35%, Numerical 30%, General Info 5%).
- **Topic-by-topic breakdown** of strengths and weaknesses.
- **Devtools** in the browser console: `window.mockpass.*` for filling answers,
  peeking at local + remote history, and inspecting the question bank.

## Run Locally

**Prerequisites:** Node.js (LTS)

1. Install dependencies:
   `npm install`
2. (Optional) Create `.env.local` with Supabase env vars — see
   "Backend setup" below. Without them, the app still runs in offline-only
   mode and login is disabled.
3. Run the app:
   `npm run dev`

The dev server runs on port 3000 by default (`http://localhost:3000`).

## Backend setup

Mock Pass uses [Supabase](https://supabase.com) (free tier is enough) as a
managed Postgres + Auth backend. The browser talks to Supabase directly;
no server runtime is required.

1. **Create a Supabase project** at <https://supabase.com>.
2. **Run the schema**: open the Supabase SQL editor, paste the contents of
   `supabase/schema.sql`, and execute. This creates the `exam_sessions`
   table and the row-level-security policies.
3. **Enable email auth**: in Supabase, go to *Authentication → Providers* and
   make sure **Email** is enabled. (Disable "Confirm email" if you want
   sign-ups to work without an email-verification step during development.)
4. **Copy your project URL and anon key**: in *Project Settings → API*.
5. **Create `.env.local`** in the repo root (it is gitignored) with:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-PUBLIC-ANON-KEY
   ```
6. **Restart `npm run dev`** so the new env vars are picked up.

That's it — sign up, take an exam, sign in on another device, and your
history will be there.

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel (it auto-detects the Vite framework).
3. In *Project Settings → Environment Variables*, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. The `vercel.json` in this repo points at the `dist/` output
   directory.

## Error tracking (Sentry, optional)

Mock Pass ships with a Sentry integration that no-ops unless
`VITE_SENTRY_DSN` is set. To enable production error monitoring:

1. Create a Sentry project at <https://sentry.io> (free tier is fine).
2. Copy the project DSN from *Project Settings → Client Keys (DSN)*.
3. Set `VITE_SENTRY_DSN` in Vercel *Environment Variables* (or in
   `.env.local` for development).
4. Redeploy. The app will start reporting errors and capturing session
   replays for any unhandled exception caught by `ErrorBoundary`.

**Recommended**: install the
[Vercel Sentry integration](https://vercel.com/integrations/sentry) — it
sets `VITE_SENTRY_DSN` automatically on every deploy and uploads source
maps. No manual env-var management required.

## Scripts

- `npm run dev` — start the Vite dev server.
- `npm run build` — produce a production build in `dist/`.
- `npm run preview` — preview the production build locally.
- `npm test` / `npm run test:watch` — run the Vitest suite (932 tests; excludes `tests/e2e/**`).
- `npm run test:e2e` — run the Playwright end-to-end suite (`tests/e2e/sync.spec.ts`).
  Requires `npx playwright install chromium` (one-time) and a reachable
  Supabase project (the test signs up a real user at `e2e-<timestamp>@mockpass.test`).
- `npm run test:e2e:ui` — open the Playwright UI mode for debugging.
- `npm run lint` — type-check the project with `tsc --noEmit`.
- `npm run clean` — delete the `dist/` folder and the legacy `server.js`.

## Project Layout

- `supabase/schema.sql` — `exam_sessions` table + RLS policies.
- `supabase/leaderboard.sql` — `profiles` table + `exam_seasons` table +
  `current_season` view + `leaderboard_season` / `leaderboard_season_week` /
  `leaderboard_season_topic` views + `is_handle_available` RPC +
  `is_admin_email` function + RLS policies. Run this **after** `schema.sql`
  in the Supabase SQL editor. Add a new `exam_seasons` row for each upcoming
  CSE; the active board auto-switches. Update the email in the
  `is_admin_email` function to match your admin allowlist.
- `src/lib/supabase.ts` — browser client + env validation.
- `src/lib/sync.ts` — `fetchRemoteHistory`, `pushSession`, row↔summary mappers.
- `src/context/AuthContext.tsx` — Supabase Auth state, `useAuth()` hook.
- `src/context/ExamContext.tsx` — reducer, shuffle, persistence, and the
  auth-gated history sync.
- `src/data/questions.ts` — `calculateScore`, `migrateSessionScore`,
  `buildTopicStats`, and the weighted-section table.
- `src/screens/` — `LoginScreen`, `DashboardScreen`, `ExamScreen`,
  `ReviewScreen`, `PerformanceScreen`, `SupportScreen`, `ProfileScreen`,
  `ResetPasswordScreen`, `LeaderboardScreen`, `AdminSeasonsScreen`.
- `src/components/AdminLayout.tsx` + `src/components/AdminSidebar.tsx` —
  the admin shell. Sign in as an admin email and use the user menu's
  "Admin Console" item to access it.
- `src/lib/handle.ts` — `validateHandle`, `buildHandleBaseFromEmail`,
  `formatNameSubtitle`, reserved-handle set.
- `src/lib/leaderboard.ts` — Supabase query helpers + `toFiniteScore` +
  `findUserRank` + `formatSeasonCountdown`.
- `src/hooks/useLeaderboard.ts` — fetches entries for a given tab/level/topic.
- `src/lib/admin.ts` — admin email allowlist + `useAdmin()` hook.
- `src/hooks/useExamSeasons.ts` — admin CRUD over `exam_seasons`.
- `src/lib/seasonValidation.ts` — form validation + `defaultSeasonValues`.
- `tests/e2e/sync.spec.ts` — Playwright E2E test: signs up → runs a
  complete exam (via the dev-only `window.mockpass.autoFillCorrect`
  helper) → submits → waits for Supabase sync → signs out → signs
  back in → confirms the session re-hydrates from remote.

## Admin Console

The admin area lives behind a small email allowlist (set in two places
that must stay in sync — see the comment at the top of `src/lib/admin.ts`):

1. **`src/lib/admin.ts`** — `ALLOWED_ADMIN_EMAILS` (drives the client-side
   `useAdmin()` hook and the "Admin Console" item in the user menu).
2. **`supabase/leaderboard.sql`** — the `is_admin_email()` function
   (drives the RLS policies on `exam_seasons`).

When a user whose email is in the allowlist signs in, a new "Admin
Console" item appears in the user menu. v1 ships with a single section
("Exam Seasons") that lets you add / edit / disable / delete the rows
in the `exam_seasons` table. Each action is gated by RLS — non-admins
get a "You don't have access to this area" empty state if they try to
navigate to `/admin` directly.

## Data + privacy notes

- The 150-item question bank is bundled with the JS bundle (no questions
  ever leave the browser).
- **In-progress exams** stay in `localStorage` only — they are not synced
  mid-exam. Only completed sessions are pushed to the database.
- On first sign-in, **local history is discarded** and the remote history
  becomes the only source of truth. This is intentional; importing legacy
  data is on the v2 roadmap.
- **Sign-out** preserves the local cache (so an in-progress exam survives
  a re-login), but no further data is pushed until you sign back in.


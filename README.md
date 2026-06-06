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
4. Deploy. The `vercel.json` in this repo declares the env-var keys Vercel
   should prompt for, and points at the `dist/` output directory.

## Scripts

- `npm run dev` — start the Vite dev server.
- `npm run build` — produce a production build in `dist/`.
- `npm run preview` — preview the production build locally.
- `npm test` / `npm run test:watch` — run the Vitest suite.
- `npm run lint` — type-check the project with `tsc --noEmit`.
- `npm run clean` — delete the `dist/` folder and the legacy `server.js`.

## Project Layout

- `supabase/schema.sql` — `exam_sessions` table + RLS policies.
- `src/lib/supabase.ts` — browser client + env validation.
- `src/lib/sync.ts` — `fetchRemoteHistory`, `pushSession`, row↔summary mappers.
- `src/context/AuthContext.tsx` — Supabase Auth state, `useAuth()` hook.
- `src/context/ExamContext.tsx` — reducer, shuffle, persistence, and the
  auth-gated history sync.
- `src/data/questions.ts` — `calculateScore`, `migrateSessionScore`,
  `buildTopicStats`, and the weighted-section table.
- `src/screens/` — `LoginScreen`, `DashboardScreen`, `ExamScreen`,
  `ReviewScreen`, `PerformanceScreen`, `SupportScreen`.

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


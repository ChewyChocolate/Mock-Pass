-- Mock Pass — Supabase schema
-- Apply this once via the Supabase SQL editor (or `supabase db push`).
-- Idempotent: safe to re-run.

create table if not exists public.exam_sessions (
  id                text primary key,
  user_id           uuid not null references auth.users(id) on delete cascade,
  level             text not null check (level in ('sub-professional', 'professional')),
  started_at        bigint not null,
  submitted_at      bigint not null,
  total_questions   int  not null,
  correct           int  not null,
  score             numeric(5,2) not null check (score >= 0 and score <= 100),
  time_spent_seconds int  not null,
  topic_stats       jsonb not null,
  created_at        timestamptz not null default now()
);

create index if not exists exam_sessions_user_submitted_idx
  on public.exam_sessions (user_id, submitted_at desc);

-- Leaderboard views filter by (submitted_at, level) without a user_id
-- predicate (the join is `cross join current_season s`). Without this
-- index the views do a full table scan on every page load. 1k users
-- @ 10 sessions each is fine; 10k users starts to feel slow.
create index if not exists exam_sessions_submitted_level_idx
  on public.exam_sessions (submitted_at, level);

alter table public.exam_sessions enable row level security;

-- Drop existing policies if they exist so this script is idempotent.
drop policy if exists "users read own sessions"   on public.exam_sessions;
drop policy if exists "users insert own sessions" on public.exam_sessions;

create policy "users read own sessions"
  on public.exam_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users insert own sessions"
  on public.exam_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- No update / delete policy: rows are append-only from the client.
-- Account-level cleanup is the user's job (deferred to v2).

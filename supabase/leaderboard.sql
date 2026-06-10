-- Mock Pass — Leaderboard schema
-- Apply this after schema.sql in the Supabase SQL editor.
-- Idempotent: safe to re-run.
--
-- v2: Active Exam Season model. The main leaderboard resets the day after
-- each major Civil Service exam concludes, so reviewers compete against the
-- current batch cramming for the same test date (not against users who
-- already sat and passed a previous one).

-- 1. Profiles table
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  handle     text unique not null check (handle ~ '^[a-z0-9_]{3,20}$'),
  first_name text,
  last_name  text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "handles are public"       on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "users delete own profile" on public.profiles;

create policy "handles are public"
  on public.profiles for select
  using (true);

create policy "users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users delete own profile"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = user_id);

-- 2. CHECK constraint on exam_sessions (soft anti-cheat)
alter table public.exam_sessions
  drop constraint if exists exam_sessions_correct_le_total;
alter table public.exam_sessions
  add constraint exam_sessions_correct_le_total
  check (correct <= total_questions and total_questions > 0);

-- 3. Exam seasons table
-- Each row represents a CSE exam date and the window during which the
-- leaderboard counts attempts toward that season. starts_at is when
-- the season opens for review (typically ~60 days before exam_date).
-- ends_at is midnight of the day AFTER exam_date (when the board resets).
create table if not exists public.exam_seasons (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  exam_date   date not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  created_at  timestamptz not null default now(),
  constraint  exam_seasons_window_ordered check (ends_at > starts_at),
  constraint  exam_seasons_window_days    check (
    (extract(epoch from ends_at) - extract(epoch from starts_at)) between 86400 and 365 * 86400
  )
);

create unique index if not exists exam_seasons_exam_date_key
  on public.exam_seasons (exam_date);

-- Soft-disable column. A season with is_active=false is hidden from the
-- public current_season view (and therefore from the leaderboard), but kept
-- in the table for history. Admins can re-enable later.
alter table public.exam_seasons
  add column if not exists is_active boolean not null default true;

alter table public.exam_seasons enable row level security;

drop policy if exists "seasons are public" on public.exam_seasons;

create policy "seasons are public"
  on public.exam_seasons for select
  using (true);

-- Seed: one active season. The "next" CSC exam is assumed to be Aug 15, 2026;
-- the season window is 60 days before -> 1 day after. Update this row (or
-- insert more rows) as new exam dates are announced.
insert into public.exam_seasons (label, exam_date, starts_at, ends_at)
values (
  'August 2026 CSE',
  date '2026-08-15',
  timestamptz '2026-06-16 00:00:00+00',
  timestamptz '2026-08-16 00:00:00+00'
)
on conflict (exam_date) do nothing;

-- 4. View: the currently active season (the row whose [starts_at, ends_at]
-- window contains now() AND is_active=true). Used by both the UI header and
-- the leaderboard views to filter sessions.
create or replace view public.current_season as
select id, label, exam_date, starts_at, ends_at
from public.exam_seasons
where is_active = true
  and now() between starts_at and ends_at
order by starts_at desc
limit 1;

grant select on public.current_season to anon, authenticated;

-- 4b. Admin RPC: check if the signed-in user is in the admin allowlist.
-- Mirrors the constant in src/lib/admin.ts. Keep both in sync.
-- SECURITY DEFINER so the RLS policies can call it without exposing the list.
create or replace function public.is_admin_email()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'deguzmanchristianearl@gmail.com'
  );
$$;

grant execute on function public.is_admin_email() to authenticated;

-- 4c. RLS on exam_seasons: everyone can read active seasons (current_season
-- already filters by is_active), admins can read everything; only admins
-- can write.
drop policy if exists "seasons are public" on public.exam_seasons;

create policy "active seasons are public"
  on public.exam_seasons for select
  using (is_active = true or public.is_admin_email());

create policy "admins can insert seasons"
  on public.exam_seasons for insert
  to authenticated
  with check (public.is_admin_email());

create policy "admins can update seasons"
  on public.exam_seasons for update
  to authenticated
  using (public.is_admin_email())
  with check (public.is_admin_email());

create policy "admins can delete seasons"
  on public.exam_seasons for delete
  to authenticated
  using (public.is_admin_email());

-- 4d. Admin view: ALL seasons, newest first. RLS on the underlying table
-- still applies; only admins will get rows back.
create or replace view public.admin_seasons as
select id, label, exam_date, starts_at, ends_at, is_active
from public.exam_seasons
order by starts_at desc;

grant select on public.admin_seasons to authenticated;

-- 5. Helper: build the subtitle string. Inlined in each view to keep the
-- SQL portable and the views self-contained.
--    substr(first_name, 1, 2) || '...' || substr(first_name, -1) || ' ' || substr(last_name, 1, 1)
-- For users with no name metadata, the subtitle is NULL and the UI hides it.

-- 6. Drop the v1 "all-time" views (replaced by season-scoped ones).
drop view if exists public.leaderboard_best;
drop view if exists public.leaderboard_week;
drop view if exists public.leaderboard_topic;

-- 7. View: best score per user per level WITHIN the active season.
-- "Best" = highest single attempt submitted during the active season window.
create or replace view public.leaderboard_season as
select
  es.user_id,
  p.handle,
  case
    when p.first_name is not null and length(p.first_name) >= 1
     and p.last_name  is not null and length(p.last_name)  >= 1
    then upper(
      substr(p.first_name, 1, 2)
      || '...'
      || substr(p.first_name, length(p.first_name), 1)
      || ' '
      || substr(p.last_name,  1, 1)
    )
    else null
  end as subtitle,
  es.level,
  max(es.score)::numeric(5,2) as best_score,
  max(es.submitted_at)        as best_submitted_at,
  count(*)::int               as attempts
from public.exam_sessions es
join public.profiles      p  on p.user_id = es.user_id
cross join public.current_season s
where es.submitted_at >= (extract(epoch from s.starts_at) * 1000)::bigint
  and es.submitted_at <  (extract(epoch from s.ends_at)   * 1000)::bigint
group by es.user_id, p.handle, p.first_name, p.last_name, es.level;

grant select on public.leaderboard_season to anon, authenticated;

-- 8. View: best score in the active season AND in the last 7 days.
create or replace view public.leaderboard_season_week as
select
  es.user_id,
  p.handle,
  case
    when p.first_name is not null and length(p.first_name) >= 1
     and p.last_name  is not null and length(p.last_name)  >= 1
    then upper(
      substr(p.first_name, 1, 2)
      || '...'
      || substr(p.first_name, length(p.first_name), 1)
      || ' '
      || substr(p.last_name,  1, 1)
    )
    else null
  end as subtitle,
  es.level,
  max(es.score)::numeric(5,2) as best_score,
  max(es.submitted_at)        as best_submitted_at,
  count(*)::int               as attempts_this_week
from public.exam_sessions es
join public.profiles      p  on p.user_id = es.user_id
cross join public.current_season s
where es.submitted_at >= (extract(epoch from (now() - interval '7 days')) * 1000)::bigint
  and es.submitted_at >= (extract(epoch from s.starts_at)            * 1000)::bigint
  and es.submitted_at <  (extract(epoch from s.ends_at)              * 1000)::bigint
group by es.user_id, p.handle, p.first_name, p.last_name, es.level;

grant select on public.leaderboard_season_week to anon, authenticated;

-- 9. View: best per-topic accuracy WITHIN the active season.
create or replace view public.leaderboard_season_topic as
with topic_data as (
  select
    es.user_id,
    es.level,
    es.submitted_at,
    topic.key as topic,
    ((topic.value->>'correct')::numeric / nullif((topic.value->>'total')::int, 0)) * 100
      as topic_pct
  from public.exam_sessions es
  cross join lateral jsonb_each(es.topic_stats) as topic(key, value)
  cross join public.current_season s
  where (topic.value->>'total')::int > 0
    and es.submitted_at >= (extract(epoch from s.starts_at) * 1000)::bigint
    and es.submitted_at <  (extract(epoch from s.ends_at)   * 1000)::bigint
)
select
  td.user_id,
  p.handle,
  case
    when p.first_name is not null and length(p.first_name) >= 1
     and p.last_name  is not null and length(p.last_name)  >= 1
    then upper(
      substr(p.first_name, 1, 2)
      || '...'
      || substr(p.first_name, length(p.first_name), 1)
      || ' '
      || substr(p.last_name,  1, 1)
    )
    else null
  end as subtitle,
  td.level,
  td.topic,
  max(td.topic_pct)::numeric(5,2) as best_topic_pct,
  max(td.submitted_at)             as best_submitted_at
from topic_data td
join public.profiles p on p.user_id = td.user_id
group by td.user_id, p.handle, p.first_name, p.last_name, td.level, td.topic;

grant select on public.leaderboard_season_topic to anon, authenticated;

-- 10. RPC: handle availability check
create or replace function public.is_handle_available(handle text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where profiles.handle = lower(is_handle_available.handle)
  );
$$;

grant execute on function public.is_handle_available(text) to authenticated;

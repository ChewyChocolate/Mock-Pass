-- Mock Pass — Leaderboard schema
-- Apply this after schema.sql in the Supabase SQL editor.
-- Idempotent: safe to re-run.

-- 1. Profiles table
-- Public projection of (handle + first_name + last_name) for use on the leaderboard.
-- We duplicate first_name/last_name here (they also live in auth.users.raw_user_meta_data)
-- because the auth schema is not readable by the anon/authenticated roles, but the
-- leaderboard needs to render a privacy-preserving subtitle for every user.
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

-- Public read so the leaderboard can show handles + subtitles.
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
-- Reject the easiest client-side fakes: a row claiming 200 correct out of 150 total,
-- or a row with total_questions = 0.
alter table public.exam_sessions
  drop constraint if exists exam_sessions_correct_le_total;
alter table public.exam_sessions
  add constraint exam_sessions_correct_le_total
  check (correct <= total_questions and total_questions > 0);

-- 3. View: best score per user per level (all-time)
create or replace view public.leaderboard_best as
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
join public.profiles p on p.user_id = es.user_id
group by es.user_id, p.handle, p.first_name, p.last_name, es.level;

grant select on public.leaderboard_best to anon, authenticated;

-- 4. View: best score in the last 7 days (rolling weekly board)
-- exam_sessions.submitted_at is stored as a bigint (ms since epoch).
create or replace view public.leaderboard_week as
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
join public.profiles p on p.user_id = es.user_id
where es.submitted_at >= (extract(epoch from (now() - interval '7 days')) * 1000)::bigint
group by es.user_id, p.handle, p.first_name, p.last_name, es.level;

grant select on public.leaderboard_week to anon, authenticated;

-- 5. View: best per-topic accuracy, exploded from topic_stats jsonb
-- Each row in topic_stats is { "Topic Name": { "correct": n, "total": n } }.
create or replace view public.leaderboard_topic as
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
  where (topic.value->>'total')::int > 0
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

grant select on public.leaderboard_topic to anon, authenticated;

-- 6. RPC: handle availability check
-- Used by the Profile screen's debounced availability check.
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

-- Mock Pass — Leaderboard schema
-- Apply this after schema.sql in the Supabase SQL editor.
-- Idempotent: safe to re-run.
--
-- v2: Active Exam Season model. The main leaderboard resets the day after
-- each major Civil Service exam concludes, so reviewers compete against the
-- current batch cramming for the same test date (not against users who
-- already sat and passed a previous one).

-- 0. Grants needed for is_admin_email() to call auth.email()
grant usage on schema auth to authenticated;

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

-- Idempotency: drop the v2 policies (and any old v1 "seasons are public"
-- policy that may exist from a previous run) before recreating.
drop policy if exists "seasons are public"        on public.exam_seasons;
drop policy if exists "active seasons are public" on public.exam_seasons;
drop policy if exists "admins can insert seasons" on public.exam_seasons;
drop policy if exists "admins can update seasons" on public.exam_seasons;
drop policy if exists "admins can delete seasons" on public.exam_seasons;

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

-- 4b. Admin allowlist (DB-backed, single source of truth).
-- Replaces the prior hardcoded email inside is_admin_email() so that
-- adding/removing admins is a single INSERT/DELETE, not a redeploy.
create table if not exists public.admin_allowlist (
  email       text primary key,
  added_at    timestamptz not null default now(),
  constraint  admin_allowlist_email_lower check (email = lower(email))
);

-- Seed the first admin. To add another admin later:
--   insert into public.admin_allowlist (email) values ('you@example.com');
-- To remove:
--   delete from public.admin_allowlist where email = 'you@example.com';
insert into public.admin_allowlist (email)
values ('deguzmanchristianearl1@gmail.com')
on conflict (email) do nothing;

-- RLS on the allowlist: only admins (those already in it) can read it.
-- This prevents enumeration. Non-admins can't even count rows.
alter table public.admin_allowlist enable row level security;

drop policy if exists "admins can read allowlist" on public.admin_allowlist;
create policy "admins can read allowlist"
  on public.admin_allowlist for select
  to authenticated
  using (public.is_admin_email());

-- No INSERT/UPDATE/DELETE policy: writes go through the SQL editor only.
-- Future: an admin-only "Manage Admins" section could write through an RPC.

-- RLS helper used by all exam_seasons policies. Reads from the table.
-- SECURITY DEFINER so it works regardless of the caller's RLS on admin_allowlist.
--
-- IMPORTANT: We use auth.email() (not auth.jwt() ->> 'email') because
-- GoTrue's default JWT does NOT include the email claim. auth.email()
-- reads from auth.users via the JWT's sub and is the Supabase-recommended
-- way to get the signed-in user's email in RLS policies.
-- Requires: grant usage on schema auth to authenticated; (above, near
-- the top of this file).
create or replace function public.is_admin_email()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_allowlist
    where email = lower(coalesce(auth.email(), ''))
  );
$$;

grant execute on function public.is_admin_email() to authenticated;

-- Client-side check. Returns true iff the given email is in the allowlist.
-- SECURITY DEFINER so anon can call it without RLS on admin_allowlist.
-- The client uses this to decide whether to show the "Admin Console" UI
-- affordance. RLS still gates every write — so a client pretending to be
-- admin would be denied at the database level regardless.
create or replace function public.is_email_in_admin_allowlist(email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_allowlist
    where admin_allowlist.email = lower(is_email_in_admin_allowlist.email)
  );
$$;

grant execute on function public.is_email_in_admin_allowlist(text) to anon, authenticated;

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
--
-- exclude_user_id is an optional uuid used to skip the caller's own row.
-- This closes the TOCTOU window where a user "changes" their handle to the
-- same value: the RPC would otherwise return false because the row exists
-- in the profiles table.
create or replace function public.is_handle_available(
  handle text,
  exclude_user_id uuid default null
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where profiles.handle = lower(is_handle_available.handle)
      and (exclude_user_id is null or profiles.user_id <> exclude_user_id)
  );
$$;

grant execute on function public.is_handle_available(text, uuid) to authenticated;

-- 11. RPC: admin stats dashboard.
-- Returns a single JSON blob with all numbers the admin Stats screen
-- needs. SECURITY DEFINER + is_admin_email() guard so non-admins get
-- a permission error instead of leaked data.
--
-- Shape:
--   {
--     total_users: int,
--     total_sessions: int,
--     sessions_this_week: int,
--     sessions_last_30_days: [{ day: 'YYYY-MM-DD', count: int }, ...],
--     pass_rate_overall: numeric,         -- % of all sessions with score >= 80
--     average_score_overall: numeric,
--     pass_rate_distribution: { '0-49': int, '50-79': int, '80-89': int, '90-100': int },
--     sessions_by_level: { professional: int, 'sub-professional': int },
--     topic_difficulty: [{ topic: text, avg_score: numeric, n: int }, ...]
--     active_seasons: { total: int, active_now: int, upcoming: int, past: int }
--   }
create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_caller_email text := lower(coalesce(auth.email(), ''));
  v_total_users int;
  v_total_sessions int;
  v_sessions_this_week int;
  v_pass_rate_overall numeric;
  v_average_score_overall numeric;
  v_dist_0_49 int;
  v_dist_50_79 int;
  v_dist_80_89 int;
  v_dist_90_100 int;
  v_professional int;
  v_sub_professional int;
  v_total_seasons int;
  v_active_seasons int;
  v_upcoming_seasons int;
  v_past_seasons int;
  v_session_recent jsonb;
  v_topic_difficulty jsonb;
begin
  if not exists (
    select 1 from public.admin_allowlist where email = v_caller_email
  ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select count(*) into v_total_users from public.profiles;

  select
    count(*),
    count(*) filter (where submitted_at >= (extract(epoch from (now() - interval '7 days')) * 1000)::bigint)
  into v_total_sessions, v_sessions_this_week
  from public.exam_sessions;

  select
    coalesce(round(100.0 * count(*) filter (where score >= 80) / nullif(count(*), 0), 1), 0),
    coalesce(round(avg(score)::numeric, 1), 0)
  into v_pass_rate_overall, v_average_score_overall
  from public.exam_sessions;

  select
    count(*) filter (where score < 50),
    count(*) filter (where score >= 50 and score < 80),
    count(*) filter (where score >= 80 and score < 90),
    count(*) filter (where score >= 90)
  into v_dist_0_49, v_dist_50_79, v_dist_80_89, v_dist_90_100
  from public.exam_sessions;

  select
    count(*) filter (where level = 'professional'),
    count(*) filter (where level = 'sub-professional')
  into v_professional, v_sub_professional
  from public.exam_sessions;

  select
    count(*),
    count(*) filter (where is_active = true and now() between starts_at and ends_at),
    count(*) filter (where starts_at > now()),
    count(*) filter (where ends_at < now())
  into v_total_seasons, v_active_seasons, v_upcoming_seasons, v_past_seasons
  from public.exam_seasons;

  -- Sessions per day for the last 30 days. Use generate_series for a
  -- complete series, then left join to fill in zero-count days. Order
  -- the inner subquery; jsonb_agg() doesn't take an ORDER BY.
  select coalesce(jsonb_agg(row_to_json(d)), '[]'::jsonb) into v_session_recent
  from (
    select to_char(d, 'YYYY-MM-DD') as day,
           coalesce(c.cnt, 0)::int as count
    from generate_series(
      (current_date - interval '29 days')::date,
      current_date,
      interval '1 day'
    ) d
    left join (
      select date_trunc('day', to_timestamp(submitted_at / 1000.0)) as day,
             count(*) as cnt
      from public.exam_sessions
      where submitted_at >= (extract(epoch from (current_date - interval '29 days')) * 1000)::bigint
      group by 1
    ) c on c.day = d
    order by d
  ) d;

  -- Per-topic difficulty: average score per topic across all sessions.
  -- topic_stats is jsonb, so we expand it with jsonb_each_text. Order
  -- the inner subquery; jsonb_agg() doesn't take an ORDER BY.
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_topic_difficulty
  from (
    select
      t.topic,
      round(avg((t.value->>'correct')::numeric / nullif((t.value->>'total')::int, 0) * 100)::numeric, 1) as avg_score,
      count(*)::int as n
    from public.exam_sessions es
    cross join lateral jsonb_each(es.topic_stats) as t(topic, value)
    where (t.value->>'total')::int > 0
    group by t.topic
    order by avg_score asc
  ) t;

  return jsonb_build_object(
    'total_users', v_total_users,
    'total_sessions', v_total_sessions,
    'sessions_this_week', v_sessions_this_week,
    'sessions_last_30_days', v_session_recent,
    'pass_rate_overall', v_pass_rate_overall,
    'average_score_overall', v_average_score_overall,
    'pass_rate_distribution', jsonb_build_object(
      '0-49', v_dist_0_49,
      '50-79', v_dist_50_79,
      '80-89', v_dist_80_89,
      '90-100', v_dist_90_100
    ),
    'sessions_by_level', jsonb_build_object(
      'professional', v_professional,
      'sub-professional', v_sub_professional
    ),
    'topic_difficulty', v_topic_difficulty,
    'active_seasons', jsonb_build_object(
      'total', v_total_seasons,
      'active_now', v_active_seasons,
      'upcoming', v_upcoming_seasons,
      'past', v_past_seasons
    )
  );
end;
$$;

grant execute on function public.admin_stats() to authenticated;

-- 12. Support tickets.
-- Users can create tickets and read their own. Admins can read all
-- tickets and update the status + add an admin_note.
create table if not exists public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     text not null check (length(subject) between 3 and 200),
  message     text not null check (length(message) between 1 and 5000),
  status      text not null default 'open'
              check (status in ('open', 'closed', 'archived')),
  admin_note  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists support_tickets_user_id_idx
  on public.support_tickets (user_id, created_at desc);

create index if not exists support_tickets_status_idx
  on public.support_tickets (status, created_at desc);

alter table public.support_tickets enable row level security;

drop policy if exists "users read own tickets"       on public.support_tickets;
drop policy if exists "users insert own tickets"     on public.support_tickets;
drop policy if exists "admins read all tickets"      on public.support_tickets;
drop policy if exists "admins update tickets"       on public.support_tickets;
drop policy if exists "admins delete tickets"       on public.support_tickets;

create policy "users read own tickets"
  on public.support_tickets for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users insert own tickets"
  on public.support_tickets for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "admins read all tickets"
  on public.support_tickets for select
  to authenticated
  using (public.is_admin_email());

create policy "admins update tickets"
  on public.support_tickets for update
  to authenticated
  using (public.is_admin_email())
  with check (public.is_admin_email());

create policy "admins delete tickets"
  on public.support_tickets for delete
  to authenticated
  using (public.is_admin_email());

-- Trigger: keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists support_tickets_touch_updated_at on public.support_tickets;
create trigger support_tickets_touch_updated_at
  before update on public.support_tickets
  for each row execute function public.touch_updated_at();

-- 13. Admin user search.
-- Returns up to 20 users whose email or handle matches the search
-- string. SECURITY DEFINER + is_admin_email() guard. Reads from
-- auth.users, which the anon role cannot SELECT directly.
--
-- Implementation note: the inner SELECT must use a CTE for the
-- session-counts aggregate, NOT a subquery in the FROM clause. The
-- subquery form (select user_id, count(*) as cnt from
-- public.exam_sessions group by user_id) was producing
--   column reference "email" is ambiguous
-- in production (Postgres 15), apparently because the RETURNS TABLE
-- output column "email" was being pulled into the subquery's scope
-- resolution along with the outer column references. The CTE form
-- isolates the scope. The explicit `as user_email` / `as handle`
-- aliases on the projection are belt-and-suspenders, AND the
-- RETURNS TABLE output column is named `user_email` (not `email`)
-- so the output schema cannot shadow a source column of the same
-- name.
create or replace function public.admin_search_users(search text)
returns table (
  user_id uuid,
  user_email text,
  handle text,
  created_at timestamptz,
  sessions_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.admin_allowlist where email = lower(coalesce(auth.email(), ''))
  ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  with session_counts as (
    select es.user_id, count(*)::bigint as cnt
    from public.exam_sessions es
    group by es.user_id
  )
  select
    au.id as user_id,
    au.email as user_email,
    p.handle as handle,
    au.created_at as created_at,
    coalesce(sc.cnt, 0) as sessions_count
  from auth.users au
  left join public.profiles p on p.user_id = au.id
  left join session_counts sc on sc.user_id = au.id
  where
    search is null
    or search = ''
    or au.email ilike '%' || search || '%'
    or (p.handle is not null and p.handle ilike '%' || search || '%')
  order by au.created_at desc
  limit 20;
end;
$$;

grant execute on function public.admin_search_users(text) to authenticated;

-- 14. Admin: get a user's exam sessions. SECURITY DEFINER bypasses RLS.
create or replace function public.admin_get_user_sessions(target_user_id uuid)
returns table (
  id text,
  level text,
  score numeric,
  correct int,
  total_questions int,
  submitted_at bigint,
  time_spent_seconds int
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.admin_allowlist where email = lower(coalesce(auth.email(), ''))
  ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  select
    es.id, es.level, es.score, es.correct, es.total_questions,
    es.submitted_at, es.time_spent_seconds
  from public.exam_sessions es
  where es.user_id = target_user_id
  order by es.submitted_at desc
  limit 50;
end;
$$;

grant execute on function public.admin_get_user_sessions(uuid) to authenticated;

-- 15. Admin: delete a user's app data. SECURITY DEFINER bypasses RLS
-- so the admin can delete without owning the rows. The auth.users row
-- itself is NOT deleted (that requires the Supabase service role,
-- which the client never sees). The result is "soft account removal":
-- the user can no longer sign in because their profile/sessions/tickets
-- are gone, and Supabase will reject sign-in for a deleted user
-- once we add the call to auth.admin_delete_user() in a server-side
-- context (deferred to v2).
create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.admin_allowlist where email = lower(coalesce(auth.email(), ''))
  ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if target_user_id is null then
    raise exception 'target_user_id is required';
  end if;

  delete from public.support_tickets where user_id = target_user_id;
  delete from public.exam_sessions where user_id = target_user_id;
  delete from public.profiles where user_id = target_user_id;
end;
$$;

grant execute on function public.admin_delete_user(uuid) to authenticated;

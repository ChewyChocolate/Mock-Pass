-- Mock Pass — Question Bank schema
-- Apply this after leaderboard.sql in the Supabase SQL editor.
-- Idempotent: safe to re-run.
--
-- This file moves the question bank from bundled JS into the database so
-- the admin console can edit questions in-browser. After running this
-- file, run `migrations/migrate-questions-to-db.ts` once (or paste the
-- generated INSERTs) to populate the table from the current JS bundle.
--
-- Idempotency: the topic CHECK is dropped above so re-runs pick up
-- any change to the canonical topic list. The `options` shape CHECK
-- is created on first CREATE TABLE; on a re-run the table already
-- exists, so the CHECK is not re-applied. If you change the options
-- shape, drop the constraint manually first:
--   alter table public.questions drop constraint if exists questions_options_shape;

-- Drop the existing topic CHECK constraint (if any) so the inline
-- CHECK on the topic column can be (re)created idempotently. The
-- constraint is anonymous (no name given inline) so Postgres
-- auto-names it `questions_topic_check`. Drop by that name; if the
-- constraint was never created (fresh DB), the IF EXISTS makes the
-- drop a no-op.
alter table if exists public.questions
  drop constraint if exists questions_topic_check;

create table if not exists public.questions (
  id                text primary key,
  level             text not null check (level in ('sub-professional', 'professional')),
  topic             text not null check (topic in (
                      'Verbal Ability',
                      'Analytical Reasoning',
                      'Numerical Ability',
                      'General Information',
                      'Clerical Ability'
                    )),
  prompt            text not null check (length(prompt) between 10 and 4000),
  options           jsonb not null,
  correct_option_id  text not null check (correct_option_id in ('A', 'B', 'C', 'D')),
  explanation       text not null check (length(explanation) between 1 and 4000),
  is_active         boolean not null default true,
  -- Editorial metadata. Both columns are optional; existing rows
  -- will get NULL on migration. difficulty is 1 (easiest) to 5
  -- (hardest) and tags is a free-form text[] for ad-hoc labels
  -- (e.g. 'trivia', 'math-heavy', 'needs-review'). The CHECK on
  -- difficulty matches the 5-star UI in the admin form.
  difficulty       smallint check (difficulty is null or (difficulty between 1 and 5)),
  tags             text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint        questions_options_shape
                    check (
                      jsonb_typeof(options) = 'object'
                      and options ? 'A' and options ? 'B'
                      and options ? 'C' and options ? 'D'
                      and jsonb_typeof(options->'A') = 'string'
                      and jsonb_typeof(options->'B') = 'string'
                      and jsonb_typeof(options->'C') = 'string'
                      and jsonb_typeof(options->'D') = 'string'
                      and length(options->>'A') between 1 and 1000
                      and length(options->>'B') between 1 and 1000
                      and length(options->>'C') between 1 and 1000
                      and length(options->>'D') between 1 and 1000
                    )
);

create index if not exists questions_level_topic_idx
  on public.questions (level, topic, id);

create index if not exists questions_active_idx
  on public.questions (is_active) where is_active = true;

alter table public.questions enable row level security;

-- Read: everyone (including anon for the exam) needs to read active
-- questions. Inactive questions are admin-only.
drop policy if exists "everyone reads active questions" on public.questions;
drop policy if exists "admins read all questions" on public.questions;
drop policy if exists "admins insert questions" on public.questions;
drop policy if exists "admins update questions" on public.questions;
drop policy if exists "admins delete questions" on public.questions;

create policy "everyone reads active questions"
  on public.questions for select
  to anon, authenticated
  using (is_active = true);

create policy "admins read all questions"
  on public.questions for select
  to authenticated
  using (public.is_admin_email());

-- Writes: admin-only.
create policy "admins insert questions"
  on public.questions for insert
  to authenticated
  with check (public.is_admin_email());

create policy "admins update questions"
  on public.questions for update
  to authenticated
  using (public.is_admin_email())
  with check (public.is_admin_email());

create policy "admins delete questions"
  on public.questions for delete
  to authenticated
  using (public.is_admin_email());

-- Reuse the touch_updated_at trigger from leaderboard.sql.
drop trigger if exists questions_touch_updated_at on public.questions;
create trigger questions_touch_updated_at
  before update on public.questions
  for each row execute function public.touch_updated_at();

-- Hard-delete guard. Admins can disable a question (is_active=false)
-- but cannot DELETE a row outright. This prevents an in-flight exam
-- in some other browser from suddenly losing a question mid-session,
-- and it keeps the audit trail clean (every question ever shipped is
-- still in the table, marked inactive). If a question is genuinely
-- broken, disable it; if a question must be removed, the admin can
-- override the guard from psql/Supabase Studio with:
--   alter table public.questions disable trigger questions_block_active_delete;
--   delete from public.questions where id = '...';
--   alter table public.questions enable trigger questions_block_active_delete;
create or replace function public.questions_block_active_delete()
returns trigger
language plpgsql
as $$
begin
  if old.is_active then
    raise exception
      'cannot delete active question %; disable it first (set is_active=false)', old.id
      using errcode = '23514';
  end if;
  return old;
end;
$$;

drop trigger if exists questions_block_active_delete on public.questions;
create trigger questions_block_active_delete
  before delete on public.questions
  for each row execute function public.questions_block_active_delete();

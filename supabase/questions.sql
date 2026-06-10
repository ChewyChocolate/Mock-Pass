-- Mock Pass — Question Bank schema
-- Apply this after leaderboard.sql in the Supabase SQL editor.
-- Idempotent: safe to re-run.
--
-- This file moves the question bank from bundled JS into the database so
-- the admin console can edit questions in-browser. After running this
-- file, run `migrations/migrate-questions-to-db.ts` once (or paste the
-- generated INSERTs) to populate the table from the current JS bundle.

create table if not exists public.questions (
  id                text primary key,
  level             text not null check (level in ('sub-professional', 'professional')),
  topic             text not null,
  prompt            text not null check (length(prompt) between 10 and 4000),
  options           jsonb not null,
  correct_option_id  text not null check (correct_option_id in ('A', 'B', 'C', 'D')),
  explanation       text not null check (length(explanation) between 1 and 4000),
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint        questions_options_shape
                    check (
                      jsonb_typeof(options) = 'object'
                      and options ? 'A' and options ? 'B'
                      and options ? 'C' and options ? 'D'
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

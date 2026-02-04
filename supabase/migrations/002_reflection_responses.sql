-- Run after schema.sql. Adds reflection responses and two-level completion.

-- User responses to reflection questions (one row per question per devotion per user).
-- 500 words ≈ 3500 chars; we use 4000 to be safe.
create table if not exists public.user_devotion_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  devotion_id integer not null references public.devotions(id) on delete cascade,
  question_key text not null check (question_key in ('q1', 'q2', 'q3', 'q4')),
  response_text text not null default '',
  updated_at timestamptz not null default now(),
  unique(user_id, devotion_id, question_key)
);

create index if not exists idx_user_devotion_responses_user_devotion
  on public.user_devotion_responses(user_id, devotion_id);

alter table public.user_devotion_responses enable row level security;

create policy "Users can view own responses" on public.user_devotion_responses
  for select using (auth.uid() = user_id);
create policy "Users can insert own responses" on public.user_devotion_responses
  for insert with check (auth.uid() = user_id);
create policy "Users can update own responses" on public.user_devotion_responses
  for update using (auth.uid() = user_id);

-- Optional: mark when user completed all reflection questions for a devotion.
alter table public.user_progress
  add column if not exists responses_completed_at timestamptz;

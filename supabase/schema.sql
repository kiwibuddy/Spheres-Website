-- Sphere Devotions Platform schema. Run in Supabase SQL editor.

-- profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- spheres (static reference data)
create table if not exists public.spheres (
  id serial primary key,
  slug text unique not null,
  name text not null,
  description text default '',
  color_primary text not null,
  icon_svg text,
  total_devotions integer not null default 52,
  order_index integer not null
);

-- devotions (static content)
create table if not exists public.devotions (
  id serial primary key,
  sphere_id integer not null references public.spheres(id) on delete cascade,
  code text not null,
  title text not null,
  scripture_reference text not null default '',
  youtube_url text not null default '',
  duration_seconds integer,
  transcript text,
  order_in_sphere integer not null,
  reflection_q1 text,
  reflection_q2 text,
  reflection_q3 text,
  reflection_q4 text,
  call_to_action text,
  unique(sphere_id, order_in_sphere)
);

-- user_progress
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  devotion_id integer not null references public.devotions(id) on delete cascade,
  completed boolean not null default false,
  watch_percentage integer not null default 0 check (watch_percentage >= 0 and watch_percentage <= 100),
  completed_at timestamptz,
  last_watched_at timestamptz not null default now(),
  unique(user_id, devotion_id)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.spheres enable row level security;
alter table public.devotions enable row level security;
alter table public.user_progress enable row level security;

-- profiles: users can view and update own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- spheres: public read
create policy "Anyone can read spheres" on public.spheres for select to public using (true);

-- devotions: public read
create policy "Anyone can read devotions" on public.devotions for select to public using (true);

-- user_progress: own row only
create policy "Users can view own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress for update using (auth.uid() = user_id);

-- optional: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

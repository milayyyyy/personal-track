-- LifeFlow initial schema for personal-track project

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  email text not null,
  created_at timestamptz not null default now(),
  constraint profiles_username_unique unique (username)
);

create table if not exists public.user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  app jsonb not null default '{}'::jsonb,
  tasks jsonb not null default '{}'::jsonb,
  reminders jsonb not null default '{}'::jsonb,
  food jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_data enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "user_data_select_own"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "user_data_insert_own"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "user_data_update_own"
  on public.user_data for update
  using (auth.uid() = user_id);

create index if not exists profiles_username_idx on public.profiles (lower(username));

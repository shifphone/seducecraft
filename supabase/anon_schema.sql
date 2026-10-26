-- Run this in Supabase SQL editor

-- Anonymous characters (no auth required)
create table if not exists public.anon_characters (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  photos text[],
  created_at timestamptz default now()
);

alter table public.anon_characters disable row level security;

-- Anonymous gallery
create table if not exists public.anon_gallery (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text,
  prompt text,
  character_name text,
  src text,
  created_at timestamptz default now()
);

alter table public.anon_gallery disable row level security;

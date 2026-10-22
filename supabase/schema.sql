-- Seducecraft backend schema
-- Run in Supabase SQL editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  credits int not null default 10,
  is_anonymous boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Characters
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  style text,
  photos text[], -- data urls or storage paths
  params jsonb,
  created_at timestamptz default now()
);

alter table public.characters enable row level security;

create policy "Users manage own characters" on public.characters
  for all using (auth.uid() = user_id);

-- Gallery
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  prompt text,
  character_name text,
  character_photo text,
  src text,
  created_at timestamptz default now()
);

alter table public.gallery enable row level security;

create policy "Users manage own gallery" on public.gallery
  for all using (auth.uid() = user_id);

-- Credit transactions
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  reason text,
  created_at timestamptz default now()
);

alter table public.credit_transactions enable row level security;

create policy "Users view own transactions" on public.credit_transactions
  for select using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, credits)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), 10);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

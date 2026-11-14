-- Secret Crushes (Zero-Knowledge / Mutual Reveal Only) & Date Safety Plans

create table if not exists public.secret_crushes (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_hash text not null,
  target_hash text not null,
  is_revealed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (sender_id, target_hash)
);

create table if not exists public.date_safety_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  buddy_name text not null check (char_length(buddy_name) between 1 and 80),
  buddy_contact text not null check (char_length(buddy_contact) between 5 and 30),
  venue text not null check (char_length(venue) between 2 and 200),
  meet_time timestamptz not null,
  emergency_notes text check (char_length(emergency_notes) <= 500),
  status text not null default 'active' check (status in ('active', 'completed', 'alert_triggered')),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.secret_crushes enable row level security;
alter table public.date_safety_plans enable row level security;

-- Users can only see their own crushes
create policy "Users can see own secret crushes"
  on public.secret_crushes for select
  to authenticated
  using (auth.uid() = sender_id);

create policy "Users can insert own secret crushes"
  on public.secret_crushes for insert
  to authenticated
  with check (auth.uid() = sender_id);

create policy "Users can delete own secret crushes"
  on public.secret_crushes for delete
  to authenticated
  using (auth.uid() = sender_id);

-- Users can only manage their own safety plans
create policy "Users manage own date safety plans"
  on public.date_safety_plans for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

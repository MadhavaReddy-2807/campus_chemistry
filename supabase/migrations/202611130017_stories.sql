-- 24h ephemeral campus stories
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null default 'thought' check (media_type in ('photo', 'thought', 'prompt')),
  media_url text,
  caption text check (char_length(caption) <= 300),
  background_style text not null default 'rose-gradient',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create table if not exists public.story_views (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  viewer_id uuid not null references auth.users(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (story_id, viewer_id)
);

-- RLS
alter table public.stories enable row level security;
alter table public.story_views enable row level security;

create policy "Active stories are viewable by authenticated users"
  on public.stories for select
  to authenticated
  using (expires_at > now());

create policy "Users can post stories"
  on public.stories for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can delete their own stories"
  on public.stories for delete
  to authenticated
  using (auth.uid() = author_id);

create policy "Users can view story views for their own stories"
  on public.story_views for select
  to authenticated
  using (
    auth.uid() = viewer_id or
    exists (select 1 from public.stories where id = story_views.story_id and author_id = auth.uid())
  );

create policy "Users can record story views"
  on public.story_views for insert
  to authenticated
  with check (auth.uid() = viewer_id);

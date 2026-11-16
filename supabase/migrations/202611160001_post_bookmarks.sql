create table if not exists public.post_bookmarks (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_bookmarks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'post_bookmarks' and policyname = 'Users can view their own bookmarks'
  ) then
    create policy "Users can view their own bookmarks"
      on public.post_bookmarks for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'post_bookmarks' and policyname = 'Users can manage their own bookmarks'
  ) then
    create policy "Users can manage their own bookmarks"
      on public.post_bookmarks for all
      using (auth.uid() = user_id);
  end if;
end $$;

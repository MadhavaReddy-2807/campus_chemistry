create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('moderator', 'admin')),
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references auth.users(id),
  report_id uuid references public.reports(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('dismiss','warn','remove_content','suspend','restore')),
  note text check (note is null or char_length(note) <= 2000),
  created_at timestamptz not null default now()
);

create or replace function public.is_moderator(candidate_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = candidate_id and role in ('moderator', 'admin'));
$$;

create or replace function public.block_user(target_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or target_user_id = auth.uid() then raise exception 'Invalid block request'; end if;
  insert into public.blocks (blocker_id, blocked_id) values (auth.uid(), target_user_id) on conflict do nothing;
  update public.matches set status = 'blocked', unmatched_at = now() where (user_a = least(auth.uid(), target_user_id) and user_b = greatest(auth.uid(), target_user_id)) or (user_a = least(target_user_id, auth.uid()) and user_b = greatest(target_user_id, auth.uid()));
end;
$$;

create or replace function public.unmatch_user(target_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or target_user_id = auth.uid() then raise exception 'Invalid unmatch request'; end if;
  update public.matches set status = 'unmatched', unmatched_at = now() where (user_a = least(auth.uid(), target_user_id) and user_b = greatest(auth.uid(), target_user_id));
end;
$$;

revoke all on function public.is_moderator(uuid) from public;
revoke all on function public.block_user(uuid) from public;
revoke all on function public.unmatch_user(uuid) from public;
grant execute on function public.block_user(uuid) to authenticated;
grant execute on function public.unmatch_user(uuid) to authenticated;

alter table public.user_roles enable row level security;
alter table public.moderation_actions enable row level security;
create policy "users can read their own role" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "moderators can read reports" on public.reports for select to authenticated using (reporter_id = auth.uid() or public.is_moderator());
create policy "moderators can update reports" on public.reports for update to authenticated using (public.is_moderator()) with check (public.is_moderator());
create policy "moderators can read moderation actions" on public.moderation_actions for select to authenticated using (public.is_moderator());
create policy "moderators can create moderation actions" on public.moderation_actions for insert to authenticated with check (moderator_id = auth.uid() and public.is_moderator());

drop policy if exists "members can read messages" on public.messages;
drop policy if exists "members can send messages" on public.messages;
create policy "unblocked conversation members can read messages" on public.messages for select to authenticated using (
  exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid())
  and not exists (select 1 from public.conversation_members other join public.blocks b on (b.blocker_id = auth.uid() and b.blocked_id = other.user_id) or (b.blocker_id = other.user_id and b.blocked_id = auth.uid()) where other.conversation_id = conversation_id and other.user_id <> auth.uid())
);
create policy "unblocked conversation members can send messages" on public.messages for insert to authenticated with check (
  sender_id = auth.uid()
  and exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid())
  and not exists (select 1 from public.conversation_members other join public.blocks b on (b.blocker_id = auth.uid() and b.blocked_id = other.user_id) or (b.blocker_id = other.user_id and b.blocked_id = auth.uid()) where other.conversation_id = conversation_id and other.user_id <> auth.uid())
);

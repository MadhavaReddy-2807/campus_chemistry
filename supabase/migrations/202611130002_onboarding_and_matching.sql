-- Resumable onboarding state and server-side dating operations.

create table public.onboarding_drafts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  institute_id uuid references public.institutes(id),
  current_step smallint not null default 1 check (current_step between 1 and 9),
  payload jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  sort_order smallint not null default 0 check (sort_order between 0 and 5),
  alt_text text check (alt_text is null or char_length(alt_text) <= 200),
  created_at timestamptz not null default now(),
  unique (user_id, sort_order)
);

create index profile_photos_user_order_idx on public.profile_photos (user_id, sort_order);

create or replace function public.set_onboarding_draft_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger onboarding_drafts_set_updated_at before update on public.onboarding_drafts for each row execute function public.set_onboarding_draft_updated_at();

create or replace function public.is_dating_eligible(candidate_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = candidate_id
      and p.verification_status = 'verified'
      and p.dating_enabled = true
      and p.dating_visibility = true
      and p.date_of_birth is not null
      and p.date_of_birth <= (current_date - interval '18 years')::date
  );
$$;

create or replace function public.mutual_preferences_match(first_id uuid, second_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles a
    join public.profiles b on b.id = second_id
    left join public.discovery_preferences ap on ap.user_id = a.id
    left join public.discovery_preferences bp on bp.user_id = b.id
    where a.id = first_id
      and (coalesce(cardinality(ap.preferred_genders), 0) = 0 or b.gender = any(ap.preferred_genders))
      and (coalesce(cardinality(bp.preferred_genders), 0) = 0 or a.gender = any(bp.preferred_genders))
      and (ap.min_age is null or extract(year from age(current_date, b.date_of_birth)) between ap.min_age and ap.max_age)
      and (bp.min_age is null or extract(year from age(current_date, a.date_of_birth)) between bp.min_age and bp.max_age)
      and (coalesce(ap.same_campus_only, false) = false or a.institute_id = b.institute_id)
      and (coalesce(bp.same_campus_only, false) = false or a.institute_id = b.institute_id)
      and (a.institute_id = b.institute_id or (coalesce(ap.allow_cross_campus, false) and coalesce(bp.allow_cross_campus, false)))
  );
$$;

create or replace function public.register_discovery_action(
  target_id uuid,
  action_name text,
  prompt_id uuid default null,
  action_comment text default null
)
returns table (action_id uuid, match_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  new_action_id uuid;
  reciprocal_exists boolean;
  new_match_id uuid;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;
  if target_id = actor_id then raise exception 'A user cannot act on their own profile'; end if;
  if action_name not in ('like', 'pass', 'save', 'prompt_comment') then raise exception 'Unsupported discovery action'; end if;
  if not public.is_dating_eligible(actor_id) or not public.is_dating_eligible(target_id) then raise exception 'Dating eligibility required'; end if;
  if not public.mutual_preferences_match(actor_id, target_id) then raise exception 'Discovery preferences do not permit this connection'; end if;
  if exists (select 1 from public.blocks b where (b.blocker_id = actor_id and b.blocked_id = target_id) or (b.blocker_id = target_id and b.blocked_id = actor_id)) then raise exception 'This connection is unavailable'; end if;

  insert into public.discovery_actions (actor_id, target_id, action, target_prompt_id, comment)
  values (actor_id, target_id, action_name, prompt_id, action_comment)
  on conflict (actor_id, target_id) do update set action = excluded.action, target_prompt_id = excluded.target_prompt_id, comment = excluded.comment, created_at = now()
  returning id into new_action_id;

  if action_name = 'like' or action_name = 'prompt_comment' then
    select exists (select 1 from public.discovery_actions da where da.actor_id = target_id and da.target_id = actor_id and da.action in ('like', 'prompt_comment')) into reciprocal_exists;
    if reciprocal_exists then
      insert into public.matches (user_a, user_b) values (least(actor_id, target_id), greatest(actor_id, target_id)) on conflict (user_a, user_b) do update set status = 'active', unmatched_at = null returning id into new_match_id;
      if new_match_id is null then select m.id into new_match_id from public.matches m where m.user_a = least(actor_id, target_id) and m.user_b = greatest(actor_id, target_id); end if;
      insert into public.conversations (kind, match_id) values ('match', new_match_id) on conflict (match_id) do nothing;
      insert into public.conversation_members (conversation_id, user_id)
        select c.id, member_id from public.conversations c cross join lateral (values (actor_id), (target_id)) members(member_id) where c.match_id = new_match_id on conflict do nothing;
    end if;
  end if;
  return query select new_action_id, new_match_id;
end;
$$;

revoke all on function public.register_discovery_action(uuid, text, uuid, text) from public;
grant execute on function public.register_discovery_action(uuid, text, uuid, text) to authenticated;

alter table public.onboarding_drafts enable row level security;
alter table public.profile_photos enable row level security;
create policy "users can manage own onboarding draft" on public.onboarding_drafts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users can read visible profile photos" on public.profile_photos for select to authenticated using (user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = user_id and p.social_visibility = 'public'));
create policy "users can manage own profile photos" on public.profile_photos for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

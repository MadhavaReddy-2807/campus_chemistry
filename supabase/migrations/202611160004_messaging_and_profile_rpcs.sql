-- Direct messaging & profile updates RPCs for IIT/NIT social platform

create or replace function public.get_or_create_direct_conversation(target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conv_id uuid;
  v_caller_id uuid := auth.uid();
begin
  if v_caller_id is null then
    raise exception 'Not authenticated';
  end if;
  if v_caller_id = target_user_id then
    raise exception 'Cannot create direct conversation with yourself';
  end if;

  -- Block check
  if exists (
    select 1 from public.blocks
    where (blocker_id = v_caller_id and blocked_id = target_user_id)
       or (blocker_id = target_user_id and blocked_id = v_caller_id)
  ) then
    raise exception 'Unable to message this user';
  end if;

  -- Find existing direct conversation
  select c.id into v_conv_id
  from public.conversations c
  join public.conversation_members cm1 on cm1.conversation_id = c.id and cm1.user_id = v_caller_id
  join public.conversation_members cm2 on cm2.conversation_id = c.id and cm2.user_id = target_user_id
  where c.kind = 'direct'
  limit 1;

  if v_conv_id is not null then
    return v_conv_id;
  end if;

  -- Create new direct conversation
  insert into public.conversations (kind)
  values ('direct')
  returning id into v_conv_id;

  insert into public.conversation_members (conversation_id, user_id, joined_at)
  values
    (v_conv_id, v_caller_id, now()),
    (v_conv_id, target_user_id, now());

  return v_conv_id;
end;
$$;

revoke all on function public.get_or_create_direct_conversation(uuid) from public;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

create or replace function public.update_student_profile(
  p_display_name text,
  p_username text,
  p_bio text,
  p_study_year smallint,
  p_avatar_url text default null
) returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set
    display_name = coalesce(nullif(trim(p_display_name), ''), display_name),
    username = coalesce(nullif(trim(p_username), ''), username),
    bio = trim(p_bio),
    study_year = coalesce(p_study_year, study_year),
    avatar_url = nullif(trim(p_avatar_url), ''),
    updated_at = now()
  where id = auth.uid()
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile not found';
  end if;

  return updated_profile;
end;
$$;

revoke all on function public.update_student_profile(text, text, text, smallint, text) from public;
grant execute on function public.update_student_profile(text, text, text, smallint, text) to authenticated;

-- Keep protected profile attributes out of client-controlled UPDATE statements.
-- Profile editing is exposed through two narrow, authenticated RPCs instead.

revoke update on public.profiles from authenticated;

create or replace function public.update_my_profile(
  p_display_name text,
  p_username text,
  p_bio text,
  p_degree text,
  p_department text,
  p_study_year smallint
) returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare updated_profile public.profiles;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  update public.profiles
  set display_name = p_display_name,
      username = p_username,
      bio = nullif(p_bio, ''),
      degree = nullif(p_degree, ''),
      department = nullif(p_department, ''),
      study_year = p_study_year
  where id = auth.uid()
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;
  return updated_profile;
end;
$$;

create or replace function public.update_my_privacy(
  p_social_visibility text,
  p_dating_visibility boolean,
  p_cross_campus_visibility boolean,
  p_message_permission text,
  p_activity_visibility boolean
) returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare updated_profile public.profiles;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  update public.profiles
  set social_visibility = p_social_visibility,
      dating_visibility = p_dating_visibility,
      cross_campus_visibility = p_cross_campus_visibility,
      message_permission = p_message_permission,
      activity_visibility = p_activity_visibility
  where id = auth.uid()
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;
  return updated_profile;
end;
$$;

revoke all on function public.update_my_profile(text, text, text, text, text, smallint) from public;
revoke all on function public.update_my_privacy(text, boolean, boolean, text, boolean) from public;
grant execute on function public.update_my_profile(text, text, text, text, text, smallint) to authenticated;
grant execute on function public.update_my_privacy(text, boolean, boolean, text, boolean) to authenticated;

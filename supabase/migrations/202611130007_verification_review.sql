-- Moderator-only approval/rejection. This is atomic so a request and profile
-- cannot diverge, and raw verification evidence is never exposed here.

create policy "moderators can read verification requests" on public.verification_requests
  for select to authenticated using (public.is_moderator());

create or replace function public.review_verification_request(
  p_request_id uuid,
  p_decision text,
  p_note text default null
) returns public.verification_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewed_request public.verification_requests;
begin
  if not public.is_moderator() then raise exception 'Moderator access required' using errcode = '42501'; end if;
  if p_decision not in ('approved', 'rejected') then raise exception 'Invalid verification decision'; end if;
  if p_note is not null and char_length(p_note) > 2000 then raise exception 'Review note is too long'; end if;

  update public.verification_requests
  set status = p_decision,
      reviewed_at = now(),
      reviewed_by = auth.uid()
  where id = p_request_id and status = 'pending'
  returning * into reviewed_request;

  if reviewed_request.id is null then raise exception 'Pending verification request not found'; end if;

  update public.profiles
  set verification_status = case when p_decision = 'approved' then 'verified' else 'rejected' end
  where id = reviewed_request.user_id;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'verification_' || p_decision, 'verification_request', p_request_id, jsonb_build_object('note', p_note));

  return reviewed_request;
end;
$$;

revoke all on function public.review_verification_request(uuid, text, text) from public;
grant execute on function public.is_moderator(uuid) to authenticated;
grant execute on function public.review_verification_request(uuid, text, text) to authenticated;

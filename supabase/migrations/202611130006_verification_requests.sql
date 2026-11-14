-- Verification requests are created only through a domain-validating function.
-- Raw institutional email addresses are never persisted.

drop policy if exists "users can manage own verification requests" on public.verification_requests;
create policy "users can read own verification requests" on public.verification_requests
  for select to authenticated using (user_id = auth.uid());

revoke all on public.verification_requests from authenticated;
grant select on public.verification_requests to authenticated;

create or replace function public.request_institute_email_verification(
  p_institute_id uuid,
  p_email text
) returns table (request_id uuid, request_status text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  requester uuid := auth.uid();
  normalized_email text := lower(trim(p_email));
  email_domain text := lower(split_part(normalized_email, '@', 2));
  new_request public.verification_requests;
begin
  if requester is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if normalized_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Enter a valid institute email address';
  end if;
  if not exists (select 1 from public.institutes where id = p_institute_id and is_active) then
    raise exception 'Institute is not available';
  end if;
  if not exists (select 1 from public.institute_domains where institute_id = p_institute_id and domain = email_domain and is_active) then
    raise exception 'That email domain is not approved for this institute';
  end if;
  if not exists (select 1 from public.onboarding_drafts where user_id = requester and institute_id = p_institute_id) then
    raise exception 'Choose this institute in onboarding first';
  end if;

  update public.verification_requests
  set status = 'expired'
  where user_id = requester and status = 'pending';

  insert into public.verification_requests (user_id, institute_id, email_domain, method, status, expires_at)
  values (requester, p_institute_id, email_domain, 'institute_email', 'pending', now() + interval '24 hours')
  returning * into new_request;

  return query select new_request.id, new_request.status, new_request.expires_at;
end;
$$;

revoke all on function public.request_institute_email_verification(uuid, text) from public;
grant execute on function public.request_institute_email_verification(uuid, text) to authenticated;

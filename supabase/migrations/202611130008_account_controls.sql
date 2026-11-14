create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'cancelled', 'completed')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, status)
);

alter table public.account_deletion_requests enable row level security;
create policy "users can read own deletion requests" on public.account_deletion_requests for select to authenticated using (user_id = auth.uid());
revoke all on public.account_deletion_requests from authenticated;
grant select on public.account_deletion_requests to authenticated;

create or replace function public.request_account_deletion()
returns public.account_deletion_requests
language plpgsql security definer set search_path = public
as $$
declare requested public.account_deletion_requests;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  insert into public.account_deletion_requests (user_id) values (auth.uid())
  on conflict (user_id, status) do update set requested_at = now()
  returning * into requested;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id) values (auth.uid(), 'account_deletion_requested', 'account', auth.uid());
  return requested;
end;
$$;

revoke all on function public.request_account_deletion() from public;
grant execute on function public.request_account_deletion() to authenticated;

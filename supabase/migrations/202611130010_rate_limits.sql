create table public.rate_limit_events (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (char_length(action) between 1 and 80),
  occurred_at timestamptz not null default now()
);

create index rate_limit_events_actor_action_time_idx on public.rate_limit_events (actor_id, action, occurred_at desc);
alter table public.rate_limit_events enable row level security;
revoke all on public.rate_limit_events from authenticated;

create or replace function public.consume_rate_limit(p_action text, p_max_count integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  recent_count integer;
begin
  if actor is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if p_action is null or char_length(p_action) not between 1 and 80 or p_max_count < 1 or p_window_seconds < 1 then raise exception 'Invalid rate limit configuration'; end if;
  perform pg_advisory_xact_lock(hashtextextended(actor::text || ':' || p_action, 0));
  delete from public.rate_limit_events where actor_id = actor and action = p_action and occurred_at < now() - make_interval(secs => p_window_seconds);
  select count(*)::integer into recent_count from public.rate_limit_events where actor_id = actor and action = p_action and occurred_at >= now() - make_interval(secs => p_window_seconds);
  if recent_count >= p_max_count then return false; end if;
  insert into public.rate_limit_events (actor_id, action) values (actor, p_action);
  return true;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated;

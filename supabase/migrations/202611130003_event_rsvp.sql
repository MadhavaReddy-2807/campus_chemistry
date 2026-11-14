create or replace function public.rsvp_event(requested_event_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  attendee uuid := auth.uid();
  event_capacity integer;
  going_count integer;
  result_status text;
begin
  if attendee is null then raise exception 'Authentication required'; end if;
  select e.capacity into event_capacity from public.events e where e.id = requested_event_id and e.status = 'published' for update;
  if not found then raise exception 'Event is not available'; end if;
  select count(*)::integer into going_count from public.event_attendees ea where ea.event_id = requested_event_id and ea.status = 'going';
  result_status := case when event_capacity is not null and going_count >= event_capacity then 'waitlisted' else 'going' end;
  insert into public.event_attendees (event_id, user_id, status) values (requested_event_id, attendee, result_status)
  on conflict (event_id, user_id) do update set status = excluded.status;
  return result_status;
end;
$$;

revoke all on function public.rsvp_event(uuid) from public;
grant execute on function public.rsvp_event(uuid) to authenticated;

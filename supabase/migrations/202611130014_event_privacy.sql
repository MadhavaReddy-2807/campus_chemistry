create or replace function public.can_view_event(candidate_event_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.events e
    join public.profiles viewer on viewer.id = auth.uid()
    where e.id = candidate_event_id
      and (e.status = 'published' or e.host_id = auth.uid())
      and (
        e.host_id = auth.uid()
        or (e.visibility = 'campus' and e.institute_id is not null and e.institute_id = viewer.institute_id)
        or (e.visibility = 'inter_campus' and viewer.verification_status = 'verified')
        or (e.visibility = 'invite_only' and exists (select 1 from public.event_attendees ea where ea.event_id = e.id and ea.user_id = auth.uid()))
      )
  );
$$;

revoke all on function public.can_view_event(uuid) from public;
grant execute on function public.can_view_event(uuid) to authenticated;

drop policy if exists "users can read published events" on public.events;
create policy "users can read authorized events" on public.events for select to authenticated using (public.can_view_event(id));

revoke insert, update, delete on public.event_attendees from authenticated;
grant select on public.event_attendees to authenticated;

create or replace function public.withdraw_event_rsvp(requested_event_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.event_attendees set status = 'withdrawn' where event_id = requested_event_id and user_id = auth.uid() and status in ('going', 'waitlisted');
end;
$$;

revoke all on function public.withdraw_event_rsvp(uuid) from public;
grant execute on function public.withdraw_event_rsvp(uuid) to authenticated;

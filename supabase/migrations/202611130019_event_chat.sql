-- Event chat for confirmed attendees of campus meetups
create table if not exists public.event_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.event_messages enable row level security;

-- Confirmed attendees can view event messages
create policy "Confirmed attendees can read event messages"
  on public.event_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.event_attendees
      where event_id = event_messages.event_id
        and user_id = auth.uid()
        and status = 'going'
    ) or
    exists (
      select 1 from public.events
      where id = event_messages.event_id
        and host_id = auth.uid()
    )
  );

-- Confirmed attendees can post event messages
create policy "Confirmed attendees can send event messages"
  on public.event_messages for insert
  to authenticated
  with check (
    auth.uid() = author_id and
    (
      exists (
        select 1 from public.event_attendees
        where event_id = event_messages.event_id
          and user_id = auth.uid()
          and status = 'going'
      ) or
      exists (
        select 1 from public.events
        where id = event_messages.event_id
          and host_id = auth.uid()
      )
    )
  );

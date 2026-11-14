-- Generate minimal, privacy-safe notifications from server-side state changes.
-- Message bodies are intentionally never copied into notifications.

create or replace function public.notify_match_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, actor_id, href)
  values
    (new.user_a, 'match', 'New mutual match', 'You both chose to connect.', new.user_b, '/matches'),
    (new.user_b, 'match', 'New mutual match', 'You both chose to connect.', new.user_a, '/matches');
  return new;
end;
$$;

create or replace function public.notify_message_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, actor_id, href)
  select cm.user_id, 'message', 'New message', 'Someone sent you a message.', new.sender_id, '/messages/' || new.conversation_id
  from public.conversation_members cm
  where cm.conversation_id = new.conversation_id and cm.user_id <> new.sender_id;
  return new;
end;
$$;

create or replace function public.notify_follow_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' then
    insert into public.notifications (user_id, type, title, body, actor_id, href)
    values (new.following_id, 'follow', 'New follower', 'Someone followed your campus profile.', new.follower_id, '/profile');
  end if;
  return new;
end;
$$;

drop trigger if exists matches_notify_created on public.matches;
create trigger matches_notify_created after insert on public.matches for each row execute function public.notify_match_created();
drop trigger if exists messages_notify_created on public.messages;
create trigger messages_notify_created after insert on public.messages for each row execute function public.notify_message_created();
drop trigger if exists follows_notify_created on public.follows;
create trigger follows_notify_created after insert on public.follows for each row execute function public.notify_follow_created();

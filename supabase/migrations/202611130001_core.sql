-- Campus Chemistry core schema. Apply with Supabase CLI after configuring a project.
create extension if not exists pgcrypto;

create table public.institutes (
  id uuid primary key default gen_random_uuid(),
  institute_type text not null check (institute_type in ('IIT', 'NIT')),
  official_name text not null,
  short_name text not null,
  city text not null,
  state text not null,
  official_website text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (institute_type, official_name),
  unique (short_name)
);

create table public.institute_domains (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references public.institutes(id) on delete cascade,
  domain text not null,
  source_url text not null,
  reviewed_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id),
  is_active boolean not null default true,
  unique (institute_id, domain)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_\.]{3,24}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  date_of_birth date,
  gender text,
  pronouns text,
  institute_id uuid references public.institutes(id),
  degree text,
  department text,
  study_year smallint check (study_year between 1 and 10),
  bio text check (char_length(bio) <= 500),
  verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified','rejected','suspended')),
  current_student boolean not null default true,
  dating_enabled boolean not null default false,
  social_visibility text not null default 'public' check (social_visibility in ('public','private')),
  dating_visibility boolean not null default false,
  cross_campus_visibility boolean not null default false,
  message_permission text not null default 'matches' check (message_permission in ('nobody','matches','following','everyone')),
  activity_visibility boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institute_id uuid not null references public.institutes(id),
  email_domain text,
  method text not null check (method in ('institute_email','manual_review')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  private_document_path text,
  expires_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  is_active boolean not null default true
);

create table public.user_interests (
  user_id uuid not null references public.profiles(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, interest_id)
);

create table public.profile_prompts (
  id uuid primary key default gen_random_uuid(),
  prompt text not null unique,
  is_active boolean not null default true
);

create table public.prompt_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid not null references public.profile_prompts(id),
  answer text not null check (char_length(answer) between 1 and 240),
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, prompt_id)
);

create table public.discovery_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  min_age smallint not null default 18 check (min_age between 18 and 100),
  max_age smallint not null default 35 check (max_age between 18 and 100),
  preferred_genders text[] not null default '{}',
  relationship_intentions text[] not null default '{}',
  same_campus_only boolean not null default false,
  allow_cross_campus boolean not null default false,
  updated_at timestamptz not null default now(),
  check (max_age >= min_age)
);

create table public.discovery_actions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('like','pass','save','prompt_comment')),
  target_prompt_id uuid references public.prompt_answers(id) on delete set null,
  comment text check (comment is null or char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  unique (actor_id, target_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','unmatched','blocked')),
  created_at timestamptz not null default now(),
  unmatched_at timestamptz,
  check (user_a <> user_b),
  check (user_a < user_b),
  unique (user_a, user_b)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('match','direct','group','event')),
  match_id uuid unique references public.matches(id) on delete set null,
  event_id uuid,
  created_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text check (body is null or char_length(body) <= 2200),
  audience text not null default 'campus' check (audience in ('public','campus','followers','private')),
  institute_id uuid references public.institutes(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (body is not null or audience <> 'private')
);

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image','video')),
  sort_order smallint not null default 0,
  alt_text text check (char_length(alt_text) <= 200)
);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'accepted' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  institute_id uuid references public.institutes(id),
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) between 1 and 4000),
  category text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  approximate_venue text,
  private_venue_details text,
  capacity integer check (capacity is null or capacity between 1 and 10000),
  visibility text not null default 'campus' check (visibility in ('campus','inter_campus','invite_only')),
  status text not null default 'published' check (status in ('draft','published','cancelled','completed')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.event_attendees (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'going' check (status in ('going','waitlisted','withdrawn','attended')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.posts(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  reason text not null,
  details text check (char_length(details) <= 2000),
  status text not null default 'open' check (status in ('open','under_review','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index profiles_institute_visibility_idx on public.profiles (institute_id, social_visibility, dating_visibility);
create index profiles_dating_idx on public.profiles (dating_enabled, verification_status, date_of_birth);
create index discovery_actions_actor_created_idx on public.discovery_actions (actor_id, created_at desc);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at desc);
create index posts_feed_idx on public.posts (institute_id, created_at desc) where deleted_at is null;
create index comments_post_created_idx on public.comments (post_id, created_at);
create index events_discovery_idx on public.events (institute_id, starts_at) where status = 'published';
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger prompt_answers_set_updated_at before update on public.prompt_answers for each row execute function public.set_updated_at();
create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();

alter table public.institutes enable row level security;
alter table public.institute_domains enable row level security;
alter table public.profiles enable row level security;
alter table public.verification_requests enable row level security;
alter table public.interests enable row level security;
alter table public.user_interests enable row level security;
alter table public.profile_prompts enable row level security;
alter table public.prompt_answers enable row level security;
alter table public.discovery_preferences enable row level security;
alter table public.discovery_actions enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "authenticated users can read active institutes" on public.institutes for select to authenticated using (is_active);
create policy "authenticated users can read active institute domains" on public.institute_domains for select to authenticated using (is_active);
create policy "authenticated users can read interests" on public.interests for select to authenticated using (is_active);
create policy "authenticated users can read prompts" on public.profile_prompts for select to authenticated using (is_active);

create policy "users can read visible profiles" on public.profiles for select to authenticated using (
  id = auth.uid() or (social_visibility = 'public' and verification_status = 'verified')
);
create policy "users can update their own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "users can create their own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

create policy "users can manage own verification requests" on public.verification_requests for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users can manage own interests" on public.user_interests for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users can read visible answers" on public.prompt_answers for select to authenticated using (exists (select 1 from public.profiles p where p.id = user_id and (p.id = auth.uid() or p.social_visibility = 'public')));
create policy "users can manage own answers" on public.prompt_answers for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users can manage own preferences" on public.discovery_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users can manage own discovery actions" on public.discovery_actions for all to authenticated using (actor_id = auth.uid()) with check (actor_id = auth.uid());

create policy "match members can read matches" on public.matches for select to authenticated using (user_a = auth.uid() or user_b = auth.uid());
create policy "conversation members can read conversations" on public.conversations for select to authenticated using (exists (select 1 from public.conversation_members cm where cm.conversation_id = id and cm.user_id = auth.uid()));
create policy "members can read members" on public.conversation_members for select to authenticated using (exists (select 1 from public.conversation_members mine where mine.conversation_id = conversation_id and mine.user_id = auth.uid()));
create policy "members can read messages" on public.messages for select to authenticated using (exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid()));
create policy "members can send messages" on public.messages for insert to authenticated with check (sender_id = auth.uid() and exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid()));
create policy "senders can update messages" on public.messages for update to authenticated using (sender_id = auth.uid()) with check (sender_id = auth.uid());

create policy "users can read visible posts" on public.posts for select to authenticated using (deleted_at is null and (author_id = auth.uid() or audience in ('public','campus')));
create policy "users can create own posts" on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy "users can update own posts" on public.posts for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "users can read media on visible posts" on public.post_media for select to authenticated using (exists (select 1 from public.posts p where p.id = post_id and p.deleted_at is null));
create policy "users can manage media on own posts" on public.post_media for all to authenticated using (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())) with check (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()));
create policy "users can manage own post likes" on public.post_likes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users can read comments on visible posts" on public.comments for select to authenticated using (exists (select 1 from public.posts p where p.id = post_id and p.deleted_at is null));
create policy "users can create own comments" on public.comments for insert to authenticated with check (author_id = auth.uid());
create policy "users can update own comments" on public.comments for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "users can manage own follows" on public.follows for all to authenticated using (follower_id = auth.uid()) with check (follower_id = auth.uid());

create policy "users can read published events" on public.events for select to authenticated using (status = 'published' or host_id = auth.uid());
create policy "users can create own events" on public.events for insert to authenticated with check (host_id = auth.uid());
create policy "hosts can update own events" on public.events for update to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "users can manage own event attendance" on public.event_attendees for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users can manage own blocks" on public.blocks for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
create policy "users can create reports" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "reporters can read own reports" on public.reports for select to authenticated using (reporter_id = auth.uid());
create policy "users can read own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "users can update own notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Communities for campus clubs, interest groups, and inter-institute societies
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9\-]{3,60}$'),
  description text not null check (char_length(description) between 10 and 1000),
  category text not null check (category in ('Tech & Coding', 'Creative & Arts', 'Music & Jamming', 'Sports & Fitness', 'Literature & Debating', 'Gaming & Anime', 'Entrepreneurship', 'Research & Academia')),
  campus_scope text not null default 'all', -- 'all' for inter-IIT/NIT or institute_id UUID string
  created_by uuid references auth.users(id) on delete set null,
  is_verified boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'moderator', 'lead')),
  joined_at timestamptz not null default now(),
  unique (community_id, user_id)
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 150),
  body text not null check (char_length(body) between 5 and 3000),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_posts enable row level security;

create policy "Communities are viewable by authenticated users"
  on public.communities for select
  to authenticated
  using (true);

create policy "Authenticated users can create communities"
  on public.communities for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Community memberships are viewable by authenticated users"
  on public.community_members for select
  to authenticated
  using (true);

create policy "Users can manage their own memberships"
  on public.community_members for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Community posts are viewable by authenticated users"
  on public.community_posts for select
  to authenticated
  using (true);

create policy "Community members can create posts"
  on public.community_posts for insert
  to authenticated
  with check (
    auth.uid() = author_id and
    exists (
      select 1 from public.community_members
      where community_id = community_posts.community_id and user_id = auth.uid()
    )
  );

-- Pre-seed vibrant inaugural IIT & NIT communities
insert into public.communities (id, name, slug, description, category, campus_scope)
values
  ('10000000-0000-0000-0003-000000000001', 'IIT/NIT Hackers & Builders', 'hackers-and-builders', 'Open collaborative space for software engineers, ML researchers, and open-source contributors across all IITs and NITs.', 'Tech & Coding', 'all'),
  ('10000000-0000-0000-0003-000000000002', 'Indie Acoustic & Jamming Room', 'indie-acoustic-jam', 'For musicians, vocalists, songwriters, and bedroom producers sharing rough takes, finding bandmates, and hosting hostel jam sessions.', 'Music & Jamming', 'all'),
  ('10000000-0000-0000-0003-000000000003', 'Campus Photography Collective', 'photography-collective', 'Golden hour shots around campus, street photography during fests, and gear/technique discussions.', 'Creative & Arts', 'all'),
  ('10000000-0000-0000-0003-000000000004', 'Founders & Zero-to-One Circle', 'founders-circle', 'Peer circle for students building startups, raising angel rounds, or working on early prototypes between exams.', 'Entrepreneurship', 'all'),
  ('10000000-0000-0000-0003-000000000005', 'Campus Runners & Sunrise Club', 'runners-sunrise-club', 'Early morning tracks, 5k/10k training, marathon banter, and accountability partners before morning lectures.', 'Sports & Fitness', 'all'),
  ('10000000-0000-0000-0003-000000000006', 'Debate & Philosophy Society', 'debate-philosophy', 'Nuanced discussions on ethics, tech policy, existential philosophy, and inter-college parliamentary debates.', 'Literature & Debating', 'all')
on conflict (slug) do nothing;

-- Post audience rules must be enforced for the post and every dependent row.
-- This prevents private post media/comments from bypassing the parent policy.

create or replace function public.can_view_post(candidate_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.posts p
    join public.profiles author on author.id = p.author_id
    left join public.profiles viewer on viewer.id = auth.uid()
    where p.id = candidate_post_id
      and p.deleted_at is null
      and (
        p.author_id = auth.uid()
        or p.audience = 'public'
        or (p.audience = 'campus' and viewer.institute_id is not null and viewer.institute_id = author.institute_id)
        or (p.audience = 'followers' and exists (
          select 1 from public.follows f
          where f.follower_id = auth.uid() and f.following_id = p.author_id and f.status = 'accepted'
        ))
      )
  );
$$;

revoke all on function public.can_view_post(uuid) from public;
grant execute on function public.can_view_post(uuid) to authenticated;

drop policy if exists "users can read visible posts" on public.posts;
create policy "users can read audience-visible posts" on public.posts
  for select to authenticated using (public.can_view_post(id));

drop policy if exists "users can read media on visible posts" on public.post_media;
create policy "users can read media on audience-visible posts" on public.post_media
  for select to authenticated using (public.can_view_post(post_id));

drop policy if exists "users can read comments on visible posts" on public.comments;
create policy "users can read comments on audience-visible posts" on public.comments
  for select to authenticated using (public.can_view_post(post_id));

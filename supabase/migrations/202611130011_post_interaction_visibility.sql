-- Interactions must inherit the visibility of their parent post.

drop policy if exists "users can manage own post likes" on public.post_likes;
create policy "users can read own post likes" on public.post_likes
  for select to authenticated using (user_id = auth.uid());
create policy "users can like visible posts" on public.post_likes
  for insert to authenticated with check (user_id = auth.uid() and public.can_view_post(post_id));
create policy "users can remove own post likes" on public.post_likes
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "users can create own comments" on public.comments;
create policy "users can create comments on visible posts" on public.comments
  for insert to authenticated with check (author_id = auth.uid() and public.can_view_post(post_id));

drop policy if exists "users can update own comments" on public.comments;
create policy "users can update comments on visible posts" on public.comments
  for update to authenticated using (author_id = auth.uid() and public.can_view_post(post_id)) with check (author_id = auth.uid() and public.can_view_post(post_id));

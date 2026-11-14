-- Allow prospective students on onboarding to read active institutes and domains
create policy "anyone can read active institutes"
  on public.institutes for select
  to anon
  using (is_active);

create policy "anyone can read active institute domains"
  on public.institute_domains for select
  to anon
  using (is_active);

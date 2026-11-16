insert into public.interests (name, category, is_active) values
  ('Music', 'Creative', true),
  ('Movies', 'Entertainment', true),
  ('Sports', 'Recreation', true),
  ('Gaming', 'Tech', true),
  ('Technology', 'Tech', true),
  ('Photography', 'Creative', true),
  ('Books', 'Literature', true),
  ('Travel', 'Recreation', true),
  ('Fitness', 'Health', true),
  ('Art', 'Creative', true),
  ('Startups', 'Entrepreneurship', true),
  ('Research', 'Academics', true),
  ('Coding', 'Tech', true),
  ('Dance', 'Creative', true)
on conflict (name) do update set is_active = true;

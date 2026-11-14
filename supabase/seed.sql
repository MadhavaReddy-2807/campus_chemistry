-- Reviewed pilot seed only. Expand through an admin-reviewed import before launch.
-- Sources: https://csc.iitd.ac.in/services-miscellaneous-policies-privacy
--         https://www.nitt.edu/home/academics/notices/

insert into public.institutes (institute_type, official_name, short_name, city, state, official_website)
values
  ('IIT', 'Indian Institute of Technology Delhi', 'IIT Delhi', 'New Delhi', 'Delhi', 'https://home.iitd.ac.in'),
  ('NIT', 'National Institute of Technology Tiruchirappalli', 'NIT Trichy', 'Tiruchirappalli', 'Tamil Nadu', 'https://www.nitt.edu')
on conflict (short_name) do nothing;

insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitd.ac.in', 'https://csc.iitd.ac.in/services-miscellaneous-policies-privacy' from public.institutes where short_name = 'IIT Delhi'
on conflict (institute_id, domain) do nothing;

insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitt.edu', 'https://www.nitt.edu/home/academics/notices/' from public.institutes where short_name = 'NIT Trichy'
on conflict (institute_id, domain) do nothing;

insert into public.interests (name, category) values
  ('Music', 'Creative'), ('Photography', 'Creative'), ('Coffee', 'Food & drink'), ('Startups', 'Work & ideas'),
  ('Research', 'Work & ideas'), ('Running', 'Movement'), ('Anime', 'Culture'), ('Travel', 'Outdoors')
on conflict (name) do nothing;

insert into public.profile_prompts (prompt) values
  ('My ideal first date is...'), ('A random fact about me...'), ('My perfect weekend...'),
  ('Something I could talk about for hours...'), ('A green flag I appreciate...')
on conflict (prompt) do nothing;

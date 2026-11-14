-- Complete directory seed for all 23 IITs and 31 NITs in India.
-- Ensures on conflict do nothing so existing pilot data remains clean.

insert into public.institutes (id, institute_type, official_name, short_name, city, state, official_website)
values
  -- 23 IITs
  ('00000000-0000-0000-0001-000000000001', 'IIT', 'Indian Institute of Technology Kharagpur', 'IIT Kharagpur', 'Kharagpur', 'West Bengal', 'https://www.iitkgp.ac.in'),
  ('00000000-0000-0000-0001-000000000002', 'IIT', 'Indian Institute of Technology Bombay', 'IIT Bombay', 'Mumbai', 'Maharashtra', 'https://www.iitb.ac.in'),
  ('00000000-0000-0000-0001-000000000003', 'IIT', 'Indian Institute of Technology Madras', 'IIT Madras', 'Chennai', 'Tamil Nadu', 'https://www.iitm.ac.in'),
  ('00000000-0000-0000-0001-000000000004', 'IIT', 'Indian Institute of Technology Kanpur', 'IIT Kanpur', 'Kanpur', 'Uttar Pradesh', 'https://www.iitk.ac.in'),
  ('00000000-0000-0000-0001-000000000005', 'IIT', 'Indian Institute of Technology Delhi', 'IIT Delhi', 'New Delhi', 'Delhi', 'https://home.iitd.ac.in'),
  ('00000000-0000-0000-0001-000000000006', 'IIT', 'Indian Institute of Technology Guwahati', 'IIT Guwahati', 'Guwahati', 'Assam', 'https://www.iitg.ac.in'),
  ('00000000-0000-0000-0001-000000000007', 'IIT', 'Indian Institute of Technology Roorkee', 'IIT Roorkee', 'Roorkee', 'Uttarakhand', 'https://www.iitr.ac.in'),
  ('00000000-0000-0000-0001-000000000008', 'IIT', 'Indian Institute of Technology Ropar', 'IIT Ropar', 'Rupnagar', 'Punjab', 'https://www.iitrpr.ac.in'),
  ('00000000-0000-0000-0001-000000000009', 'IIT', 'Indian Institute of Technology Bhubaneswar', 'IIT Bhubaneswar', 'Bhubaneswar', 'Odisha', 'https://www.iitbbs.ac.in'),
  ('00000000-0000-0000-0001-000000000010', 'IIT', 'Indian Institute of Technology Gandhinagar', 'IIT Gandhinagar', 'Gandhinagar', 'Gujarat', 'https://www.iitgn.ac.in'),
  ('00000000-0000-0000-0001-000000000011', 'IIT', 'Indian Institute of Technology Hyderabad', 'IIT Hyderabad', 'Sangareddy', 'Telangana', 'https://www.iith.ac.in'),
  ('00000000-0000-0000-0001-000000000012', 'IIT', 'Indian Institute of Technology Jodhpur', 'IIT Jodhpur', 'Jodhpur', 'Rajasthan', 'https://www.iitj.ac.in'),
  ('00000000-0000-0000-0001-000000000013', 'IIT', 'Indian Institute of Technology Patna', 'IIT Patna', 'Patna', 'Bihar', 'https://www.iitp.ac.in'),
  ('00000000-0000-0000-0001-000000000014', 'IIT', 'Indian Institute of Technology Indore', 'IIT Indore', 'Indore', 'Madhya Pradesh', 'https://www.iiti.ac.in'),
  ('00000000-0000-0000-0001-000000000015', 'IIT', 'Indian Institute of Technology Mandi', 'IIT Mandi', 'Mandi', 'Himachal Pradesh', 'https://www.iitmandi.ac.in'),
  ('00000000-0000-0000-0001-000000000016', 'IIT', 'Indian Institute of Technology (BHU) Varanasi', 'IIT BHU Varanasi', 'Varanasi', 'Uttar Pradesh', 'https://www.iitbhu.ac.in'),
  ('00000000-0000-0000-0001-000000000017', 'IIT', 'Indian Institute of Technology Palakkad', 'IIT Palakkad', 'Palakkad', 'Kerala', 'https://www.iitpkd.ac.in'),
  ('00000000-0000-0000-0001-000000000018', 'IIT', 'Indian Institute of Technology Tirupati', 'IIT Tirupati', 'Tirupati', 'Andhra Pradesh', 'https://www.iittp.ac.in'),
  ('00000000-0000-0000-0001-000000000019', 'IIT', 'Indian Institute of Technology (ISM) Dhanbad', 'IIT ISM Dhanbad', 'Dhanbad', 'Jharkhand', 'https://www.iitism.ac.in'),
  ('00000000-0000-0000-0001-000000000020', 'IIT', 'Indian Institute of Technology Bhilai', 'IIT Bhilai', 'Bhilai', 'Chhattisgarh', 'https://www.iitbhilai.ac.in'),
  ('00000000-0000-0000-0001-000000000021', 'IIT', 'Indian Institute of Technology Dharwad', 'IIT Dharwad', 'Dharwad', 'Karnataka', 'https://www.iitdh.ac.in'),
  ('00000000-0000-0000-0001-000000000022', 'IIT', 'Indian Institute of Technology Jammu', 'IIT Jammu', 'Jammu', 'Jammu and Kashmir', 'https://www.iitjammu.ac.in'),
  ('00000000-0000-0000-0001-000000000023', 'IIT', 'Indian Institute of Technology Goa', 'IIT Goa', 'Ponda', 'Goa', 'https://www.iitgoa.ac.in'),

  -- 31 NITs
  ('00000000-0000-0000-0002-000000000001', 'NIT', 'National Institute of Technology Tiruchirappalli', 'NIT Trichy', 'Tiruchirappalli', 'Tamil Nadu', 'https://www.nitt.edu'),
  ('00000000-0000-0000-0002-000000000002', 'NIT', 'National Institute of Technology Karnataka', 'NIT Surathkal', 'Surathkal', 'Karnataka', 'https://www.nitk.ac.in'),
  ('00000000-0000-0000-0002-000000000003', 'NIT', 'National Institute of Technology Rourkela', 'NIT Rourkela', 'Rourkela', 'Odisha', 'https://www.nitrkl.ac.in'),
  ('00000000-0000-0000-0002-000000000004', 'NIT', 'National Institute of Technology Warangal', 'NIT Warangal', 'Warangal', 'Telangana', 'https://www.nitw.ac.in'),
  ('00000000-0000-0000-0002-000000000005', 'NIT', 'National Institute of Technology Calicut', 'NIT Calicut', 'Kozhikode', 'Kerala', 'https://www.nitc.ac.in'),
  ('00000000-0000-0000-0002-000000000006', 'NIT', 'Visvesvaraya National Institute of Technology', 'VNIT Nagpur', 'Nagpur', 'Maharashtra', 'https://vnit.ac.in'),
  ('00000000-0000-0000-0002-000000000007', 'NIT', 'Malaviya National Institute of Technology Jaipur', 'MNIT Jaipur', 'Jaipur', 'Rajasthan', 'https://www.mnit.ac.in'),
  ('00000000-0000-0000-0002-000000000008', 'NIT', 'Motilal Nehru National Institute of Technology', 'MNNIT Allahabad', 'Prayagraj', 'Uttar Pradesh', 'https://www.mnnit.ac.in'),
  ('00000000-0000-0000-0002-000000000009', 'NIT', 'Maulana Azad National Institute of Technology', 'MANIT Bhopal', 'Bhopal', 'Madhya Pradesh', 'https://www.manit.ac.in'),
  ('00000000-0000-0000-0002-000000000010', 'NIT', 'Sardar Vallabhbhai National Institute of Technology', 'SVNIT Surat', 'Surat', 'Gujarat', 'https://www.svnit.ac.in'),
  ('00000000-0000-0000-0002-000000000011', 'NIT', 'National Institute of Technology Kurukshetra', 'NIT Kurukshetra', 'Kurukshetra', 'Haryana', 'https://www.nitkkr.ac.in'),
  ('00000000-0000-0000-0002-000000000012', 'NIT', 'National Institute of Technology Durgapur', 'NIT Durgapur', 'Durgapur', 'West Bengal', 'https://www.nitdgp.ac.in'),
  ('00000000-0000-0000-0002-000000000013', 'NIT', 'National Institute of Technology Jamshedpur', 'NIT Jamshedpur', 'Jamshedpur', 'Jharkhand', 'https://www.nitjsr.ac.in'),
  ('00000000-0000-0000-0002-000000000014', 'NIT', 'Dr. B. R. Ambedkar National Institute of Technology', 'NIT Jalandhar', 'Jalandhar', 'Punjab', 'https://www.nitj.ac.in'),
  ('00000000-0000-0000-0002-000000000015', 'NIT', 'National Institute of Technology Silchar', 'NIT Silchar', 'Silchar', 'Assam', 'http://www.nits.ac.in'),
  ('00000000-0000-0000-0002-000000000016', 'NIT', 'National Institute of Technology Hamirpur', 'NIT Hamirpur', 'Hamirpur', 'Himachal Pradesh', 'https://nith.ac.in'),
  ('00000000-0000-0000-0002-000000000017', 'NIT', 'National Institute of Technology Raipur', 'NIT Raipur', 'Raipur', 'Chhattisgarh', 'http://www.nitrr.ac.in'),
  ('00000000-0000-0000-0002-000000000018', 'NIT', 'National Institute of Technology Patna', 'NIT Patna', 'Patna', 'Bihar', 'https://www.nitp.ac.in'),
  ('00000000-0000-0000-0002-000000000019', 'NIT', 'National Institute of Technology Srinagar', 'NIT Srinagar', 'Srinagar', 'Jammu and Kashmir', 'https://nitsri.ac.in'),
  ('00000000-0000-0000-0002-000000000020', 'NIT', 'National Institute of Technology Agartala', 'NIT Agartala', 'Agartala', 'Tripura', 'https://www.nita.ac.in'),
  ('00000000-0000-0000-0002-000000000021', 'NIT', 'National Institute of Technology Meghalaya', 'NIT Meghalaya', 'Shillong', 'Meghalaya', 'https://www.nitm.ac.in'),
  ('00000000-0000-0000-0002-000000000022', 'NIT', 'National Institute of Technology Manipur', 'NIT Manipur', 'Imphal', 'Manipur', 'http://www.nitmanipur.ac.in'),
  ('00000000-0000-0000-0002-000000000023', 'NIT', 'National Institute of Technology Nagaland', 'NIT Nagaland', 'Chumukedima', 'Nagaland', 'https://nitnagaland.ac.in'),
  ('00000000-0000-0000-0002-000000000024', 'NIT', 'National Institute of Technology Mizoram', 'NIT Mizoram', 'Aizawl', 'Mizoram', 'https://www.nitmz.ac.in'),
  ('00000000-0000-0000-0002-000000000025', 'NIT', 'National Institute of Technology Arunachal Pradesh', 'NIT Arunachal Pradesh', 'Jote', 'Arunachal Pradesh', 'https://www.nitap.ac.in'),
  ('00000000-0000-0000-0002-000000000026', 'NIT', 'National Institute of Technology Goa', 'NIT Goa', 'Cuncolim', 'Goa', 'https://www.nitgoa.ac.in'),
  ('00000000-0000-0000-0002-000000000027', 'NIT', 'National Institute of Technology Puducherry', 'NIT Puducherry', 'Karaikal', 'Puducherry', 'https://www.nitpy.ac.in'),
  ('00000000-0000-0000-0002-000000000028', 'NIT', 'National Institute of Technology Sikkim', 'NIT Sikkim', 'Ravangla', 'Sikkim', 'https://nitsikkim.ac.in'),
  ('00000000-0000-0000-0002-000000000029', 'NIT', 'National Institute of Technology Uttarakhand', 'NIT Uttarakhand', 'Srinagar', 'Uttarakhand', 'https://www.nituk.ac.in'),
  ('00000000-0000-0000-0002-000000000030', 'NIT', 'National Institute of Technology Andhra Pradesh', 'NIT Andhra Pradesh', 'Tadepalligudem', 'Andhra Pradesh', 'https://www.nitandhra.ac.in'),
  ('00000000-0000-0000-0002-000000000031', 'NIT', 'Indian Institute of Engineering Science and Technology, Shibpur', 'IIEST Shibpur (NIT)', 'Howrah', 'West Bengal', 'https://www.iiests.ac.in')
on conflict (short_name) do nothing;

-- Add corresponding domains
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitkgp.ac.in', 'https://www.iitkgp.ac.in' from public.institutes where short_name = 'IIT Kharagpur'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitb.ac.in', 'https://www.iitb.ac.in' from public.institutes where short_name = 'IIT Bombay'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitm.ac.in', 'https://www.iitm.ac.in' from public.institutes where short_name = 'IIT Madras'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitk.ac.in', 'https://www.iitk.ac.in' from public.institutes where short_name = 'IIT Kanpur'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitd.ac.in', 'https://home.iitd.ac.in' from public.institutes where short_name = 'IIT Delhi'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitg.ac.in', 'https://www.iitg.ac.in' from public.institutes where short_name = 'IIT Guwahati'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitr.ac.in', 'https://www.iitr.ac.in' from public.institutes where short_name = 'IIT Roorkee'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitrpr.ac.in', 'https://www.iitrpr.ac.in' from public.institutes where short_name = 'IIT Ropar'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitbbs.ac.in', 'https://www.iitbbs.ac.in' from public.institutes where short_name = 'IIT Bhubaneswar'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitgn.ac.in', 'https://www.iitgn.ac.in' from public.institutes where short_name = 'IIT Gandhinagar'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iith.ac.in', 'https://www.iith.ac.in' from public.institutes where short_name = 'IIT Hyderabad'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitj.ac.in', 'https://www.iitj.ac.in' from public.institutes where short_name = 'IIT Jodhpur'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitp.ac.in', 'https://www.iitp.ac.in' from public.institutes where short_name = 'IIT Patna'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iiti.ac.in', 'https://www.iiti.ac.in' from public.institutes where short_name = 'IIT Indore'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitmandi.ac.in', 'https://www.iitmandi.ac.in' from public.institutes where short_name = 'IIT Mandi'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitbhu.ac.in', 'https://www.iitbhu.ac.in' from public.institutes where short_name = 'IIT BHU Varanasi'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitpkd.ac.in', 'https://www.iitpkd.ac.in' from public.institutes where short_name = 'IIT Palakkad'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iittp.ac.in', 'https://www.iittp.ac.in' from public.institutes where short_name = 'IIT Tirupati'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitism.ac.in', 'https://www.iitism.ac.in' from public.institutes where short_name = 'IIT ISM Dhanbad'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitbhilai.ac.in', 'https://www.iitbhilai.ac.in' from public.institutes where short_name = 'IIT Bhilai'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitdh.ac.in', 'https://www.iitdh.ac.in' from public.institutes where short_name = 'IIT Dharwad'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitjammu.ac.in', 'https://www.iitjammu.ac.in' from public.institutes where short_name = 'IIT Jammu'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iitgoa.ac.in', 'https://www.iitgoa.ac.in' from public.institutes where short_name = 'IIT Goa'
on conflict (institute_id, domain) do nothing;

-- NIT domains
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitt.edu', 'https://www.nitt.edu' from public.institutes where short_name = 'NIT Trichy'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitk.ac.in', 'https://www.nitk.ac.in' from public.institutes where short_name = 'NIT Surathkal'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitrkl.ac.in', 'https://www.nitrkl.ac.in' from public.institutes where short_name = 'NIT Rourkela'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitw.ac.in', 'https://www.nitw.ac.in' from public.institutes where short_name = 'NIT Warangal'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitc.ac.in', 'https://www.nitc.ac.in' from public.institutes where short_name = 'NIT Calicut'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'vnit.ac.in', 'https://vnit.ac.in' from public.institutes where short_name = 'VNIT Nagpur'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'mnit.ac.in', 'https://www.mnit.ac.in' from public.institutes where short_name = 'MNIT Jaipur'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'mnnit.ac.in', 'https://www.mnnit.ac.in' from public.institutes where short_name = 'MNNIT Allahabad'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'manit.ac.in', 'https://www.manit.ac.in' from public.institutes where short_name = 'MANIT Bhopal'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'svnit.ac.in', 'https://www.svnit.ac.in' from public.institutes where short_name = 'SVNIT Surat'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitkkr.ac.in', 'https://www.nitkkr.ac.in' from public.institutes where short_name = 'NIT Kurukshetra'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitdgp.ac.in', 'https://www.nitdgp.ac.in' from public.institutes where short_name = 'NIT Durgapur'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitjsr.ac.in', 'https://www.nitjsr.ac.in' from public.institutes where short_name = 'NIT Jamshedpur'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitj.ac.in', 'https://www.nitj.ac.in' from public.institutes where short_name = 'NIT Jalandhar'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nits.ac.in', 'http://www.nits.ac.in' from public.institutes where short_name = 'NIT Silchar'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nith.ac.in', 'https://nith.ac.in' from public.institutes where short_name = 'NIT Hamirpur'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitrr.ac.in', 'http://www.nitrr.ac.in' from public.institutes where short_name = 'NIT Raipur'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitp.ac.in', 'https://www.nitp.ac.in' from public.institutes where short_name = 'NIT Patna'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitsri.ac.in', 'https://nitsri.ac.in' from public.institutes where short_name = 'NIT Srinagar'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nita.ac.in', 'https://www.nita.ac.in' from public.institutes where short_name = 'NIT Agartala'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitm.ac.in', 'https://www.nitm.ac.in' from public.institutes where short_name = 'NIT Meghalaya'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitmanipur.ac.in', 'http://www.nitmanipur.ac.in' from public.institutes where short_name = 'NIT Manipur'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitnagaland.ac.in', 'https://nitnagaland.ac.in' from public.institutes where short_name = 'NIT Nagaland'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitmz.ac.in', 'https://www.nitmz.ac.in' from public.institutes where short_name = 'NIT Mizoram'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitap.ac.in', 'https://www.nitap.ac.in' from public.institutes where short_name = 'NIT Arunachal Pradesh'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitgoa.ac.in', 'https://www.nitgoa.ac.in' from public.institutes where short_name = 'NIT Goa'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitpy.ac.in', 'https://www.nitpy.ac.in' from public.institutes where short_name = 'NIT Puducherry'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitsikkim.ac.in', 'https://nitsikkim.ac.in' from public.institutes where short_name = 'NIT Sikkim'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nituk.ac.in', 'https://www.nituk.ac.in' from public.institutes where short_name = 'NIT Uttarakhand'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'nitandhra.ac.in', 'https://www.nitandhra.ac.in' from public.institutes where short_name = 'NIT Andhra Pradesh'
on conflict (institute_id, domain) do nothing;
insert into public.institute_domains (institute_id, domain, source_url)
select id, 'iiests.ac.in', 'https://www.iiests.ac.in' from public.institutes where short_name = 'IIEST Shibpur (NIT)'
on conflict (institute_id, domain) do nothing;

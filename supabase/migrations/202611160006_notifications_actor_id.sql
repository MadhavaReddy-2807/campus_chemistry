alter table public.notifications add column if not exists actor_id uuid references public.profiles(id) on delete set null;

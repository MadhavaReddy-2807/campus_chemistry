create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  in_app_notifications boolean not null default true,
  email_notifications boolean not null default false,
  web_push_notifications boolean not null default false,
  read_receipts boolean not null default true,
  activity_status boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;
create policy "users can manage own settings" on public.user_settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger user_settings_set_updated_at before update on public.user_settings for each row execute function public.set_updated_at();

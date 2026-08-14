alter table public.profiles add column if not exists telegram_chat_id  text;
alter table public.profiles add column if not exists telegram_link_code text;

create unique index if not exists profiles_telegram_link_code_idx
  on public.profiles (telegram_link_code) where telegram_link_code is not null;

create index if not exists profiles_telegram_chat_idx
  on public.profiles (telegram_chat_id) where telegram_chat_id is not null;

revoke update (telegram_chat_id) on public.profiles from anon, authenticated;

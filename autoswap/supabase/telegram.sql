alter table public.profiles add column if not exists telegram_chat_id  text;
alter table public.profiles add column if not exists telegram_link_code text;

create unique index if not exists profiles_telegram_link_code_idx
  on public.profiles (telegram_link_code) where telegram_link_code is not null;

create index if not exists profiles_telegram_chat_idx
  on public.profiles (telegram_chat_id) where telegram_chat_id is not null;

revoke update (telegram_chat_id) on public.profiles from anon, authenticated;

-- Defense-in-depth only: the column REVOKE above is a no-op whenever the role
-- also holds table-level UPDATE, which Supabase grants anon/authenticated by
-- default (a table-wide grant already covers every column). Without the trigger
-- below a client could point their own profile at any chat id, skipping the
-- link-code ownership check the bot performs and pushing notifications into a
-- stranger's Telegram. Only the bot (service role) may set this column.
--
-- Lives here rather than in the shared profiles guard because telegram.sql is
-- optional: a deployment without it has no telegram_chat_id column, and a
-- trigger referencing a missing field would break every profile update.
-- telegram_link_code is deliberately NOT frozen - the client generates it.
create or replace function public.trg_profiles_guard_telegram()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.telegram_chat_id := old.telegram_chat_id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_telegram on public.profiles;
create trigger profiles_guard_telegram
  before update on public.profiles
  for each row execute function public.trg_profiles_guard_telegram();

-- =============================================================
-- AutoSwap — Telegram notifications (optional add-on)
--
-- Delivers offer / message / match notifications to users over a Telegram
-- bot instead of email/SMS. Run after schema.sql + policies.sql.
--
--   1. telegram_chat_id   — the user's private Telegram chat, set ONLY by the
--                           bot Edge Function (service role). Never client-set.
--   2. telegram_link_code — a short random code the account page writes to its
--                           own row; the user sends it to the bot as
--                           /start <code> to link their chat. Single use.
--
-- Delivery: create a Supabase Database Webhook on INSERT into
-- public.notifications that calls the `telegram-notify` Edge Function.
-- See TELEGRAM_SETUP.md.
-- =============================================================

alter table public.profiles add column if not exists telegram_chat_id  text;
alter table public.profiles add column if not exists telegram_link_code text;

create unique index if not exists profiles_telegram_link_code_idx
  on public.profiles (telegram_link_code) where telegram_link_code is not null;

create index if not exists profiles_telegram_chat_idx
  on public.profiles (telegram_chat_id) where telegram_chat_id is not null;

-- The chat id is identity-sensitive: only the bot (service role) may write it,
-- so a user can't redirect another account's notifications to their own chat.
-- The link_code stays writable by the owner (account page sets it before /start).
revoke update (telegram_chat_id) on public.profiles from anon, authenticated;

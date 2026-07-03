# Telegram notifications — setup

AutoSwap can deliver offer / message / match notifications over a Telegram bot
(no SMS or email provider needed). Notifications are still stored in-app; this
just forwards them to the user's Telegram chat.

## 1. Create the bot

1. In Telegram, message [@BotFather](https://t.me/BotFather) → `/newbot`.
2. Note the **bot token** and the **bot username** (e.g. `AutoSwapNotifyBot`).

## 2. Database

Run the migration (after `schema.sql` + `policies.sql`):

```sql
\i telegram.sql
```

This adds `telegram_chat_id` (bot-writable only) and `telegram_link_code`
(owner-writable) to `profiles`.

## 3. Deploy the Edge Functions

```bash
supabase functions deploy telegram-bot
supabase functions deploy telegram-notify

supabase secrets set TELEGRAM_BOT_TOKEN=123456:ABC...
supabase secrets set TELEGRAM_WEBHOOK_SECRET=$(openssl rand -hex 16)
supabase secrets set NOTIFY_WEBHOOK_SECRET=$(openssl rand -hex 16)
```

(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.)

## 4. Point the bot webhook at `telegram-bot`

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<project-ref>.functions.supabase.co/telegram-bot&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

## 5. Fire `telegram-notify` on new notifications

Dashboard → **Database → Webhooks → Create**:

- Table: `public.notifications`, Events: **Insert**
- Type: **Supabase Edge Function** → `telegram-notify`
- HTTP header: `Authorization: Bearer <NOTIFY_WEBHOOK_SECRET>`

## 6. Frontend

In `front/supabase-config.js` set:

```js
window.AUTO_SWAP_TELEGRAM_BOT = 'AutoSwapNotifyBot'; // your bot username
```

The account page then shows **Telegram-ის დაკავშირება**. Clicking it writes a
one-time code and opens `t.me/<bot>?start=<code>`; when the user taps **Start**,
`telegram-bot` links their chat. From then on they receive notifications in
Telegram.

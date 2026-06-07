# AutoSwap Web Backend Setup

This static frontend uses Supabase directly from the browser.

## 1. Configure Browser Keys

Edit `web/supabase-config.js`:

```js
window.AUTO_SWAP_SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
window.AUTO_SWAP_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

The anon key is safe in browser code when Row Level Security is enabled.

## 2. Run the SQL

The frontend expects these tables:

- `profiles`
- `vehicles`
- `vehicle_photos`
- `desired_vehicles`
- `offers`
- `conversations`
- `messages`

Use the SQL files already generated for the web backend:

1. `autoswap-web/supabase/schema.sql`
2. `autoswap-web/supabase/policies.sql`

Run them in the Supabase SQL editor in that order.

## 3. Enable Auth

For the current static frontend, enable Email auth in Supabase. The app uses:

- sign up with email/password
- sign in with email/password
- sign out

The backend architecture can still add Google, Apple, and Phone later.

## 4. Storage

The SQL creates a public `vehicle-photos` bucket. Listing photos upload to:

```text
vehicles/{vehicle_id}/{photo_id}.jpg
```

Only the owner can upload/delete photos for their own vehicle folder.

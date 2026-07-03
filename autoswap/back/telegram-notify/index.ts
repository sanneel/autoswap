// =============================================================
// Edge Function: telegram-notify
// Database-Webhook target for INSERT on public.notifications. Looks up the
// recipient's linked Telegram chat and forwards the notification text.
//
// Configure a Supabase Database Webhook:
//   Table: public.notifications · Event: INSERT · Type: Supabase Edge Function
//   Function: telegram-notify
// (Add an Authorization header with the service-role key or a shared secret.)
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN,
//      NOTIFY_WEBHOOK_SECRET (optional shared secret checked against Authorization)
// =============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const TG_API = `https://api.telegram.org/bot${Deno.env.get("TELEGRAM_BOT_TOKEN")}`;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("NOTIFY_WEBHOOK_SECRET");
  if (secret) {
    const auth = req.headers.get("Authorization") ?? "";
    if (auth !== `Bearer ${secret}` && auth !== secret) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  let payload: { record?: { user_id?: string; title?: string; body?: string } };
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const record = payload.record;
  if (!record?.user_id) return new Response("ok");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("telegram_chat_id")
    .eq("id", record.user_id)
    .maybeSingle();

  // No linked chat -> nothing to deliver (in-app notification still stored).
  if (!profile?.telegram_chat_id) return new Response("ok");

  const title = record.title ?? "AutoSwap";
  const body = record.body ?? "";
  const text = `<b>${escapeHtml(title)}</b>\n${escapeHtml(body)}`;

  await fetch(`${TG_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: profile.telegram_chat_id,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  return new Response("ok");
});

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const TG_API = `https://api.telegram.org/bot${Deno.env.get("TELEGRAM_BOT_TOKEN")}`;

async function sendMessage(chatId: number | string, text: string) {
  await fetch(`${TG_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

// Compare the webhook secret without leaking how far the match got. `!==` on
// strings bails at the first differing byte; over a network that difference is
// impractical to measure, but a secret comparison is the wrong place to rely on
// that being true.
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  let diff = x.length ^ y.length;
  const length = Math.max(x.length, y.length);
  for (let i = 0; i < length; i += 1) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
  if (!secret) return new Response("Server misconfigured: TELEGRAM_WEBHOOK_SECRET not set", { status: 500 });
  if (!timingSafeEqual(req.headers.get("x-telegram-bot-api-secret-token") || "", secret)) {
    return new Response("Forbidden", { status: 403 });
  }

  let update: Record<string, unknown>;
  try {
    update = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const message = (update as { message?: { chat?: { id: number }; text?: string } }).message;
  const chatId = message?.chat?.id;
  const text = (message?.text ?? "").trim();

  if (!chatId) return new Response("ok");

  const match = text.match(/^\/start(?:\s+(\S+))?/);
  if (!match) {
    await sendMessage(chatId, "გამოიყენე AutoSwap-ის ანგარიშის გვერდი დასაკავშირებლად.");
    return new Response("ok");
  }

  const code = match[1];
  if (!code) {
    await sendMessage(chatId, "დასაკავშირებლად გახსენი AutoSwap → ანგარიში → Telegram-ის დაკავშირება.");
    return new Response("ok");
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("telegram_link_code", code)
    .maybeSingle();

  if (!profile) {
    await sendMessage(chatId, "კოდი არასწორია ან ვადაგასულია. სცადე თავიდან ანგარიშის გვერდიდან.");
    return new Response("ok");
  }

  await supabase
    .from("profiles")
    .update({ telegram_chat_id: String(chatId), telegram_link_code: null })
    .eq("id", profile.id);

  await sendMessage(chatId, "✅ დაკავშირდა! ახლა შეთავაზებებსა და შეტყობინებებს აქ მიიღებ.");
  return new Response("ok");
});

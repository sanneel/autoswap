import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  normalizeChannel,
  sendOtp,
  VerifyGeError,
  verifyGeConfigured,
} from "../_shared/verify-ge.ts";

const PHONE_RE = /^\+995\d{9}$/;
const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  const candidate = (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "").trim();
  if (!candidate) return null;
  if (IPV4_RE.test(candidate) || candidate.includes(":")) return candidate;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let phone: string | undefined;
  let channelRaw: unknown;
  let purpose = "login";
  try {
    const body = await req.json();
    phone = typeof body?.phone === "string" ? body.phone.trim() : undefined;
    channelRaw = body?.channel;
    if (body?.purpose === "attach") purpose = "attach";
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  if (!phone || !PHONE_RE.test(phone)) {
    return jsonResponse({ error: "A valid Georgian phone number is required" }, 400);
  }
  const channel = normalizeChannel(channelRaw);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let attachUserId: string | null = null;
  if (purpose === "attach") {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: claims, error: authError } = await admin.auth.getUser(token);
    if (authError || !claims?.user) {
      return jsonResponse({ error: "Sign in before attaching a number" }, 401);
    }
    attachUserId = claims.user.id;
  }

  const { data: verdict, error: rlError } = await admin.rpc("otp_rate_check", {
    p_ip: clientIp(req),
    p_phone: phone,
  });
  if (rlError) {
    console.error("request-otp: otp_rate_check failed", rlError.message);
    return jsonResponse({ error: "Rate check unavailable" }, 500);
  }
  if (verdict && verdict.allowed === false) {
    return jsonResponse(
      { error: verdict.reason || "Too many requests", retry_after: verdict.retry_after ?? 60, blocked: true },
      429,
    );
  }

  if (verifyGeConfigured()) {
    try {
      let sent;
      let attempted = channel;
      try {
        sent = await sendOtp(phone, channel);
      } catch (err) {
        const e = err instanceof VerifyGeError ? err : null;
        const retryable = channel === "WHATSAPP"
          && e
          && e.code !== "INSUFFICIENT_BALANCE"
          && e.code !== "PAYMENT_REQUIRED"
          && e.code !== "RATE_LIMIT_EXCEEDED";
        if (!retryable) throw err;
        console.warn("request-otp: WhatsApp send failed, retrying over SMS", e?.code, e?.message);
        attempted = "SMS";
        sent = await sendOtp(phone, "SMS");
      }
      const delivered = sent.channel || attempted;
      const { error: bindError } = await admin.rpc("otp_request_record", {
        p_request_id: sent.requestId,
        p_phone: phone,
        p_channel: delivered,
        p_purpose: purpose,
        p_user_id: attachUserId,
      });
      if (bindError) {
        console.error("request-otp: otp_request_record failed", bindError.message);
        return jsonResponse({ error: "Could not start verification. Please try again." }, 500);
      }
      return jsonResponse({
        status: "sent",
        provider: "verify_ge",
        request_id: sent.requestId,
        channel: delivered,
        requested_channel: channel,
        channel_source: sent.channelSource,
        channel_lookup_error: sent.channelLookupError ?? null,
        purpose,
        expires_at: sent.expiresAt ?? null,
      });
    } catch (err) {
      const e = err instanceof VerifyGeError
        ? err
        : new VerifyGeError("PROVIDER_ERROR", String((err as Error)?.message || err));
      console.error("request-otp: verify.ge send failed", e.code, e.message);
      if (e.code === "INSUFFICIENT_BALANCE" || e.code === "PAYMENT_REQUIRED") {
        return jsonResponse({ error: "SMS service temporarily unavailable", code: e.code }, 503);
      }
      if (e.code === "RATE_LIMIT_EXCEEDED") {
        return jsonResponse({ error: "Too many requests", retry_after: 60, blocked: true }, 429);
      }
      return jsonResponse({ error: e.message, code: e.code, provider_status: e.status }, 502);
    }
  }

  if (purpose === "attach") return jsonResponse({ status: "legacy_attach", provider: "supabase" });

  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { error } = await anon.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
  });
  if (!error) return jsonResponse({ status: "sent", provider: "supabase" });

  const message = String(error.message || "");
  if (/provider|not enabled|disabled|unsupported|sms/i.test(message)) {
    return jsonResponse({ status: "provider_disabled" });
  }
  return jsonResponse({ error: message }, 400);
});

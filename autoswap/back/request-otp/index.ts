import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { corsHeadersFor, jsonResponseFor } from "../_shared/cors.ts";
import { trustedClientIp } from "../_shared/client-ip.ts";
import {
  normalizeChannel,
  sendOtp,
  VerifyGeError,
  verifyGeConfigured,
} from "../_shared/verify-ge.ts";

const PHONE_RE = /^\+995\d{9}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeadersFor(req) });
  if (req.method !== "POST") return jsonResponseFor(req, { error: "Method not allowed" }, 405);

  let phone: string | undefined;
  let channelRaw: unknown;
  let purpose = "login";
  try {
    const body = await req.json();
    phone = typeof body?.phone === "string" ? body.phone.trim() : undefined;
    channelRaw = body?.channel;
    if (body?.purpose === "attach") purpose = "attach";
  } catch {
    return jsonResponseFor(req, { error: "Invalid JSON body" }, 400);
  }
  if (!phone || !PHONE_RE.test(phone)) {
    return jsonResponseFor(req, { error: "A valid Georgian phone number is required" }, 400);
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
      return jsonResponseFor(req, { error: "Sign in before attaching a number" }, 401);
    }
    attachUserId = claims.user.id;
  }

  const { data: verdict, error: rlError } = await admin.rpc("otp_rate_check", {
    p_ip: trustedClientIp(req),
    p_phone: phone,
  });
  if (rlError) {
    console.error("request-otp: otp_rate_check failed", rlError.message);
    return jsonResponseFor(req, { error: "Rate check unavailable" }, 500);
  }
  if (verdict && verdict.allowed === false) {
    return jsonResponseFor(req, 
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
        return jsonResponseFor(req, { error: "Could not start verification. Please try again." }, 500);
      }
      return jsonResponseFor(req, {
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
        return jsonResponseFor(req, { error: "SMS service temporarily unavailable", code: e.code }, 503);
      }
      if (e.code === "RATE_LIMIT_EXCEEDED") {
        return jsonResponseFor(req, { error: "Too many requests", retry_after: 60, blocked: true }, 429);
      }
      return jsonResponseFor(req, { error: "Could not send the code. Please try again." }, 502);
    }
  }

  if (purpose === "attach") return jsonResponseFor(req, { status: "legacy_attach", provider: "supabase" });

  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { error } = await anon.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
  });
  if (!error) return jsonResponseFor(req, { status: "sent", provider: "supabase" });

  const message = String(error.message || "");
  if (/provider|not enabled|disabled|unsupported|sms/i.test(message)) {
    return jsonResponseFor(req, { status: "provider_disabled" });
  }
  return jsonResponseFor(req, { error: message }, 400);
});

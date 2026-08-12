// =============================================================
// Edge Function: request-otp
// The single server-side entry point for sending a login code. Every OTP send
// is funnelled through here so the rate limiter is authoritative — the browser
// holds only the public anon key, so a check that lived client-side could just
// be skipped.
//
// Flow:
//   1. Resolve the real client IP from the proxy headers.
//   2. public.otp_rate_check(ip, phone) (service role) applies per-IP burst,
//      per-phone bombing, and distributed-velocity rules.
//   3. If allowed, dispatch the code:
//        • verify.ge (SMS or WhatsApp) when VERIFY_GE_API_KEY is set, and
//          bind the returned requestId to this phone via otp_request_record;
//        • otherwise Supabase Auth's own SMS (legacy path, SMS only).
//
// verify.ge mints and checks the code itself, so verification does NOT happen
// client-side on that path — the browser posts the requestId to `verify-otp`,
// which is the only thing that can turn a good code into a session.
//
// Request:  POST { "phone": "+9955XXXXXXXX", "channel": "sms" | "whatsapp" }
// Response: 200 { "status": "sent", "provider": "verify_ge",
//                 "request_id": "...", "channel": "SMS", "expires_at": "..." }
//           200 { "status": "sent", "provider": "supabase" }  — legacy path
//           200 { "status": "provider_disabled" }    — no SMS provider; client
//                                                       falls back to demo flow
//           429 { "error", "retry_after", "blocked" } — rate limited
//           4xx { "error" }                            — bad input / send error
// =============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  normalizeChannel,
  sendOtp,
  VerifyGeError,
  verifyGeConfigured,
} from "../_shared/verify-ge.ts";

// Georgian mobile in E.164: +995 followed by 9 digits.
const PHONE_RE = /^\+995\d{9}$/;
const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  const candidate = (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "").trim();
  if (!candidate) return null;
  // Only forward something Postgres can cast to inet; otherwise drop to null
  // (the limiter still applies its phone + global rules).
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

  // Attaching a number to an existing account is only meaningful for a signed-in
  // caller, and the resulting request is bound to *that* user — so the identity
  // is resolved from the JWT here, never from the request body.
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

  // --- Rate limit (authoritative) ---
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

  // --- verify.ge path (SMS + WhatsApp) ---
  if (verifyGeConfigured()) {
    try {
      // WhatsApp is the default channel, so a WhatsApp-specific failure would
      // lock every new user out of signing in. verify.ge exposes no way to ask
      // whether the account carries a WhatsApp entitlement — SdkConfiguration
      // reports branding, webhooks and test mode, nothing per-channel — so the
      // only way to find out is to try. On a failed WhatsApp send we retry once
      // over SMS and report what actually went out; the client then tells the
      // user the code came by SMS instead of leaving them watching WhatsApp.
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
      // Bind requestId → phone before telling the client anything. `verify-otp`
      // reads the phone back from this row and ignores whatever the browser
      // claims, which is what stops a caller from verifying their own code and
      // asking for somebody else's session.
      // What actually went out, which is not always what was asked for: an
      // account without a WhatsApp entitlement gets SMS instead, silently.
      // Falls back to `attempted`, not `channel` — after an SMS retry the
      // requested channel is the wrong answer.
      const delivered = sent.channel || attempted;
      const { error: bindError } = await admin.rpc("otp_request_record", {
        p_request_id: sent.requestId,
        p_phone: phone,
        p_channel: delivered,
        p_purpose: purpose,
        p_user_id: attachUserId,
      });
      if (bindError) {
        // The code is already on its way, but without the binding it can never
        // be exchanged for a session. Fail loudly rather than stranding the user
        // on a code screen that cannot succeed.
        console.error("request-otp: otp_request_record failed", bindError.message);
        return jsonResponse({ error: "Could not start verification. Please try again." }, 500);
      }
      return jsonResponse({
        status: "sent",
        provider: "verify_ge",
        request_id: sent.requestId,
        channel: delivered,
        requested_channel: channel,
        // Lets a mislabelled channel be told apart from a mis-delivered one:
        // "none" means neither the send response nor the status lookup stated
        // a channel, so `channel` above is an assumption, not an observation.
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
      // Out of credit is an operator problem, not a user one — the client shows
      // a neutral "try later" for these rather than leaking billing state.
      if (e.code === "INSUFFICIENT_BALANCE" || e.code === "PAYMENT_REQUIRED") {
        return jsonResponse({ error: "SMS service temporarily unavailable", code: e.code }, 503);
      }
      if (e.code === "RATE_LIMIT_EXCEEDED") {
        return jsonResponse({ error: "Too many requests", retry_after: 60, blocked: true }, 429);
      }
      // Always 502 for a provider failure, never the provider's own status.
      // Forwarding it collided with transport-level meanings: verify.ge
      // answering 404 made the browser think this Edge Function was missing and
      // replace the real message with "service unavailable", hiding the one
      // piece of information needed to diagnose the send. The provider's
      // message and code travel in the body, where nothing reinterprets them.
      return jsonResponse({ error: e.message, code: e.code, provider_status: e.status }, 502);
    }
  }

  // --- Legacy path: Supabase Auth SMS (verification stays client-side) ---
  // Attaching a number to an existing account has no signInWithOtp equivalent;
  // on this path the client keeps using updateUser({ phone }) + phone_change.
  if (purpose === "attach") return jsonResponse({ status: "legacy_attach", provider: "supabase" });

  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { error } = await anon.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
  });
  if (!error) return jsonResponse({ status: "sent", provider: "supabase" });

  const message = String(error.message || "");
  // No SMS provider configured on the project → let the client show its
  // clearly-labelled demo flow instead of a hard error.
  if (/provider|not enabled|disabled|unsupported|sms/i.test(message)) {
    return jsonResponse({ status: "provider_disabled" });
  }
  return jsonResponse({ error: message }, 400);
});

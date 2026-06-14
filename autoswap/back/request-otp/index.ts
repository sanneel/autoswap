// =============================================================
// Edge Function: request-otp
// The single server-side entry point for sending a login SMS code. Every OTP
// send is funnelled through here so the rate limiter is authoritative — the
// browser holds only the public anon key, so a check that lived client-side
// could just be skipped.
//
// Flow:
//   1. Resolve the real client IP from the proxy headers.
//   2. public.otp_rate_check(ip, phone) (service role) applies per-IP burst,
//      per-phone bombing, and distributed-velocity rules.
//   3. If allowed, ask Supabase Auth to dispatch the SMS (anon client, normal
//      signInWithOtp path; verification stays client-side via verifyOtp).
//
// Request:  POST { "phone": "+9955XXXXXXXX" }
// Response: 200 { "status": "sent" }                 — code dispatched
//           200 { "status": "provider_disabled" }    — no SMS provider; client
//                                                       falls back to demo flow
//           429 { "error", "retry_after", "blocked" } — rate limited
//           4xx { "error" }                            — bad input / send error
//
// For bypass-proof enforcement against the raw /auth/v1/otp endpoint, wire the
// same otp_rate_check() as a Supabase "Send SMS" auth hook (see SUPABASE_SETUP).
// =============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

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
  try {
    const body = await req.json();
    phone = typeof body?.phone === "string" ? body.phone.trim() : undefined;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  if (!phone || !PHONE_RE.test(phone)) {
    return jsonResponse({ error: "A valid Georgian phone number is required" }, 400);
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

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

  // --- Send the code (only after passing the limiter) ---
  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { error } = await anon.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
  });
  if (!error) return jsonResponse({ status: "sent" });

  const message = String(error.message || "");
  // No SMS provider configured on the project → let the client show its
  // clearly-labelled demo flow instead of a hard error.
  if (/provider|not enabled|disabled|unsupported|sms/i.test(message)) {
    return jsonResponse({ status: "provider_disabled" });
  }
  return jsonResponse({ error: message }, 400);
});

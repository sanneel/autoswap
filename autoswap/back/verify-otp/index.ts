// =============================================================
// Edge Function: verify-otp
// Exchanges a verify.ge requestId + code for a real Supabase session.
//
// Only needed on the verify.ge path. verify.ge mints and checks the code
// itself, so Supabase Auth never learns that this number was proven — which
// means nothing client-side can produce a session any more, and this function
// becomes the sole issuer. Treat it accordingly.
//
// Two rules carry the security of this endpoint:
//
//   1. The phone is read from public.otp_requests, never from the request
//      body. The browser supplies only a requestId. Trusting a body-supplied
//      phone would let a caller verify a code sent to their own number and
//      then ask for a session belonging to someone else's.
//   2. The request is single-use. otp_request_claim() burns it inside one
//      UPDATE ... RETURNING, so two concurrent verifies cannot both win, and a
//      captured requestId cannot be replayed.
//
// Wrong codes cost an attempt (otp_request_begin_verify) but do not burn the
// request, so a typo does not force a fresh SMS.
//
// Request:  POST { "request_id": "...", "code": "123456" }
//           purpose 'attach' additionally requires Authorization: Bearer <jwt>
// Response: 200 { "status": "signed_in", "access_token", "refresh_token" }
//           200 { "status": "attached" }                   — attach purpose
//           400 { "error", "code": "INVALID_OTP_CODE" }    — wrong/expired code
//           410 { "error" }                                — request spent
//           4xx/5xx { "error" }
// =============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { verifyOtp } from "../_shared/verify-ge.ts";

const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

function clientIp(req: Request): string | undefined {
  const fwd = req.headers.get("x-forwarded-for");
  const candidate = (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "").trim();
  if (!candidate) return undefined;
  return IPV4_RE.test(candidate) || candidate.includes(":") ? candidate : undefined;
}

interface BoundRequest {
  phone: string;
  purpose: string;
  user_id: string | null;
}

/** rpc() returning setof → array; normalise to the single row or null. */
function firstRow(data: unknown): BoundRequest | null {
  const row = Array.isArray(data) ? data[0] : data;
  return row && (row as BoundRequest).phone ? (row as BoundRequest) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let requestId: string | undefined;
  let code: string | undefined;
  try {
    const body = await req.json();
    requestId = typeof body?.request_id === "string" ? body.request_id.trim() : undefined;
    code = typeof body?.code === "string" ? body.code.trim() : undefined;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  if (!requestId) return jsonResponse({ error: "request_id is required" }, 400);
  if (!code || !/^\d{4,8}$/.test(code)) return jsonResponse({ error: "A numeric code is required" }, 400);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // --- Resolve the binding and spend one attempt ---
  const { data: openData, error: openError } = await admin.rpc("otp_request_begin_verify", {
    p_request_id: requestId,
  });
  if (openError) {
    console.error("verify-otp: otp_request_begin_verify failed", openError.message);
    return jsonResponse({ error: "Verification unavailable" }, 500);
  }
  const bound = firstRow(openData);
  if (!bound) {
    // Unknown, expired, already used, or out of attempts. Deliberately one
    // message for all four — distinguishing them tells an attacker which
    // requestIds exist.
    return jsonResponse({ error: "This code is no longer valid. Request a new one." }, 410);
  }

  // Attach needs a signed-in caller, and the check runs *before* the code is
  // spent — an expired session should not also cost the user their code.
  let attachUser: { id: string } | null = null;
  if (bound.purpose === "attach") {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: claims, error: authError } = await admin.auth.getUser(token);
    // The signed-in caller must be the same user the request was issued to.
    if (authError || !claims?.user || (bound.user_id && claims.user.id !== bound.user_id)) {
      return jsonResponse({ error: "Sign in before attaching a number" }, 401);
    }
    attachUser = { id: claims.user.id };
  }

  // --- Ask the provider (the only party that knows the digits) ---
  const result = await verifyOtp(requestId, code, clientIp(req), req.headers.get("user-agent") || undefined);
  if (!result.ok) {
    return jsonResponse(
      { error: result.message || "Incorrect code", code: result.code || "INVALID_OTP_CODE" },
      400,
    );
  }

  // --- Burn the request; a good code is worth exactly one session ---
  const { data: claimData, error: claimError } = await admin.rpc("otp_request_claim", {
    p_request_id: requestId,
  });
  if (claimError) {
    console.error("verify-otp: otp_request_claim failed", claimError.message);
    return jsonResponse({ error: "Verification unavailable" }, 500);
  }
  if (!firstRow(claimData)) {
    // Lost the race against a concurrent verify of the same requestId.
    return jsonResponse({ error: "This code has already been used." }, 410);
  }

  const phone = bound.phone;

  // --- Attach: the number is proven, write it onto the caller's account ---
  if (attachUser) {
    const { error: updateError } = await admin.auth.admin.updateUserById(attachUser.id, {
      phone,
      phone_confirm: true,
    });
    if (updateError) {
      console.error("verify-otp: attach failed", updateError.message);
      return jsonResponse({ error: updateError.message }, 400);
    }
    return jsonResponse({ status: "attached", phone });
  }

  // --- Login: find or create the account for this number ---
  let userId: string | null = null;
  const { data: existing, error: lookupError } = await admin.rpc("user_id_for_phone", { p_phone: phone });
  if (lookupError) {
    console.error("verify-otp: user_id_for_phone failed", lookupError.message);
    return jsonResponse({ error: "Verification unavailable" }, 500);
  }
  userId = (existing as string | null) || null;

  if (!userId) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      phone,
      phone_confirm: true,
    });
    if (createError || !created?.user) {
      console.error("verify-otp: createUser failed", createError?.message);
      return jsonResponse({ error: createError?.message || "Could not create the account" }, 400);
    }
    userId = created.user.id;
  }

  // --- Mint the session ---
  // Supabase has no admin "issue a session for this user" call, and
  // generateLink() is email-only, so the supported route for a phone-first
  // account is to set a fresh single-use credential and immediately spend it.
  // The password is server-side only: it is written and used inside this
  // function, never returned, and replaced on the next login. Nothing else in
  // AutoSwap offers password sign-in, so there is no user-set value to clobber.
  const password = `${crypto.randomUUID()}${crypto.randomUUID()}`;
  const { error: pwError } = await admin.auth.admin.updateUserById(userId, {
    password,
    phone_confirm: true,
  });
  if (pwError) {
    console.error("verify-otp: password rotation failed", pwError.message);
    return jsonResponse({ error: "Could not complete sign-in" }, 500);
  }

  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: session, error: signInError } = await anon.auth.signInWithPassword({ phone, password });
  if (signInError || !session?.session) {
    // Nearly always means phone sign-in is switched off for the project. The
    // provider settings can stay empty — no SMS is ever sent through Supabase
    // on this path — but the phone provider itself has to be enabled.
    console.error("verify-otp: signInWithPassword failed", signInError?.message);
    return jsonResponse({ error: "Could not complete sign-in" }, 500);
  }

  return jsonResponse({
    status: "signed_in",
    access_token: session.session.access_token,
    refresh_token: session.session.refresh_token,
  });
});

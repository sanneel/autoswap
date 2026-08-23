import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { corsHeadersFor, jsonResponseFor } from "../_shared/cors.ts";
import { trustedClientIp } from "../_shared/client-ip.ts";
import { verifyOtp } from "../_shared/verify-ge.ts";

const SHADOW_EMAIL_DOMAIN = Deno.env.get("SHADOW_EMAIL_DOMAIN") || "phone.autoswap.ge";

function shadowEmail(phone: string): string {
  return `p${phone.replace(/\D/g, "")}@${SHADOW_EMAIL_DOMAIN}`;
}

interface BoundRequest {
  phone: string;
  purpose: string;
  user_id: string | null;
}

function firstRow(data: unknown): BoundRequest | null {
  const row = Array.isArray(data) ? data[0] : data;
  return row && (row as BoundRequest).phone ? (row as BoundRequest) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeadersFor(req) });
  if (req.method !== "POST") return jsonResponseFor(req, { error: "Method not allowed" }, 405);

  let requestId: string | undefined;
  let code: string | undefined;
  try {
    const body = await req.json();
    requestId = typeof body?.request_id === "string" ? body.request_id.trim() : undefined;
    code = typeof body?.code === "string" ? body.code.trim() : undefined;
  } catch {
    return jsonResponseFor(req, { error: "Invalid JSON body" }, 400);
  }
  if (!requestId) return jsonResponseFor(req, { error: "request_id is required" }, 400);
  if (!code || !/^\d{4,8}$/.test(code)) return jsonResponseFor(req, { error: "A numeric code is required" }, 400);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: openData, error: openError } = await admin.rpc("otp_request_begin_verify", {
    p_request_id: requestId,
  });
  if (openError) {
    console.error("verify-otp: otp_request_begin_verify failed", openError.message);
    return jsonResponseFor(req, { error: "Verification unavailable" }, 500);
  }
  const bound = firstRow(openData);
  if (!bound) {
    return jsonResponseFor(req, { error: "This code is no longer valid. Request a new one." }, 410);
  }

  let attachUser: { id: string } | null = null;
  if (bound.purpose === "attach") {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: claims, error: authError } = await admin.auth.getUser(token);
    if (authError || !claims?.user || (bound.user_id && claims.user.id !== bound.user_id)) {
      return jsonResponseFor(req, { error: "Sign in before attaching a number" }, 401);
    }
    attachUser = { id: claims.user.id };
  }

  const result = await verifyOtp(requestId, code, trustedClientIp(req) ?? undefined, req.headers.get("user-agent") || undefined);
  if (!result.ok) {
    return jsonResponseFor(req, 
      { error: result.message || "Incorrect code", code: result.code || "INVALID_OTP_CODE" },
      400,
    );
  }

  const { data: claimData, error: claimError } = await admin.rpc("otp_request_claim", {
    p_request_id: requestId,
  });
  if (claimError) {
    console.error("verify-otp: otp_request_claim failed", claimError.message);
    return jsonResponseFor(req, { error: "Verification unavailable" }, 500);
  }
  if (!firstRow(claimData)) {
    return jsonResponseFor(req, { error: "This code has already been used." }, 410);
  }

  const phone = bound.phone;

  if (attachUser) {
    const { error: updateError } = await admin.auth.admin.updateUserById(attachUser.id, {
      phone,
      phone_confirm: true,
    });
    if (updateError) {
      console.error("verify-otp: attach failed", updateError.message);
      return jsonResponseFor(req, { error: updateError.message }, 400);
    }
    return jsonResponseFor(req, { status: "attached", phone });
  }

  const { data: existing, error: lookupError } = await admin.rpc("user_id_for_phone", { p_phone: phone });
  if (lookupError) {
    console.error("verify-otp: user_id_for_phone failed", lookupError.message);
    return jsonResponseFor(req, { error: "Verification unavailable" }, 500);
  }
  let userId = (existing as string | null) || null;
  const email = shadowEmail(phone);
  let linkEmail = email;

  if (!userId) {
    // The number is only ever recorded in service-role-only fields: the
    // GoTrue-verified phone column and app_metadata. It must NEVER go into
    // user_metadata - any signed-in client can rewrite that with
    // auth.updateUser({data:{...}}), and user_id_for_phone would then be
    // resolving logins against attacker-controlled data.
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      phone,
      phone_confirm: true,
      app_metadata: { verified_phone: phone },
    });
    if (createError || !created?.user) {
      // Fallback for projects that reject a phone on create (phone provider
      // off): the account gets no phone column, so app_metadata.verified_phone
      // is the only thing that keeps it resolvable on the next sign-in.
      const { data: retry, error: retryError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        app_metadata: { verified_phone: phone },
      });
      if (retryError || !retry?.user) {
        console.error("verify-otp: createUser failed", createError?.message, retryError?.message);
        return jsonResponseFor(req, { error: retryError?.message || "Could not create the account" }, 400);
      }
      userId = retry.user.id;
    } else {
      userId = created.user.id;
    }
  } else {
    const { data: current } = await admin.auth.admin.getUserById(userId);
    if (current?.user?.email) {
      linkEmail = current.user.email;
    } else {
      const { error: emailError } = await admin.auth.admin.updateUserById(userId, {
        email,
        email_confirm: true,
      });
      if (emailError) {
        console.error("verify-otp: shadow email attach failed", emailError.message);
        return jsonResponseFor(req, { error: "Could not complete sign-in" }, 500);
      }
    }
  }

  const { data: linked, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: linkEmail,
  });
  const tokenHash = linked?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    console.error("verify-otp: generateLink failed", linkError?.message);
    return jsonResponseFor(req, { error: "Could not complete sign-in" }, 500);
  }

  return jsonResponseFor(req, { status: "signed_in", token_hash: tokenHash });
});

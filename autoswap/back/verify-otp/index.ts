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

  const { data: openData, error: openError } = await admin.rpc("otp_request_begin_verify", {
    p_request_id: requestId,
  });
  if (openError) {
    console.error("verify-otp: otp_request_begin_verify failed", openError.message);
    return jsonResponse({ error: "Verification unavailable" }, 500);
  }
  const bound = firstRow(openData);
  if (!bound) {
    return jsonResponse({ error: "This code is no longer valid. Request a new one." }, 410);
  }

  let attachUser: { id: string } | null = null;
  if (bound.purpose === "attach") {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: claims, error: authError } = await admin.auth.getUser(token);
    if (authError || !claims?.user || (bound.user_id && claims.user.id !== bound.user_id)) {
      return jsonResponse({ error: "Sign in before attaching a number" }, 401);
    }
    attachUser = { id: claims.user.id };
  }

  const result = await verifyOtp(requestId, code, clientIp(req), req.headers.get("user-agent") || undefined);
  if (!result.ok) {
    return jsonResponse(
      { error: result.message || "Incorrect code", code: result.code || "INVALID_OTP_CODE" },
      400,
    );
  }

  const { data: claimData, error: claimError } = await admin.rpc("otp_request_claim", {
    p_request_id: requestId,
  });
  if (claimError) {
    console.error("verify-otp: otp_request_claim failed", claimError.message);
    return jsonResponse({ error: "Verification unavailable" }, 500);
  }
  if (!firstRow(claimData)) {
    return jsonResponse({ error: "This code has already been used." }, 410);
  }

  const phone = bound.phone;

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

  const { data: existing, error: lookupError } = await admin.rpc("user_id_for_phone", { p_phone: phone });
  if (lookupError) {
    console.error("verify-otp: user_id_for_phone failed", lookupError.message);
    return jsonResponse({ error: "Verification unavailable" }, 500);
  }
  let userId = (existing as string | null) || null;
  const email = shadowEmail(phone);
  let linkEmail = email;

  if (!userId) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      phone,
      phone_confirm: true,
      user_metadata: { phone },
    });
    if (createError || !created?.user) {
      const { data: retry, error: retryError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { phone },
      });
      if (retryError || !retry?.user) {
        console.error("verify-otp: createUser failed", createError?.message, retryError?.message);
        return jsonResponse({ error: retryError?.message || "Could not create the account" }, 400);
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
        return jsonResponse({ error: "Could not complete sign-in" }, 500);
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
    return jsonResponse({ error: "Could not complete sign-in" }, 500);
  }

  return jsonResponse({ status: "signed_in", token_hash: tokenHash });
});

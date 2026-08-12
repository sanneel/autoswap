// =============================================================
// verify.ge OTP client (SMS + WhatsApp)
//
// Closed-loop provider: `send` mints a code and returns a requestId, `verify`
// checks a code against that requestId. The app never handles the digits, so
// Supabase Auth cannot be the verifier any more — see verify_ge_auth.sql.
//
// Docs:  https://verify.ge/ka/docs
// Base:  https://api.verify.ge/api/v1     (override with VERIFY_GE_BASE_URL)
// Auth:  Authorization: Bearer <VERIFY_GE_API_KEY>
//
// Note the auth header: the published docs page says `X-API-Key`, and the API
// rejects that with "authorization header is required". Their own SDK sends
// `Authorization: Bearer`, which is what actually works — so the docs are
// wrong, not the key. Both headers are sent, since the extra one costs nothing
// and spares the next person this discovery.
//
// Responses come wrapped as { success, data } / { success, error }, but the
// unwrapping below tolerates a bare object too — the published docs and the
// SDK disagree on the envelope for some endpoints, and a login flow is a bad
// place to be strict about a shape that costs nothing to accept.
// =============================================================

export type VerifyChannel = "SMS" | "WHATSAPP";

const DEFAULT_BASE = "https://api.verify.ge/api/v1";
const TTL_SECONDS = 300; // provider accepts 60–600
const CODE_LENGTH = 6; // provider accepts 4–8
const TIMEOUT_MS = 15_000;

export class VerifyGeError extends Error {
  // Provider error code (e.g. INSUFFICIENT_BALANCE, RATE_LIMIT_EXCEEDED).
  code: string;
  status: number;
  retryable: boolean;
  constructor(code: string, message: string, status = 502, retryable = false) {
    super(message);
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

export function verifyGeConfigured(): boolean {
  return !!Deno.env.get("VERIFY_GE_API_KEY");
}

/** "whatsapp" / "WhatsApp" → "WHATSAPP"; anything else falls back to SMS. */
export function normalizeChannel(raw: unknown): VerifyChannel {
  return String(raw ?? "").trim().toUpperCase() === "WHATSAPP" ? "WHATSAPP" : "SMS";
}

function baseUrl(): string {
  return (Deno.env.get("VERIFY_GE_BASE_URL") || DEFAULT_BASE).replace(/\/$/, "");
}

async function call<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const key = Deno.env.get("VERIFY_GE_API_KEY");
  if (!key) throw new VerifyGeError("NOT_CONFIGURED", "verify.ge API key is not set", 500);

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "X-API-Key": key,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    // Network failure or timeout — retryable, the caller decides how to say so.
    throw new VerifyGeError("PROVIDER_UNAVAILABLE", String((err as Error)?.message || err), 503, true);
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = await res.json();
  } catch {
    /* leave empty; the status check below still fires */
  }

  const error = payload?.error as Record<string, unknown> | undefined;
  if (!res.ok || payload?.success === false || error) {
    throw new VerifyGeError(
      String(error?.code || "PROVIDER_ERROR"),
      String(error?.message || res.statusText || "verify.ge request failed"),
      res.status || 502,
      Boolean(error?.retryable),
    );
  }
  return (payload?.data ?? payload) as T;
}

export interface SendResult {
  requestId: string;
  expiresAt?: string;
  status?: string;
  /** What the provider actually used — not necessarily what we asked for. */
  channel?: VerifyChannel;
  /**
   * Where `channel` came from, so a wrong label can be told apart from a wrong
   * delivery: "send" = echoed by /otp/send, "status" = read back from
   * /otp/{id}, "none" = neither said, so the caller is assuming.
   */
  channelSource: "send" | "status" | "none";
  /** Raw diagnostic from the status lookup when it fails. */
  channelLookupError?: string;
}

/**
 * GET /otp/{requestId} — used only to read back the delivered channel when the
 * send response does not state it.
 *
 * This exists because asking for WHATSAPP does not guarantee WhatsApp: if the
 * account has no WhatsApp entitlement verify.ge falls back to SMS silently, and
 * a UI that then says "sent via WhatsApp" is simply lying to the user. Returns
 * undefined on any failure — a cosmetic label is never worth failing a login.
 */
async function fetchChannel(
  requestId: string,
): Promise<{ channel?: VerifyChannel; error?: string }> {
  const key = Deno.env.get("VERIFY_GE_API_KEY");
  if (!key) return { error: "no api key" };
  try {
    const res = await fetch(`${baseUrl()}/otp/${encodeURIComponent(requestId)}`, {
      headers: { Authorization: `Bearer ${key}`, "X-API-Key": key },
      signal: AbortSignal.timeout(5000),
    });
    const body = await res.text();
    if (!res.ok) return { error: `HTTP ${res.status} ${body.slice(0, 120)}` };
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(body);
    } catch {
      return { error: `unparseable: ${body.slice(0, 120)}` };
    }
    const data = (payload?.data ?? payload) as Record<string, unknown>;
    const raw = String(data?.channel ?? "").toUpperCase();
    if (raw === "WHATSAPP" || raw === "SMS") return { channel: raw as VerifyChannel };
    return { error: `no channel field; keys=${Object.keys(data || {}).join(",").slice(0, 120)}` };
  } catch (err) {
    return { error: String((err as Error)?.message || err).slice(0, 120) };
  }
}

/** POST /otp/send — returns the requestId the verify step is bound to. */
export async function sendOtp(
  phoneNumber: string,
  channel: VerifyChannel,
  idempotencyKey?: string,
): Promise<SendResult> {
  const data = await call<Record<string, unknown>>("/otp/send", {
    phoneNumber,
    channel,
    ttl: TTL_SECONDS,
    length: CODE_LENGTH,
    ...(idempotencyKey ? { idempotencyKey } : {}),
  });
  const requestId = String(data?.requestId || data?.request_id || "");
  if (!requestId) {
    throw new VerifyGeError("PROVIDER_ERROR", "verify.ge returned no requestId");
  }
  // Prefer the channel the provider reports over the one we requested; fall
  // back to a status lookup only when the send response is silent about it.
  const echoed = String(data?.channel ?? "").toUpperCase();
  let delivered: VerifyChannel | undefined;
  let channelSource: SendResult["channelSource"] = "none";
  let channelLookupError: string | undefined;
  if (echoed === "WHATSAPP" || echoed === "SMS") {
    delivered = echoed as VerifyChannel;
    channelSource = "send";
  } else {
    const looked = await fetchChannel(requestId);
    if (looked.channel) {
      delivered = looked.channel;
      channelSource = "status";
    } else {
      channelLookupError = looked.error;
    }
  }
  return {
    requestId,
    expiresAt: data?.expiresAt ? String(data.expiresAt) : undefined,
    status: data?.status ? String(data.status) : undefined,
    channel: delivered,
    channelSource,
    channelLookupError,
  };
}

/**
 * POST /otp/verify — true only when the provider confirms the code.
 *
 * Wrong codes come back as a thrown INVALID_OTP_CODE rather than
 * `success: false`, so both shapes are treated as a plain failure; only a
 * genuine `success: true` returns true. Attempt-count enforcement lives on
 * the provider side (OTP_MAX_ATTEMPTS), which is what caps brute force
 * against a single requestId.
 */
export async function verifyOtp(
  requestId: string,
  code: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ ok: boolean; code?: string; message?: string }> {
  try {
    const data = await call<Record<string, unknown>>("/otp/verify", {
      requestId,
      code,
      ...(ipAddress ? { ipAddress } : {}),
      ...(userAgent ? { userAgent } : {}),
    });
    return { ok: data?.success !== false, message: data?.message ? String(data.message) : undefined };
  } catch (err) {
    if (err instanceof VerifyGeError) {
      // A rejected code is an expected outcome, not an outage. Anything the
      // caller should react to differently (balance, outage) keeps its code.
      return { ok: false, code: err.code, message: err.message };
    }
    throw err;
  }
}

export type VerifyChannel = "SMS" | "WHATSAPP";

const DEFAULT_BASE = "https://api.verify.ge/api/v1";
const TTL_SECONDS = 300;
const CODE_LENGTH = 6;
const TIMEOUT_MS = 15_000;

export class VerifyGeError extends Error {
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
    throw new VerifyGeError("PROVIDER_UNAVAILABLE", String((err as Error)?.message || err), 503, true);
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = await res.json();
  } catch {
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
  channel?: VerifyChannel;
  channelSource: "send" | "status" | "none";
  channelLookupError?: string;
}

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
      return { ok: false, code: err.code, message: err.message };
    }
    throw err;
  }
}

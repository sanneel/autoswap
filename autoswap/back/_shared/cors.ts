// The five JWT-authenticated functions keep the permissive headers below: they
// authenticate with a bearer token rather than cookies and send no
// Access-Control-Allow-Credentials, so a hostile origin's fetch carries no
// ambient authority and a wildcard costs nothing there.
//
// request-otp / verify-otp are different: they are callable without a JWT and
// they spend real money on SMS, so an arbitrary page could use a visitor's
// browser to pump OTPs at a number. Those two use corsHeadersFor() below,
// which reflects only allow-listed origins.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Production origins. Override with ALLOWED_ORIGINS (comma-separated) for
// preview deployments - e.g. a *.pages.dev URL - or any extra domain.
const DEFAULT_ALLOWED_ORIGINS = [
  "https://autoswap.ge",
  "https://www.autoswap.ge",
];

// Developer machines; ports vary, so match the host rather than listing them.
const LOCALHOST_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function allowList(): string[] {
  const raw = (Deno.env.get("ALLOWED_ORIGINS") || "").trim();
  if (!raw) return DEFAULT_ALLOWED_ORIGINS;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function isAllowed(origin: string): boolean {
  if (!origin) return false;
  const list = allowList();
  if (list.includes("*")) return true;
  return list.includes(origin) || LOCALHOST_RE.test(origin);
}

/** CORS headers for the SMS-spending endpoints: reflect only allow-listed
 *  origins. A disallowed origin simply gets no Allow-Origin header, so the
 *  browser drops the response; non-browser callers are unaffected and still
 *  face the OTP rate limiter. */
export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = (req.headers.get("origin") || "").trim();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  if (isAllowed(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** jsonResponse for the origin-restricted endpoints. */
export function jsonResponseFor(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeadersFor(req), "Content-Type": "application/json" },
  });
}

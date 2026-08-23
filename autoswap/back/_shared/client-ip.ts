// Deriving a client IP that a caller cannot choose for itself.
//
// The rate limiter keys on this value, so a forgeable IP is worse than none: it
// lets one machine reset its own per-IP bucket at will AND invent enough
// "distinct" IPs to trip the distributed-rotation rule, which is a global
// cooldown - i.e. a denial-of-service lever handed to the attacker.
//
// X-Forwarded-For is APPENDED to by each hop, so its left-hand end is whatever
// the client sent and its right-hand end is what infrastructure observed. The
// old code read the LEFTMOST entry, which is exactly the attacker-controlled
// one, and only consulted x-real-ip when X-Forwarded-For was absent - so simply
// sending the header shadowed the more trustworthy value.
//
// Preference order here is: headers a proxy OVERWRITES (single-valued, so a
// client-sent copy is replaced rather than kept), then X-Forwarded-For counted
// from the RIGHT.
const OVERWRITTEN_HEADERS = [
  "cf-connecting-ip", // Cloudflare - replaces any client-supplied value
  "true-client-ip",
  "x-real-ip", // set by the nearest reverse proxy
  "fly-client-ip",
];

const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

function isIp(value: string): boolean {
  if (!value) return false;
  if (IPV4_RE.test(value)) return value.split(".").every((o) => Number(o) <= 255);
  return value.includes(":") && /^[0-9a-fA-F:.]+$/.test(value); // IPv6
}

/**
 * Number of proxies in front of this function that append to X-Forwarded-For.
 * 1 (the default) means the right-most entry was added by the nearest proxy and
 * is therefore trustworthy. Set TRUSTED_PROXY_HOPS if extra proxies are added
 * in front of Supabase, otherwise the wrong entry gets trusted.
 */
function trustedHops(): number {
  const n = Number(Deno.env.get("TRUSTED_PROXY_HOPS") || "1");
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

/** The caller's IP, or null when no trustworthy value can be established.
 *  Null is deliberate: otp_rate_check then skips the IP-keyed rules instead of
 *  enforcing them against data the caller chose, while the per-phone rule -
 *  which keys on the number being texted and cannot be spoofed - still holds. */
export function trustedClientIp(req: Request): string | null {
  for (const name of OVERWRITTEN_HEADERS) {
    const value = (req.headers.get(name) || "").trim();
    if (isIp(value)) return value;
  }

  const chain = (req.headers.get("x-forwarded-for") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!chain.length) return null;

  const index = chain.length - trustedHops();
  const candidate = chain[index >= 0 ? index : 0];
  return isIp(candidate) ? candidate : null;
}

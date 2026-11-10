// =============================================================
// Nexus AI — lightweight abuse protection
// Per-IP sliding-window rate limiting + same-origin check for the
// LLM / publish endpoints, preventing use as a free proxy.
// =============================================================

const hits = new Map<string, number[]>();

/** True if the key has exceeded `max` requests in `windowMs`. */
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  return false;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("true-client-ip") ||
    "unknown"
  );
}

/**
 * Reject cross-origin requests. Browsers send an `Origin` header on all
 * same-origin POSTs; external pages making cross-site calls (e.g. to use
 * this server as a free LLM proxy) will not match and are refused.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin") || "";
  if (!origin) return false;
  const host = req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return origin === `${proto}://${host}`;
}

/** Returns true and can be used as an early guard: respond 403 if cross-origin. */
export function originBlocked(req: Request): boolean {
  return !isSameOrigin(req);
}

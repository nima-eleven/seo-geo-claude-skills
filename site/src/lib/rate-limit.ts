/**
 * In-memory, per-IP rate limiting for the contact endpoint.
 *
 * Deliberately simple: a fixed window in module scope. That is sufficient for
 * a single-instance consulting site, where the goal is blunting a spam script
 * rather than coordinating limits across a fleet. If the site is ever deployed
 * across several always-on instances, swap the map for Upstash or Vercel KV —
 * the call signature is designed not to change.
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = recent[0];
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((WINDOW_MS - (now - oldest)) / 1000),
    };
  }

  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic sweep so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [key, timestamps] of hits) {
      if (timestamps.every((timestamp) => now - timestamp >= WINDOW_MS)) {
        hits.delete(key);
      }
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP from proxy headers. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}

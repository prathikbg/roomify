// Simple in-memory IP rate limiter.
// Good enough for a single-instance deployment (PM2 fork mode).
// If you scale to multiple workers/instances, swap this for Redis.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Defaults tuned for AI image generation (expensive call):
//   10 generations per IP per hour.
const DEFAULT_MAX = 10;
const DEFAULT_WINDOW_MS = 60 * 60 * 1000;

// Periodic cleanup so the Map doesn't grow unbounded on a long-running process.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(key);
    }
  }, CLEANUP_INTERVAL_MS).unref?.();
}

export type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; remaining: 0; resetAt: number; retryAfterMs: number };

export function rateLimit(
  key: string,
  max: number = DEFAULT_MAX,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  scheduleCleanup();
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  if (existing.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterMs: existing.resetAt - now,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: max - existing.count,
    resetAt: existing.resetAt,
  };
}

// Extract client IP from a Hono / fetch Request. Honors x-forwarded-for
// (set by Nginx/Cloudflare) and falls back to a stable "unknown" bucket.
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    // First entry is the original client when set by a trusted proxy chain.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

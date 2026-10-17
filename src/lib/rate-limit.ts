import { headers } from 'next/headers';

/**
 * Tiny fixed-window rate limiter held in process memory.
 * Good enough to blunt password guessing on a single instance; behind a load
 * balancer or on serverless, back it with a shared store (e.g. Redis) instead.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function consume(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();

  // opportunistic cleanup so the map can't grow without bound
  if (buckets.size > 5000) {
    buckets.forEach((b, k) => {
      if (b.resetAt <= now) buckets.delete(k);
    });
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

export function reset(key: string): void {
  buckets.delete(key);
}

/** Client IP as reported by the proxy. Only trustworthy when deployed behind a proxy that sets x-forwarded-for. */
export function clientIp(): string {
  const h = headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
}

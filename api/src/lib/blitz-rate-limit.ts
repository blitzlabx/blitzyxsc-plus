/**
 * Blitz rate limiter — per-IP sliding-window limiter.
 *
 * Uses an in-memory Map by default. On Cloudflare, swap in Durable Objects
 * or KV for distributed rate limiting.
 *
 * Author: Blitz (blitzlabx)
 */

import type { MiddlewareHandler } from 'hono';
import { BLITZ_DEFAULTS } from '../config';

interface RateBucket {
  count: number;
  resetAt: number;
}

// Simple in-memory store. On serverless platforms with cold starts,
// this resets per-instance — which is fine for the default 60 req/min.
// For distributed rate limiting, override with Cloudflare KV / Durable
// Objects / Upstash Redis.
const buckets = new Map<string, RateBucket>();

// Periodically purge expired buckets to prevent memory bloat.
let lastPurge = Date.now();
function purgeIfStale() {
  const now = Date.now();
  if (now - lastPurge > 60_000) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
    lastPurge = now;
  }
}

export const blitzRateLimit: MiddlewareHandler = async (c, next) => {
  if (c.env?.DISABLE_RATE_LIMIT === '1') {
    await next();
    return;
  }

  // Identify the client. Trust X-Forwarded-For when behind a known proxy
  // (Vercel/Cloudflare/Netlify all set this correctly).
  const xff = c.req.header('x-forwarded-for') || '';
  const ip = xff.split(',')[0].trim() || c.req.header('x-real-ip') || 'unknown';

  const perMin = parseInt(c.env?.RATE_LIMIT_PER_MIN || '', 10) || BLITZ_DEFAULTS.rateLimitPerMin;
  const windowMs = BLITZ_DEFAULTS.rateLimitWindowMs;

  purgeIfStale();

  const key = `${ip}`;
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  c.header('X-RateLimit-Limit', String(perMin));
  c.header('X-RateLimit-Remaining', String(Math.max(0, perMin - bucket.count)));
  c.header('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > perMin) {
    return c.json(
      {
        ok: false,
        error: 'RATE_LIMITED',
        message: `Rate limit exceeded (${perMin} requests/minute). Retry after ${Math.ceil((bucket.resetAt - now) / 1000)}s.`,
        retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
        requestId: c.get('requestId'),
      },
      429 as any,
    );
  }

  await next();
};

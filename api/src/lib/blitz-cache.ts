/**
 * Blitz cache helpers — set Cache-Control headers + optional KV caching.
 *
 * Author: Blitz (blitzlabx)
 */

import type { Context } from 'hono';

/**
 * Set standard Cache-Control headers on a response so that edge networks
 * (Cloudflare, Vercel Edge, Netlify Edge) can cache the response.
 *
 * Per-IP rate limiting still applies — caching just reduces upstream load.
 */
export function blitzSetCacheHeaders(c: Context, ttlSec: number): void {
  if (ttlSec <= 0) {
    c.header('Cache-Control', 'no-store, max-age=0');
    return;
  }
  c.header('Cache-Control', `public, max-age=${ttlSec}, s-maxage=${ttlSec}, stale-while-revalidate=${ttlSec * 2}`);
  c.header('Vary', 'Accept-Encoding');
}

/**
 * Wrap a fetch in a simple in-memory cache (per-instance on serverless).
 * For distributed caching, override with Cloudflare KV / Vercel KV /
 * Upstash Redis.
 */
const memoryCache = new Map<string, { body: string; expiresAt: number }>();

let lastCachePurge = Date.now();
function purgeCacheIfStale() {
  const now = Date.now();
  if (now - lastCachePurge > 5 * 60_000) {
    for (const [key, entry] of memoryCache) {
      if (entry.expiresAt < now) memoryCache.delete(key);
    }
    lastCachePurge = now;
  }
}

export async function blitzCacheGet<T>(key: string): Promise<T | null> {
  purgeCacheIfStale();
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  try {
    return JSON.parse(entry.body) as T;
  } catch {
    return null;
  }
}

export async function blitzCacheSet<T>(key: string, value: T, ttlSec: number): Promise<void> {
  if (ttlSec <= 0) return;
  memoryCache.set(key, {
    body: JSON.stringify(value),
    expiresAt: Date.now() + ttlSec * 1000,
  });
}

/**
 * Cache-aside helper: try memory cache first, fall back to fetcher.
 * The fetcher is only called on a miss.
 */
export async function blitzCacheAside<T>(
  key: string,
  ttlSec: number,
  fetcher: () => Promise<T>,
): Promise<{ value: T; cached: boolean }> {
  const cached = await blitzCacheGet<T>(key);
  if (cached !== null) return { value: cached, cached: true };
  const value = await fetcher();
  await blitzCacheSet(key, value, ttlSec);
  return { value, cached: false };
}

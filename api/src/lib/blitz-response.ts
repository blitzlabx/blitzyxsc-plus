/**
 * Blitz response helpers — wrap any data in a standard envelope.
 *
 * Author: Blitz (blitzlabx)
 */

import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

interface BlitzEnvelope<T> {
  ok: true;
  data: T;
  meta: {
    requestId: string;
    durationMs: number;
    cached: boolean;
    provider: string | null;
    timestamp: string;
  };
}

interface BlitzErrorEnvelope {
  ok: false;
  error: string;
  message: string;
  requestId: string;
  durationMs: number;
}

export function blitzOk<T>(c: Context, data: T, opts: { cached?: boolean; provider?: string | null } = {}): Response {
  const env: BlitzEnvelope<T> = {
    ok: true,
    data,
    meta: {
      requestId: c.get('requestId'),
      durationMs: Date.now() - c.get('startTime'),
      cached: opts.cached ?? false,
      provider: opts.provider ?? null,
      timestamp: new Date().toISOString(),
    },
  };
  return c.json(env);
}

export function blitzErr(c: Context, error: string, message: string, status: number): Response {
  const env: BlitzErrorEnvelope = {
    ok: false,
    error,
    message,
    requestId: c.get('requestId'),
    durationMs: Date.now() - c.get('startTime'),
  };
  return c.json(env, status as ContentfulStatusCode);
}

/**
 * Parse the `limit` query param, clamped to [1, maxLimit].
 */
export function blitzParseLimit(c: Context, defaultLimit = 20, maxLimit = 100): number {
  const raw = c.req.query('limit');
  if (!raw) return defaultLimit;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return defaultLimit;
  return Math.min(n, maxLimit);
}

/**
 * Strip the leading @ from a handle.
 */
export function blitzNormalizeHandle(handle: string): string {
  return handle.replace(/^@/, '').trim();
}

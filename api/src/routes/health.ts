/**
 * GET /health — service health check.
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { blitzOk } from '../lib/blitz-response';
import { BLITZ_META, BLITZ_DEFAULTS } from '../config';

export const healthRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

healthRoutes.get('/', (c) => {
  return blitzOk(c, {
    status: 'ok',
    service: BLITZ_META.name,
    version: BLITZ_META.version,
    uptime: process.uptime ? Math.round(process.uptime()) : null,
    timestamp: new Date().toISOString(),
    rateLimitPerMin: parseInt(c.env?.RATE_LIMIT_PER_MIN || '', 10) || BLITZ_DEFAULTS.rateLimitPerMin,
  });
});

healthRoutes.get('/live', (c) => c.json({ status: 'live' }));

healthRoutes.get('/ready', async (c) => {
  // Probe an upstream endpoint to confirm the FxTwitter provider is reachable.
  try {
    const resp = await fetch('https://api.fxtwitter.com/2/profile/elonmusk', {
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return c.json({ status: 'ready', upstream: 'reachable' });
  } catch (err) {
    return c.json(
      { status: 'degraded', upstream: 'unreachable', error: (err as Error).message },
      503,
    );
  }
});

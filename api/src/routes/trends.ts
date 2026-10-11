/**
 * GET /api/trends — fetch current trending topics.
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { blitzClient } from '../lib/blitz-client';
import { blitzCacheAside } from '../lib/blitz-cache';
import { blitzOk } from '../lib/blitz-response';
import { BLITZ_DEFAULTS } from '../config';

export const trendsRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

trendsRoutes.get('/', async (c) => {
  const cacheKey = 'trends:global';

  const { value: trends, cached } = await blitzCacheAside(
    cacheKey,
    BLITZ_DEFAULTS.cacheTtlTrendsSec,
    () => blitzClient().fetchTrends(),
  );

  c.header('Cache-Control', `public, max-age=${BLITZ_DEFAULTS.cacheTtlTrendsSec}, s-maxage=${BLITZ_DEFAULTS.cacheTtlTrendsSec}`);
  c.header('X-Cache', cached ? 'HIT' : 'MISS');

  return blitzOk(c, { count: trends.length, trends }, { cached, provider: 'fxtwitter' });
});

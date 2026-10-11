/**
 * GET /api/timeline/:handle — fetch a user's recent tweets.
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { blitzClient } from '../lib/blitz-client';
import { blitzCacheAside } from '../lib/blitz-cache';
import { blitzOk, blitzParseLimit, blitzNormalizeHandle } from '../lib/blitz-response';
import { BLITZ_DEFAULTS } from '../config';

export const timelineRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

timelineRoutes.get('/:handle', async (c) => {
  const handle = blitzNormalizeHandle(c.req.param('handle'));
  const limit = blitzParseLimit(c);
  const cacheKey = `timeline:${handle.toLowerCase()}:${limit}`;

  const { value: tweets, cached } = await blitzCacheAside(
    cacheKey,
    BLITZ_DEFAULTS.cacheTtlTimelineSec,
    () => blitzClient().fetchTimeline(handle, limit),
  );

  c.header('Cache-Control', `public, max-age=${BLITZ_DEFAULTS.cacheTtlTimelineSec}, s-maxage=${BLITZ_DEFAULTS.cacheTtlTimelineSec}`);
  c.header('X-Cache', cached ? 'HIT' : 'MISS');

  return blitzOk(c, { handle, count: tweets.length, tweets }, { cached, provider: 'fxtwitter' });
});

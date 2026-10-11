/**
 * GET /api/following/:handle — fetch a user's following list.
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { blitzClient } from '../lib/blitz-client';
import { blitzCacheAside } from '../lib/blitz-cache';
import { blitzOk, blitzParseLimit, blitzNormalizeHandle } from '../lib/blitz-response';
import { BLITZ_DEFAULTS } from '../config';

export const followingRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

followingRoutes.get('/:handle', async (c) => {
  const handle = blitzNormalizeHandle(c.req.param('handle'));
  const limit = blitzParseLimit(c);
  const cacheKey = `following:${handle.toLowerCase()}:${limit}`;

  const { value: users, cached } = await blitzCacheAside(
    cacheKey,
    BLITZ_DEFAULTS.cacheTtlFollowersSec,
    () => blitzClient().fetchFollowing(handle, limit),
  );

  c.header('Cache-Control', `public, max-age=${BLITZ_DEFAULTS.cacheTtlFollowersSec}, s-maxage=${BLITZ_DEFAULTS.cacheTtlFollowersSec}`);
  c.header('X-Cache', cached ? 'HIT' : 'MISS');

  return blitzOk(c, { handle, count: users.length, users }, { cached, provider: 'fxtwitter' });
});

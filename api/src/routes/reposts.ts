/**
 * GET /api/reposts/:id — fetch the list of users who reposted a tweet.
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { blitzClient } from '../lib/blitz-client';
import { blitzCacheAside } from '../lib/blitz-cache';
import { blitzOk } from '../lib/blitz-response';
import { BLITZ_DEFAULTS } from '../config';

export const repostsRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

repostsRoutes.get('/:id', async (c) => {
  const id = c.req.param('id').trim();
  const cacheKey = `reposts:${id}`;

  const { value: users, cached } = await blitzCacheAside(
    cacheKey,
    BLITZ_DEFAULTS.cacheTtlStatusSec,
    () => blitzClient().fetchReposts(id),
  );

  c.header('Cache-Control', `public, max-age=${BLITZ_DEFAULTS.cacheTtlStatusSec}, s-maxage=${BLITZ_DEFAULTS.cacheTtlStatusSec}`);
  c.header('X-Cache', cached ? 'HIT' : 'MISS');

  return blitzOk(c, { id, count: users.length, users }, { cached, provider: 'fxtwitter' });
});

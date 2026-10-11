/**
 * GET /api/profile/:handle — fetch a user profile.
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { blitzClient } from '../lib/blitz-client';
import { blitzCacheAside } from '../lib/blitz-cache';
import { blitzOk, blitzNormalizeHandle } from '../lib/blitz-response';
import { BLITZ_DEFAULTS } from '../config';

export const profileRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

profileRoutes.get('/:handle', async (c) => {
  const handle = blitzNormalizeHandle(c.req.param('handle'));
  const cacheKey = `profile:${handle.toLowerCase()}`;

  const { value: user, cached } = await blitzCacheAside(
    cacheKey,
    BLITZ_DEFAULTS.cacheTtlProfileSec,
    () => blitzClient().fetchProfile(handle),
  );

  c.header('Cache-Control', `public, max-age=${BLITZ_DEFAULTS.cacheTtlProfileSec}, s-maxage=${BLITZ_DEFAULTS.cacheTtlProfileSec}`);
  c.header('X-Cache', cached ? 'HIT' : 'MISS');

  return blitzOk(c, user, { cached, provider: 'fxtwitter' });
});

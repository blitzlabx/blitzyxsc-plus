/**
 * GET /api/about/:handle — fetch extended profile metadata.
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { blitzClient } from '../lib/blitz-client';
import { blitzCacheAside } from '../lib/blitz-cache';
import { blitzOk, blitzNormalizeHandle } from '../lib/blitz-response';
import { BLITZ_DEFAULTS } from '../config';

export const aboutRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

aboutRoutes.get('/:handle', async (c) => {
  const handle = blitzNormalizeHandle(c.req.param('handle'));
  const cacheKey = `about:${handle.toLowerCase()}`;

  const { value: about, cached } = await blitzCacheAside(
    cacheKey,
    BLITZ_DEFAULTS.cacheTtlProfileSec,
    () => blitzClient().fetchAbout(handle),
  );

  c.header('Cache-Control', `public, max-age=${BLITZ_DEFAULTS.cacheTtlProfileSec}, s-maxage=${BLITZ_DEFAULTS.cacheTtlProfileSec}`);
  c.header('X-Cache', cached ? 'HIT' : 'MISS');

  return blitzOk(c, about, { cached, provider: 'fxtwitter' });
});

/**
 * GET /api/status/:id — fetch a single tweet by ID.
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { blitzClient } from '../lib/blitz-client';
import { blitzCacheAside } from '../lib/blitz-cache';
import { blitzOk } from '../lib/blitz-response';
import { BLITZ_DEFAULTS } from '../config';

export const statusRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

statusRoutes.get('/:id', async (c) => {
  const id = c.req.param('id').trim();
  if (!/^\d{5,25}$/.test(id)) {
    return c.json(
      {
        ok: false,
        error: 'BAD_REQUEST',
        message: 'Tweet ID must be a numeric string (5-25 digits).',
        requestId: c.get('requestId'),
      },
      400,
    );
  }

  const cacheKey = `status:${id}`;
  const { value: tweet, cached } = await blitzCacheAside(
    cacheKey,
    BLITZ_DEFAULTS.cacheTtlStatusSec,
    () => blitzClient().fetchStatus(id),
  );

  c.header('Cache-Control', `public, max-age=${BLITZ_DEFAULTS.cacheTtlStatusSec}, s-maxage=${BLITZ_DEFAULTS.cacheTtlStatusSec}`);
  c.header('X-Cache', cached ? 'HIT' : 'MISS');

  return blitzOk(c, tweet, { cached, provider: 'fxtwitter' });
});

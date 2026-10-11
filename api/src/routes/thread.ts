/**
 * GET /api/thread/:id — fetch an unrolled thread.
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { blitzClient } from '../lib/blitz-client';
import { blitzCacheAside } from '../lib/blitz-cache';
import { blitzOk } from '../lib/blitz-response';
import { BLITZ_DEFAULTS } from '../config';

export const threadRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

threadRoutes.get('/:id', async (c) => {
  const id = c.req.param('id').trim();
  const cacheKey = `thread:${id}`;

  const { value: thread, cached } = await blitzCacheAside(
    cacheKey,
    BLITZ_DEFAULTS.cacheTtlConversationSec,
    () => blitzClient().fetchThread(id),
  );

  c.header('Cache-Control', `public, max-age=${BLITZ_DEFAULTS.cacheTtlConversationSec}, s-maxage=${BLITZ_DEFAULTS.cacheTtlConversationSec}`);
  c.header('X-Cache', cached ? 'HIT' : 'MISS');

  return blitzOk(c, thread, { cached, provider: 'fxtwitter' });
});

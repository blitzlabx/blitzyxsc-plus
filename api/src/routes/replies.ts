/**
 * GET /api/replies/:id — fetch the conversation (root + thread + replies).
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { blitzClient } from '../lib/blitz-client';
import { blitzCacheAside } from '../lib/blitz-cache';
import { blitzOk } from '../lib/blitz-response';
import { BLITZ_DEFAULTS } from '../config';

export const repliesRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

repliesRoutes.get('/:id', async (c) => {
  const id = c.req.param('id').trim();
  const cacheKey = `replies:${id}`;

  const { value: conv, cached } = await blitzCacheAside(
    cacheKey,
    BLITZ_DEFAULTS.cacheTtlConversationSec,
    () => blitzClient().fetchReplies(id),
  );

  c.header('Cache-Control', `public, max-age=${BLITZ_DEFAULTS.cacheTtlConversationSec}, s-maxage=${BLITZ_DEFAULTS.cacheTtlConversationSec}`);
  c.header('X-Cache', cached ? 'HIT' : 'MISS');

  return blitzOk(c, conv, { cached, provider: 'fxtwitter' });
});

/**
 * GET /api/search/users?q=... — search users via typeahead.
 *
 * Note: tweet search is not supported without an authenticated account.
 * Only user search is available via FxTwitter's typeahead.
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { blitzClient } from '../lib/blitz-client';
import { blitzCacheAside } from '../lib/blitz-cache';
import { blitzOk } from '../lib/blitz-response';
import { BLITZ_DEFAULTS } from '../config';

export const searchRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

searchRoutes.get('/users', async (c) => {
  const q = (c.req.query('q') || '').trim();
  if (!q) {
    return c.json(
      {
        ok: false,
        error: 'BAD_REQUEST',
        message: 'Missing required query param: q (the search query).',
        requestId: c.get('requestId'),
      },
      400,
    );
  }
  if (q.length > 100) {
    return c.json(
      {
        ok: false,
        error: 'BAD_REQUEST',
        message: 'Query must be ≤ 100 characters.',
        requestId: c.get('requestId'),
      },
      400,
    );
  }

  const cacheKey = `search:users:${q.toLowerCase()}`;
  const { value: users, cached } = await blitzCacheAside(
    cacheKey,
    60,
    () => blitzClient().searchUsers(q),
  );

  c.header('Cache-Control', 'public, max-age=60, s-maxage=60');
  c.header('X-Cache', cached ? 'HIT' : 'MISS');

  return blitzOk(c, { query: q, count: users.length, users }, { cached, provider: 'fxtwitter' });
});

// Friendly alias
searchRoutes.get('/', (c) => {
  const q = c.req.query('q');
  if (!q) {
    return c.json(
      {
        ok: false,
        error: 'BAD_REQUEST',
        message: 'Use /api/search/users?q=... — tweet search is not supported without an account.',
        hint: 'Only user search (typeahead) is available.',
        requestId: c.get('requestId'),
      },
      400,
    );
  }
  // Forward to /users handler
  return c.redirect(`/api/search/users?q=${encodeURIComponent(q)}`, 307);
});

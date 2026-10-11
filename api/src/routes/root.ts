/**
 * GET / — root index. Lists all endpoints.
 *
 * Author: Blitz (blitzlabx)
 */

import { Hono } from 'hono';
import type { Bindings, Vars } from '../app';
import { BLITZ_META, BLITZ_ENDPOINTS, BLITZ_DEFAULTS } from '../config';
import { blitzOk } from '../lib/blitz-response';

export const rootRoutes = new Hono<{ Bindings: Bindings; Variables: Vars }>();

rootRoutes.get('/', (c) => {
  return blitzOk(c, {
    name: BLITZ_META.name,
    version: BLITZ_META.version,
    tagline: BLITZ_META.tagline,
    author: `${BLITZ_META.author} (@${BLITZ_META.handle})`,
    creatorLabel: BLITZ_META.creatorLabel,
    license: BLITZ_META.license,
    homepage: BLITZ_META.website,
    donation: BLITZ_META.donation,
    github: BLITZ_META.github,
    rateLimit: `${BLITZ_DEFAULTS.rateLimitPerMin} req/min per IP`,
    endpoints: BLITZ_ENDPOINTS.map((e) => ({
      method: e.method,
      path: e.path,
      summary: e.summary,
      cacheTtlSec: e.cacheTtlSec,
      params: e.params,
    })),
    usage: {
      profile: 'GET /api/profile/elonmusk',
      status: 'GET /api/status/2109205119480758676',
      timeline: 'GET /api/timeline/NASA?limit=10',
      replies: 'GET /api/replies/2109205119480758676',
      trends: 'GET /api/trends',
      search: 'GET /api/search/users?q=blitzlabx',
    },
  });
});

rootRoutes.get('/robots.txt', (c) =>
  c.text('User-agent: *\nAllow: /\nDisallow: /api/\n'),
);

rootRoutes.get('/favicon.ico', (c) => c.body(null, 204));

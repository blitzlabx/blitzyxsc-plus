/**
 * blitzyxsc-plus — Hono app definition (framework-agnostic).
 *
 * This file is the single source of truth for the API surface. Every
 * runtime adapter (Vercel / Cloudflare / Netlify / Node / Deno / Bun)
 * imports `app` from here and binds it to its own HTTP entry point.
 *
 * Author: Blitz (blitzlabx)
 * License: MIT
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { cache } from 'hono/cache';
import { poweredBy } from 'hono/powered-by';
import { secureHeaders } from 'hono/secure-headers';
import { jwt } from 'hono/jwt';

import { profileRoutes } from './routes/profile';
import { statusRoutes } from './routes/status';
import { timelineRoutes } from './routes/timeline';
import { repliesRoutes } from './routes/replies';
import { threadRoutes } from './routes/thread';
import { trendsRoutes } from './routes/trends';
import { searchRoutes } from './routes/search';
import { followersRoutes } from './routes/followers';
import { followingRoutes } from './routes/following';
import { mediaRoutes } from './routes/media';
import { mentionsRoutes } from './routes/mentions';
import { aboutRoutes } from './routes/about';
import { repostsRoutes } from './routes/reposts';
import { healthRoutes } from './routes/health';
import { rootRoutes } from './routes/root';

import { blitzRateLimit } from './lib/blitz-rate-limit';
import { blitzErrorMiddleware } from './lib/blitz-errors';
import { blitzCache } from './lib/blitz-cache';

export type Bindings = {
  // Cloudflare KV / Workers KV (optional)
  CACHE?: KVNamespace;
  // Optional JWT secret for authenticated tier (not required for no-auth usage)
  JWT_SECRET?: string;
  // Per-IP rate limit (requests per minute). Default 60.
  RATE_LIMIT_PER_MIN?: string;
  // Upstream provider override
  DEFAULT_PROVIDER?: 'fxtwitter' | 'syndication' | 'graphql';
  // Disable rate limiting (for dev or trusted proxies)
  DISABLE_RATE_LIMIT?: string;
};

export type Vars = {
  requestId: string;
  startTime: number;
};

/**
 * Build the Hono app. This function is called by every runtime adapter
 * so the same app definition works on Vercel / Cloudflare / Netlify /
 * Node / Deno / Bun.
 */
export function createApp(): Hono<{ Bindings: Bindings; Variables: Vars }> {
  const app = new Hono<{ Bindings: Bindings; Variables: Vars }>();

  // --- Global middleware ---

  app.use('*', poweredBy());
  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400,
    }),
  );
  app.use(secureHeaders());
  app.use('*', async (c, next) => {
    c.set('requestId', crypto.randomUUID());
    c.set('startTime', Date.now());
    await next();
  });

  // Request logger (only enabled in dev / when DEBUG=1)
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === '1') {
    app.use('*', logger());
  }

  // Blitz rate limiter — 60 req/min per IP by default.
  app.use('/api/*', blitzRateLimit);

  // Blitz cache — 60s for /api/profile, 30s for /api/timeline, etc.
  // (Per-route cache headers are set in the route handlers below.)

  // --- Error handler ---
  app.onError(blitzErrorMiddleware);

  // --- 404 handler ---
  app.notFound((c) =>
    c.json(
      {
        ok: false,
        error: 'NOT_FOUND',
        message: `${c.req.method} ${c.req.path} is not a valid blitzyxsc-plus endpoint.`,
        hint: 'See GET / for the full route listing.',
        requestId: c.get('requestId'),
      },
      404,
    ),
  );

  // --- Routes ---
  app.route('/', rootRoutes);
  app.route('/health', healthRoutes);
  app.route('/api/profile', profileRoutes);
  app.route('/api/status', statusRoutes);
  app.route('/api/timeline', timelineRoutes);
  app.route('/api/replies', repliesRoutes);
  app.route('/api/thread', threadRoutes);
  app.route('/api/trends', trendsRoutes);
  app.route('/api/search', searchRoutes);
  app.route('/api/followers', followersRoutes);
  app.route('/api/following', followingRoutes);
  app.route('/api/media', mediaRoutes);
  app.route('/api/mentions', mentionsRoutes);
  app.route('/api/about', aboutRoutes);
  app.route('/api/reposts', repostsRoutes);

  return app;
}

export const app = createApp();
export default app;

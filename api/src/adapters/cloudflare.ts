/**
 * Cloudflare Workers/Pages adapter.
 *
 * Usage:
 *   1. wrangler.toml:
 *      name = "blitzyxsc-plus"
 *      main = "src/adapters/cloudflare.ts"
 *      compatibility_date = "2024-10-01"
 *
 * Author: Blitz (blitzlabx)
 */

import { app } from '../app';

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
};

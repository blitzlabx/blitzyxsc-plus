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

// ExecutionContext is a Cloudflare Workers global. Declare a minimal
// fallback type so this file typechecks on Node/Bun/Deno too.
type ExecutionContextLike = {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException?(): void;
};

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContextLike): Promise<Response> {
    return app.fetch(request, env, ctx as any);
  },
};

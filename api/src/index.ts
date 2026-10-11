/**
 * blitzyxsc-plus — main entry point.
 *
 * This file selects the appropriate runtime adapter based on the
 * JavaScript runtime environment. On Bun, it uses Bun.serve(). On Node,
 * it uses @hono/node-server. On Cloudflare Workers, it exports a
 * default fetch handler. On Vercel/Netlify, it uses the adapter
 * from `api/index.ts`.
 *
 * Run directly with:
 *   - bun src/index.ts        (Bun runtime)
 *   - npx tsx src/index.ts    (Node runtime)
 *   - deno run --allow-net src/index.ts  (Deno runtime)
 *
 * Author: Blitz (blitzlabx)
 * License: MIT
 */

import { app } from './app';
import { BLITZ_META } from './config';

// Detect runtime
const runtime = detectRuntime();

if (runtime === 'bun') {
  // Bun native — fastest, no extra deps
  const port = parseInt(process.env.PORT || '8787', 10);
  const hostname = process.env.HOST || '0.0.0.0';
  console.log(blitzBanner(port));
  Bun.serve({ port, hostname, fetch: app.fetch });
} else if (runtime === 'node') {
  // Node — use @hono/node-server
  import('@hono/node-server').then(({ serve }) => {
    const port = parseInt(process.env.PORT || '8787', 10);
    console.log(blitzBanner(port));
    serve({ fetch: app.fetch, port, hostname: '0.0.0.0' });
  });
} else if (runtime === 'deno') {
  // Deno native
  const port = parseInt((Deno as any).env.get('PORT') || '8787', 10);
  console.log(blitzBanner(port));
  Deno.serve({ port, hostname: '0.0.0.0' }, app.fetch);
} else {
  // Fallback: assume Node + tsx — try @hono/node-server
  import('@hono/node-server').then(({ serve }) => {
    const port = parseInt(process.env.PORT || '8787', 10);
    console.log(blitzBanner(port));
    serve({ fetch: app.fetch, port, hostname: '0.0.0.0' });
  });
}

function detectRuntime(): 'bun' | 'node' | 'deno' {
  // @ts-ignore
  if (typeof Bun !== 'undefined') return 'bun';
  // @ts-ignore
  if (typeof Deno !== 'undefined') return 'deno';
  return 'node';
}

function blitzBanner(port: number): string {
  const lines = [
    '',
    '  ██████  ██ ██   ██ ███████ ██      ██      ███████ ███████ ██   ██ ███████',
    ' ██░░░░  ░██░██  ░██░██░░░░░██░     ░██     ██░░░░░░░██░░░░░░██  ░██░██░░░░░██',
    ' ██  █████░██░██  ░██░█████  ██   ██░██     ░█████  ░░░██░  ░██ ░██ ░█████',
    '██░░  ░░██░██░██  ░██░██░░░  ██  ██░░██     ░░░░░██   ░██    ░██░██ ░██░░░░',
    '██  ██████░██░██  ░██░██████░██ █████░██     ██████   ░██    ░███░  ░██████',
    '░░  ░░░░░ ░░░░██  ░██░░░░░░░░░░ ░░░░░░░░     ░░░░░░   ░░     ░░░    ░░░░░░░',
    '',
    `  ${BLITZ_META.creatorLabel}`,
    `  v${BLITZ_META.version} • ${BLITZ_META.license} • by ${BLITZ_META.author} (@${BLITZ_META.handle})`,
    '',
    `  → http://localhost:${port}`,
    `  → docs: https://github.com/blitzlabx/blitzyxsc-plus`,
    `  → donate: ${BLITZ_META.donation}`,
    '',
    `  Routes:`,
    `    GET /health`,
    `    GET /api/profile/:handle`,
    `    GET /api/status/:id`,
    `    GET /api/timeline/:handle?limit=20`,
    `    GET /api/replies/:id`,
    `    GET /api/thread/:id`,
    `    GET /api/trends`,
    `    GET /api/search/users?q=...`,
    `    GET /api/followers/:handle`,
    `    GET /api/following/:handle`,
    `    GET /api/media/:handle`,
    `    GET /api/mentions/:handle`,
    `    GET /api/about/:handle`,
    `    GET /api/reposts/:id`,
    '',
  ];
  return lines.join('\n');
}

export { app };

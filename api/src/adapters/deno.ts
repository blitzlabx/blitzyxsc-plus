/**
 * Deno adapter — for self-hosting on Deno Deploy or any Deno-capable host.
 *
 * Run: deno run --allow-net --allow-env src/adapters/deno.ts
 *
 * Author: Blitz (blitzlabx)
 */

import { app } from '../app';

const DenoNS = (globalThis as any).Deno || ({} as any);
const port = parseInt(DenoNS.env?.get?.('PORT') || '8787', 10);
const hostname = DenoNS.env?.get?.('HOST') || '0.0.0.0';

DenoNS.serve?.({ port, hostname }, app.fetch);

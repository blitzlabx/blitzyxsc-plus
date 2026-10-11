/**
 * Deno adapter — for self-hosting on Deno Deploy or any Deno-capable host.
 *
 * Run: deno run --allow-net --allow-env src/adapters/deno.ts
 *
 * Author: Blitz (blitzlabx)
 */

import { app } from '../app';

const port = parseInt(Deno.env.get('PORT') || '8787', 10);
const hostname = Deno.env.get('HOST') || '0.0.0.0';

Deno.serve({ port, hostname }, app.fetch);

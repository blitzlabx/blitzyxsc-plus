/**
 * Node adapter — for self-hosting on a VM, Docker, or any Node-capable host.
 *
 * Run: npx tsx src/adapters/node.ts
 *
 * Author: Blitz (blitzlabx)
 */

import { serve } from '@hono/node-server';
import { app } from '../app';

const port = parseInt(process.env.PORT || '8787', 10);
const hostname = process.env.HOST || '0.0.0.0';

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(`blitzyxsc-plus running on http://${info.address}:${info.port}`);
});

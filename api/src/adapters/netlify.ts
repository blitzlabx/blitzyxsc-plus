/**
 * Netlify Functions adapter.
 *
 * Usage:
 *   1. netlify.toml:
 *      [functions]
 *      directory = "netlify/functions"
 *      node_bundler = "esbuild"
 *
 *   2. Place this file at: netlify/functions/api/index.ts
 *
 * Author: Blitz (blitzlabx)
 */

import { handle } from 'hono/netlify';
import { app } from '../app';

export default handle(app);

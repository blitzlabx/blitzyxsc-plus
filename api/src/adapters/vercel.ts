/**
 * Vercel adapter — handles /api/* routes in Vercel's serverless functions.
 *
 * Usage:
 *   1. Copy this folder to your Vercel project root.
 *   2. Set: vercel.json { "rewrites": [{ "source": "/(.*)", "destination": "/api" }] }
 *
 * Author: Blitz (blitzlabx)
 */

import { handle } from 'hono/vercel';
import { app } from '../app';

export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);

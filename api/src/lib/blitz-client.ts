/**
 * Blitz client — singleton instance of the blitzyxsc client used by
 * every route handler. Tunable via env vars.
 *
 * Author: Blitz (blitzlabx)
 */

import { Blitzyxsc } from './blitzyxsc/client';
import { BLITZ_DEFAULTS, BlitzProvider } from '../config';

let _blitzClient: Blitzyxsc | null = null;
let _blitzProviders: BlitzProvider[] | null = null;

function resolveProviders(): BlitzProvider[] {
  if (_blitzProviders) return _blitzProviders;
  const fromEnv = (process.env.BLITZ_PROVIDERS || 'fxtwitter,syndication').split(',') as BlitzProvider[];
  _blitzProviders = fromEnv;
  return _blitzProviders;
}

export function blitzClient(): Blitzyxsc {
  if (!_blitzClient) {
    _blitzClient = new Blitzyxsc({
      providers: resolveProviders(),
      timeoutMs: parseInt(process.env.BLITZ_TIMEOUT_MS || '', 10) || BLITZ_DEFAULTS.timeoutMs,
      retry: parseInt(process.env.BLITZ_RETRY || '', 10) || BLITZ_DEFAULTS.retry,
    });
  }
  return _blitzClient;
}

/**
 * Reset the singleton — useful for tests.
 */
export function blitzResetClient(): void {
  _blitzClient = null;
  _blitzProviders = null;
}

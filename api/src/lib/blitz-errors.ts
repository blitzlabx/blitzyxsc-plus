/**
 * Blitz error handler — converts blitzyxsc errors into JSON responses.
 *
 * Author: Blitz (blitzlabx)
 */

import type { Context } from 'hono';
import {
  BlitzyxscError,
  BlitzyxscAuthError,
  BlitzyxscNotFoundError,
  BlitzyxscRateLimitError,
  BlitzyxscNetworkError,
  BlitzyxscParseError,
} from './blitzyxsc/exceptions';

function statusFor(err: BlitzyxscError): number {
  if (err instanceof BlitzyxscNotFoundError) return 404;
  if (err instanceof BlitzyxscRateLimitError) return 429;
  if (err instanceof BlitzyxscAuthError) return 401;
  if (err instanceof BlitzyxscNetworkError) return 502;
  if (err instanceof BlitzyxscParseError) return 502;
  return 500;
}

export const blitzErrorMiddleware = (err: Error, c: Context) => {
  if (err instanceof BlitzyxscError) {
    const status = statusFor(err);
    // Convert "BlitzyxscNotFoundError" → "NOT_FOUND",
    // "BlitzyxscRateLimitError" → "RATE_LIMITED", etc.
    const rawName = err.constructor.name
      .replace('Blitzyxsc', '')
      .replace('Error', '');
    const error_code = rawName
      .replace(/([A-Z])/g, '_$1')
      .replace(/^_/, '')
      .toUpperCase()
      .replace('RATE_LIMIT', 'RATE_LIMITED');
    return c.json(
      {
        ok: false,
        error: error_code,
        message: err.message,
        provider: err.provider,
        statusCode: err.statusCode,
        url: err.url,
        requestId: c.get('requestId'),
        // Helpful for clients debugging — how long the request took.
        durationMs: Date.now() - c.get('startTime'),
      },
      status,
    );
  }
  // Unknown error.
  return c.json(
    {
      ok: false,
      error: 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred.',
      requestId: c.get('requestId'),
      durationMs: Date.now() - c.get('startTime'),
    },
    500,
  );
};

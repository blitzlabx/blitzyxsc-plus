/**
 * blitzyxsc.utils — HTTP plumbing shared across providers (Node.js fetch based).
 */

import {
    DEFAULT_HEADERS,
    DEFAULT_TIMEOUT_MS,
    DEFAULT_RETRY,
    RATE_LIMIT_BACKOFF_MS,
} from './constants';
import {
    BlitzyxscError,
    BlitzyxscNetworkError,
    BlitzyxscNotFoundError,
    BlitzyxscRateLimitError,
} from './exceptions';

export interface HttpResponse {
    statusCode: number;
    body: string;
    url: string;
    headers: Record<string, string>;
}

export interface HttpGetOptions {
    params?: Record<string, string | number | undefined>;
    headers?: Record<string, string>;
    timeoutMs?: number;
    retry?: number;
    provider?: string;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function buildUrl(base: string, params?: HttpGetOptions['params']): string {
    if (!params) return base;
    const entries = Object.entries(params).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return base;
    const search = entries
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
    return base + (base.includes('?') ? '&' : '?') + search;
}

/**
 * HTTP GET with retry + rate-limit backoff. Uses the global `fetch`
 * (Node 18+ / Bun / Den / browser). Falls back to native Node https if
 * fetch is unavailable (rare on modern runtimes).
 */
export async function httpGet(url: string, opts: HttpGetOptions = {}): Promise<HttpResponse> {
    const headers: Record<string, string> = {
        ...DEFAULT_HEADERS,
        ...(opts.headers || {}),
    };
    if (!headers['User-Agent']) {
        headers['User-Agent'] = DEFAULT_HEADERS['User-Agent'];
    }
    const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const retry = opts.retry ?? DEFAULT_RETRY;
    const provider = opts.provider ?? 'unknown';
    const fullUrl = buildUrl(url, opts.params);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retry; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const resp = await fetch(fullUrl, {
                method: 'GET',
                headers,
                signal: controller.signal,
                redirect: 'follow',
            });
            clearTimeout(timer);
            const body = await resp.text();
            const statusCode = resp.status;
            if (statusCode === 429) {
                lastError = new BlitzyxscRateLimitError(
                    `[${provider}] HTTP 429 (rate limit) for ${fullUrl}`,
                    { statusCode, url: fullUrl, provider },
                );
                await sleep(RATE_LIMIT_BACKOFF_MS * Math.pow(2, attempt));
                continue;
            }
            if (statusCode === 404) {
                throw new BlitzyxscNotFoundError(
                    `[${provider}] HTTP 404 for ${fullUrl}`,
                    { statusCode, url: fullUrl, provider, raw: body.slice(0, 500) },
                );
            }
            if (statusCode >= 500 && attempt < retry) {
                lastError = new BlitzyxscError(
                    `[${provider}] HTTP ${statusCode} for ${fullUrl}`,
                    { statusCode, url: fullUrl, provider },
                );
                await sleep(500 * (attempt + 1));
                continue;
            }
            if (statusCode >= 400) {
                throw new BlitzyxscError(
                    `[${provider}] HTTP ${statusCode} for ${fullUrl}`,
                    { statusCode, url: fullUrl, provider, raw: body.slice(0, 500) },
                );
            }
            const respHeaders: Record<string, string> = {};
            resp.headers.forEach((value, key) => {
                respHeaders[key] = value;
            });
            return { statusCode, body, url: fullUrl, headers: respHeaders };
        } catch (err: any) {
            clearTimeout(timer);
            if (err instanceof BlitzyxscError) {
                throw err;
            }
            if (err?.name === 'AbortError') {
                lastError = new BlitzyxscNetworkError(
                    `[${provider}] Timeout after ${timeoutMs}ms for ${fullUrl}`,
                    { url: fullUrl, provider },
                );
            } else {
                lastError = new BlitzyxscNetworkError(
                    `[${provider}] Network error for ${fullUrl}: ${err?.message || String(err)}`,
                    { url: fullUrl, provider },
                );
            }
            if (attempt < retry) {
                await sleep(500 * (attempt + 1));
                continue;
            }
        }
    }

    if (lastError instanceof BlitzyxscError) {
        throw lastError;
    }
    throw new BlitzyxscError(
        `[${provider}] Failed after ${retry + 1} attempts: ${fullUrl}`,
        { url: fullUrl, provider },
    );
}

export interface HttpPostOptions {
    body?: string | Uint8Array;
    headers?: Record<string, string>;
    timeoutMs?: number;
    provider?: string;
}

export async function httpPost(url: string, opts: HttpPostOptions = {}): Promise<HttpResponse> {
    const headers: Record<string, string> = {
        ...DEFAULT_HEADERS,
        ...(opts.headers || {}),
    };
    if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    const provider = opts.provider ?? 'unknown';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers,
            body: opts.body,
            signal: controller.signal,
            redirect: 'follow',
        });
        clearTimeout(timer);
        const body = await resp.text();
        if (resp.status >= 400) {
            throw new BlitzyxscError(
                `[${provider}] HTTP ${resp.status} on POST ${url}`,
                { statusCode: resp.status, url, provider, raw: body.slice(0, 500) },
            );
        }
        const respHeaders: Record<string, string> = {};
        resp.headers.forEach((value, key) => {
            respHeaders[key] = value;
        });
        return { statusCode: resp.status, body, url, headers: respHeaders };
    } catch (err: any) {
        clearTimeout(timer);
        if (err instanceof BlitzyxscError) {
            throw err;
        }
        throw new BlitzyxscNetworkError(
            `[${provider}] Network error on POST ${url}: ${err?.message || String(err)}`,
            { url, provider },
        );
    }
}

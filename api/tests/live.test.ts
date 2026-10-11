/**
 * blitzyxsc-plus live smoke tests.
 *
 * Run: bun test tests/live.test.ts
 *
 * Spins up the Hono app via app.request() (no actual HTTP server needed)
 * and exercises every endpoint against the real FxTwitter + Syndication
 * upstreams.
 *
 * Author: Blitz (blitzlabx)
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import { app } from '../src/app';

const BASE = 'http://test.local';

describe('blitzyxsc-plus — root index', () => {
  it('GET / — returns API index with all endpoints', async () => {
    const res = await app.request(`${BASE}/`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.name).toBe('blitzyxsc-plus');
    expect(body.data.author).toContain('Blitz');
    expect(body.data.author).toContain('blitzlabx');
    expect(body.data.donation).toContain('flutterwave.com');
    expect(body.data.endpoints.length).toBeGreaterThan(10);
    expect(body.data.endpoints[0].path).toMatch(/\/api\/.+/);
  });

  it('GET /robots.txt — returns robots', async () => {
    const res = await app.request(`${BASE}/robots.txt`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('User-agent');
  });

  it('GET /favicon.ico — returns 204', async () => {
    const res = await app.request(`${BASE}/favicon.ico`);
    expect(res.status).toBe(204);
  });
});

describe('blitzyxsc-plus — health', () => {
  it('GET /health — returns ok status', async () => {
    const res = await app.request(`${BASE}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe('ok');
    expect(body.data.service).toBe('blitzyxsc-plus');
  });

  it('GET /health/live — returns live status', async () => {
    const res = await app.request(`${BASE}/health/live`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('live');
  });
});

describe('blitzyxsc-plus — 404 handling', () => {
  it('GET /nonexistent — returns 404 JSON envelope', async () => {
    const res = await app.request(`${BASE}/nonexistent`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('NOT_FOUND');
    expect(body.message).toContain('/nonexistent');
    expect(body.requestId).toBeDefined();
  });
});

describe('blitzyxsc-plus — /api/profile/:handle', () => {
  it('GET /api/profile/elonmusk — returns profile data', async () => {
    const res = await app.request(`${BASE}/api/profile/elonmusk`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.screenName.toLowerCase()).toBe('elonmusk');
    expect(body.data.followers).toBeGreaterThan(1_000_000);
    expect(body.meta.provider).toBe('fxtwitter');
    expect(body.meta.requestId).toBeDefined();
    expect(res.headers.get('x-cache')).toMatch(/^(HIT|MISS)$/);
  }, 30_000);

  it('GET /api/profile/@elonmusk — strips @ prefix', async () => {
    const res = await app.request(`${BASE}/api/profile/@elonmusk`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.screenName.toLowerCase()).toBe('elonmusk');
  }, 30_000);

  it('GET /api/profile/nonexistent_xyz123 — returns 404', async () => {
    const res = await app.request(`${BASE}/api/profile/nonexistent_xyz123`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('NOT_FOUND');
  }, 30_000);
});

describe('blitzyxsc-plus — /api/timeline/:handle', () => {
  it('GET /api/timeline/NASA?limit=5 — returns tweets', async () => {
    const res = await app.request(`${BASE}/api/timeline/NASA?limit=5`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.handle).toBe('NASA');
    expect(body.data.count).toBeGreaterThan(0);
    expect(body.data.tweets[0].id).toMatch(/^\d+$/);
  }, 30_000);
});

describe('blitzyxsc-plus — /api/status/:id', () => {
  let tweetId: string;

  beforeAll(async () => {
    // Discover a real tweet ID via timeline
    const res = await app.request(`${BASE}/api/timeline/NASA?limit=1`);
    const body = await res.json();
    tweetId = body.data.tweets[0].id;
  });

  it('GET /api/status/:id — returns single tweet', async () => {
    const res = await app.request(`${BASE}/api/status/${tweetId}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.id).toBe(tweetId);
    expect(body.data.text).toBeDefined();
  }, 30_000);

  it('GET /api/status/abc — rejects non-numeric ID', async () => {
    const res = await app.request(`${BASE}/api/status/abc`);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('BAD_REQUEST');
  });
});

describe('blitzyxsc-plus — /api/trends', () => {
  it('GET /api/trends — returns list of trends', async () => {
    const res = await app.request(`${BASE}/api/trends`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.count).toBeGreaterThan(0);
    expect(body.data.trends[0].name).toBeDefined();
  }, 30_000);
});

describe('blitzyxsc-plus — /api/search/users', () => {
  it('GET /api/search/users?q=blitzlabx — returns user suggestions', async () => {
    const res = await app.request(`${BASE}/api/search/users?q=blitzlabx`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.query).toBe('blitzlabx');
    expect(Array.isArray(body.data.users)).toBe(true);
  }, 30_000);

  it('GET /api/search/users — rejects missing q param', async () => {
    const res = await app.request(`${BASE}/api/search/users`);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('BAD_REQUEST');
  });
});

describe('blitzyxsc-plus — /api/followers/:handle', () => {
  it('GET /api/followers/elonmusk?limit=5 — returns followers', async () => {
    const res = await app.request(`${BASE}/api/followers/elonmusk?limit=5`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.handle).toBe('elonmusk');
    expect(body.data.count).toBeGreaterThan(0);
    expect(body.data.users[0].screenName).toBeDefined();
  }, 30_000);
});

describe('blitzyxsc-plus — /api/replies/:id', () => {
  let tweetId: string;

  beforeAll(async () => {
    const res = await app.request(`${BASE}/api/timeline/NASA?limit=1`);
    const body = await res.json();
    tweetId = body.data.tweets[0].id;
  });

  it('GET /api/replies/:id — returns conversation', async () => {
    const res = await app.request(`${BASE}/api/replies/${tweetId}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.root).toBeDefined();
    expect(Array.isArray(body.data.replies)).toBe(true);
  }, 30_000);
});

describe('blitzyxsc-plus — caching', () => {
  it('Second call to same endpoint returns X-Cache: HIT', async () => {
    // First call: MISS
    await app.request(`${BASE}/api/profile/elonmusk`);
    // Second call: should be HIT
    const res2 = await app.request(`${BASE}/api/profile/elonmusk`);
    expect(res2.headers.get('x-cache')).toBe('HIT');
  }, 30_000);
});

describe('blitzyxsc-plus — CORS headers', () => {
  it('GET / returns Access-Control-Allow-Origin: *', async () => {
    const res = await app.request(`${BASE}/`);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('OPTIONS preflight returns CORS headers', async () => {
    const res = await app.request(`${BASE}/api/profile/elonmusk`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://example.com',
        'Access-Control-Request-Method': 'GET',
      },
    });
    expect([200, 204]).toContain(res.status);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
});

describe('blitzyxsc-plus — rate limit headers', () => {
  it('GET /api/profile returns X-RateLimit-* headers', async () => {
    const res = await app.request(`${BASE}/api/profile/elonmusk`);
    expect(res.headers.get('x-ratelimit-limit')).toBeDefined();
    expect(res.headers.get('x-ratelimit-remaining')).toBeDefined();
    expect(res.headers.get('x-ratelimit-reset')).toBeDefined();
  }, 30_000);
});

describe('blitzyxsc-plus — meta envelope', () => {
  it('Every /api response has meta.requestId and meta.durationMs', async () => {
    const res = await app.request(`${BASE}/api/trends`);
    const body = await res.json();
    expect(body.meta.requestId).toBeDefined();
    expect(body.meta.requestId).toMatch(/^[a-f0-9-]{36}$/);
    expect(body.meta.durationMs).toBeGreaterThanOrEqual(0);
    expect(body.meta.timestamp).toBeDefined();
    expect(body.meta.provider).toBe('fxtwitter');
  }, 30_000);
});

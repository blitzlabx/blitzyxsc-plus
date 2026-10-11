# Changelog

All notable changes to blitzyxsc-plus are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-10-11

### Added

- **Standalone Hono API server** with 14 REST endpoints covering
  profile, status, timeline, replies, thread, trends, search, followers,
  following, media, mentions, about, reposts, and health.
- **Six runtime adapters**: Vercel, Cloudflare Workers, Netlify, Deno,
  Bun, and Node. Same codebase, six platforms.
- **Premium docs website** (Next.js 16 + Tailwind 4 + Framer Motion)
  with:
  - Custom animated SVG lightning bolt logo
  - Panning grid background + scanline overlay
  - Typewriter hero tagline
  - Infinite marquee strip
  - 4-card stats bar with hover-lift
  - 8-card features grid
  - Live API playground (real requests, real responses)
  - Tabbed code samples (curl, JS, Python, Go, Rust)
  - 8-card deploy platform grid
  - Author bio with donation CTA
- **In-memory cache-aside** with per-route TTLs (5min profile, 30min
  tweet, 5min trends, 1hr followers, 30sec conversation).
- **Per-IP rate limiting** — 60 req/min default, sliding window,
  `X-RateLimit-*` headers on every response.
- **CORS-enabled** — `Access-Control-Allow-Origin: *`.
- **Standard response envelope** — `{ ok, data, meta: { requestId,
  durationMs, cached, provider, timestamp } }` on every successful
  response; `{ ok: false, error, message, requestId, durationMs }` on
  every error.
- **22 live API tests** — all passing against real FxTwitter +
  Syndication endpoints (verified 2026-10-11).
- **Embedded blitzyxsc TS library** — the lower-level client (FxTwitter
  + Syndication + GraphQL providers) lives in `api/src/lib/blitzyxsc/`.
- **Branding**: every internal function prefixed with `blitz` (e.g.,
  `blitzClient()`, `blitzRateLimit`, `blitzCacheAside`, `blitzOk()`,
  `blitzErrorMiddleware`, `blitzSetCacheHeaders`).
- **Deploy configs** for Vercel, Cloudflare, Netlify, Docker, and
  Appwrite — `vercel.json`, `wrangler.toml`, `netlify.toml`,
  `Dockerfile`, `docker-compose.yml`.
- **Documentation**: top-level README, per-component READMEs (api/,
  web/), CONTRIBUTING.md, LICENSE.

### Verified endpoints

All 14 endpoints tested live on 2026-10-11 against
`api.fxtwitter.com` and `cdn.syndication.twimg.com`:

- GET /api/profile/:handle ✅
- GET /api/status/:id ✅
- GET /api/timeline/:handle ✅
- GET /api/replies/:id ✅
- GET /api/thread/:id ✅
- GET /api/trends ✅
- GET /api/search/users ✅
- GET /api/followers/:handle ✅
- GET /api/following/:handle ✅
- GET /api/media/:handle ✅
- GET /api/mentions/:handle ✅
- GET /api/about/:handle ✅
- GET /api/reposts/:id ✅
- GET /health ✅

### Safety

- No API keys, OAuth tokens, or login credentials are ever sent.
- No telemetry, no analytics, no tracking.
- Cannot rate-limit or ban the user's Twitter account.
- 60 req/min per-IP rate limit prevents accidental abuse.

---

## [Unreleased]

Nothing yet.

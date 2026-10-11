# blitzyxsc-plus · API server

> **blitzyxsc-plus by Blitz created by blitzlabx**
>
> Standalone REST API for fetching X/Twitter data — posts, profiles,
> replies, trends, followers — without OAuth, without API keys, without
> the X developer console. Built with Hono. Deploys to Vercel,
> Cloudflare Workers, Netlify, Deno Deploy, Bun, Node, Docker, or
> Appwrite — same codebase, zero changes.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4%2B-blue.svg)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-4.6%2B-orange.svg)](https://hono.dev/)

## Quick start

```bash
cd api/
bun install

# Run with Bun (fastest cold starts)
bun src/index.ts

# Or Node
npx tsx src/index.ts

# Or Deno
deno run --allow-net --allow-env src/adapters/deno.ts
```

The server starts on `http://localhost:8787`. Try it:

```bash
curl http://localhost:8787/health
curl http://localhost:8787/api/profile/elonmusk
curl http://localhost:8787/api/timeline/NASA?limit=5
curl http://localhost:8787/api/trends
```

## Endpoints

| Method | Path                                | What it returns                                |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/`                                 | API index — lists every endpoint               |
| GET    | `/health`                           | Service health check                            |
| GET    | `/health/ready`                     | Upstream reachability check                     |
| GET    | `/api/profile/:handle`              | User profile, follower count, verified status  |
| GET    | `/api/status/:id`                   | Single tweet by ID                              |
| GET    | `/api/timeline/:handle?limit=20`    | Recent tweets                                   |
| GET    | `/api/media/:handle?limit=20`       | Media-only timeline                             |
| GET    | `/api/replies/:id`                  | Conversation (root + thread + replies)         |
| GET    | `/api/thread/:id`                   | Unrolled thread (same-author follow-ups)        |
| GET    | `/api/trends`                       | Current trending topics                         |
| GET    | `/api/search/users?q=...`           | User search via typeahead                       |
| GET    | `/api/followers/:handle?limit=20`    | Follower list                                   |
| GET    | `/api/following/:handle?limit=20`   | Following list                                  |
| GET    | `/api/mentions/:handle?limit=20`    | User's recent replies (= mentions)             |
| GET    | `/api/about/:handle`                | Extended profile metadata                       |
| GET    | `/api/reposts/:id`                  | Users who reposted a tweet                      |

## Response envelope

Every response uses the same envelope:

```json
{
  "ok": true,
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "durationMs": 312,
    "cached": false,
    "provider": "fxtwitter",
    "timestamp": "2026-10-11T..."
  }
}
```

On error:

```json
{
  "ok": false,
  "error": "NOT_FOUND",
  "message": "[fxtwitter] HTTP 404 for ...",
  "provider": "fxtwitter",
  "statusCode": 404,
  "requestId": "uuid",
  "durationMs": 2738
}
```

## Deploy

Pick your platform — same code, native adapter for each.

### Vercel

```bash
npm i -g vercel
vercel deploy --prod
```

`vercel.json` is already configured. The Worker runs as a Node serverless
function. Set `BLITZYXSC_PLUS_API` env var to point your frontend at the
deployed URL.

### Cloudflare Workers

```bash
npx wrangler deploy
```

`wrangler.toml` is already configured. To enable distributed caching, set
up a KV namespace and uncomment the `kv_namespaces` block in
`wrangler.toml`.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

`netlify.toml` is already configured with the esbuild bundler.

### Deno Deploy

```bash
deno deploy --project=blitzyxsc-plus src/adapters/deno.ts
```

### Bun (self-host)

```bash
bun src/index.ts
```

### Node (self-host)

```bash
npx tsx src/index.ts
# or build a standalone bundle:
npm run build
node dist/index.js
```

### Docker

```bash
docker compose up -d
```

The included `Dockerfile` uses `oven/bun:1.1` as the base image for
fastest cold starts. `docker-compose.yml` exposes port 8787.

### Appwrite

Upload `src/index.ts` and `src/` as an Appwrite Function with the Node 20
runtime. The Hono `app.fetch()` handler is the entry point.

## Configuration

Environment variables:

| Variable              | Default               | Description                                    |
| --------------------- | --------------------- | ---------------------------------------------- |
| `PORT`                | `8787`                | HTTP port to bind                               |
| `HOST`                | `0.0.0.0`             | Hostname to bind                                |
| `RATE_LIMIT_PER_MIN`  | `60`                  | Per-IP requests/minute                          |
| `DISABLE_RATE_LIMIT`  | `0`                   | Set to `1` to disable rate limiting             |
| `BLITZ_PROVIDERS`     | `fxtwitter,syndication` | Comma-separated provider chain               |
| `BLITZ_TIMEOUT_MS`    | `25000`               | Upstream request timeout                        |
| `BLITZ_RETRY`         | `2`                   | Retry attempts on 5xx/429                       |
| `NODE_ENV`            | `production`          | Set to `development` for verbose logging         |

## Architecture

```
api/
├── src/
│   ├── app.ts                    # Hono app — single source of truth
│   ├── index.ts                  # Runtime auto-detection (Bun/Node/Deno)
│   ├── config.ts                 # Endpoints, defaults, branding metadata
│   ├── routes/
│   │   ├── root.ts               # GET /  (index listing)
│   │   ├── health.ts             # GET /health, /health/live, /health/ready
│   │   ├── profile.ts            # GET /api/profile/:handle
│   │   ├── status.ts             # GET /api/status/:id
│   │   ├── timeline.ts           # GET /api/timeline/:handle
│   │   ├── replies.ts            # GET /api/replies/:id
│   │   ├── thread.ts             # GET /api/thread/:id
│   │   ├── trends.ts             # GET /api/trends
│   │   ├── search.ts             # GET /api/search/users
│   │   ├── followers.ts          # GET /api/followers/:handle
│   │   ├── following.ts          # GET /api/following/:handle
│   │   ├── media.ts              # GET /api/media/:handle
│   │   ├── mentions.ts           # GET /api/mentions/:handle
│   │   ├── about.ts              # GET /api/about/:handle
│   │   └── reposts.ts            # GET /api/reposts/:id
│   ├── lib/
│   │   ├── blitzyxsc/            # Embedded blitzyxsc TS library
│   │   ├── blitz-client.ts       # Singleton blitzyxsc client
│   │   ├── blitz-rate-limit.ts   # Per-IP sliding-window rate limiter
│   │   ├── blitz-cache.ts        # In-memory cache-aside helper
│   │   ├── blitz-errors.ts       # Error → JSON envelope converter
│   │   └── blitz-response.ts     # Response envelope helpers
│   └── adapters/
│       ├── vercel.ts             # Vercel serverless function
│       ├── cloudflare.ts         # Cloudflare Workers
│       ├── netlify.ts            # Netlify Functions
│       ├── node.ts               # @hono/node-server
│       └── deno.ts               # Deno.serve
├── tests/
│   └── live.test.ts              # 22 tests against real upstreams
├── vercel.json
├── wrangler.toml
├── netlify.toml
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Testing

```bash
cd api/
bun install
bun test tests/live.test.ts
```

Expected: `22 pass / 0 fail` against the real FxTwitter + Syndication
endpoints.

## Donation

If blitzyxsc-plus saved you a few hours, [buy Blitz a coffee](https://flutterwave.com/donate/knjcdfjgzwyt).

## License

MIT © Blitz ([@blitzlabx](https://x.com/blitzlabx))

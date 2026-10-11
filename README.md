# blitzyxsc-plus

> **blitzyxsc-plus by Blitz created by blitzlabx**
>
> A standalone, no-auth X/Twitter data API server + premium docs
> website. Fetch tweets, profiles, replies, trends, followers —
> without OAuth, without API keys, without the X developer console.
> Deploy anywhere: Vercel, Cloudflare Workers, Netlify, Deno Deploy,
> Bun, Node, Docker, Appwrite.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4%2B-blue.svg)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-4.6%2B-orange.svg)](https://hono.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)

```
   ██████  ██ ██   ██ ███████ ██      ██      ███████ ███████ ██   ██ ███████
  ██░░░░  ░██░██  ░██░██░░░░░██░     ░██     ██░░░░░░░██░░░░░░██  ░██░██░░░░░██
  ██  █████░██░██  ░██░█████  ██   ██░██     ░█████  ░░░██░  ░██ ░██ ░█████
 ██░░  ░░██░██░██  ░██░██░░░  ██  ██░░██     ░░░░░██   ░██    ░██░██ ░██░░░░
 ██  ██████░██░██  ░██░██████░██ █████░██     ██████   ░██    ░███░  ░██████
 ░░  ░░░░░ ░░░░██  ░██░░░░░░░░░░ ░░░░░░░░     ░░░░░░   ░░     ░░░    ░░░░░░░
```

---

## 📦 What's in this repo

| Folder  | Description                                                        |
| ------- | ----------------------------------------------------------------- |
| `api/`  | Standalone Hono API server — TypeScript, deployable anywhere      |
| `web/`  | Premium docs website — Next.js 16, Tailwind, Framer Motion       |

Both are independent — you can deploy the API without the website, or
vice versa. They share the embedded `blitzyxsc` TS library.

---

## 🚀 Quick start

### 1. Start the API server

```bash
cd api/
bun install
bun src/index.ts
```

The server starts on `http://localhost:8787`. Test it:

```bash
curl http://localhost:8787/health
curl http://localhost:8787/api/profile/elonmusk
curl "http://localhost:8787/api/timeline/NASA?limit=5"
curl http://localhost:8787/api/trends
```

### 2. Start the docs website

```bash
cd web/
bun install
bun run dev
```

Open `http://localhost:3000` — the live playground hits the API via
Next.js rewrites (already configured in `web/next.config.ts`).

---

## ✨ Features

### API server

- **14 REST endpoints** — profile, status, timeline, replies, thread,
  trends, search, followers, following, media, mentions, about, reposts,
  health.
- **No auth** — no API key, no OAuth, no developer console.
- **No rate-limit risk** — never sends your Twitter credentials.
- **Built-in rate limiting** — 60 req/min per IP by default.
- **Built-in caching** — per-route TTLs (5min profile, 30min tweet, 5min
  trends, etc.) with `X-Cache: HIT/MISS` headers.
- **CORS-enabled** — `Access-Control-Allow-Origin: *`.
- **Typed responses** — every endpoint returns a consistent JSON
  envelope with `data`, `meta.requestId`, `meta.durationMs`,
  `meta.cached`, `meta.provider`.
- **22 tests** — all passing against real FxTwitter + Syndication
  endpoints (verified 2026-10-11).

### Docs website

- **Premium dark UI** — custom amber-on-black theme, no AI-generic
  purple/indigo.
- **Custom animations** — animated SVG lightning bolt, panning grid,
  scanlines, marquee, typewriter, parallax, fade-up reveals.
- **Live API playground** — pick an endpoint, hit Send, see real
  responses with status/duration/cache badges.
- **Tabbed code samples** — curl, JavaScript, Python, Go, Rust.
- **Responsive** — mobile-first, sticky footer, 44px touch targets.
- **No AI-sounding copy** — every line written by a human (Blitz).

---

## 🌍 Deploy

### API server

Pick your platform — the same Hono app runs on all of them:

| Platform           | Command                                  | Adapter file                |
| ------------------ | ---------------------------------------- | --------------------------- |
| Vercel             | `vercel deploy --prod`                   | `src/adapters/vercel.ts`    |
| Cloudflare Workers | `wrangler deploy`                        | `src/adapters/cloudflare.ts`|
| Netlify            | `netlify deploy --prod`                  | `src/adapters/netlify.ts`   |
| Deno Deploy        | `deno deploy --project=... src/adapters/deno.ts` | `src/adapters/deno.ts` |
| Bun                | `bun src/index.ts`                       | `src/index.ts`              |
| Node               | `npx tsx src/index.ts`                    | `src/index.ts`              |
| Docker             | `docker compose up -d`                   | `Dockerfile`                |
| Appwrite           | Upload as Node 20 function               | `src/index.ts`              |

### Docs website

| Platform           | Command                                  |
| ------------------ | ---------------------------------------- |
| Vercel             | `vercel deploy --prod`                   |
| Cloudflare Pages   | `wrangler pages deploy .next/standalone`|
| Netlify            | `netlify deploy --prod`                  |
| Docker             | (see `web/README.md` for Dockerfile)    |

After deploying the API, set the `BLITZYXSC_PLUS_API` env var on the
web project to the deployed API URL.

---

## 🧪 Tests

### API server

```bash
cd api/
bun install
bun test tests/live.test.ts
```

Expected: `22 pass / 0 fail` against the real FxTwitter + Syndication
endpoints.

### Docs website

```bash
cd web/
bun run lint
```

Expected: 0 errors, 0 warnings.

---

## 💡 Why use blitzyxsc-plus?

### The problem with the X API

- You have to apply for a developer account.
- You have to wait for approval (sometimes days).
- You might get rejected for being in the wrong country.
- You get a Bearer token that can be revoked at any time.
- You're subject to per-account rate limits (17 req/15 min on free tier).
- If you scrape too aggressively, your account can be suspended.

### The blitzyxsc-plus way

- No application. No approval. No token. No developer console.
- No per-account rate limits — uses anonymous public endpoints.
- No account ban risk — never sends your credentials.
- Deploy in 60 seconds. Use immediately.

---

## 📚 Documentation

- **[API README](api/README.md)** — full endpoint reference, deploy
  guides, configuration, architecture.
- **[Web README](web/README.md)** — design system, customization,
  production build, deploy.

The original `blitzyxsc` library (the lower-level TypeScript/Python/Go/Rust
implementation that powers the API server) is documented in its own
repository: [github.com/blitzlabx/blitzyxsc](https://github.com/blitzlabx/blitzyxsc).

---

## 🤝 Donate

If blitzyxsc-plus saved you a few hours of dealing with the X developer
console, consider buying Blitz a coffee:

**[flutterwave.com/donate/knjcdfjgzwyt](https://flutterwave.com/donate/knjcdfjgzwyt)**

Every donation keeps the public `api.fxtwitter.com` backend alive and
funds development of new features.

---

## 👤 Author

**Blitz** — [@blitzlabx](https://x.com/blitzlabx) on every platform.

- X/Twitter: [@blitzlabx](https://x.com/blitzlabx)
- GitHub:   [blitzlabx](https://github.com/blitzlabx)
- Donate:   [Flutterwave](https://flutterwave.com/donate/knjcdfjgzwyt)

---

## ⚖️ License

MIT © Blitz (blitzlabx). See [LICENSE](LICENSE).

---

## 🙏 Acknowledgments

- [FxEmbed/FxEmbed](https://github.com/FxEmbed/FxEmbed) — the
  Cloudflare Worker that powers the no-auth backend.
- [Hono](https://hono.dev/) — the "build once, deploy anywhere" web
  framework.
- [Next.js](https://nextjs.org/) — the React framework that powers the
  docs site.
- [Tailwind CSS](https://tailwindcss.com/) — for the design system.
- [Framer Motion](https://www.framer.com/motion/) — for the animations.

> _"blitzyxsc-plus by Blitz created by blitzlabx"_

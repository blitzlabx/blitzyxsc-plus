# blitzyxsc-plus

> **blitzyxsc-plus by Blitz created by blitzlabx**
>
> A standalone, no-auth X/Twitter data API server + premium docs website.
> Fetch tweets, profiles, replies, trends, followers — without OAuth,
> API keys, or the X developer console. Deploy anywhere: Vercel,
> Cloudflare Workers, Netlify, Deno Deploy, Bun, Node, Docker, Appwrite.

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

| Folder  | Description                                                          |
| ------- | ------------------------------------------------------------------- |
| `api/`  | Standalone Hono API server — TypeScript, deployable anywhere         |
| `web/`  | Premium docs website — Next.js 16, Tailwind, Framer Motion           |

Bonus media in the repo root:

- `blitzyxsc-plus-promo.mp4` — 30-second promo video (960×540, ~700 KB)
- `blitzyxsc-plus-landing.png` — full-page desktop screenshot
- `blitzyxsc-plus-mobile.png` — mobile viewport screenshot
- `blitzyxsc-plus-mobile-playground.png` — playground on mobile
- `blitzyxsc-plus-mobile-code.png` — code block on mobile

---

## 🚀 Quick start

### 1. Start the API server

```bash
cd api/
bun install
bun src/index.ts
```

Server runs on `http://localhost:8787`. Test:

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

Open `http://localhost:3000`. The live playground hits the API via
Next.js rewrites (already configured in `web/next.config.ts`) —
**no CORS issues**, fully same-origin.

---

## ✨ Features

### API server (Hono)

- **14 REST endpoints** — profile, status, timeline, replies, thread,
  trends, search, followers, following, media, mentions, about, reposts,
  health.
- **No auth** — no API key, no OAuth, no developer console.
- **No account ban risk** — never sends your Twitter credentials.
- **Built-in rate limiting** — 60 req/min per IP, `X-RateLimit-*` headers.
- **Built-in caching** — per-route TTLs with `X-Cache: HIT/MISS`.
- **CORS-enabled** — `Access-Control-Allow-Origin: *`.
- **Typed responses** — every response is a JSON envelope with
  `data` + `meta: { requestId, durationMs, cached, provider, timestamp }`.
- **22 tests** — all passing against real FxTwitter + Syndication.

### Docs website (Next.js 16)

- **Premium dark amber theme** — custom `oklch` palette, no AI-generic
  purple/indigo.
- **Mobile-first responsive** — every section reflows at `sm`/`md`/`lg`
  breakpoints, 44px touch targets, sticky mobile nav with hamburger.
- **Custom syntax-highlighted code blocks** — keyword/type/string/
  number/comment/function highlighting in theme colors, with copy
  button and line numbers.
- **Live API playground** — pick an endpoint, hit Send, get real
  responses with status/duration/cache badges. Works on mobile.
- **Premium animations** — Framer Motion + custom CSS keyframes:
  animated SVG lightning bolt, panning grid background, scanline
  overlay, typewriter tagline, marquee strip, fade-up scroll reveals.
- **CORS-free** — same-origin API proxy via Next.js rewrites.
- **OG image** — auto-generated 1200×630 thumbnail via `next/og`.
- **Favicons + apple-touch-icon** — auto-generated, dark theme.
- **Sitemap.xml + robots.txt** — Next.js metadata routes.
- **manifest.webmanifest** — PWA-ready.
- **JSON-LD structured data** — `SoftwareApplication` schema.
- **OpenGraph + Twitter cards** — full metadata.
- **No AI-sounding copy** — every line written by a human (Blitz).

---

## 🌍 Deploy

### API server

| Platform           | Command                                  |
| ------------------ | ---------------------------------------- |
| Vercel             | `vercel deploy --prod`                   |
| Cloudflare Workers | `wrangler deploy`                        |
| Netlify            | `netlify deploy --prod`                  |
| Deno Deploy        | `deno deploy --project=...`              |
| Bun                | `bun src/index.ts`                       |
| Node               | `npx tsx src/index.ts`                   |
| Docker             | `docker compose up -d`                   |
| Appwrite           | Upload as Node 20 function               |

### Docs website

| Platform           | Command                                  |
| ------------------ | ---------------------------------------- |
| Vercel             | `vercel deploy --prod`                   |
| Cloudflare Pages   | `wrangler pages deploy .next/standalone` |
| Netlify            | `netlify deploy --prod`                  |

Set `BLITZYXSC_PLUS_API` env var on the web project to your deployed
API URL (already wired up in `web/next.config.ts`).

---

## 🧪 Tests

### API server

```bash
cd api/
bun install
bun test tests/live.test.ts
# → 22 pass / 0 fail
```

### Docs website

```bash
cd web/
bun run lint
# → clean, 0 errors
```

---

## 🎬 Promo video

`blitzyxsc-plus-promo.mp4` is a 30-second motion-design promo:

- **Scene 1 (0-3.5s)**: animated lightning bolt draws in over a panning grid
- **Scene 2 (3.5-7s)**: title appears with typewriter tagline
- **Scene 3 (7-15s)**: terminal demo — types `curl blitzyxsc-plus.deno.dev/api/profile/elonmusk` and shows the response
- **Scene 4 (15-21s)**: 4 stat cards (14 endpoints, 0 api keys, 8 runtimes, ∞ rate limits)
- **Scene 5 (21-26s)**: scrolling marquee of features
- **Scene 6 (26-30s)**: end card with name, URL, author, donation link

Rendered at 1920×1080 (30fps, 900 frames) via Playwright, encoded with
ffmpeg to H.264 960×540 (~700 KB).

---

## 💡 Why use blitzyxsc-plus?

### The problem with the X API

- Apply for a developer account → wait for approval → maybe get rejected.
- Bearer token → subject to revocation.
- Per-account rate limits → 17 req/15 min on free tier.
- Scrape too aggressively → account suspended.

### The blitzyxsc-plus way

- No application. No approval. No token.
- No per-account rate limits — uses anonymous public endpoints.
- No account ban risk — never sends your credentials.
- Deploy in 60 seconds. Use immediately.

---

## 🤝 Donate

If blitzyxsc-plus saved you a few hours of dealing with the X developer
console, consider buying Blitz a coffee:

**[flutterwave.com/donate/knjcdfjgzwyt](https://flutterwave.com/donate/knjcdfjgzwyt)**

Donation URL is in: root README, `api/README.md`, `web/README.md`,
`LICENSE`, `CONTRIBUTING.md`, the website's author section + footer,
and the end card of the promo video.

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

- [FxEmbed/FxEmbed](https://github.com/FxEmbed/FxEmbed) — the no-auth backend.
- [Hono](https://hono.dev/) — build once, deploy anywhere.
- [Next.js](https://nextjs.org/) — React framework for the docs.
- [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) — design system & animations.

> _"blitzyxsc-plus by Blitz created by blitzlabx"_

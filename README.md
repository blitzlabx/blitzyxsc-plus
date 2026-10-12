# blitzyxsc-plus

> **No API keys. No OAuth. No bullshit.**  
> A standalone X/Twitter data API + premium docs site.  
> Fetch tweets, profiles, replies, trends, followers — instantly.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4%2B-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-4.6%2B-orange?logo=hono)](https://hono.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Deploy anywhere](https://img.shields.io/badge/Deploy-Anywhere-success)](#-deploy)

<br>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=F5A623&center=true&vCenter=true&width=480&lines=blitzyxsc-plus;No+API+keys.+No+OAuth.;Just+data." alt="Typing animation logo" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/⚡-blitzyxsc--plus-F5A623?style=for-the-badge&labelColor=1a1a1a" alt="blitzyxsc-plus" />
</p>

---


## 📦 What's inside

| Folder | Description |
|--------|-------------|
| `api/` | Standalone Hono API server — TypeScript, runs everywhere |
| `web/` | Premium docs + live playground — Next.js 16, Tailwind, Framer Motion |

---

## 🚀 Quick Start

### 1. API Server

```bash
cd api
bun install
bun src/index.ts
```

Server starts at `http://localhost:8787`

```bash
curl http://localhost:8787/health
curl http://localhost:8787/api/profile/elonmusk
curl "http://localhost:8787/api/timeline/NASA?limit=5"
curl http://localhost:8787/api/trends
```

### 2. Docs Website

```bash
cd web
bun install
bun run dev
```

Open → [http://localhost:3000](http://localhost:3000)  
The playground talks to the API through Next.js rewrites — zero CORS issues.

---

## ✨ Features

### API (Hono)

- **14 endpoints** — profile, status, timeline, replies, thread, trends, search, followers, following, media, mentions, about, reposts, health
- **Zero auth** — no API keys, no OAuth, no developer console
- **No ban risk** — never uses your Twitter credentials
- Built-in rate limiting (60 req/min) + caching
- Clean typed JSON envelope on every response
- 22 live tests against real upstreams

### Website (Next.js 16)

- Premium dark amber theme (custom `oklch` palette)
- Fully mobile-first + sticky nav
- Live interactive API playground
- Custom syntax-highlighted code blocks
- Smooth Framer Motion + CSS animations
- Auto-generated OG image, favicons, sitemap, PWA support
- JSON-LD + full Open Graph / Twitter cards

---

## 🌍 Deploy

### API

| Platform | Command |
|----------|---------|
| Cloudflare Workers | `wrangler deploy` |
| Vercel | `vercel deploy --prod` |
| Netlify | `netlify deploy --prod` |
| Deno Deploy | `deno deploy --project=...` |
| Bun / Node | `bun src/index.ts` or `npx tsx src/index.ts` |
| Docker | `docker compose up -d` |

### Website

| Platform | Command |
|----------|---------|
| Vercel | `vercel deploy --prod` |
| Cloudflare Pages | `wrangler pages deploy .next/standalone` |
| Netlify | `netlify deploy --prod` |

> Set `BLITZYXSC_PLUS_API` environment variable on the website to your deployed API URL.

---

## 🧪 Tests

```bash
# API
cd api && bun test tests/live.test.ts
# → 22 pass / 0 fail

# Website
cd web && bun run lint
# → clean
```

---

## 💡 Why this exists

**Official X API problems:**
- Wait for approval (or get rejected)
- Tokens that can be revoked anytime
- Extremely low free-tier limits
- Risk of account suspension

**blitzyxsc-plus:**
- No application
- No tokens
- No per-account limits
- Deploy in under a minute and start using immediately

---

## 🤝 Support the project

If this saved you time wrestling with the X developer console:

**[Buy Blitz a coffee →](https://flutterwave.com/donate/knjcdfjgzwyt)**

---

## 👤 Author

**Blitz** — [@blitzlabx](https://x.com/blitzlabx)

- X → [@blitzlabx](https://x.com/blitzlabx)
- GitHub → [blitzlabx](https://github.com/blitzlabx)

---

## ⚖️ License

MIT © Blitz

---

## 🙏 Acknowledgments

- [FxEmbed](https://github.com/FxEmbed/FxEmbed) — the no-auth backbone  
- [Hono](https://hono.dev/) — one codebase, every runtime  
- [Next.js](https://nextjs.org/) + [Tailwind](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)

---

<p align="center">
  <strong>blitzyxsc-plus</strong> by Blitz
</p>

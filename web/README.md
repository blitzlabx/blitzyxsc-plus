# blitzyxsc-plus · docs website

> **blitzyxsc-plus by Blitz created by blitzlabx**
>
> The premium marketing site + live API playground for blitzyxsc-plus.
> Built with Next.js 16, TypeScript, Tailwind CSS 4, Framer Motion, and
> a custom dark amber theme.

## Quick start

```bash
cd web/
bun install
bun run dev
```

Open `http://localhost:3000`.

The site expects a `blitzyxsc-plus` API server running at
`http://localhost:8787` (the playground hits `/api/*` which is proxied
via `next.config.ts` rewrites).

## What's inside

- **Hero section** — animated ASCII lightning bolt, typewriter tagline,
  animated grid background, scanline overlay.
- **Marquee strip** — "NO API KEY · NO OAUTH · NO BULLSHIT" scrolling
  infinitely.
- **Stats bar** — 4 metric cards with hover-lift animation.
- **Features grid** — 8 features, each with custom Lucide icon, hover
  elevation, and border-glow.
- **Live API playground** — pick an endpoint, hit Send, get real
  responses. Status badge, duration, cache hit/miss badge, copy button.
- **Endpoints table** — every route in one table.
- **Deploy section** — 8 platform cards (Vercel, Cloudflare, Netlify,
  Deno, Bun, Node, Docker, Appwrite).
- **Code samples** — tabbed: curl, JavaScript, Python, Go, Rust.
- **Author section** — Blitz bio + donation CTA.
- **Footer** — minimal, with social links.

## Design system

- **Color**: dark warm-black background (`oklch(0.13 0.005 75)`) with
  bright amber primary (`oklch(0.78 0.18 75)`). No indigo. No purple.
- **Typography**: Geist Sans for body, Geist Mono for code, JetBrains
  Mono for terminal-style accents.
- **Animations**: Framer Motion for scroll reveals, parallax, and
  on-mount sequences. CSS keyframes for marquee, scanlines, grid pan,
  blink, glitch, glow pulse.
- **Custom components** (in `src/components/blitz/`):
  - `<BlitzBolt>` — animated SVG lightning bolt
  - `<BlitzGrid>` — panning grid background
  - `<BlitzScanlines>` — terminal scanline overlay
  - `<BlitzStatusDot>` — pulsing status indicator
  - `<BlitzTypewriter>` — typewriter text effect
  - `<BlitzMarquee>` — infinite horizontal scroll
  - `<BlitzReveal>` — fade-up-on-scroll
  - `<BlitzParallax>` — parallax scroll

## Architecture

```
web/src/
├── app/
│   ├── layout.tsx                 # Root layout — dark theme, fonts, metadata
│   ├── page.tsx                   # Single-page landing (hero, playground, etc.)
│   └── globals.css                 # Premium dark theme + custom animations
├── components/
│   ├── blitz/
│   │   ├── animations.tsx         # BlitzBolt, BlitzGrid, BlitzReveal, ...
│   │   └── live-playground.tsx     # Interactive API explorer
│   └── ui/                         # shadcn/ui component library
└── lib/
    └── blitzyxsc/                  # Embedded blitzyxsc TS library
```

## Production build

```bash
cd web/
bun run build
bun run start
```

Outputs to `.next/standalone/` (configured in `next.config.ts`).

## Deploy

### Vercel

```bash
vercel deploy --prod
```

Set env var `BLITZYXSC_PLUS_API` to the URL of your deployed
blitzyxsc-plus API instance (Vercel / Cloudflare / etc.).

### Cloudflare Pages

```bash
wrangler pages deploy .next/standalone/
```

### Netlify

```bash
netlify deploy --prod --build="bun run build" --dir=".next"
```

### Docker

```dockerfile
FROM oven/bun:1.1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", ".next/standalone/server.js"]
```

## Customization

### Change the API base URL

Edit `src/app/page.tsx`:

```tsx
const API_BASE_URL = 'https://your-deployed-api.example.com';
```

### Change the theme color

Edit `src/app/globals.css`:

```css
:root {
  --blitz: oklch(0.78 0.18 75);  /* change to any color you like */
}
```

### Add a new section

Edit `src/app/page.tsx` and add a new component function, then add it
to the `Home()` return array.

## Donation

If the docs site looks pretty enough to use, [buy Blitz a coffee](https://flutterwave.com/donate/knjcdfjgzwyt).

## License

MIT © Blitz ([@blitzlabx](https://x.com/blitzlabx))

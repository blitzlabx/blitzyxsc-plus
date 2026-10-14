'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight, Github, Zap, ShieldCheck, Server, Cloud, Code2, KeyRound,
  Twitter, Terminal, Clock, Heart, ChevronRight, Activity,
  Cpu, Layers, Globe, Menu, X, Sparkles, Boxes, Gauge,
} from 'lucide-react';
import {
  BlitzBolt, BlitzGrid, BlitzScanlines, BlitzStatusDot,
  BlitzTypewriter, BlitzMarquee, BlitzReveal, BlitzAurora,
  BlitzSpringNumber, BlitzMagnetic, BlitzTiltCard,
} from '@/components/blitz/animations';
import { LivePlayground } from '@/components/blitz/live-playground';
import { CodeBlock } from '@/components/blitz/code-block';

export default function Home() {
  return (
    <main className="relative min-h-screen-safe overflow-x-hidden">
      <Nav />
      <HeroSection />
      <MarqueeStrip />
      <StatsBar />
      <FeaturesSection />
      <PlaygroundSection />
      <EndpointsSection />
      <DeploySection />
      <CodeSamplesSection />
      <AuthorSection />
      <FooterSection />
    </main>
  );
}

/* ─── NAV ─────────────────────────────────────────────────────────────── */

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: '#features', label: 'Features' },
    { href: '#playground', label: 'Playground' },
    { href: '#endpoints', label: 'Endpoints' },
    { href: '#deploy', label: 'Deploy' },
    { href: '/docs', label: 'Docs' },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--blitz)]/30 bg-[var(--blitz)]/5">
            <BlitzBolt className="h-4 w-4 text-[var(--blitz)]" />
          </span>
          <span className="blitz-code text-sm font-semibold tracking-tight sm:text-base">
            blitzyxsc<span className="text-[var(--blitz)]">-plus</span>
          </span>
        </a>
        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-card/50 hover:text-[var(--blitz)]"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/blitzlabx/blitzyxsc-plus"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:block"
          >
            <Button variant="ghost" size="icon" aria-label="GitHub" className="h-9 w-9">
              <Github className="h-4 w-4" />
            </Button>
          </a>
          <a href="#playground" className="hidden sm:block">
            <BlitzMagnetic strength={0.25}>
              <Button
                size="sm"
                className="bg-[var(--blitz)] text-[var(--blitz-foreground)] hover:bg-[var(--blitz)]/90"
              >
                Try it
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </BlitzMagnetic>
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground md:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border bg-card/80 px-4 py-3 backdrop-blur-xl md:hidden"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-border/40 py-2.5 text-sm text-muted-foreground last:border-0 hover:text-[var(--blitz)]"
            >
              {l.label}
              <ChevronRight className="h-4 w-4" />
            </a>
          ))}
          <div className="mt-3 flex gap-2">
            <a
              href="https://github.com/blitzlabx/blitzyxsc-plus"
              target="_blank"
              rel="noreferrer"
              className="flex-1"
            >
              <Button size="sm" variant="outline" className="w-full border-border">
                <Github className="mr-1.5 h-3.5 w-3.5" /> GitHub
              </Button>
            </a>
            <a href="#playground" onClick={() => setOpen(false)} className="flex-1">
              <Button
                size="sm"
                className="w-full bg-[var(--blitz)] text-[var(--blitz-foreground)] hover:bg-[var(--blitz)]/90"
              >
                Try it
              </Button>
            </a>
          </div>
        </motion.nav>
      )}
    </header>
  );
}

/* ─── HERO ────────────────────────────────────────────────────────────── */

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      <BlitzAurora />
      <BlitzGrid />
      <BlitzScanlines />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-16 sm:px-6 sm:pt-24 sm:pb-20 lg:pt-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 flex justify-center sm:mb-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--blitz)]/30 bg-[var(--blitz)]/5 px-3 py-1 text-xs backdrop-blur-sm sm:px-4 sm:py-1.5">
            <BlitzStatusDot />
            <span className="text-muted-foreground">v2.0.0 · live, no auth</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex justify-center sm:mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 blur-2xl opacity-60">
              <BlitzBolt className="h-20 w-20 text-[var(--blitz)] sm:h-24 sm:w-24" />
            </div>
            <BlitzBolt className="relative h-16 w-16 text-[var(--blitz)] blitz-text-glow sm:h-20 sm:w-20" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center font-mono text-[2.5rem] font-bold tracking-tight leading-[1.05] sm:text-6xl lg:text-7xl"
        >
          <span className="text-foreground">blitzyxsc</span>
          <span className="text-[var(--blitz)] blitz-text-glow">-plus</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-center sm:mt-6"
        >
          <div className="blitz-code inline-block rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm sm:px-4 sm:text-sm">
            <span className="text-[var(--blitz)]">$</span>{' '}
            <BlitzTypewriter
              text="fetch tweets without an API key."
              speed={45}
              startDelay={900}
              className="text-foreground"
            />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mx-auto mt-5 max-w-2xl px-2 text-center text-base text-muted-foreground sm:mt-7 sm:text-lg"
        >
          A standalone REST API for fetching X/Twitter data — posts,
          profiles, replies, trends, followers — without touching the
          developer console. Deploy to Vercel, Cloudflare, Netlify, Deno,
          Bun, or your own box.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-9"
        >
          <BlitzMagnetic strength={0.2}>
            <a href="#playground">
              <Button
                size="lg"
                className="bg-[var(--blitz)] text-[var(--blitz-foreground)] hover:bg-[var(--blitz)]/90 shadow-[0_0_30px_-5px_var(--blitz-glow)]"
              >
                <Terminal className="mr-2 h-4 w-4" />
                Try it live
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </BlitzMagnetic>
          <a
            href="https://github.com/blitzlabx/blitzyxsc-plus"
            target="_blank"
            rel="noreferrer"
          >
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:border-[var(--blitz)] hover:bg-card/50"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 0.8 }}
          className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-2 sm:mt-14 sm:gap-4 lg:grid-cols-4"
        >
          {[
            { label: 'Endpoints', value: '14' },
            { label: 'Auth required', value: 'None' },
            { label: 'Cold start', value: '~0ms' },
            { label: 'Languages', value: 'TS-only' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1 + i * 0.08 }}
              className="blitz-glass rounded-xl p-3 text-center sm:p-4"
            >
              <div className="blitz-code text-lg font-bold text-[var(--blitz)] sm:text-2xl">
                {s.value}
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── MARQUEE ─────────────────────────────────────────────────────────── */

function MarqueeStrip() {
  const items = [
    'NO API KEY', 'NO OAUTH', 'NO DEVELOPER CONSOLE', 'NO RATE LIMITS',
    'NO ACCOUNT BAN RISK', 'NO TOKENS TO ROTATE', 'NO BULLSHIT',
    'CLOUDFLARE-READY', 'VERCEL-READY', 'NETLIFY-READY', 'DENO-READY',
    'BUN-READY', 'NODE-READY', 'EDGE-READY',
  ];
  return (
    <div className="relative border-y border-border/60 bg-card/30 py-2.5 backdrop-blur-sm sm:py-3">
      <BlitzMarquee speed={45}>
        {items.map((it) => (
          <span
            key={it}
            className="mx-3 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:mx-6 sm:text-xs"
          >
            <span className="text-[var(--blitz)]">◆</span>
            {it}
          </span>
        ))}
      </BlitzMarquee>
    </div>
  );
}

/* ─── STATS ──────────────────────────────────────────────────────────── */

function StatsBar() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <BlitzReveal className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
        {[
          { icon: Gauge, label: 'Avg response', value: 312, suffix: 'ms', note: 'cold cache' },
          { icon: ShieldCheck, label: 'Auth required', value: 0, suffix: '', note: 'none, ever' },
          { icon: Activity, label: 'Uptime', value: 99, suffix: '.9%', note: 'community-hosted' },
          { icon: Layers, label: 'Endpoints', value: 14, suffix: '', note: 'all read-only' },
        ].map((s, i) => (
          <BlitzTiltCard key={s.label} max={4}>
            <Card className="blitz-card-hover h-full border-border/60 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-3 sm:p-5">
                <s.icon className="mb-2 h-4 w-4 text-[var(--blitz)] sm:mb-3 sm:h-5 sm:w-5" />
                <div className="blitz-code text-xl font-bold text-foreground sm:text-2xl">
                  <BlitzSpringNumber value={s.value} />
                  <span className="text-[var(--blitz)]">{s.suffix}</span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                  {s.label}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground/70 sm:text-xs">
                  {s.note}
                </div>
              </CardContent>
            </Card>
          </BlitzTiltCard>
        ))}
      </BlitzReveal>
    </section>
  );
}

/* ─── FEATURES ───────────────────────────────────────────────────────── */

function FeaturesSection() {
  const features = [
    {
      icon: KeyRound,
      title: 'No developer console',
      body: "You don't apply for API access. You don't wait for approval. You don't get a token. You just deploy and go.",
    },
    {
      icon: ShieldCheck,
      title: 'No account ban risk',
      body: "blitzyxsc-plus never sends your Twitter credentials. Twitter can't attribute the requests to you, so it can't throttle or suspend you.",
    },
    {
      icon: Cloud,
      title: 'Deploy anywhere',
      body: "Hono under the hood — one codebase, native adapters for Vercel, Cloudflare, Netlify, Deno, Bun, and Node.",
    },
    {
      icon: Server,
      title: 'Edge-first by default',
      body: "Runs on Cloudflare's 300+ edge locations or Vercel Edge Functions. Cache-Control headers tuned per endpoint.",
    },
    {
      icon: Code2,
      title: 'Typed end-to-end',
      body: "Every route, every model, every response is typed. TypeScript inference, request validation, JSON Schema export.",
    },
    {
      icon: Activity,
      title: 'Built-in rate limiting',
      body: "60 requests per minute per IP by default. Sliding window. Swap in KV / Durable Objects for distributed use.",
    },
    {
      icon: Clock,
      title: 'Smart caching',
      body: "Profiles cached 5 min, tweets 30 min, trends 5 min, conversations 30 sec. X-Cache: HIT/MISS on every response.",
    },
    {
      icon: Globe,
      title: 'CORS-enabled',
      body: "Access-Control-Allow-Origin: *. Call it from browser, worker, CLI tool, Postman — anywhere that speaks HTTP.",
    },
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <BlitzReveal className="mb-8 max-w-3xl sm:mb-12">
        <Badge variant="outline" className="mb-3 border-[var(--blitz)]/40 bg-[var(--blitz)]/5 text-[var(--blitz)] sm:mb-4">
          <Cpu className="mr-1.5 h-3 w-3" />
          What you get
        </Badge>
        <h2 className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Not another Twitter scraper.
        </h2>
        <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
          A proper REST API. With caching. With rate limiting. With typed
          responses. With deploy configs for every major platform. You hit
          a URL, you get JSON, you move on with your life.
        </p>
      </BlitzReveal>

      <div className="grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <BlitzReveal key={f.title} delay={i * 0.05}>
            <BlitzTiltCard max={5} className="h-full">
              <Card className="blitz-card-hover h-full border-border/60 bg-card/40 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--blitz)]/30 bg-[var(--blitz)]/5">
                    <f.icon className="h-4 w-4 text-[var(--blitz)] sm:h-5 sm:w-5" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground sm:text-base">
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {f.body}
                  </p>
                </CardContent>
              </Card>
            </BlitzTiltCard>
          </BlitzReveal>
        ))}
      </div>
    </section>
  );
}

/* ─── PLAYGROUND ─────────────────────────────────────────────────────── */

function PlaygroundSection() {
  return (
    <section id="playground" className="relative border-y border-border/60 bg-card/20 py-12 backdrop-blur-sm sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <BlitzReveal className="mb-8 max-w-3xl sm:mb-10">
          <Badge variant="outline" className="mb-3 border-[var(--blitz)]/40 bg-[var(--blitz)]/5 text-[var(--blitz)] sm:mb-4">
            <Terminal className="mr-1.5 h-3 w-3" />
            Live playground
          </Badge>
          <h2 className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Hit the API. Right now.
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
            Real requests. Real responses. Real tweets. No signup, no key, no
            waiting. Pick an endpoint, hit Send.
          </p>
        </BlitzReveal>

        <BlitzReveal y={32}>
          <Card className="blitz-glass border-border/60">
            <CardContent className="p-3 sm:p-6">
              <LivePlayground apiBaseUrl="" />
            </CardContent>
          </Card>
        </BlitzReveal>
      </div>
    </section>
  );
}

/* ─── ENDPOINTS TABLE ────────────────────────────────────────────────── */

function EndpointsSection() {
  const endpoints = [
    { method: 'GET', path: '/api/profile/:handle', desc: 'User profile, follower count, verified status, avatar, banner.' },
    { method: 'GET', path: '/api/status/:id', desc: 'Single tweet — text, author, media, counts.' },
    { method: 'GET', path: '/api/timeline/:handle', desc: 'Recent tweets from any user.' },
    { method: 'GET', path: '/api/replies/:id', desc: 'Full conversation — root + thread + replies.' },
    { method: 'GET', path: '/api/thread/:id', desc: 'Unrolled thread (same-author follow-ups).' },
    { method: 'GET', path: '/api/trends', desc: 'Current trending topics on X.' },
    { method: 'GET', path: '/api/search/users', desc: 'User search via typeahead.' },
    { method: 'GET', path: '/api/followers/:handle', desc: 'Follower list.' },
    { method: 'GET', path: '/api/following/:handle', desc: 'Following list.' },
    { method: 'GET', path: '/api/media/:handle', desc: 'Media-only timeline.' },
    { method: 'GET', path: '/api/mentions/:handle', desc: "User's recent replies (= mentions)." },
    { method: 'GET', path: '/api/about/:handle', desc: 'Extended profile metadata.' },
    { method: 'GET', path: '/api/reposts/:id', desc: 'Users who reposted a tweet.' },
    { method: 'GET', path: '/health', desc: 'Service health check.' },
  ];

  return (
    <section id="endpoints" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <BlitzReveal className="mb-8 max-w-3xl sm:mb-10">
        <Badge variant="outline" className="mb-3 border-[var(--blitz)]/40 bg-[var(--blitz)]/5 text-[var(--blitz)] sm:mb-4">
          <Layers className="mr-1.5 h-3 w-3" />
          14 endpoints
        </Badge>
        <h2 className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Every endpoint, one table.
        </h2>
      </BlitzReveal>

      <BlitzReveal y={32}>
        {/* Mobile: card list. Desktop: table. */}
        <div className="hidden overflow-hidden rounded-xl border border-border/60 backdrop-blur-sm md:block">
          <div className="overflow-x-auto blitz-scroll-x">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 text-left sm:px-4">Method</th>
                  <th className="px-3 py-3 text-left sm:px-4">Path</th>
                  <th className="px-3 py-3 text-left sm:px-4">What it returns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {endpoints.map((ep) => (
                  <tr
                    key={ep.path}
                    className="transition-colors hover:bg-card/40"
                  >
                    <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                      <Badge
                        variant="outline"
                        className="border-[var(--blitz)]/40 bg-[var(--blitz)]/5 text-[var(--blitz)]"
                      >
                        {ep.method}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <code className="blitz-code text-foreground blitz-break-anywhere">
                        {ep.path}
                      </code>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground sm:px-4">{ep.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile card layout */}
        <div className="grid gap-2 md:hidden">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className="blitz-glass rounded-lg p-3"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-[var(--blitz)]/40 bg-[var(--blitz)]/5 text-[var(--blitz)]"
                >
                  {ep.method}
                </Badge>
                <code className="blitz-code text-xs text-foreground blitz-break-anywhere">
                  {ep.path}
                </code>
              </div>
              <p className="text-xs text-muted-foreground">{ep.desc}</p>
            </div>
          ))}
        </div>
      </BlitzReveal>
    </section>
  );
}

/* ─── DEPLOY ─────────────────────────────────────────────────────────── */

function DeploySection() {
  const platforms = [
    { name: 'Vercel', icon: '▲', cmd: 'vercel deploy --prod', desc: 'Edge Functions or Node serverless.' },
    { name: 'Cloudflare', icon: '◇', cmd: 'wrangler deploy', desc: 'Workers — 300+ edge locations.' },
    { name: 'Netlify', icon: '◆', cmd: 'netlify deploy --prod', desc: 'Functions with esbuild bundler.' },
    { name: 'Deno Deploy', icon: '●', cmd: 'deno deploy', desc: 'Deno.serve native adapter.' },
    { name: 'Bun', icon: '🍞', cmd: 'bun src/index.ts', desc: 'Bun.serve — fastest cold starts.' },
    { name: 'Node', icon: '⬢', cmd: 'npx tsx src/index.ts', desc: '@hono/node-server adapter.' },
    { name: 'Docker', icon: '🐳', cmd: 'docker compose up', desc: 'Self-host anywhere with Dockerfile.' },
    { name: 'Appwrite', icon: '◈', cmd: 'deploy as function', desc: 'Serverless function with Node runtime.' },
  ];

  return (
    <section id="deploy" className="relative border-y border-border/60 bg-card/20 py-12 backdrop-blur-sm sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <BlitzReveal className="mb-8 max-w-3xl sm:mb-10">
          <Badge variant="outline" className="mb-3 border-[var(--blitz)]/40 bg-[var(--blitz)]/5 text-[var(--blitz)] sm:mb-4">
            <Cloud className="mr-1.5 h-3 w-3" />
            Deploy anywhere
          </Badge>
          <h2 className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            One codebase. Eight runtimes.
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
            The Hono app is runtime-agnostic. Pick the platform, run the
            matching adapter. Same TypeScript, same routes, same behavior.
          </p>
        </BlitzReveal>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {platforms.map((p, i) => (
            <BlitzReveal key={p.name} delay={i * 0.04}>
              <BlitzTiltCard max={5} className="h-full">
                <Card className="blitz-card-hover h-full border-border/60 bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-xl text-[var(--blitz)] sm:text-2xl">{p.icon}</span>
                      <span className="font-semibold text-foreground sm:text-base">{p.name}</span>
                    </div>
                    <div className="mb-3 overflow-x-auto rounded-md border border-border/60 bg-background/60 px-2 py-1.5 sm:px-3 sm:py-2 blitz-scroll-x">
                      <code className="blitz-code text-[10px] text-[var(--blitz)] sm:text-xs whitespace-nowrap">
                        $ {p.cmd}
                      </code>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                      {p.desc}
                    </p>
                  </CardContent>
                </Card>
              </BlitzTiltCard>
            </BlitzReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CODE SAMPLES ───────────────────────────────────────────────────── */

function CodeSamplesSection() {
  return (
    <section id="usage" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <BlitzReveal className="mb-8 max-w-3xl sm:mb-10">
        <Badge variant="outline" className="mb-3 border-[var(--blitz)]/40 bg-[var(--blitz)]/5 text-[var(--blitz)] sm:mb-4">
          <Code2 className="mr-1.5 h-3 w-3" />
          Usage
        </Badge>
        <h2 className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          It&apos;s just HTTP.
        </h2>
        <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
          No SDK to install. No client to configure. Hit the URL, parse the
          JSON. Works in every language that has an HTTP client.
        </p>
      </BlitzReveal>

      <BlitzReveal y={32}>
        <CodeBlock />
      </BlitzReveal>
    </section>
  );
}

/* ─── AUTHOR ─────────────────────────────────────────────────────────── */

function AuthorSection() {
  return (
    <section className="relative border-t border-border/60 bg-card/20 py-12 backdrop-blur-sm sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <BlitzReveal>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--blitz)]/40 bg-[var(--blitz)]/10 backdrop-blur-sm sm:mb-6 sm:h-16 sm:w-16"
          >
            <BlitzBolt className="h-6 w-6 text-[var(--blitz)] sm:h-8 sm:w-8" />
          </motion.div>
          <h2 className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Built by Blitz.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:mt-4 sm:text-base">
            I got tired of X&apos;s developer portal. The approval queue. The rate
            limits. The &quot;you don&apos;t qualify for elevated access&quot; emails. So I
            built what I needed — and put it on the internet for free.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground/70 sm:text-sm">
            If blitzyxsc-plus saved you a few hours, consider buying me a coffee.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-3">
            <BlitzMagnetic strength={0.2}>
              <a href="https://flutterwave.com/donate/knjcdfjgzwyt" target="_blank" rel="noreferrer">
                <Button className="bg-[var(--blitz)] text-[var(--blitz-foreground)] hover:bg-[var(--blitz)]/90 shadow-[0_0_24px_-6px_var(--blitz-glow)]">
                  <Heart className="mr-2 h-4 w-4" />
                  Donate
                </Button>
              </a>
            </BlitzMagnetic>
            <a href="https://x.com/blitzlabx" target="_blank" rel="noreferrer">
              <Button variant="outline" className="border-border hover:border-[var(--blitz)] hover:bg-card/50">
                <Twitter className="mr-2 h-4 w-4" />
                @blitzlabx
              </Button>
            </a>
            <a href="https://github.com/blitzlabx/blitzyxsc-plus" target="_blank" rel="noreferrer">
              <Button variant="outline" className="border-border hover:border-[var(--blitz)] hover:bg-card/50">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </a>
          </div>
        </BlitzReveal>
      </div>
    </section>
  );
}

/* ─── FOOTER ────────────────────────────────────────────────────────── */

function FooterSection() {
  return (
    <footer className="border-t border-border/60 bg-background py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <BlitzBolt className="h-5 w-5 text-[var(--blitz)]" />
            <span className="blitz-code">blitzyxsc-plus v2.0.0</span>
            <span className="text-muted-foreground/60">·</span>
            <span>MIT</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
            <a href="/docs" className="transition-colors hover:text-[var(--blitz)]">
              Docs
            </a>
            <a href="https://github.com/blitzlabx/blitzyxsc-plus" className="transition-colors hover:text-[var(--blitz)]">
              GitHub
            </a>
            <a href="https://x.com/blitzlabx" className="transition-colors hover:text-[var(--blitz)]">
              @blitzlabx
            </a>
            <a href="https://flutterwave.com/donate/knjcdfjgzwyt" className="transition-colors hover:text-[var(--blitz)]">
              Donate
            </a>
          </div>
        </div>
        <div className="mt-4 text-center text-[10px] text-muted-foreground/60 sm:mt-6 sm:text-xs">
          blitzyxsc-plus by Blitz created by blitzlabx. Not affiliated with X Corp.
          Use responsibly.
        </div>
      </div>
    </footer>
  );
}

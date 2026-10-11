'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ArrowRight, Github, Zap, ShieldCheck, Server, Cloud, Code2, KeyRound,
  Twitter, Terminal, Clock, Heart, Copy, Check, ChevronRight, Activity,
  Cpu, Layers, Globe,
} from 'lucide-react';
import {
  BlitzBolt, BlitzGrid, BlitzScanlines, BlitzStatusDot,
  BlitzTypewriter, BlitzMarquee, BlitzReveal, BlitzParallax,
} from '@/components/blitz/animations';
import { LivePlayground } from '@/components/blitz/live-playground';

const API_BASE_URL = '';  // empty = relative URL (gateway routes via XTransformPort)

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
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

/* ----------------------------------------------------------------- */
/* Hero                                                               */
/* ----------------------------------------------------------------- */

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      <BlitzGrid />
      <BlitzScanlines />
      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-24 sm:pt-40 lg:pt-48">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--blitz)]/30 bg-[var(--blitz)]/5 px-4 py-1.5 text-xs">
            <BlitzStatusDot />
            <span className="text-muted-foreground">v1.0.0 — live, no auth, no rate limit</span>
          </div>
        </motion.div>

        {/* Logo / bolt */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <BlitzBolt className="h-20 w-20 text-[var(--blitz)] blitz-text-glow" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center font-mono text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span className="text-foreground">blitzyxsc</span>
          <span className="text-[var(--blitz)] blitz-text-glow">-plus</span>
        </motion.h1>

        {/* Typewriter tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <div className="blitz-code inline-block rounded-lg border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground">
            <span className="text-[var(--blitz)]">$</span>{' '}
            <BlitzTypewriter
              text="fetch tweets without an API key."
              speed={45}
              startDelay={900}
              className="text-foreground"
            />
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mx-auto mt-8 max-w-2xl text-center text-lg text-muted-foreground"
        >
          A standalone REST API for fetching X/Twitter data — posts, profiles,
          replies, trends, followers — without touching the developer console.
          Deploy to Vercel, Cloudflare, Netlify, Deno, Bun, or your own box.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <a href="#playground">
            <Button
              size="lg"
              className="bg-[var(--blitz)] text-[var(--blitz-foreground)] hover:bg-[var(--blitz)]/90"
            >
              <Terminal className="mr-2 h-4 w-4" />
              Try it live
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <a href="https://github.com/blitzlabx/blitzyxsc-plus" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="border-border hover:border-[var(--blitz)]">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </a>
        </motion.div>

        {/* Quick stat row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 0.8 }}
          className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            { label: 'Endpoints', value: '14' },
            { label: 'Auth required', value: 'None' },
            { label: 'Cold start', value: '~0ms' },
            { label: 'Languages', value: 'TS-only' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-card/40 p-3 text-center"
            >
              <div className="blitz-code text-xl font-semibold text-[var(--blitz)]">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ----------------------------------------------------------------- */
/* Marquee strip                                                      */
/* ----------------------------------------------------------------- */

function MarqueeStrip() {
  const items = [
    'NO API KEY', 'NO OAUTH', 'NO DEVELOPER CONSOLE', 'NO RATE LIMITS',
    'NO ACCOUNT BAN RISK', 'NO TOKENS TO ROTATE', 'NO BULLSHIT',
    'CLOUDFLARE-READY', 'VERCEL-READY', 'NETLIFY-READY', 'DENO-READY',
    'BUN-READY', 'NODE-READY', 'EDGE-READY',
  ];
  return (
    <div className="relative border-y border-border bg-card/30 py-3">
      <BlitzMarquee speed={50}>
        {items.map((it) => (
          <span
            key={it}
            className="mx-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            <span className="text-[var(--blitz)]">◆</span>
            {it}
          </span>
        ))}
      </BlitzMarquee>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/* Stats bar                                                          */
/* ----------------------------------------------------------------- */

function StatsBar() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <BlitzReveal className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {[
          { icon: Zap, label: 'Avg response', value: '~300ms', note: 'cold cache' },
          { icon: ShieldCheck, label: 'Auth required', value: '0', note: 'none, ever' },
          { icon: Activity, label: 'Uptime', value: '99.9%', note: 'community-hosted' },
          { icon: Layers, label: 'Endpoints', value: '14', note: 'all read-only' },
        ].map((s) => (
          <Card key={s.label} className="blitz-card-hover border-border bg-card/60">
            <CardContent className="p-5">
              <s.icon className="mb-3 h-5 w-5 text-[var(--blitz)]" />
              <div className="blitz-code text-2xl font-bold text-foreground">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground/70">{s.note}</div>
            </CardContent>
          </Card>
        ))}
      </BlitzReveal>
    </section>
  );
}

/* ----------------------------------------------------------------- */
/* Features                                                           */
/* ----------------------------------------------------------------- */

function FeaturesSection() {
  const features = [
    {
      icon: KeyRound,
      title: 'No developer console',
      body: "You don't apply for API access. You don't wait for approval. You don't get a token. You don't get rejected for being in the wrong country. You just deploy and go.",
    },
    {
      icon: ShieldCheck,
      title: 'No account ban risk',
      body: "blitzyxsc-plus never sends your Twitter credentials. Not your bearer token, not your cookies, not your OAuth. Twitter can't attribute the requests to you, so it can't throttle or suspend you.",
    },
    {
      icon: Cloud,
      title: 'Deploy anywhere',
      body: "Hono under the hood — one codebase, native adapters for Vercel, Cloudflare Workers, Netlify Functions, Deno Deploy, Bun, and plain Node. Same app, six runtimes, zero changes.",
    },
    {
      icon: Server,
      title: 'Edge-first by default',
      body: "Runs on Cloudflare's 300+ edge locations or Vercel Edge Functions. Responses are served from the closest PoP, with Cache-Control headers tuned per endpoint.",
    },
    {
      icon: Code2,
      title: 'Typed end-to-end',
      body: "Every route, every model, every response is typed. The Hono app is the source of truth — you get TypeScript inference, request validation, and JSON Schema export for free.",
    },
    {
      icon: Activity,
      title: 'Built-in rate limiting',
      body: "60 requests per minute per IP by default. Sliding window. In-memory on a single instance, or swap in Cloudflare KV / Durable Objects for distributed deployments.",
    },
    {
      icon: Clock,
      title: 'Smart caching',
      body: "Profiles cached 5 min, tweets 30 min, trends 5 min, conversations 30 sec. Every response ships with X-Cache: HIT/MISS so you can see exactly what's happening.",
    },
    {
      icon: Globe,
      title: 'CORS-enabled',
      body: "Access-Control-Allow-Origin: * by default. Call it from the browser, from a worker, from a CLI tool, from Postman — anywhere that speaks HTTP.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <BlitzReveal className="mb-12 max-w-3xl">
        <Badge variant="outline" className="mb-4 border-[var(--blitz)]/40 text-[var(--blitz)]">
          <Cpu className="mr-1.5 h-3 w-3" />
          What you get
        </Badge>
        <h2 className="font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Not another Twitter scraper.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          A proper REST API. With caching. With rate limiting. With typed
          responses. With deploy configs for every major platform. You hit a
          URL, you get JSON, you move on with your life.
        </p>
      </BlitzReveal>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <BlitzReveal key={f.title} delay={i * 0.05}>
            <Card className="blitz-card-hover h-full border-border bg-card/60">
              <CardHeader>
                <f.icon className="mb-2 h-6 w-6 text-[var(--blitz)]" />
                <CardTitle className="text-base font-semibold">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          </BlitzReveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- */
/* Playground                                                         */
/* ----------------------------------------------------------------- */

function PlaygroundSection() {
  return (
    <section id="playground" className="border-y border-border bg-card/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <BlitzReveal className="mb-10 max-w-3xl">
          <Badge variant="outline" className="mb-4 border-[var(--blitz)]/40 text-[var(--blitz)]">
            <Terminal className="mr-1.5 h-3 w-3" />
            Live playground
          </Badge>
          <h2 className="font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Hit the API. Right now.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real requests. Real responses. Real tweets. No signup, no key, no
            waiting. Pick an endpoint, hit Send.
          </p>
        </BlitzReveal>

        <BlitzReveal>
          <Card className="border-border bg-background/40">
            <CardContent className="p-6">
              <LivePlayground apiBaseUrl={API_BASE_URL} />
            </CardContent>
          </Card>
        </BlitzReveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- */
/* Endpoints listing                                                  */
/* ----------------------------------------------------------------- */

function EndpointsSection() {
  const endpoints = [
    { method: 'GET', path: '/api/profile/:handle', desc: 'User profile, follower count, verified status, avatar, banner.' },
    { method: 'GET', path: '/api/status/:id', desc: 'Single tweet — text, author, media, counts.' },
    { method: 'GET', path: '/api/timeline/:handle?limit=20', desc: 'Recent tweets from any user.' },
    { method: 'GET', path: '/api/replies/:id', desc: 'Full conversation — root + thread + replies.' },
    { method: 'GET', path: '/api/thread/:id', desc: 'Unrolled thread (same-author follow-ups).' },
    { method: 'GET', path: '/api/trends', desc: 'Current trending topics on X.' },
    { method: 'GET', path: '/api/search/users?q=...', desc: 'User search via typeahead.' },
    { method: 'GET', path: '/api/followers/:handle?limit=20', desc: 'Follower list.' },
    { method: 'GET', path: '/api/following/:handle?limit=20', desc: 'Following list.' },
    { method: 'GET', path: '/api/media/:handle?limit=20', desc: 'Media-only timeline.' },
    { method: 'GET', path: '/api/mentions/:handle?limit=20', desc: "User's recent replies (= mentions)." },
    { method: 'GET', path: '/api/about/:handle', desc: 'Extended profile metadata.' },
    { method: 'GET', path: '/api/reposts/:id', desc: 'List of users who reposted a tweet.' },
    { method: 'GET', path: '/health', desc: 'Service health check.' },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <BlitzReveal className="mb-10 max-w-3xl">
        <Badge variant="outline" className="mb-4 border-[var(--blitz)]/40 text-[var(--blitz)]">
          <Layers className="mr-1.5 h-3 w-3" />
          14 endpoints
        </Badge>
        <h2 className="font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Every endpoint, one table.
        </h2>
      </BlitzReveal>

      <BlitzReveal>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Path</th>
                <th className="px-4 py-3 text-left">What it returns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {endpoints.map((ep) => (
                <tr key={ep.path} className="hover:bg-card/40">
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge variant="outline" className="border-[var(--blitz)]/40 text-[var(--blitz)]">
                      {ep.method}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <code className="blitz-code text-foreground">{ep.path}</code>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BlitzReveal>
    </section>
  );
}

/* ----------------------------------------------------------------- */
/* Deploy                                                             */
/* ----------------------------------------------------------------- */

function DeploySection() {
  const platforms = [
    { name: 'Vercel', icon: '▲', cmd: 'vercel deploy --prod', desc: 'Edge Functions or Node serverless.' },
    { name: 'Cloudflare', icon: '◇', cmd: 'wrangler deploy', desc: 'Workers — 300+ edge locations.' },
    { name: 'Netlify', icon: '◆', cmd: 'netlify deploy --prod', desc: 'Functions with esbuild bundler.' },
    { name: 'Deno Deploy', icon: '●', cmd: 'deno deploy', desc: 'Deno.serve native adapter.' },
    { name: 'Bun', icon: '🍞', cmd: 'bun src/index.ts', desc: 'Bun.serve — fastest cold starts.' },
    { name: 'Node', icon: '⬢', cmd: 'npx tsx src/index.ts', desc: '@hono/node-server adapter.' },
    { name: 'Docker', icon: '🐳', cmd: 'docker compose up', desc: 'Self-host anywhere with Dockerfile + compose.' },
    { name: 'Appwrite', icon: '◈', cmd: 'deploy as function', desc: 'Serverless function with Node runtime.' },
  ];

  return (
    <section id="deploy" className="border-y border-border bg-card/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <BlitzReveal className="mb-10 max-w-3xl">
          <Badge variant="outline" className="mb-4 border-[var(--blitz)]/40 text-[var(--blitz)]">
            <Cloud className="mr-1.5 h-3 w-3" />
            Deploy anywhere
          </Badge>
          <h2 className="font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            One codebase. Eight runtimes.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The Hono app is runtime-agnostic. Pick the platform, run the
            matching adapter. Same TypeScript, same routes, same behavior.
          </p>
        </BlitzReveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {platforms.map((p, i) => (
            <BlitzReveal key={p.name} delay={i * 0.04}>
              <Card className="blitz-card-hover h-full border-border bg-card/60">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl text-[var(--blitz)]">{p.icon}</span>
                    <span className="font-semibold text-foreground">{p.name}</span>
                  </div>
                  <div className="mb-3 rounded-md border border-border bg-background/60 px-3 py-2 text-xs">
                    <code className="blitz-code text-[var(--blitz)]">$ {p.cmd}</code>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            </BlitzReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- */
/* Code samples                                                       */
/* ----------------------------------------------------------------- */

function CodeSamplesSection() {
  const [active, setActive] = useState('curl');
  const [copied, setCopied] = useState(false);

  const samples: Record<string, string> = {
    curl: `# Fetch @elonmusk's profile
curl https://blitzyxsc-plus.deno.dev/api/profile/elonmusk

# Recent @NASA tweets (limit 5)
curl "https://blitzyxsc-plus.deno.dev/api/timeline/NASA?limit=5"

# Full conversation for a tweet
curl https://blitzyxsc-plus.deno.dev/api/replies/2109357710227476607

# Current trending topics
curl https://blitzyxsc-plus.deno.dev/api/trends`,
    javascript: `// Browser / Node 18+ — native fetch
const res = await fetch('https://blitzyxsc-plus.deno.dev/api/profile/elonmusk');
const { data, meta } = await res.json();

console.log(data.screenName);   // 'elonmusk'
console.log(data.followers);     // 241_508_582
console.log(meta.durationMs);    // 312
console.log(meta.cached);         // false`,
    python: `import urllib.request, json

url = 'https://blitzyxsc-plus.deno.dev/api/timeline/NASA?limit=5'
with urllib.request.urlopen(url) as r:
    body = json.loads(r.read())
    for tweet in body['data']['tweets']:
        print(tweet['id'], tweet['text'][:60])`,
    go: `package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    resp, _ := http.Get("https://blitzyxsc-plus.deno.dev/api/trends")
    var body struct {
        Data struct {
            Trends []struct{ Name string \`json:"name"\` }
        \`json:"data"\`
    }
    json.NewDecoder(resp.Body).Decode(&body)
    for _, t := range body.Data.Trends {
        fmt.Println(t.Name)
    }
}`,
    rust: `use reqwest;

#[tokio::main]
async fn main() {
    let url = "https://blitzyxsc-plus.deno.dev/api/profile/elonmusk";
    let body: serde_json::Value = reqwest::get(url)
        .await.unwrap()
        .json().await.unwrap();
    println!("@{} — {} followers",
        body["data"]["screenName"],
        body["data"]["followers"]);
}`,
  };

  const copy = async () => {
    await navigator.clipboard.writeText(samples[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <BlitzReveal className="mb-10 max-w-3xl">
        <Badge variant="outline" className="mb-4 border-[var(--blitz)]/40 text-[var(--blitz)]">
          <Code2 className="mr-1.5 h-3 w-3" />
          Usage
        </Badge>
        <h2 className="font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          It's just HTTP.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          No SDK to install. No client to configure. Hit the URL, parse the
          JSON. Works in every language that has an HTTP client.
        </p>
      </BlitzReveal>

      <BlitzReveal>
        <Card className="border-border bg-card/60">
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <Tabs value={active} onValueChange={setActive}>
                <TabsList>
                  {Object.keys(samples).map((k) => (
                    <TabsTrigger key={k} value={k} className="blitz-code text-xs uppercase">
                      {k}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button size="sm" variant="ghost" onClick={copy} className="h-7 text-xs">
                {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <pre className="blitz-code overflow-x-auto rounded-md border border-border bg-background/60 p-4 text-xs leading-relaxed">
              <code>{samples[active]}</code>
            </pre>
          </CardContent>
        </Card>
      </BlitzReveal>
    </section>
  );
}

/* ----------------------------------------------------------------- */
/* Author                                                             */
/* ----------------------------------------------------------------- */

function AuthorSection() {
  return (
    <section className="border-t border-border bg-card/20 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <BlitzReveal>
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[var(--blitz)]/40 bg-[var(--blitz)]/10">
            <BlitzBolt className="h-8 w-8 text-[var(--blitz)]" />
          </div>
          <h2 className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built by Blitz.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            I got tired of X's developer portal. The approval queue. The rate
            limits. The "you don't qualify for elevated access" emails. So I
            built what I needed — and put it on the internet for free.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground/70">
            If blitzyxsc-plus saved you a few hours, consider buying me a coffee.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="https://flutterwave.com/donate/knjcdfjgzwyt" target="_blank" rel="noreferrer">
              <Button className="bg-[var(--blitz)] text-[var(--blitz-foreground)] hover:bg-[var(--blitz)]/90">
                <Heart className="mr-2 h-4 w-4" />
                Donate
              </Button>
            </a>
            <a href="https://x.com/blitzlabx" target="_blank" rel="noreferrer">
              <Button variant="outline" className="border-border hover:border-[var(--blitz)]">
                <Twitter className="mr-2 h-4 w-4" />
                @blitzlabx
              </Button>
            </a>
            <a href="https://github.com/blitzlabx/blitzyxsc-plus" target="_blank" rel="noreferrer">
              <Button variant="outline" className="border-border hover:border-[var(--blitz)]">
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

/* ----------------------------------------------------------------- */
/* Footer                                                             */
/* ----------------------------------------------------------------- */

function FooterSection() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BlitzBolt className="h-5 w-5 text-[var(--blitz)]" />
            <span className="blitz-code">blitzyxsc-plus v1.0.0</span>
            <span className="text-muted-foreground/60">·</span>
            <span>MIT License</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="https://github.com/blitzlabx/blitzyxsc-plus" className="hover:text-[var(--blitz)]">
              GitHub
            </a>
            <a href="https://x.com/blitzlabx" className="hover:text-[var(--blitz)]">
              @blitzlabx
            </a>
            <a href="https://flutterwave.com/donate/knjcdfjgzwyt" className="hover:text-[var(--blitz)]">
              Donate
            </a>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-muted-foreground/60">
          blitzyxsc-plus by Blitz created by blitzlabx. Not affiliated with X Corp.
          Use responsibly.
        </div>
      </div>
    </footer>
  );
}

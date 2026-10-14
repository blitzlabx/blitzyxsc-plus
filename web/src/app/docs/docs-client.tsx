'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Terminal, Shield, Clock, Globe, Server, Activity, Code2,
  Zap, ArrowLeft, Layers, Lock, Gauge, BookOpen, Cloud,
} from 'lucide-react';
import { BlitzBolt, BlitzReveal } from '@/components/blitz/animations';
import Link from 'next/link';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/profile/:handle',
    summary: 'User profile — screen name, name, bio, follower count, verified status, avatar, banner.',
    cacheTtl: '300s (5 min)',
    params: [{ name: 'handle', type: 'string', required: true, desc: 'Twitter screen name (with or without @)' }],
    sample: `{ "ok": true, "data": { "id": "44196397", "screenName": "elonmusk", "name": "Elon Musk", "followers": 241501097, "verified": true } }`,
  },
  {
    method: 'GET',
    path: '/api/status/:id',
    summary: 'Single tweet — text, author, media, reply/repost/like counts, views.',
    cacheTtl: '1800s (30 min)',
    params: [{ name: 'id', type: 'string', required: true, desc: 'Numeric tweet ID (5–25 digits)' }],
    sample: `{ "ok": true, "data": { "id": "2110438877274259488", "text": "Try Grok Voice", "author": {...}, "replyCount": 508, "retweetCount": 205 } }`,
  },
  {
    method: 'GET',
    path: '/api/timeline/:handle',
    summary: "User's recent tweets.",
    cacheTtl: '60s (1 min)',
    params: [
      { name: 'handle', type: 'string', required: true, desc: 'Twitter screen name' },
      { name: 'limit', type: 'integer', required: false, desc: 'Max tweets (default 20, max 100)' },
    ],
    sample: `{ "ok": true, "data": { "handle": "NASA", "count": 5, "tweets": [...] } }`,
  },
  {
    method: 'GET',
    path: '/api/replies/:id',
    summary: 'Full conversation — root tweet + thread + replies.',
    cacheTtl: '30s',
    params: [{ name: 'id', type: 'string', required: true, desc: 'Root tweet ID' }],
    sample: `{ "ok": true, "data": { "root": {...}, "thread": [...], "replies": [...] } }`,
  },
  {
    method: 'GET',
    path: '/api/thread/:id',
    summary: 'Unrolled thread — root + same-author follow-ups only.',
    cacheTtl: '30s',
    params: [{ name: 'id', type: 'string', required: true, desc: 'Root tweet ID' }],
    sample: `{ "ok": true, "data": { "root": {...}, "tweets": [...] } }`,
  },
  {
    method: 'GET',
    path: '/api/trends',
    summary: 'Current trending topics on X.',
    cacheTtl: '300s (5 min)',
    params: [],
    sample: `{ "ok": true, "data": { "count": 6, "trends": [{ "name": "Starlink", "description": "Trending in United States" }] } }`,
  },
  {
    method: 'GET',
    path: '/api/search/users',
    summary: 'User search via typeahead.',
    cacheTtl: '60s',
    params: [{ name: 'q', type: 'string', required: true, desc: 'Search query (≤ 100 chars)' }],
    sample: `{ "ok": true, "data": { "query": "blitz", "count": 14, "users": [...] } }`,
  },
  {
    method: 'GET',
    path: '/api/followers/:handle',
    summary: "User's followers list.",
    cacheTtl: '3600s (1 hour)',
    params: [
      { name: 'handle', type: 'string', required: true, desc: 'Twitter screen name' },
      { name: 'limit', type: 'integer', required: false, desc: 'Default 20' },
    ],
    sample: `{ "ok": true, "data": { "handle": "elonmusk", "count": 5, "users": [...] } }`,
  },
  {
    method: 'GET',
    path: '/api/following/:handle',
    summary: "User's following list.",
    cacheTtl: '3600s (1 hour)',
    params: [
      { name: 'handle', type: 'string', required: true, desc: 'Twitter screen name' },
      { name: 'limit', type: 'integer', required: false, desc: 'Default 20' },
    ],
    sample: `{ "ok": true, "data": { "handle": "elonmusk", "count": 5, "users": [...] } }`,
  },
  {
    method: 'GET',
    path: '/api/media/:handle',
    summary: "User's media-only timeline (photos + videos).",
    cacheTtl: '60s',
    params: [
      { name: 'handle', type: 'string', required: true, desc: 'Twitter screen name' },
      { name: 'limit', type: 'integer', required: false, desc: 'Default 20' },
    ],
    sample: `{ "ok": true, "data": { "handle": "elonmusk", "count": 5, "tweets": [...] } }`,
  },
  {
    method: 'GET',
    path: '/api/mentions/:handle',
    summary: "User's recent replies (each is a mention of its parent tweet's author).",
    cacheTtl: '60s',
    params: [
      { name: 'handle', type: 'string', required: true, desc: 'Twitter screen name' },
      { name: 'limit', type: 'integer', required: false, desc: 'Default 20' },
    ],
    sample: `{ "ok": true, "data": { "handle": "elonmusk", "count": 5, "tweets": [...] } }`,
  },
  {
    method: 'GET',
    path: '/api/about/:handle',
    summary: 'Extended profile metadata — location, country, account source, username history.',
    cacheTtl: '300s (5 min)',
    params: [{ name: 'handle', type: 'string', required: true, desc: 'Twitter screen name' }],
    sample: `{ "ok": true, "data": { "screenName": "elonmusk", "location": "United States", "raw": {...} } }`,
  },
  {
    method: 'GET',
    path: '/api/reposts/:id',
    summary: 'Users who reposted a tweet.',
    cacheTtl: '1800s (30 min)',
    params: [{ name: 'id', type: 'string', required: true, desc: 'Numeric tweet ID' }],
    sample: `{ "ok": true, "data": { "id": "2110438877274259488", "count": 20, "users": [...] } }`,
  },
  {
    method: 'GET',
    path: '/health',
    summary: 'Service health check — version, uptime, rate limit.',
    cacheTtl: 'no-store',
    params: [],
    sample: `{ "ok": true, "data": { "status": "ok", "version": "2.0.0", "uptime": 3600, "rateLimitPerMin": 60 } }`,
  },
];

export function DocsClient() {
  return (
    <main className="relative min-h-screen-safe overflow-x-hidden">
      {/* Back link */}
      <div className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-[var(--blitz)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
          <Link
            href="/#playground"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-[var(--blitz)]"
          >
            <Terminal className="h-3.5 w-3.5" />
            Open playground
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Header */}
        <BlitzReveal className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 blur-xl opacity-60">
                <BlitzBolt className="h-10 w-10 text-[var(--blitz)]" />
              </div>
              <BlitzBolt className="relative h-8 w-8 text-[var(--blitz)]" />
            </div>
            <div>
              <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                blitzyxsc<span className="text-[var(--blitz)] blitz-text-glow-soft">-plus</span>
                <span className="ml-2 blitz-rainbow-text text-base">v2.0.0</span>
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Comprehensive documentation · by Blitz (blitzlabx)
              </p>
            </div>
          </div>
        </BlitzReveal>

        {/* TL;DR */}
        <BlitzReveal className="mb-10">
          <Card className="blitz-glass border-border/60">
            <CardContent className="p-4 sm:p-6">
              <h2 className="mb-2 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-foreground sm:text-base">
                <BookOpen className="h-4 w-4 text-[var(--blitz)]" />
                TL;DR
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                blitzyxsc-plus is a standalone REST API that fetches public X/Twitter data
                — profiles, tweets, replies, threads, trends, followers, media — without
                requiring API keys, OAuth tokens, or developer console approval. You hit
                a URL, you get JSON, you move on with your life. The whole thing is built
                on Hono and runs natively on Vercel, Cloudflare Workers, Netlify, Deno
                Deploy, Bun, Node, and Docker.
              </p>
            </CardContent>
          </Card>
        </BlitzReveal>

        {/* Quick facts */}
        <BlitzReveal className="mb-10">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            {[
              { icon: Activity, label: 'Endpoints', value: '14' },
              { icon: Lock, label: 'Auth required', value: 'None' },
              { icon: Gauge, label: 'Rate limit', value: '60/min' },
              { icon: Clock, label: 'Avg latency', value: '~300ms' },
            ].map((s) => (
              <div key={s.label} className="blitz-glass rounded-lg p-3 text-center sm:p-4">
                <s.icon className="mx-auto mb-1.5 h-4 w-4 text-[var(--blitz)] sm:h-5 sm:w-5" />
                <div className="blitz-code text-base font-bold text-foreground sm:text-lg">{s.value}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </BlitzReveal>

        {/* Sections */}
        <Section id="envelope" icon={Layers} title="Response envelope">
          <p>
            Every response — success or failure — uses the same JSON envelope. Parse
            <code className="blitz-code text-[var(--blitz)]"> ok </code>
            first: if it&apos;s <code className="blitz-code">true</code>, the payload is in
            <code className="blitz-code text-[var(--blitz)]"> data</code>; if it&apos;s
            <code className="blitz-code"> false</code>, look at
            <code className="blitz-code text-[var(--blitz)]"> error</code> and
            <code className="blitz-code text-[var(--blitz)]"> message</code>.
          </p>
          <pre className="blitz-code mt-3 overflow-x-auto rounded-lg border border-border bg-background/60 p-3 text-[11px] leading-relaxed sm:text-xs blitz-scroll-x">
{`// Success (HTTP 2xx)
{
  "ok": true,
  "data": { /* endpoint-specific payload */ },
  "meta": {
    "requestId": "uuid-v4",
    "durationMs": 312,
    "cached": false,
    "provider": null,
    "timestamp": "2026-10-14T19:23:50.320Z"
  }
}

// Error (HTTP 4xx / 5xx)
{
  "ok": false,
  "error": "NOT_FOUND",      // uppercase machine code
  "message": "human-readable message",
  "requestId": "uuid-v4",
  "durationMs": 28
}`}
          </pre>
        </Section>

        <Section id="rate-limit" icon={Gauge} title="Rate limiting">
          <p>
            Every <code className="blitz-code text-[var(--blitz)]">/api/*</code> request
            counts against a sliding-window rate limit. The default is
            <strong className="text-foreground"> 60 requests per minute per IP</strong>,
            reset in 60-second windows. When you exceed it, you get a
            <code className="blitz-code text-[var(--blitz)]"> 429 </code>
            with a <code className="blitz-code">retryAfter</code> field telling you how
            many seconds to wait.
          </p>
          <p className="mt-2">
            Every response (whether or not you hit the limit) includes three
            <code className="blitz-code text-[var(--blitz)]"> X-RateLimit-*</code> response
            headers so clients can throttle themselves:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li><code className="blitz-code text-[var(--blitz)]">X-RateLimit-Limit</code> — total requests allowed per window (default 60)</li>
            <li><code className="blitz-code text-[var(--blitz)]">X-RateLimit-Remaining</code> — requests left in the current window</li>
            <li><code className="blitz-code text-[var(--blitz)]">X-RateLimit-Reset</code> — epoch seconds when the window resets</li>
          </ul>
          <p className="mt-3">
            On serverless deployments the limiter is per-instance — so 5 instances
            effectively multiply your limit 5x. For strict distributed limiting, plug in
            Cloudflare KV / Durable Objects / Upstash Redis in
            <code className="blitz-code text-[var(--blitz)]"> api/src/lib/blitz-rate-limit.ts</code>.
          </p>
        </Section>

        <Section id="caching" icon={Clock} title="Caching">
          <p>
            Responses are cached both in-memory (per-instance) and via
            <code className="blitz-code text-[var(--blitz)]"> Cache-Control </code>
            headers so edge networks (Cloudflare, Vercel Edge, Netlify Edge) can cache
            without re-hitting the upstream. Every response includes an
            <code className="blitz-code text-[var(--blitz)]"> X-Cache </code>
            header (<code className="blitz-code">HIT</code> or <code className="blitz-code">MISS</code>).
          </p>
          <p className="mt-2">TTLs per endpoint (also visible in the table below):</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li><strong className="text-foreground">Profiles</strong> — 5 minutes</li>
            <li><strong className="text-foreground">Single tweets</strong> — 30 minutes</li>
            <li><strong className="text-foreground">Timelines</strong> — 1 minute</li>
            <li><strong className="text-foreground">Trends</strong> — 5 minutes</li>
            <li><strong className="text-foreground">Followers / Following</strong> — 1 hour</li>
            <li><strong className="text-foreground">Conversations / Threads</strong> — 30 seconds</li>
            <li><strong className="text-foreground">Search</strong> — 60 seconds</li>
          </ul>
          <p className="mt-3">
            All cache entries are also returned with a
            <code className="blitz-code text-[var(--blitz)]"> stale-while-revalidate</code>
            hint, so edge networks can serve a stale response for up to 2x the TTL
            while refreshing in the background.
          </p>
        </Section>

        <Section id="error-handling" icon={Shield} title="Error codes & handling">
          <p>
            Errors return a non-2xx HTTP status plus a structured JSON envelope. The
            <code className="blitz-code text-[var(--blitz)]"> error </code>
            field is a stable uppercase machine code — branch on it, not on the
            human-readable <code className="blitz-code">message</code>.
          </p>
          <div className="mt-3 overflow-x-auto blitz-scroll-x">
            <table className="w-full min-w-[480px] text-xs sm:text-sm">
              <thead className="bg-card/60 text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">HTTP</th>
                  <th className="px-3 py-2 text-left">error code</th>
                  <th className="px-3 py-2 text-left">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr><td className="px-3 py-2">400</td><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">BAD_REQUEST</code></td><td className="px-3 py-2 text-muted-foreground">Missing/invalid query param or path arg</td></tr>
                <tr><td className="px-3 py-2">401</td><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">AUTH</code></td><td className="px-3 py-2 text-muted-foreground">Endpoint needs auth (rare for read-only)</td></tr>
                <tr><td className="px-3 py-2">404</td><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">NOT_FOUND</code></td><td className="px-3 py-2 text-muted-foreground">User/tweet doesn&apos;t exist or was deleted</td></tr>
                <tr><td className="px-3 py-2">429</td><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">RATE_LIMITED</code></td><td className="px-3 py-2 text-muted-foreground">Hit the per-IP rate limit</td></tr>
                <tr><td className="px-3 py-2">500</td><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">INTERNAL_ERROR</code></td><td className="px-3 py-2 text-muted-foreground">Unexpected server error</td></tr>
                <tr><td className="px-3 py-2">502</td><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">NETWORK</code></td><td className="px-3 py-2 text-muted-foreground">Upstream timed out / unreachable</td></tr>
                <tr><td className="px-3 py-2">502</td><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">PARSE</code></td><td className="px-3 py-2 text-muted-foreground">Upstream returned non-JSON or malformed body</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            A <code className="blitz-code text-[var(--blitz)]">requestId</code> (UUID v4) is
            attached to every response envelope — include it in bug reports so we can
            trace the exact request.
          </p>
        </Section>

        <Section id="cors" icon={Globe} title="CORS">
          <p>
            All endpoints return
            <code className="blitz-code text-[var(--blitz)]"> Access-Control-Allow-Origin: * </code>
            with <code className="blitz-code">max-age=86400</code> preflight caching. You
            can call the API from a browser, a worker, a CLI tool, Postman, or any HTTP
            client. There are no allowed-origin restrictions —
            <strong className="text-foreground"> anyone can call it from anywhere</strong>.
          </p>
        </Section>

        <Section id="limits" icon={Server} title="Hard limits & input validation">
          <ul className="space-y-2 text-sm">
            <li>
              <code className="blitz-code text-[var(--blitz)]">limit</code> query param
              is clamped to <code className="blitz-code">[1, 100]</code>. Anything above
              100 silently returns 100. Anything below 1 falls back to the default (20).
            </li>
            <li>
              <code className="blitz-code text-[var(--blitz)]">id</code> (tweet ID) must
              match <code className="blitz-code">/^\&#123;5,25\&#125;$/</code> (5–25
              digits). Anything else returns 400.
            </li>
            <li>
              <code className="blitz-code text-[var(--blitz)]">handle</code> is
              normalized (leading <code className="blitz-code">@</code> stripped, trimmed)
              before being passed upstream.
            </li>
            <li>
              <code className="blitz-code text-[var(--blitz)]">q</code> (search query) is
              capped at 100 characters. Anything longer returns 400.
            </li>
            <li>
              Upstream HTTP timeout is 20s by default (overridable via the
              <code className="blitz-code text-[var(--blitz)]"> BLITZ_TIMEOUT_MS </code>
              env var on the server side).
            </li>
            <li>
              Failed upstream requests are retried up to 2 times with exponential
              backoff (500ms, 1000ms) before the error surfaces to the client.
            </li>
            <li>
              <code className="blitz-code text-[var(--blitz)]">429</code> from upstream
              triggers a longer backoff (2s × 2^attempt) before retry.
            </li>
          </ul>
        </Section>

        <Section id="security" icon={Lock} title="Security & privacy">
          <p>
            blitzyxsc-plus never uses your Twitter credentials. There are no API keys,
            no OAuth tokens, no cookies, no login state. Requests are made from the
            server, not from your browser session — so X cannot attribute them to your
            account. There is no per-account limit, no approval queue, no risk of
            account suspension.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Secure headers</strong> are applied to
            every response (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
            etc.) via Hono&apos;s <code className="blitz-code">secureHeaders</code> middleware.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">No request body</strong> is ever read —
            all 14 endpoints are GET-only. There is nothing to inject. Path and query
            params are URL-decoded by Hono and validated before use.
          </p>
        </Section>

        {/* Endpoints table */}
        <Section id="endpoints" icon={Code2} title="All 14 endpoints">
          <div className="space-y-3">
            {ENDPOINTS.map((ep, i) => (
              <BlitzReveal key={ep.path} delay={i * 0.02}>
                <Card className="blitz-glass border-border/60">
                  <CardContent className="p-3 sm:p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-[var(--blitz)]/40 bg-[var(--blitz)]/5 text-[var(--blitz)]">
                        {ep.method}
                      </Badge>
                      <code className="blitz-code text-xs text-foreground sm:text-sm blitz-break-anywhere">
                        {ep.path}
                      </code>
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        cache: {ep.cacheTtl}
                      </Badge>
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground sm:text-sm">{ep.summary}</p>

                    {ep.params.length > 0 && (
                      <div className="mb-3 overflow-x-auto blitz-scroll-x">
                        <table className="w-full min-w-[360px] text-[11px] sm:text-xs">
                          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                            <tr>
                              <th className="px-2 py-1 text-left">Param</th>
                              <th className="px-2 py-1 text-left">Type</th>
                              <th className="px-2 py-1 text-left">Required</th>
                              <th className="px-2 py-1 text-left">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {ep.params.map((p) => (
                              <tr key={p.name}>
                                <td className="px-2 py-1"><code className="blitz-code text-[var(--blitz)]">{p.name}</code></td>
                                <td className="px-2 py-1 text-muted-foreground">{p.type}</td>
                                <td className="px-2 py-1 text-muted-foreground">{p.required ? 'yes' : 'no'}</td>
                                <td className="px-2 py-1 text-muted-foreground blitz-break-anywhere">{p.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <details className="group">
                      <summary className="cursor-pointer text-[10px] uppercase tracking-wider text-muted-foreground/70 transition-colors hover:text-[var(--blitz)]">
                        ▸ Sample response
                      </summary>
                      <pre className="blitz-code mt-2 overflow-x-auto rounded-md border border-border/60 bg-background/60 p-3 text-[10px] leading-relaxed sm:text-xs blitz-scroll-x blitz-break-anywhere">
{ep.sample}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              </BlitzReveal>
            ))}
          </div>
        </Section>

        <Section id="deploy" icon={Cloud} title="Deployment">
          <p>
            The API is a single Hono app — one codebase, eight runtimes. Pick the
            platform, run the matching adapter. Same TypeScript, same routes, same
            behavior.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { name: 'Vercel', cmd: 'vercel deploy --prod' },
              { name: 'Cloudflare Workers', cmd: 'wrangler deploy' },
              { name: 'Netlify', cmd: 'netlify deploy --prod' },
              { name: 'Deno Deploy', cmd: 'deno deploy' },
              { name: 'Bun', cmd: 'bun src/index.ts' },
              { name: 'Node', cmd: 'npx tsx src/index.ts' },
              { name: 'Docker', cmd: 'docker compose up -d' },
              { name: 'Appwrite', cmd: 'deploy as function' },
            ].map((p) => (
              <div key={p.name} className="blitz-glass rounded-lg p-3">
                <div className="mb-1 text-xs font-semibold text-foreground sm:text-sm">{p.name}</div>
                <code className="blitz-code text-[10px] text-[var(--blitz)] sm:text-xs blitz-break-anywhere">
                  $ {p.cmd}
                </code>
              </div>
            ))}
          </div>
          <p className="mt-3">
            The Next.js website deploys separately (Vercel / Cloudflare Pages / Netlify).
            Set the <code className="blitz-code text-[var(--blitz)]">BLITZYXSC_PLUS_API</code>
            environment variable on the website to point at your deployed API URL — the
            Next.js rewrites will then proxy <code className="blitz-code">/api/*</code> and
            <code className="blitz-code">/health</code> calls to that backend, so the
            playground works without CORS issues.
          </p>
        </Section>

        <Section id="env" icon={Server} title="Environment variables (server)">
          <div className="overflow-x-auto blitz-scroll-x">
            <table className="w-full min-w-[480px] text-xs sm:text-sm">
              <thead className="bg-card/60 text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Variable</th>
                  <th className="px-3 py-2 text-left">Default</th>
                  <th className="px-3 py-2 text-left">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">PORT</code></td><td className="px-3 py-2 text-muted-foreground">8787</td><td className="px-3 py-2 text-muted-foreground">HTTP listen port</td></tr>
                <tr><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">HOST</code></td><td className="px-3 py-2 text-muted-foreground">0.0.0.0</td><td className="px-3 py-2 text-muted-foreground">HTTP listen host</td></tr>
                <tr><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">RATE_LIMIT_PER_MIN</code></td><td className="px-3 py-2 text-muted-foreground">60</td><td className="px-3 py-2 text-muted-foreground">Per-IP rate limit window size</td></tr>
                <tr><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">DISABLE_RATE_LIMIT</code></td><td className="px-3 py-2 text-muted-foreground">—</td><td className="px-3 py-2 text-muted-foreground">Set to <code className="blitz-code">1</code> to disable rate limiting (dev / trusted proxies)</td></tr>
                <tr><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">BLITZ_TIMEOUT_MS</code></td><td className="px-3 py-2 text-muted-foreground">20000</td><td className="px-3 py-2 text-muted-foreground">Per-upstream-request timeout</td></tr>
                <tr><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">BLITZ_RETRY</code></td><td className="px-3 py-2 text-muted-foreground">2</td><td className="px-3 py-2 text-muted-foreground">Retry attempts on 5xx / network errors</td></tr>
                <tr><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">BLITZ_PROVIDERS</code></td><td className="px-3 py-2 text-muted-foreground">fxtwitter,syndication</td><td className="px-3 py-2 text-muted-foreground">Comma-separated list of upstream providers (in priority order)</td></tr>
                <tr><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">DEBUG</code></td><td className="px-3 py-2 text-muted-foreground">—</td><td className="px-3 py-2 text-muted-foreground">Set to <code className="blitz-code">1</code> in production to enable request logging</td></tr>
                <tr><td className="px-3 py-2"><code className="blitz-code text-[var(--blitz)]">JWT_SECRET</code></td><td className="px-3 py-2 text-muted-foreground">—</td><td className="px-3 py-2 text-muted-foreground">Optional — only if you add an authenticated tier</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="usage" icon={Zap} title="Usage examples">
          <p>It&apos;s just HTTP. Hit the URL, parse the JSON. Works in every language.</p>
          <pre className="blitz-code mt-3 overflow-x-auto rounded-lg border border-border bg-background/60 p-3 text-[11px] leading-relaxed sm:text-xs blitz-scroll-x">
{`# cURL
curl https://YOUR_HOST/api/profile/elonmusk
curl "https://YOUR_HOST/api/timeline/NASA?limit=5"
curl https://YOUR_HOST/api/trends

# JavaScript (browser / Node / Bun / Deno)
const res = await fetch('https://YOUR_HOST/api/profile/elonmusk');
const { data, meta } = await res.json();
console.log(data.screenName, data.followers, meta.durationMs);

# Python
import urllib.request, json
with urllib.request.urlopen('https://YOUR_HOST/api/timeline/NASA?limit=5') as r:
    body = json.loads(r.read())
    for tweet in body['data']['tweets']:
        print(tweet['id'], tweet['text'][:60])`}
          </pre>
        </Section>

        <Section id="health" icon={Activity} title="Health checks">
          <p>Three health endpoints are available:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              <code className="blitz-code text-[var(--blitz)]">GET /health</code> — liveness
              probe. Returns version, uptime, and rate-limit config. Always 200.
            </li>
            <li>
              <code className="blitz-code text-[var(--blitz)]">GET /health/live</code> — minimal
              liveness check. Returns <code className="blitz-code">{'{ "status": "live" }'}</code>.
            </li>
            <li>
              <code className="blitz-code text-[var(--blitz)]">GET /health/ready</code> — readiness
              probe. Probes an upstream endpoint to confirm reachability. Returns 200 if
              reachable, 503 if degraded.
            </li>
          </ul>
        </Section>

        {/* Footer */}
        <div className="mt-12 border-t border-border/60 pt-6 text-center text-[10px] text-muted-foreground/60 sm:text-xs">
          <p>
            blitzyxsc-plus v2.0.0 · MIT · by Blitz (blitzlabx) · Not affiliated with X Corp.
          </p>
          <p className="mt-1">Use responsibly. Respect upstream rate limits.</p>
        </div>
      </div>
    </main>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <BlitzReveal id={id} className="mb-10 scroll-mt-20">
      <h2 className="mb-3 flex items-center gap-2 font-mono text-lg font-bold tracking-tight text-foreground sm:text-xl">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--blitz)]/30 bg-[var(--blitz)]/5">
          <Icon className="h-3.5 w-3.5 text-[var(--blitz)]" />
        </span>
        {title}
      </h2>
      <div className="space-y-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </BlitzReveal>
  );
}

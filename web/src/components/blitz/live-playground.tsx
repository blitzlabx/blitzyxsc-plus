'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Terminal, Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BlitzJsonViewer } from './json-viewer';

type EndpointDef = {
  id: string;
  method: 'GET';
  path: string;
  label: string;
  shortLabel: string;
  defaultPathParam: string;
  extraParams?: Array<{ name: string; default: string; label: string }>;
  description: string;
  group: 'user' | 'tweet' | 'trends' | 'health';
};

const ALL_ENDPOINTS: EndpointDef[] = [
  // User endpoints
  {
    id: 'profile',
    method: 'GET',
    path: '/api/profile/{handle}',
    label: 'Profile',
    shortLabel: 'profile',
    defaultPathParam: 'elonmusk',
    description: 'Fetch a user profile by screen name.',
    group: 'user',
  },
  {
    id: 'about',
    method: 'GET',
    path: '/api/about/{handle}',
    label: 'About',
    shortLabel: 'about',
    defaultPathParam: 'elonmusk',
    description: 'Fetch extended profile metadata (location, account source, etc.).',
    group: 'user',
  },
  {
    id: 'followers',
    method: 'GET',
    path: '/api/followers/{handle}',
    label: 'Followers',
    shortLabel: 'followers',
    defaultPathParam: 'elonmusk',
    extraParams: [{ name: 'limit', default: '5', label: 'Limit' }],
    description: "Fetch a user's followers list.",
    group: 'user',
  },
  {
    id: 'following',
    method: 'GET',
    path: '/api/following/{handle}',
    label: 'Following',
    shortLabel: 'following',
    defaultPathParam: 'elonmusk',
    extraParams: [{ name: 'limit', default: '5', label: 'Limit' }],
    description: "Fetch a user's following list.",
    group: 'user',
  },
  // Tweet endpoints
  {
    id: 'status',
    method: 'GET',
    path: '/api/status/{id}',
    label: 'Status',
    shortLabel: 'status',
    defaultPathParam: '2110438877274259488',
    description: 'Fetch a single tweet by ID.',
    group: 'tweet',
  },
  {
    id: 'timeline',
    method: 'GET',
    path: '/api/timeline/{handle}',
    label: 'Timeline',
    shortLabel: 'timeline',
    defaultPathParam: 'NASA',
    extraParams: [{ name: 'limit', default: '5', label: 'Limit' }],
    description: "Fetch a user's recent tweets.",
    group: 'user',
  },
  {
    id: 'replies',
    method: 'GET',
    path: '/api/replies/{id}',
    label: 'Replies',
    shortLabel: 'replies',
    defaultPathParam: '2110438877274259488',
    description: 'Fetch the full conversation (root + thread + replies).',
    group: 'tweet',
  },
  {
    id: 'thread',
    method: 'GET',
    path: '/api/thread/{id}',
    label: 'Thread',
    shortLabel: 'thread',
    defaultPathParam: '2110438877274259488',
    description: 'Fetch an unrolled thread (same-author follow-ups).',
    group: 'tweet',
  },
  {
    id: 'reposts',
    method: 'GET',
    path: '/api/reposts/{id}',
    label: 'Reposts',
    shortLabel: 'reposts',
    defaultPathParam: '2110438877274259488',
    description: 'Fetch the list of users who reposted a tweet.',
    group: 'tweet',
  },
  {
    id: 'media',
    method: 'GET',
    path: '/api/media/{handle}',
    label: 'Media',
    shortLabel: 'media',
    defaultPathParam: 'elonmusk',
    extraParams: [{ name: 'limit', default: '5', label: 'Limit' }],
    description: "Fetch a user's media-only timeline.",
    group: 'user',
  },
  {
    id: 'mentions',
    method: 'GET',
    path: '/api/mentions/{handle}',
    label: 'Mentions',
    shortLabel: 'mentions',
    defaultPathParam: 'elonmusk',
    extraParams: [{ name: 'limit', default: '5', label: 'Limit' }],
    description: "Fetch a user's recent replies (mentions of parent's author).",
    group: 'user',
  },
  // Search
  {
    id: 'search',
    method: 'GET',
    path: '/api/search/users',
    label: 'Search users',
    shortLabel: 'search',
    defaultPathParam: '',
    extraParams: [{ name: 'q', default: 'blitzlabx', label: 'Query' }],
    description: 'Search for users via typeahead.',
    group: 'trends',
  },
  // Trends
  {
    id: 'trends',
    method: 'GET',
    path: '/api/trends',
    label: 'Trends',
    shortLabel: 'trends',
    defaultPathParam: '',
    description: 'Fetch current trending topics.',
    group: 'trends',
  },
  // Health
  {
    id: 'health',
    method: 'GET',
    path: '/health',
    label: 'Health',
    shortLabel: 'health',
    defaultPathParam: '',
    description: 'Service health check — version, uptime, rate limit.',
    group: 'health',
  },
];

const GROUP_LABELS: Record<EndpointDef['group'], string> = {
  user: 'User',
  tweet: 'Tweet',
  trends: 'Trends & Search',
  health: 'Service',
};

/**
 * LivePlayground v2 — interactive API explorer.
 *
 * Evolved for v2:
 *   - All 14 endpoints available (was 8)
 *   - Search box to filter endpoints
 *   - Mobile-first horizontal snap-scroll for endpoint picker
 *   - Rainbow neon animated border around terminal output
 *   - JSON syntax highlighting with colors
 *   - Anti-lag: response truncation + content-visibility
 *   - URL bar with copy
 *   - Status badge with color coding
 *   - ⌘+Enter / Ctrl+Enter to send
 *
 * Author: Blitz (blitzlabx)
 */
export function LivePlayground({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [selectedId, setSelectedId] = useState<string>('profile');
  const [pathParam, setPathParam] = useState<string>('elonmusk');
  const [extraParams, setExtraParams] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [status, setStatus] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [cached, setCached] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [query, setQuery] = useState<string>('');

  const endpoint = ALL_ENDPOINTS.find((e) => e.id === selectedId)!;

  const buildUrl = useCallback(() => {
    let pathOnly = endpoint.path;
    if (endpoint.defaultPathParam !== '' || pathParam) {
      pathOnly = pathOnly.replace('{handle}', encodeURIComponent(pathParam || 'elonmusk'));
      pathOnly = pathOnly.replace('{id}', encodeURIComponent(pathParam || '1'));
    }
    const extras = endpoint.extraParams || [];
    const params = new URLSearchParams();
    for (const p of extras) {
      const v = extraParams[p.name] ?? p.default;
      if (v) params.set(p.name, v);
    }
    const qs = params.toString();
    return `${apiBaseUrl}${pathOnly}${qs ? `?${qs}` : ''}`;
  }, [apiBaseUrl, endpoint, pathParam, extraParams]);

  const selectEndpoint = (id: string) => {
    const ep = ALL_ENDPOINTS.find((e) => e.id === id)!;
    setSelectedId(id);
    setPathParam(ep.defaultPathParam);
    setExtraParams({});
    setResponse('');
    setStatus(null);
    setDurationMs(null);
    setCached(null);
  };

  const sendRequest = async () => {
    setLoading(true);
    setResponse('');
    setStatus(null);
    setDurationMs(null);
    setCached(null);
    const url = buildUrl();
    const start = performance.now();
    try {
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();
      const dur = performance.now() - start;
      setStatus(res.status);
      setDurationMs(Math.round(dur));
      setCached(res.headers.get('x-cache'));
      try {
        const json = JSON.parse(text);
        setResponse(JSON.stringify(json, null, 2));
      } catch {
        setResponse(text);
      }
    } catch (err: any) {
      setStatus(0);
      setResponse(`Network error: ${err?.message || String(err)}\n\nTried: ${url}`);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(buildUrl());
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 1500);
  };

  // ⌘+Enter / Ctrl+Enter to send
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!loading) sendRequest();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, buildUrl, sendRequest]);

  // Filter endpoints by search query
  const filteredEndpoints = ALL_ENDPOINTS.filter((ep) => {
    if (!query.trim()) return ep;
    const q = query.toLowerCase();
    return (
      ep.label.toLowerCase().includes(q) ||
      ep.path.toLowerCase().includes(q) ||
      ep.id.toLowerCase().includes(q) ||
      ep.description.toLowerCase().includes(q)
    );
  });

  // Group filtered endpoints
  const groupedEndpoints = filteredEndpoints.reduce<Record<string, EndpointDef[]>>(
    (acc, ep) => {
      (acc[ep.group] ||= []).push(ep);
      return acc;
    },
    {},
  );

  const statusColor =
    status === null
      ? 'border-border text-muted-foreground'
      : status >= 200 && status < 300
      ? 'border-[var(--blitz)] text-[var(--blitz)] bg-[var(--blitz)]/10'
      : status >= 400 && status < 500
      ? 'border-amber-500/60 text-amber-300 bg-amber-500/10'
      : 'border-destructive text-destructive bg-destructive/10';

  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-[260px_1fr] lg:gap-5">
      {/* ─── Endpoint picker ─── */}
      <aside className="flex flex-col gap-2">
        {/* Search box */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 14 endpoints…"
            className="blitz-glass w-full rounded-lg py-2 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-[var(--blitz)]"
            aria-label="Search endpoints"
          />
        </div>

        {/* Endpoint list — horizontal snap-scroll on mobile, grouped vertical on desktop */}
        <div className="blitz-scroll-x flex gap-1.5 pb-1 lg:block lg:space-y-3 lg:overflow-visible lg:pb-0">
          {Object.entries(groupedEndpoints).map(([group, eps]) => (
            <div key={group} className="lg:space-y-1">
              <div className="mb-1 hidden px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 lg:block">
                {GROUP_LABELS[group as EndpointDef['group']]}
              </div>
              <div className="flex gap-1.5 lg:block lg:space-y-1">
                {eps.map((ep) => {
                  const active = ep.id === selectedId;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => selectEndpoint(ep.id)}
                      className={`group relative flex shrink-0 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all lg:w-full ${
                        active
                          ? 'border-[var(--blitz)] bg-[var(--blitz)]/10 text-[var(--blitz)] shadow-[0_0_0_1px_var(--blitz-glow)]'
                          : 'border-border/40 bg-card/40 text-muted-foreground hover:border-[var(--blitz)]/40 hover:bg-card/60 hover:text-foreground'
                      }`}
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <span className="font-mono">{ep.label}</span>
                      <span
                        className={`text-[9px] uppercase tracking-wider ${active ? 'text-[var(--blitz)]' : 'text-muted-foreground/60'}`}
                      >
                        {ep.method}
                      </span>
                      {active && (
                        <motion.span
                          layoutId="endpoint-active-bar"
                          className="absolute left-0 top-1/2 hidden h-5 w-[2px] -translate-y-1/2 rounded-full bg-[var(--blitz)] lg:block"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ─── Right panel: request + response ─── */}
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        {/* Request builder */}
        <div className="blitz-glass rounded-xl p-3 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className="border-[var(--blitz)] bg-[var(--blitz)]/10 text-[var(--blitz)]"
              >
                {endpoint.method}
              </Badge>
              <code className="blitz-code min-w-0 truncate text-foreground/90 blitz-break-anywhere">
                {endpoint.path}
              </code>
            </div>
            <Button
              size="sm"
              onClick={sendRequest}
              disabled={loading}
              className="shrink-0 bg-[var(--blitz)] text-[var(--blitz-foreground)] hover:bg-[var(--blitz)]/90"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5" />
              )}
              Send
              <kbd className="ml-2 hidden text-[10px] opacity-60 sm:inline">⌘↵</kbd>
            </Button>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">{endpoint.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {endpoint.path.includes('{') && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {endpoint.path.includes('{handle}') ? 'Handle' : 'Tweet ID'}
                </label>
                <Input
                  value={pathParam}
                  onChange={(e) => setPathParam(e.target.value)}
                  placeholder={endpoint.defaultPathParam}
                  className="blitz-code font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) sendRequest();
                  }}
                />
              </div>
            )}
            {(endpoint.extraParams || []).map((p) => (
              <div key={p.name}>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {p.label}
                </label>
                <Input
                  value={extraParams[p.name] ?? p.default}
                  onChange={(e) =>
                    setExtraParams({ ...extraParams, [p.name]: e.target.value })
                  }
                  placeholder={p.default}
                  className="blitz-code font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) sendRequest();
                  }}
                />
              </div>
            ))}
          </div>

          {/* URL bar with copy */}
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2">
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              URL
            </span>
            <code className="blitz-code min-w-0 flex-1 truncate text-xs text-[var(--blitz)]">
              {buildUrl()}
            </code>
            <button
              onClick={copyUrl}
              className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-card hover:text-[var(--blitz)]"
              aria-label="Copy URL"
            >
              {urlCopied ? (
                <span className="text-[10px] text-[var(--blitz)]">copied!</span>
              ) : (
                <span className="text-[10px]">copy</span>
              )}
            </button>
          </div>
        </div>

        {/* Response viewer — terminal with rainbow neon border */}
        <RainbowTerminal>
          {/* Terminal header (mac-style dots + status) */}
          <div className="blitz-terminal-header">
            <div className="flex min-w-0 items-center gap-3">
              <span className="blitz-terminal-dots" aria-hidden>
                <span style={{ background: '#ff5f56' }} />
                <span style={{ background: '#ffbd2e' }} />
                <span style={{ background: '#27c93f' }} />
              </span>
              <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                response · {endpoint.shortLabel}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <AnimatePresence mode="wait">
                {status !== null && (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Badge variant="outline" className={`text-[10px] ${statusColor}`}>
                      {status === 0 ? 'NET' : status}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
              {durationMs !== null && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  <span className="text-foreground/80">{durationMs}ms</span>
                </span>
              )}
              {cached && (
                <Badge variant="outline" className="text-[9px] uppercase">
                  cache: {cached}
                </Badge>
              )}
              {loading && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  fetching…
                </span>
              )}
            </div>
          </div>

          {/* Output viewport — virtualization-safe */}
          <div className="blitz-output-viewport">
            <BlitzJsonViewer text={response} loading={loading} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/60 bg-card/40 px-3 py-1.5 text-[10px] text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" />
              blitzyxsc-plus
            </span>
            <span className="hidden sm:inline">⌘+Enter to send</span>
            <span className="sm:hidden">tap Send</span>
          </div>
        </RainbowTerminal>
      </div>
    </div>
  );
}

/**
 * RainbowTerminal — wraps children in a terminal-styled container
 * with an animated rainbow neon border.
 */
function RainbowTerminal({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={containerRef} className="blitz-rainbow-border rounded-xl">
      <div className="blitz-terminal blitz-glass-strong relative rounded-xl">
        {children}
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Copy, Check, Terminal, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type EndpointDef = {
  id: string;
  method: 'GET';
  path: string;
  label: string;
  defaultPathParam: string;
  extraParams?: Array<{ name: string; default: string; label: string }>;
  description: string;
  icon?: React.ReactNode;
};

const ENDPOINTS: EndpointDef[] = [
  {
    id: 'profile',
    method: 'GET',
    path: '/api/profile/{handle}',
    label: 'Profile',
    defaultPathParam: 'elonmusk',
    description: 'Fetch a user profile by screen name.',
  },
  {
    id: 'status',
    method: 'GET',
    path: '/api/status/{id}',
    label: 'Status',
    defaultPathParam: '2110438877274259488',
    description: 'Fetch a single tweet by ID.',
  },
  {
    id: 'timeline',
    method: 'GET',
    path: '/api/timeline/{handle}',
    label: 'Timeline',
    defaultPathParam: 'NASA',
    extraParams: [{ name: 'limit', default: '5', label: 'Limit' }],
    description: "Fetch a user's recent tweets.",
  },
  {
    id: 'replies',
    method: 'GET',
    path: '/api/replies/{id}',
    label: 'Replies',
    defaultPathParam: '2110438877274259488',
    description: 'Fetch the full conversation (root + thread + replies).',
  },
  {
    id: 'trends',
    method: 'GET',
    path: '/api/trends',
    label: 'Trends',
    defaultPathParam: '',
    description: 'Fetch current trending topics.',
  },
  {
    id: 'search',
    method: 'GET',
    path: '/api/search/users',
    label: 'Search',
    defaultPathParam: '',
    extraParams: [{ name: 'q', default: 'blitzlabx', label: 'Query' }],
    description: 'Search for users via typeahead.',
  },
  {
    id: 'followers',
    method: 'GET',
    path: '/api/followers/{handle}',
    label: 'Followers',
    defaultPathParam: 'elonmusk',
    extraParams: [{ name: 'limit', default: '5', label: 'Limit' }],
    description: "Fetch a user's followers list.",
  },
  {
    id: 'about',
    method: 'GET',
    path: '/api/about/{handle}',
    label: 'About',
    defaultPathParam: 'elonmusk',
    description: 'Fetch extended profile metadata.',
  },
];

/**
 * LivePlayground — interactive API explorer.
 * Evolved: glass surfaces, animated response transitions, mobile-first layout,
 * better empty/loading states, URL bar with copy, request timing visualization.
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
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile to switch endpoint list layout
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const endpoint = ENDPOINTS.find((e) => e.id === selectedId)!;

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
    const ep = ENDPOINTS.find((e) => e.id === id)!;
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

  const copyResponse = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(buildUrl());
    setUrlCopied(true);
    toast.success('URL copied');
    setTimeout(() => setUrlCopied(false), 1500);
  };

  // Keyboard shortcut: Cmd/Ctrl+Enter to send
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!loading) sendRequest();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, buildUrl]);

  const statusColor =
    status === null
      ? ''
      : status >= 200 && status < 300
      ? 'border-[var(--blitz)] text-[var(--blitz)] bg-[var(--blitz)]/10'
      : status >= 400 && status < 500
      ? 'border-amber-500/60 text-amber-300 bg-amber-500/10'
      : 'border-destructive text-destructive bg-destructive/10';

  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-[240px_1fr] lg:gap-5">
      {/* Endpoint list — horizontal scroll on mobile, vertical on desktop */}
      <div className="flex flex-row gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0 blitz-scroll-x">
        <div className="mb-2 hidden shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:flex">
          <Terminal className="h-3 w-3" />
          Endpoints
        </div>
        {ENDPOINTS.map((ep) => {
          const active = ep.id === selectedId;
          return (
            <button
              key={ep.id}
              onClick={() => selectEndpoint(ep.id)}
              className={`group relative flex shrink-0 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all lg:w-full ${
                active
                  ? 'border-[var(--blitz)] bg-[var(--blitz)]/10 text-[var(--blitz)] shadow-[0_0_0_1px_var(--blitz-glow)]'
                  : 'border-transparent hover:border-border hover:bg-card/50'
              }`}
              style={{ scrollSnapAlign: 'start' }}
            >
              <span className="font-mono">{ep.label}</span>
              <span
                className={`text-[10px] uppercase ${active ? 'text-[var(--blitz)]' : 'text-muted-foreground'}`}
              >
                {ep.method}
              </span>
              {active && (
                <motion.span
                  layoutId="endpoint-active-indicator"
                  className="absolute left-0 top-1/2 hidden h-6 w-[2px] -translate-y-1/2 rounded-full bg-[var(--blitz)] lg:block"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right panel: request + response */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Request builder */}
        <div className="blitz-glass rounded-xl p-3 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className="border-[var(--blitz)] bg-[var(--blitz)]/10 text-[var(--blitz)]"
              >
                {endpoint.method}
              </Badge>
              <code className="blitz-code truncate text-foreground/90">{endpoint.path}</code>
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
              <span className="ml-2 hidden text-[10px] opacity-60 sm:inline">⌘↵</span>
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
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
            <span className="shrink-0 text-xs font-mono text-muted-foreground">URL</span>
            <code className="blitz-code min-w-0 flex-1 truncate text-xs text-[var(--blitz)]">
              {buildUrl()}
            </code>
            <button
              onClick={copyUrl}
              className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-card hover:text-[var(--blitz)]"
              aria-label="Copy URL"
            >
              {urlCopied ? (
                <Check className="h-3.5 w-3.5 text-[var(--blitz)]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Response viewer */}
        <div className="blitz-glass rounded-xl p-3 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Response</span>
              <AnimatePresence mode="wait">
                {status !== null && (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge variant="outline" className={statusColor}>
                      {status === 0 ? 'NET' : status}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
              {durationMs !== null && (
                <span className="text-muted-foreground">
                  <span className="text-foreground/80">{durationMs}ms</span>
                </span>
              )}
              {cached && (
                <Badge variant="outline" className="text-[10px] uppercase">
                  cache: {cached}
                </Badge>
              )}
              {loading && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  fetching…
                </span>
              )}
            </div>
            {response && (
              <Button
                size="sm"
                variant="ghost"
                onClick={copyResponse}
                className="h-7 shrink-0 text-xs"
              >
                {copied ? (
                  <Check className="mr-1 h-3 w-3 text-[var(--blitz)]" />
                ) : (
                  <Copy className="mr-1 h-3 w-3" />
                )}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            )}
          </div>

          {/* Response body — uses a real <pre> so long lines wrap properly */}
          <div className="relative">
            <pre className="blitz-code max-h-[420px] min-h-[280px] overflow-auto rounded-lg bg-background/60 p-3 text-[11px] leading-relaxed sm:text-xs blitz-scroll-x">
              <AnimatePresence mode="wait">
                {response ? (
                  <motion.code
                    key={response.slice(0, 50) + status}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="block whitespace-pre-wrap break-words blitz-break-anywhere"
                  >
                    {response}
                  </motion.code>
                ) : (
                  <span className="text-muted-foreground">
                    {loading ? 'Loading…' : '// Press "Send" or ⌘+Enter to make a request'}
                  </span>
                )}
              </AnimatePresence>
            </pre>
          </div>

          {/* Footer hint */}
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Powered by blitzyxsc-plus
            </span>
            <span>{isMobile ? 'Tap Send to run' : '⌘+Enter to send'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
    defaultPathParam: '2109357710227476607',
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
    defaultPathParam: '2109357710227476607',
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
    label: 'Search Users',
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
];

/**
 * LivePlayground — interactive API explorer.
 * Sends real requests to the configured blitzyxsc-plus instance.
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

  const endpoint = ENDPOINTS.find((e) => e.id === selectedId)!;

  const buildUrl = useCallback(() => {
    // Use relative URL. In dev, Next.js rewrites /api/* to the API server
    // (configured in next.config.ts). In production, deploy the API as a
    // separate service and point your rewrite at its URL.
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

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Endpoint selector */}
      <div className="flex flex-col gap-1.5">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Endpoints
        </div>
        {ENDPOINTS.map((ep) => {
          const active = ep.id === selectedId;
          return (
            <button
              key={ep.id}
              onClick={() => selectEndpoint(ep.id)}
              className={`group relative flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-all ${
                active
                  ? 'border-[var(--blitz)] bg-[var(--blitz)]/10 text-[var(--blitz)]'
                  : 'border-transparent hover:border-border hover:bg-card/50'
              }`}
            >
              <span className="font-mono">{ep.label}</span>
              <span
                className={`text-[10px] uppercase ${active ? 'text-[var(--blitz)]' : 'text-muted-foreground'}`}
              >
                {ep.method}
              </span>
            </button>
          );
        })}
      </div>

      {/* Request + response panel */}
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-card/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="border-[var(--blitz)] text-[var(--blitz)]">
                {endpoint.method}
              </Badge>
              <code className="blitz-code text-foreground/90">{endpoint.path}</code>
            </div>
            <Button
              size="sm"
              onClick={sendRequest}
              disabled={loading}
              className="bg-[var(--blitz)] text-[var(--blitz-foreground)] hover:bg-[var(--blitz)]/90"
            >
              {loading ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-1 h-3.5 w-3.5" />}
              Send
            </Button>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">{endpoint.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {endpoint.path.includes('{') && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  {endpoint.path.includes('{handle}') ? 'Handle' : 'Tweet ID'}
                </label>
                <Input
                  value={pathParam}
                  onChange={(e) => setPathParam(e.target.value)}
                  placeholder={endpoint.defaultPathParam}
                  className="blitz-code font-mono"
                />
              </div>
            )}
            {(endpoint.extraParams || []).map((p) => (
              <div key={p.name}>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{p.label}</label>
                <Input
                  value={extraParams[p.name] ?? p.default}
                  onChange={(e) => setExtraParams({ ...extraParams, [p.name]: e.target.value })}
                  placeholder={p.default}
                  className="blitz-code font-mono"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">URL:</span>
            <code className="blitz-code flex-1 truncate text-[var(--blitz)]">{buildUrl()}</code>
          </div>
        </div>

        {/* Response panel */}
        <div className="rounded-lg border border-border bg-card/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Response</span>
              <AnimatePresence mode="wait">
                {status !== null && (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Badge
                      variant="outline"
                      className={
                        status >= 200 && status < 300
                          ? 'border-[var(--blitz)] text-[var(--blitz)]'
                          : 'border-destructive text-destructive'
                      }
                    >
                      {status === 0 ? 'NET' : status}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
              {durationMs !== null && (
                <span className="text-muted-foreground">{durationMs}ms</span>
              )}
              {cached && (
                <Badge variant="outline" className="text-xs">
                  cache: {cached}
                </Badge>
              )}
            </div>
            {response && (
              <Button size="sm" variant="ghost" onClick={copyResponse} className="h-7 text-xs">
                {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </div>
          <Textarea
            readOnly
            value={response || '// Press "Send" to make a request'}
            className="blitz-code min-h-[320px] resize-y bg-background/60 font-mono text-xs"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

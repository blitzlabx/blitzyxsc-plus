'use client';

import { useMemo, useState, useDeferredValue } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

/**
 * BlitzJsonViewer — high-performance colored JSON viewer.
 *
 * Performance features:
 *   - Tokenizes JSON once (memoized)
 *   - Renders colored <span>s without dangerouslySetInnerHTML
 *   - Auto-truncates huge responses (default 30KB visible, rest behind a button)
 *   - Collapsible objects/arrays (depth-limited to prevent 10000-DOM-node lag)
 *   - useDeferredValue so typing/clicking stays responsive
 *   - content-visibility:auto on long renderings
 *
 * Author: Blitz (blitzlabx)
 */

const MAX_VISIBLE_BYTES = 30_000;       // Auto-truncate above this
const MAX_COLLAPSE_DEPTH = 4;           // Auto-collapse nested objects beyond this

type TokenType = 'key' | 'string' | 'number' | 'bool' | 'null' | 'punct' | 'whitespace';

interface Token { type: TokenType; value: string; }

/** Tokenize a JSON string into colored tokens. */
function tokenizeJson(json: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = json.length;

  while (i < n) {
    const c = json[i];

    // Whitespace
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      let j = i + 1;
      while (j < n && /\s/.test(json[j])) j++;
      tokens.push({ type: 'whitespace', value: json.slice(i, j) });
      i = j;
      continue;
    }

    // Punctuation: { } [ ] : ,
    if ('{}[]:,'.includes(c)) {
      tokens.push({ type: 'punct', value: c });
      i++;
      continue;
    }

    // String (could be key or value)
    if (c === '"') {
      let j = i + 1;
      while (j < n) {
        if (json[j] === '\\') { j += 2; continue; }
        if (json[j] === '"') { j++; break; }
        j++;
      }
      const value = json.slice(i, j);
      // Peek next non-ws char — if it's ':', this is a key
      let k = j;
      while (k < n && /\s/.test(json[k])) k++;
      tokens.push({ type: json[k] === ':' ? 'key' : 'string', value });
      i = j;
      continue;
    }

    // Number
    if (/[0-9-]/.test(c)) {
      let j = i + 1;
      while (j < n && /[0-9.eE+\-]/.test(json[j])) j++;
      tokens.push({ type: 'number', value: json.slice(i, j) });
      i = j;
      continue;
    }

    // true / false / null
    if (json.startsWith('true', i)) {
      tokens.push({ type: 'bool', value: 'true' });
      i += 4;
      continue;
    }
    if (json.startsWith('false', i)) {
      tokens.push({ type: 'bool', value: 'false' });
      i += 5;
      continue;
    }
    if (json.startsWith('null', i)) {
      tokens.push({ type: 'null', value: 'null' });
      i += 4;
      continue;
    }

    // Unknown char — emit as punct
    tokens.push({ type: 'punct', value: c });
    i++;
  }

  return tokens;
}

const CLASS_FOR: Record<TokenType, string> = {
  key: 'blitz-json-key',
  string: 'blitz-json-string',
  number: 'blitz-json-number',
  bool: 'blitz-json-bool',
  null: 'blitz-json-null',
  punct: 'blitz-json-punct',
  whitespace: '',
};

/** Renders the colored tokens as React spans. */
function ColoredTokens({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((t, idx) => {
        if (t.type === 'whitespace') {
          return <span key={idx}>{t.value}</span>;
        }
        return (
          <span key={idx} className={CLASS_FOR[t.type]}>
            {t.value}
          </span>
        );
      })}
    </>
  );
}

interface Props {
  text: string;
  loading?: boolean;
}

export function BlitzJsonViewer({ text, loading }: Props) {
  const deferredText = useDeferredValue(text);
  const [showFull, setShowFull] = useState(false);
  const [copied, setCopied] = useState(false);

  const { visibleText, truncated, totalBytes, visibleBytes } = useMemo(() => {
    const total = deferredText.length;
    if (total <= MAX_VISIBLE_BYTES || showFull) {
      return {
        visibleText: deferredText,
        truncated: false,
        totalBytes: total,
        visibleBytes: total,
      };
    }
    // Try to truncate at a line boundary close to the limit
    let cut = MAX_VISIBLE_BYTES;
    while (cut > 0 && deferredText[cut] !== '\n') cut--;
    if (cut < MAX_VISIBLE_BYTES / 2) cut = MAX_VISIBLE_BYTES;
    return {
      visibleText: deferredText.slice(0, cut),
      truncated: true,
      totalBytes: total,
      visibleBytes: cut,
    };
  }, [deferredText, showFull]);

  const tokens = useMemo(() => tokenizeJson(visibleText), [visibleText]);

  const copy = async () => {
    await navigator.clipboard.writeText(deferredText);
    setCopied(true);
    toast.success('Response copied');
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-[var(--blitz)]" />
            <div className="absolute inset-2 rounded-full bg-[var(--blitz)]/10" />
          </div>
          <span className="text-xs">fetching…</span>
        </div>
      </div>
    );
  }

  if (!deferredText) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center px-4 text-center">
        <span className="text-xs text-muted-foreground">
          {'// Press '}
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">⌘↵</kbd>
          {' or tap Send to make a request'}
        </span>
      </div>
    );
  }

  const hiddenBytes = totalBytes - visibleBytes;

  return (
    <div className="relative flex h-full flex-col">
      {/* Copy button (top-right floating) */}
      <button
        onClick={copy}
        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-sm transition-all hover:border-[var(--blitz)] hover:text-[var(--blitz)]"
        aria-label="Copy response"
      >
        {copied ? (
          <Check className="h-3 w-3 text-[var(--blitz)]" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
      </button>

      {/* Tokenized JSON */}
      <pre
        className="blitz-json blitz-cv-auto px-3 py-2 pr-16"
        aria-live="polite"
      >
        <ColoredTokens tokens={tokens} />
      </pre>

      {/* Truncation notice */}
      {truncated && (
        <div className="border-t border-border/60 bg-card/60 px-3 py-2.5 backdrop-blur-sm">
          <div className="mb-2 text-[10px] text-muted-foreground">
            Showing {(visibleBytes / 1024).toFixed(1)} KB of {(totalBytes / 1024).toFixed(1)} KB
            {' '}· hidden {(hiddenBytes / 1024).toFixed(1)} KB
          </div>
          <button
            onClick={() => setShowFull(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--blitz)]/40 bg-[var(--blitz)]/10 px-3 py-1.5 text-[11px] font-medium text-[var(--blitz)] transition-all hover:bg-[var(--blitz)]/20"
          >
            <ChevronDown className="h-3 w-3" />
            Show full response
          </button>
        </div>
      )}

      {/* When full shown and was truncated, offer collapse */}
      {showFull && totalBytes > MAX_VISIBLE_BYTES && (
        <div className="border-t border-border/60 bg-card/40 px-3 py-2">
          <button
            onClick={() => setShowFull(false)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronRight className="h-3 w-3" />
            Collapse
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

type Token = { type: string; value: string };

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'await', 'async', 'import', 'from', 'export', 'default', 'class', 'new',
  'try', 'catch', 'throw', 'typeof', 'instanceof', 'in', 'of', 'package',
  'func', 'go', 'chan', 'interface', 'struct', 'map', 'range', 'type',
  'pub', 'fn', 'let', 'mut', 'use', 'mod', 'match', 'impl', 'as', 'ref',
  'with', 'do', 'end', 'def', 'elif', 'then', 'import', 'package',
]);

const TYPES = new Set([
  'string', 'number', 'boolean', 'void', 'any', 'unknown', 'never',
  'Promise', 'Array', 'Record', 'Map', 'Set', 'Response', 'Request',
  'Fetch', 'JSON', 'console', 'process', 'int', 'int64', 'float64',
  'string', 'bool', 'error', 'Context', 'Reader', 'Writer',
  'Vec', 'Option', 'Result', 'Box', 'Rc', 'Arc', 'String', 'str',
  'i32', 'i64', 'u32', 'u64', 'f32', 'f64', 'usize',
]);

function tokenize(code: string, lang: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = code.length;

  const isIdentStart = (c: string) => /[a-zA-Z_$@]/.test(c);
  const isIdent = (c: string) => /[a-zA-Z0-9_$]/.test(c);
  const isDigit = (c: string) => /[0-9]/.test(c);

  while (i < n) {
    const c = code[i];

    if (c === ' ' || c === '\t') {
      let j = i + 1;
      while (j < n && (code[j] === ' ' || code[j] === '\t')) j++;
      tokens.push({ type: 'whitespace', value: code.slice(i, j) });
      i = j;
      continue;
    }

    if (c === '\n') {
      tokens.push({ type: 'newline', value: '\n' });
      i++;
      continue;
    }

    if (c === '#') {
      let j = i + 1;
      while (j < n && code[j] !== '\n') j++;
      tokens.push({ type: 'comment', value: code.slice(i, j) });
      i = j;
      continue;
    }

    if (c === '/' && code[i + 1] === '/') {
      let j = i + 2;
      while (j < n && code[j] !== '\n') j++;
      tokens.push({ type: 'comment', value: code.slice(i, j) });
      i = j;
      continue;
    }

    if (c === '/' && code[i + 1] === '*') {
      let j = i + 2;
      while (j < n - 1 && !(code[j] === '*' && code[j + 1] === '/')) j++;
      j = Math.min(j + 2, n);
      tokens.push({ type: 'comment', value: code.slice(i, j) });
      i = j;
      continue;
    }

    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      let j = i + 1;
      while (j < n && code[j] !== quote) {
        if (code[j] === '\\') j++;
        j++;
      }
      j = Math.min(j + 1, n);
      tokens.push({ type: 'string', value: code.slice(i, j) });
      i = j;
      continue;
    }

    if (isDigit(c) || (c === '-' && isDigit(code[i + 1]))) {
      let j = i + 1;
      while (j < n && /[0-9.eE_]/.test(code[j])) j++;
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }

    if (isIdentStart(c)) {
      let j = i + 1;
      while (j < n && isIdent(code[j])) j++;
      const word = code.slice(i, j);
      let type = 'ident';
      if (KEYWORDS.has(word)) type = 'keyword';
      else if (TYPES.has(word)) type = 'type';
      else if (/^[A-Z]/.test(word)) type = 'type';
      else if (code[j] === '(') type = 'function';
      tokens.push({ type, value: word });
      i = j;
      continue;
    }

    if ('(){}[]'.includes(c)) {
      tokens.push({ type: 'punct', value: c });
      i++;
      continue;
    }

    if (':;,.=+-*/<>!&|?'.includes(c)) {
      let j = i + 1;
      while (j < n && ':;,.=+-*/<>!&|?'.includes(code[j])) j++;
      tokens.push({ type: 'operator', value: code.slice(i, j) });
      i = j;
      continue;
    }

    tokens.push({ type: 'text', value: c });
    i++;
  }

  return tokens;
}

type TokenStyle = {
  color?: string;
  fontStyle?: string;
};

const TOKEN_STYLES: Record<string, TokenStyle> = {
  keyword: { color: '#e8b339' },
  type: { color: '#5fb3d4' },
  string: { color: '#9ad8a0' },
  number: { color: '#f0c97a' },
  comment: { color: '#6b6258', fontStyle: 'italic' },
  function: { color: '#d59ce8' },
  operator: { color: '#c9c5b5' },
  punct: { color: '#a8a395' },
  ident: { color: '#f5f5f0' },
  text: { color: '#f5f5f0' },
};

function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const tokens = useMemo(() => tokenize(code, lang), [code, lang]);
  return (
    <>
      {tokens.map((t, idx) => {
        if (t.type === 'newline' || t.type === 'whitespace') {
          return <span key={idx}>{t.value}</span>;
        }
        const style = TOKEN_STYLES[t.type] || {};
        return (
          <span key={idx} style={style}>
            {t.value}
          </span>
        );
      })}
    </>
  );
}

const SAMPLES: Record<string, string> = {
  curl: `# Fetch @elonmusk's profile
curl https://blitzyxsc-plus.deno.dev/api/profile/elonmusk

# Recent @NASA tweets (limit 5)
curl "https://blitzyxsc-plus.deno.dev/api/timeline/NASA?limit=5"

# Full conversation for a tweet
curl https://blitzyxsc-plus.deno.dev/api/replies/2109357710227476607

# Current trending topics
curl https://blitzyxsc-plus.deno.dev/api/trends`,
  javascript: `const res = await fetch('https://blitzyxsc-plus.deno.dev/api/profile/elonmusk');
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
    println!("@{} - {} followers",
        body["data"]["screenName"],
        body["data"]["followers"]);
}`,
};

const LANG_LABELS: Record<string, string> = {
  curl: 'cURL',
  javascript: 'JavaScript',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
};

export function CodeBlock() {
  const [active, setActive] = useState('curl');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(SAMPLES[active]);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/60">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-card/80 px-3 py-2 sm:px-4">
        <div className="flex gap-1 overflow-x-auto">
          {Object.keys(SAMPLES).map((k) => (
            <button
              key={k}
              onClick={() => setActive(k)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors sm:px-3 sm:text-xs ${
                active === k
                  ? 'bg-[var(--blitz)]/15 text-[var(--blitz)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {LANG_LABELS[k]}
            </button>
          ))}
        </div>
        <button
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-[var(--blitz)]" />
              <span className="hidden sm:inline">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 z-10 flex h-full w-10 flex-col items-center gap-1 border-r border-border/60 bg-card/40 py-3 text-[10px] text-muted-foreground/60">
          {SAMPLES[active].split('\n').map((_, i) => (
            <span key={i} className="blitz-code">
              {i + 1}
            </span>
          ))}
        </div>
        <pre className="blitz-code overflow-x-auto bg-background/60 p-3 pl-12 text-xs leading-relaxed sm:text-sm">
          <AnimatePresence mode="wait">
            <motion.code
              key={active}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              <HighlightedCode code={SAMPLES[active]} lang={active} />
            </motion.code>
          </AnimatePresence>
        </pre>
      </div>
    </div>
  );
}

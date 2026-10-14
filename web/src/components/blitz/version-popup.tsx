'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Sparkles, Zap, Terminal, Shield, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlitzBolt } from './animations';

const STORAGE_KEY = 'blitzyxsc-plus:v2-seen';
const VERSION = '2.0.0';

const HIGHLIGHTS = [
  {
    icon: Terminal,
    title: 'Premium terminal output',
    body: 'Colored JSON, rainbow neon border, scanlines, virtualized rendering for huge responses.',
  },
  {
    icon: Zap,
    title: 'All 14 endpoints in playground',
    body: 'Profile, status, timeline, replies, thread, trends, search, followers, following, media, mentions, about, reposts, health.',
  },
  {
    icon: Globe,
    title: 'Mobile-first rebuild',
    body: 'No overflow, snap-scroll endpoint picker, proper wrapping, 44px tap targets, iOS zoom protection.',
  },
  {
    icon: Shield,
    title: 'No-lag rendering',
    body: 'Responses over 30KB auto-truncate with a “Show full response” button. content-visibility skips offscreen rows.',
  },
];

/**
 * BlitzVersionPopup — shows a one-time "What's new in v2" modal
 * on first visit. Dismiss state is persisted in localStorage so it
 * never shows twice to the same browser.
 *
 * Author: Blitz (blitzlabx)
 */
export function BlitzVersionPopup() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (seen !== VERSION) {
        // Delay slightly so the splash can finish first
        const t = setTimeout(() => setOpen(true), 2200);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage may be disabled (private mode) — skip popup.
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, VERSION);
    } catch {}
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={dismiss}
            aria-hidden
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="version-popup-title"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="blitz-rainbow-border relative w-full max-w-lg overflow-hidden rounded-2xl"
          >
            <div className="blitz-glass-strong relative rounded-2xl p-5 sm:p-7">
              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute right-3 top-3 z-10 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl opacity-60">
                    <BlitzBolt className="h-10 w-10 text-[var(--blitz)]" />
                  </div>
                  <BlitzBolt className="relative h-9 w-9 text-[var(--blitz)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="blitz-code text-lg font-bold tracking-tight sm:text-xl">
                      What&apos;s new
                    </span>
                    <span className="blitz-rainbow-text blitz-code text-xs font-bold sm:text-sm">
                      v{VERSION}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                    A massive upgrade from v1.
                  </p>
                </div>
              </div>

              {/* Highlights */}
              <ul className="mb-5 space-y-3">
                {HIGHLIGHTS.map((h, i) => (
                  <motion.li
                    key={h.title}
                    initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className="flex gap-3"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--blitz)]/30 bg-[var(--blitz)]/5">
                      <h.icon className="h-3.5 w-3.5 text-[var(--blitz)]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{h.title}</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground blitz-break-anywhere">
                        {h.body}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>

              {/* Footer CTA */}
              <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={dismiss}
                  className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                >
                  Don&apos;t show again
                </button>
                <a href="#playground" onClick={dismiss} className="sm:ml-auto">
                  <Button
                    size="sm"
                    className="bg-[var(--blitz)] text-[var(--blitz-foreground)] hover:bg-[var(--blitz)]/90"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Try the playground
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

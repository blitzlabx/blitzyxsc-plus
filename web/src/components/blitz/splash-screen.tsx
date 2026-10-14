'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BlitzBolt } from './animations';

/**
 * BlitzSplash — premium loading splash screen.
 * Shows on first page load, then fades out.
 *
 * Features:
 *   - Animated BlitzBolt with glow
 *   - Shimmer progress bar
 *   - Subtle scanlines
 *   - Reduced-motion safe
 *   - Auto-dismisses after min display time
 *
 * Author: Blitz (blitzlabx)
 */
export function BlitzSplash({ minDurationMs = 1500 }: { minDurationMs?: number }) {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const start = performance.now();
    const dismiss = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, minDurationMs - elapsed);
      setTimeout(() => setVisible(false), remaining);
    };

    // Dismiss on:
    // 1) window load (after all critical resources)
    // 2) fallback timeout (in case load never fires — e.g., slow assets)
    if (document.readyState === 'complete') {
      dismiss();
    } else {
      window.addEventListener('load', dismiss, { once: true });
    }
    const fallback = setTimeout(dismiss, minDurationMs + 2000);

    return () => {
      window.removeEventListener('load', dismiss);
      clearTimeout(fallback);
    };
  }, [minDurationMs]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="blitz-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
          aria-hidden={false}
          role="status"
          aria-live="polite"
        >
          {/* Scanlines for terminal feel */}
          <div className="blitz-scanlines absolute inset-0 pointer-events-none opacity-30" />

          {/* Bolt with glow */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 blur-2xl opacity-70">
              <BlitzBolt className="h-24 w-24 text-[var(--blitz)] sm:h-28 sm:w-28" />
            </div>
            <BlitzBolt className="relative h-20 w-20 text-[var(--blitz)] blitz-text-glow sm:h-24 sm:w-24" />
          </motion.div>

          {/* Brand name */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center"
          >
            <div className="blitz-code text-2xl font-bold tracking-tight sm:text-3xl">
              blitzyxsc
              <span className="text-[var(--blitz)] blitz-text-glow-soft">-plus</span>
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">
              <span className="blitz-rainbow-text font-semibold">v2.0.0</span>
              <span className="mx-1.5 text-muted-foreground/50">·</span>
              <span>no-auth X data API</span>
            </div>
          </motion.div>

          {/* Progress shimmer */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="blitz-splash-progress"
          />

          {/* Tagline */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70"
          >
            Loading · by Blitz
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

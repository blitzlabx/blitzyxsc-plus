'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * BlitzBolt — custom animated lightning bolt. No external assets.
 *
 * Author: Blitz (blitzlabx)
 */
export function BlitzBolt({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M13 2 L4 14 H10 L9 22 L20 9 H13 L13 2 Z"
        fill="currentColor"
        fillOpacity="0.08"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M13 2 L4 14 H10 L9 22 L20 9 H13 L13 2 Z"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />
    </svg>
  );
}

/**
 * BlitzGrid — animated background grid that pans slowly.
 */
export function BlitzGrid({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 blitz-grid-bg opacity-30 ${className}`}
      aria-hidden
    />
  );
}

/**
 * BlitzScanlines — terminal-style scanline overlay.
 */
export function BlitzScanlines({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 blitz-scanlines ${className}`}
      aria-hidden
    />
  );
}

/**
 * BlitzStatusDot — pulsing dot indicating "live" or "ok".
 */
export function BlitzStatusDot({ ok = true, className = '' }: { ok?: boolean; className?: string }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${ok ? 'bg-[var(--blitz)]' : 'bg-destructive'} animate-blitz-pulse-glow ${className}`}
      aria-hidden
    />
  );
}

/**
 * BlitzTypewriter — types out text character by character.
 */
export function BlitzTypewriter({
  text,
  className = '',
  speed = 35,
  startDelay = 0,
}: {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => {
      const tick = () => {
        if (i >= text.length) {
          setDone(true);
          return;
        }
        setDisplayed(text.slice(0, i + 1));
        i++;
        timer = setTimeout(tick, speed);
      };
      tick();
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [text, speed, startDelay]);

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="animate-blitz-blink">▊</span>}
    </span>
  );
}

/**
 * BlitzMarquee — horizontal scrolling text/elements.
 */
export function BlitzMarquee({
  children,
  className = '',
  speed = 30,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="flex w-max animate-blitz-marquee" style={{ animationDuration: `${speed}s` }}>
        <div className="flex">{children}</div>
        <div className="flex" aria-hidden>{children}</div>
      </div>
    </div>
  );
}

/**
 * BlitzReveal — fade-up-on-scroll reveal.
 */
export function BlitzReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * BlitzParallax — parallax-scrolled element.
 */
export function BlitzParallax({
  children,
  offset = 60,
  className = '',
}: {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

'use client';

import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * BlitzBolt — custom animated lightning bolt. No external assets.
 * Evolved: SVG draw + glow + subtle floating.
 */
export function BlitzBolt({ className = '' }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <motion.path
        d="M13 2 L4 14 H10 L9 22 L20 9 H13 L13 2 Z"
        fill="currentColor"
        fillOpacity="0.10"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M13 2 L4 14 H10 L9 22 L20 9 H13 L13 2 Z"
        fill="none"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />
    </svg>
  );
}

/**
 * BlitzGrid — animated background grid that pans slowly.
 * Evolved: parallax-on-scroll + radial mask for fade-out at edges.
 */
export function BlitzGrid({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  return (
    <motion.div
      ref={ref}
      style={{ y }}
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
 * BlitzAurora — soft animated gradient blobs for premium hero backgrounds.
 */
export function BlitzAurora({ className = '' }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div
        className="blitz-aurora-blob animate-blitz-aurora"
        style={{
          width: '40vw',
          height: '40vw',
          top: '5%',
          left: '-10%',
          background: 'radial-gradient(circle, oklch(0.85 0.20 75 / 0.4), transparent 60%)',
          animationDelay: reduceMotion ? '0s' : '0s',
        }}
      />
      <div
        className="blitz-aurora-blob animate-blitz-aurora"
        style={{
          width: '35vw',
          height: '35vw',
          top: '30%',
          right: '-10%',
          background: 'radial-gradient(circle, oklch(0.65 0.18 60 / 0.35), transparent 60%)',
          animationDelay: reduceMotion ? '0s' : '-6s',
        }}
      />
      <div
        className="blitz-aurora-blob animate-blitz-aurora"
        style={{
          width: '30vw',
          height: '30vw',
          bottom: '-5%',
          left: '30%',
          background: 'radial-gradient(circle, oklch(0.78 0.20 75 / 0.30), transparent 60%)',
          animationDelay: reduceMotion ? '0s' : '-12s',
        }}
      />
    </div>
  );
}

/**
 * BlitzStatusDot — pulsing dot indicating "live" or "ok".
 * Evolved: ripple ring effect.
 */
export function BlitzStatusDot({ ok = true, className = '' }: { ok?: boolean; className?: string }) {
  return (
    <span
      className={`relative inline-block h-2 w-2 ${className}`}
      aria-hidden
    >
      <span
        className={`absolute inset-0 rounded-full ${ok ? 'bg-[var(--blitz)]' : 'bg-destructive'} animate-blitz-pulse-glow`}
      />
      {!ok && (
        <span className="absolute inset-0 rounded-full bg-destructive/60 animate-blitz-pulse-ring" />
      )}
    </span>
  );
}

/**
 * BlitzTypewriter — types out text character by character.
 * Evolved: respects reduced-motion (renders full text immediately).
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
  const reduceMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState(reduceMotion ? text : '');
  const [done, setDone] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
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
  }, [text, speed, startDelay, reduceMotion]);

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="animate-blitz-blink">▊</span>}
    </span>
  );
}

/**
 * BlitzMarquee — horizontal scrolling text/elements.
 * Evolved: pause on hover, fade-out mask on edges.
 */
export function BlitzMarquee({
  children,
  className = '',
  speed = 30,
  pauseOnHover = true,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <div
        className={`flex w-max animate-blitz-marquee ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>{children}</div>
      </div>
    </div>
  );
}

/**
 * BlitzReveal — fade-up-on-scroll reveal.
 * Evolved: springy easing, reduced-motion safe.
 */
export function BlitzReveal({
  children,
  className = '',
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
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

/**
 * BlitzSpringNumber — animated number that springs into place.
 * Uses useSpring for buttery smoothing.
 */
export function BlitzSpringNumber({
  value,
  format = (n: number) => Math.round(n).toLocaleString(),
  className = '',
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(reduceMotion ? value : 0, { stiffness: 80, damping: 18 });
  const [display, setDisplay] = useState(reduceMotion ? format(value) : '0');

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(format(value));
      return;
    }
    spring.set(value);
    const unsub = spring.on('change', (v) => setDisplay(format(v)));
    return () => unsub();
  }, [value, spring, format, reduceMotion]);

  return <span className={className}>{display}</span>;
}

/**
 * BlitzMagneticButton — wraps a button/link with subtle magnetic pull on hover.
 * Premium micro-interaction.
 */
export function BlitzMagnetic({
  children,
  strength = 0.3,
  className = '',
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useSpring(0, { stiffness: 150, damping: 12 });
  const y = useSpring(0, { stiffness: 150, damping: 12 });

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={`inline-block ${className}`}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        x.set(dx * strength);
        y.set(dy * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * BlitzTiltCard — 3D tilt-on-hover card wrapper.
 * Premium effect for hero cards.
 */
export function BlitzTiltCard({
  children,
  className = '',
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      className={className}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        rotateX.set((0.5 - py) * max * 2);
        rotateY.set((px - 0.5) * max * 2);
      }}
      onMouseLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

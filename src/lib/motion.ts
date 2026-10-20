import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { CSSProperties } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger };

export const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const NARROW = () => window.matchMedia('(max-width: 760px)').matches;

/** Inline style that sets CSS custom properties (React's types reject `--x` keys). */
export const vars = (v: Record<string, string | number>) => v as CSSProperties;

/**
 * Live plate misregistration: the faster you scroll, the further the cobalt and vermilion plates of every
 * `.riso` heading drift apart (`--mis` on <html>); at rest they snap back into register.
 */
export const mis = { v: 0 };
export function trackMisregistration(scrollPos: () => number) {
  const root = document.documentElement;
  let last = scrollPos();
  gsap.ticker.add(() => {
    const y = scrollPos();
    const target = RM ? 0 : Math.min(16, Math.abs(y - last) * 0.35);
    last = y;
    mis.v = target > mis.v ? target : mis.v + (target - mis.v) * 0.08;
    root.style.setProperty('--mis', `${mis.v.toFixed(2)}px`);
  });
}

/** Runs `onChange(true/false)` as the element enters/leaves the viewport. */
export function whileVisible(el: Element, onChange: (visible: boolean) => void) {
  const io = new IntersectionObserver(([e]) => onChange(e.isIntersecting), { rootMargin: '10% 0px' });
  io.observe(el);
  return () => io.disconnect();
}

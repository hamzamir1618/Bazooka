import Lenis from 'lenis';
import { gsap, ScrollTrigger, RM } from './motion';

let lenis: Lenis | null = null;

/** Smooth scroll, driven by the GSAP ticker so ScrollTrigger scrubs stay in step. Call once before render. */
export function startSmoothScroll() {
  if (RM || lenis) return;
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export const getLenis = () => lenis;
export const scrollY = () => (lenis ? lenis.scroll : window.scrollY);
/** Where the scroll is heading (the end of a glide in progress), or where it is. */
export const targetY = () => (lenis ? lenis.targetScroll : window.scrollY);

/** Absolute scroll position, glided by default. */
export function scrollToY(y: number, opts: { immediate?: boolean; duration?: number; easing?: (x: number) => number; lock?: boolean } = {}) {
  if (lenis) {
    if (opts.immediate) lenis.scrollTo(y, { immediate: true, force: true });
    else lenis.scrollTo(y, { duration: opts.duration ?? 1.6, easing: opts.easing, lock: opts.lock, force: true });
  } else {
    window.scrollTo({ top: y, behavior: opts.immediate || RM ? 'auto' : 'smooth' });
  }
}

export function goTo(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  scrollToY(el.getBoundingClientRect().top + scrollY());
}

/** Straight to a section, no glide (used right after a page swap, while the screen is covered). */
export function jumpTo(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  lenis?.resize();
  scrollToY(el.getBoundingClientRect().top + scrollY(), { immediate: true });
}

/** Dev-only handles for the browser checks. */
export function exposeForTesting() {
  if (!import.meta.env.DEV) return;
  Object.assign(window, { lenis, ScrollTrigger, gsap });
}

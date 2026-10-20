import { useRef, type ReactNode, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { useRouter } from '../lib/router';

/** Poster-style page heading: kicker ribbon, riso title, Ruqaa Arabic line, lede. */
export function PageHead({ kicker, title, ar, lede, children }: { kicker: string; title: string; ar: string; lede?: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <span className="kicker ph-k">{kicker}</span>
      <h1 className="riso ph-t">{title.split(' ').map((w, i) => <span key={i}>{i > 0 && ' '}<span className="ph-w">{w}</span></span>)}</h1>
      <div className="ph-ar" lang="ar">{ar}</div>
      {lede && <p className="ph-lede">{lede}</p>}
      {children}
    </header>
  );
}

/**
 * Runs a page's entrance once the screen is uncovered: the heading words drop in and bounce, the Arabic line
 * swings in, then `more` adds the page's own moves to the same timeline.
 */
export function usePageIntro(root: RefObject<HTMLElement>, more?: (tl: gsap.core.Timeline) => void) {
  const { revealed } = useRouter();
  const done = useRef(false);
  useGSAP(() => {
    if (!revealed || done.current) return;
    done.current = true;
    if (RM) return;
    const tl = gsap.timeline({ delay: 0.15 })
      .fromTo('.ph-k', { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' })
      .fromTo('.ph-w', { yPercent: -120, rotation: (i: number) => (i % 2 ? 8 : -8), autoAlpha: 0 }, { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.6, ease: 'bounce.out', stagger: 0.07 }, 0.1)
      .fromTo('.ph-ar', { skewY: 20, autoAlpha: 0, x: 30 }, { skewY: -5, autoAlpha: 1, x: 0, duration: 0.6, ease: 'back.out(2)' }, 0.35)
      .fromTo('.ph-lede', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.5);
    more?.(tl);
  }, { scope: root, dependencies: [revealed] });
}

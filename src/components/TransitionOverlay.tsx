import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/motion';
import { labelOf, type Point, type Route, type Transition } from '../lib/router';
import { itemById } from '../data/menu';

export interface OverlayHandle {
  /** Covers the screen; resolves once nothing of the old page shows. */
  cover: (kind: Transition, to: Route, from?: Point) => Promise<void>;
  uncover: (kind: Transition) => Promise<void>;
}

/**
 * Full-screen scene changes between pages, each one a contraption from the home-page reel:
 * plates   vermilion, cobalt and Nile silkscreen plates sweep in from three sides, then on past
 * curtain  the cinema's red curtains swing shut, then part
 * slash    a seam flashes corner to corner and two triangle halves slam together, then slide apart
 * iris     an old-film iris closes to black on the click point, then opens
 * shutter  the 3 AM steel shutter bounces down, then rolls up
 * flame    a struck flame spreads from the click and burns the screen orange, then shrinks away
 * stamp    a ticket slides up and ORDER FIRED · بالهنا thumps onto it
 * GSAP owns every element here: no CSS transforms on them; start states are set below.
 */
export const TransitionOverlay = forwardRef<OverlayHandle>(function TransitionOverlay(_, ref) {
  const root = useRef<HTMLDivElement>(null);

  const reset = () => {
    gsap.set('.tx-v', { xPercent: -101 });
    gsap.set('.tx-c', { xPercent: 101 });
    gsap.set('.tx-n', { yPercent: 101 });
    gsap.set('.tx-cur-l', { xPercent: -101 });
    gsap.set('.tx-cur-r', { xPercent: 101 });
    gsap.set('.tx-tri-tl', { xPercent: -100, yPercent: -100, rotation: 0 });
    gsap.set('.tx-tri-br', { xPercent: 100, yPercent: 100, rotation: 0 });
    gsap.set('.tx-seam', { autoAlpha: 0, clipPath: 'inset(0% 0% 100% 100%)' });
    gsap.set('.tx-iris', { '--r': '150vmax', autoAlpha: 0 });
    gsap.set('.tx-shutter', { yPercent: -101 });
    gsap.set('.tx-flame', { clipPath: 'circle(0% at 50% 50%)' });
    gsap.set('.tx-ring', { autoAlpha: 0 });
    gsap.set('.tx-sheet', { yPercent: 110, x: 0 });
    gsap.set('.tx-stamp, .tx-label', { autoAlpha: 0 });
  };

  const { contextSafe } = useGSAP(() => { reset(); }, { scope: root });

  const q = (s: string) => root.current!.querySelector<HTMLElement>(s)!;

  const labelIn = (to: Route) => {
    const l = q('.tx-label'), [k, w, ar] = labelOf(to.view, to.param);
    l.querySelector('.tx-k')!.textContent = k;
    l.querySelector('.tx-w')!.textContent = w;
    l.querySelector('.tx-ar')!.textContent = ar;
    const img = l.querySelector<HTMLImageElement>('.tx-img')!;
    const dish = to.view === 'dish' ? itemById(to.param) : undefined;
    img.hidden = !dish;
    if (dish) img.src = dish.img;
    return gsap.timeline()
      .set(l, { autoAlpha: 1 })
      .fromTo(l, { yPercent: 30, rotation: -8, scale: 0.6 }, { yPercent: 0, rotation: -3, scale: 1, duration: 0.45, ease: 'back.out(2.4)' });
  };
  const labelOut = () => gsap.to(q('.tx-label'), { autoAlpha: 0, scale: 0.85, duration: 0.2, ease: 'power2.in' });

  useImperativeHandle(ref, () => {
    const api: OverlayHandle = {
      async cover(kind, to, from) {
        root.current!.classList.add('on');
        const tl = gsap.timeline();
        const x = from?.clientX ?? innerWidth / 2, y = from?.clientY ?? innerHeight / 2;

        if (kind === 'plates') {
          tl.to('.tx-v', { xPercent: 0, duration: 0.45, ease: 'power3.inOut' })
            .to('.tx-c', { xPercent: 0, duration: 0.45, ease: 'power3.inOut' }, 0.12)
            .to('.tx-n', { yPercent: 0, duration: 0.45, ease: 'power3.inOut' }, 0.24)
            .add(labelIn(to), '-=.1');
        } else if (kind === 'curtain') {
          tl.to('.tx-cur-l', { xPercent: 0, duration: 0.6, ease: 'power3.in' })
            .to('.tx-cur-r', { xPercent: 0, duration: 0.6, ease: 'power3.in' }, 0)
            .fromTo('.tx-cur', { skewX: 0 }, { skewX: (i: number) => (i ? -4 : 4), duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.out' }, 0.6)
            .add(labelIn(to), '-=.1');
        } else if (kind === 'slash') {
          tl.set('.tx-seam', { autoAlpha: 1 })
            .to('.tx-seam', { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.18, ease: 'power4.in' })
            .to('.tx-tri-tl', { xPercent: 0, yPercent: 0, duration: 0.42, ease: 'power4.in' }, 0.08)
            .to('.tx-tri-br', { xPercent: 0, yPercent: 0, duration: 0.42, ease: 'power4.in' }, 0.08)
            .to('.tx-seam', { autoAlpha: 0, duration: 0.15 }, 0.5)
            .fromTo('.tx-tri', { x: 0 }, { x: (i: number) => (i ? 8 : -8), duration: 0.06, yoyo: true, repeat: 3, ease: 'none' }, 0.5)
            .add(labelIn(to), 0.55);
        } else if (kind === 'iris') {
          const iris = q('.tx-iris');
          iris.style.setProperty('--x', `${x}px`);
          iris.style.setProperty('--y', `${y}px`);
          tl.set(iris, { autoAlpha: 1, '--r': '150vmax' })
            .to(iris, { '--r': '0vmax', duration: 0.7, ease: 'power3.in' })
            .add(labelIn(to), '-=.1');
        } else if (kind === 'shutter') {
          tl.to('.tx-shutter', { yPercent: 0, duration: 0.6, ease: 'bounce.out' })
            .add(labelIn(to), '-=.15');
        } else if (kind === 'flame') {
          const f = q('.tx-flame'), ring = q('.tx-ring');
          gsap.set(ring, { left: x, top: y, xPercent: -50, yPercent: -50, width: 10, height: 10, autoAlpha: 1 });
          tl.fromTo(f, { clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: 0.65, ease: 'power3.in' })
            .to(ring, { width: Math.hypot(innerWidth, innerHeight) * 3, height: Math.hypot(innerWidth, innerHeight) * 3, duration: 0.65, ease: 'power3.in' }, 0)
            .set(ring, { autoAlpha: 0 })
            .add(labelIn(to), '-=.1');
        } else if (kind === 'stamp') {
          tl.to('.tx-sheet', { yPercent: 0, duration: 0.5, ease: 'power3.in' })
            .fromTo('.tx-stamp', { scale: 3.2, rotation: -32, autoAlpha: 0 }, { scale: 1, rotation: -10, autoAlpha: 1, duration: 0.3, ease: 'power4.in' })
            .fromTo('.tx-sheet', { x: -14 }, { x: 0, duration: 0.6, ease: 'elastic.out(1,.25)' }, '-=.05');
        }
        tl.to({}, { duration: 0.15 });
        await tl.then(() => undefined);
      },

      async uncover(kind) {
        const tl = gsap.timeline({ onComplete: () => { reset(); root.current?.classList.remove('on'); } });
        if (kind === 'stamp') {
          tl.to('.tx-stamp', { scale: 0.7, autoAlpha: 0, duration: 0.25, ease: 'power2.in' })
            .to('.tx-sheet', { yPercent: -115, duration: 0.7, ease: 'power3.inOut' }, '-=.05');
          await tl.then(() => undefined);
          return;
        }
        tl.add(labelOut());
        if (kind === 'plates') {
          tl.to('.tx-n', { yPercent: -101, duration: 0.45, ease: 'power3.inOut' })
            .to('.tx-c', { xPercent: -101, duration: 0.45, ease: 'power3.inOut' }, '-=.33')
            .to('.tx-v', { xPercent: 101, duration: 0.45, ease: 'power3.inOut' }, '-=.33');
        } else if (kind === 'curtain') {
          tl.to('.tx-cur-l', { xPercent: -101, duration: 0.75, ease: 'power3.inOut' })
            .to('.tx-cur-r', { xPercent: 101, duration: 0.75, ease: 'power3.inOut' }, '<');
        } else if (kind === 'slash') {
          tl.to('.tx-tri-tl', { xPercent: -80, yPercent: -105, rotation: -12, duration: 0.6, ease: 'power3.in' })
            .to('.tx-tri-br', { xPercent: 80, yPercent: 105, rotation: 10, duration: 0.6, ease: 'power3.in' }, '<+.05');
        } else if (kind === 'iris') {
          const iris = q('.tx-iris');
          iris.style.setProperty('--x', '50%');
          iris.style.setProperty('--y', '50%');
          tl.to(iris, { '--r': '150vmax', duration: 0.75, ease: 'power3.in' });
        } else if (kind === 'shutter') {
          tl.to('.tx-shutter', { keyframes: { yPercent: [0, -8, -4, -101], easeEach: 'power2.inOut' }, duration: 0.75, ease: 'none' });
        } else if (kind === 'flame') {
          tl.to('.tx-flame', { clipPath: 'circle(0% at 50% 50%)', duration: 0.6, ease: 'power3.inOut' });
        }
        await tl.then(() => undefined);
      },
    };
    return { cover: contextSafe(api.cover), uncover: contextSafe(api.uncover) };
  });

  return (
    <div className="tx" ref={root} aria-hidden="true">
      <div className="tx-full tx-v" /><div className="tx-full tx-c" /><div className="tx-full tx-n" />
      <div className="tx-cur tx-cur-l" /><div className="tx-cur tx-cur-r" />
      <div className="tx-full tx-tri tx-tri-tl" /><div className="tx-full tx-tri tx-tri-br" />
      <svg className="tx-full tx-seam" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="104" y1="-4" x2="-4" y2="104" stroke="#D99B26" strokeWidth="16" vectorEffect="non-scaling-stroke" opacity="0.6" />
        <line x1="104" y1="-4" x2="-4" y2="104" stroke="#FFF6D8" strokeWidth="4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="tx-full tx-iris" />
      <div className="tx-full tx-shutter"><div className="tx-clock">03:00 AM</div><div className="tx-handle" /></div>
      <div className="tx-full tx-flame" /><div className="tx-ring" />
      <div className="tx-full tx-sheet">
        <div className="tx-stamp"><b>ORDER FIRED</b><span lang="ar">بالهنا</span></div>
      </div>
      <div className="tx-label">
        <img className="tx-img" alt="" hidden />
        <span className="tx-k" /><span className="tx-w riso" /><span className="tx-ar" lang="ar" />
      </div>
    </div>
  );
});

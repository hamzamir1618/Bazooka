import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, mis } from '../lib/motion';

/**
 * First load: three silkscreen plates (vermilion, cobalt, Nile key) sweep off in turn to reveal the registered
 * poster, while the headline plates swing wide and snap into register. Click to skip.
 */
export function Intro({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline>();

  useGSAP(() => {
    mis.v = 26;
    tl.current = gsap.timeline({ delay: 0.25, onComplete: onDone })
      .to('.ip-v', { xPercent: 102, duration: 0.6, ease: 'power3.inOut' }, 0)
      .to('.ip-c', { xPercent: -102, duration: 0.6, ease: 'power3.inOut' }, 0.28)
      .to('.ip-n', { yPercent: -102, duration: 0.6, ease: 'power3.inOut' }, 0.56)
      .add(onReveal, 0.7)
      .to(mis, { v: 0, duration: 1.2, ease: 'elastic.out(1, 0.35)' }, 0.9);
  }, { scope: root });

  return (
    <div className="intro" ref={root} onClick={() => tl.current?.timeScale(4)} aria-hidden="true">
      <div className="intro-plate ip-n"><span>١٩٦٨</span><small>PLATE 00 · NILE KEY</small></div>
      <div className="intro-plate ip-c"><span>بازوكا</span><small>PLATE 01 · AL-AHRAM COBALT</small></div>
      <div className="intro-plate ip-v"><span>صاروخ</span><small>PLATE 02 · POMEGRANATE VERMILION</small></div>
    </div>
  );
}

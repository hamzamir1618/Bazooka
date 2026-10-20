import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM, ScrollTrigger } from '../lib/motion';
import { useBasket } from '../lib/basket';
import { linkTo, NAV_OF, useRouter, type View } from '../lib/router';

const LINKS: { view: View; label: string; ar: string }[] = [
  { view: 'menu', label: 'Menu', ar: 'القائمة' },
  { view: 'story', label: 'Story', ar: 'الحكاية' },
  { view: 'visit', label: 'Visit', ar: 'الفروع' },
];

/**
 * A cinema-ticket nav bar. It slides away while you scroll down (the reel gets the whole screen) and drops back in
 * when you scroll up. Once the tray has something in it, a floating tray ticket stays bottom-right.
 */
export function Nav() {
  const { count } = useBasket();
  const { go, route } = useRouter();
  const bar = useRef<HTMLElement>(null);
  const tray = useRef<HTMLAnchorElement>(null);
  const sticker = useRef<HTMLAnchorElement>(null);
  const last = useRef(count);
  const lit = NAV_OF[route.view];

  useGSAP(() => {
    const el = bar.current!;
    let hidden = false;
    const show = (on: boolean) => {
      if (on === !hidden) return;
      hidden = !on;
      if (RM) { gsap.set(el, { autoAlpha: on ? 1 : 0 }); return; }
      gsap.to(el, on
        ? { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.8)', overwrite: true }
        : { yPercent: -150, autoAlpha: 0, duration: 0.3, ease: 'power2.in', overwrite: true });
    };
    const st = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => {
        const y = self.scroll();
        if (y < 80) show(true);
        else if (self.direction > 0 && self.getVelocity() > 60) show(false);
        else if (self.direction < 0 && self.getVelocity() < -60) show(true);
      },
    });
    return () => st.kill();
  });

  // a new page always starts with the nav showing
  useEffect(() => { gsap.to(bar.current, { yPercent: 0, autoAlpha: 1, duration: 0.3, overwrite: true }); }, [route]);

  useEffect(() => {
    if (count === last.current) return;
    const added = count > last.current;
    last.current = count;
    if (RM || !sticker.current) return;
    if (added && count === 1) gsap.fromTo(sticker.current, { scale: 0, rotation: -120 }, { scale: 1, rotation: -4, duration: 0.8, ease: 'back.out(2.2)' });
  }, [count]);

  const trayLabel = `Your tray, ${count} item${count === 1 ? '' : 's'}`;

  return (
    <>
      <header className="nav" ref={bar}>
        <a className="nav-logo" {...linkTo(go, 'home')} aria-label="Bazooka, home">
          <span className="nav-ar">بازوكا</span>
          <span className="nav-en">BAZOOKA</span>
        </a>
        <nav aria-label="Pages">
          <ul>
            {LINKS.map(l => (
              <li key={l.view}>
                <a {...linkTo(go, l.view)} aria-current={lit === l.view ? 'page' : undefined}>
                  <span>{l.label}</span><small lang="ar">{l.ar}</small>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a ref={tray} className={`nav-tray ${count ? 'has' : ''}`} data-tray-target {...linkTo(go, 'order')} aria-label={trayLabel} aria-current={lit === 'order' ? 'page' : undefined}>
          Order <b>{count}</b>
        </a>
      </header>
      {count > 0 && lit !== 'order' && (
        <a ref={sticker} className="tray-sticker" data-tray-target {...linkTo(go, 'order')} aria-label={trayLabel}>
          <b>{count}</b><span>on your tray</span>
        </a>
      )}
    </>
  );
}

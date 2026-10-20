import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { useBasket } from '../lib/basket';
import { useRouter } from '../lib/router';
import { BRANCHES, HOURS, mapsUrl, openNow } from '../data/branches';
import { PageHead, usePageIntro } from '../components/PageHead';

/**
 * The night windows as marquee boards. Each board's bulbs chase while that window is open; "Pick up here" sets the
 * branch on the tray and goes to the order page.
 */
export function VisitPage() {
  const root = useRef<HTMLDivElement>(null);
  const { go } = useRouter();
  const { branch, setBranch } = useBasket();
  const open = openNow();

  usePageIntro(root, tl => tl
    .fromTo('.board', { yPercent: -60, rotation: (i: number) => (i % 2 ? 6 : -6), autoAlpha: 0 }, { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.7, ease: 'bounce.out', stagger: 0.12 }, 0.35));

  useGSAP(() => {
    if (RM) return;
    gsap.fromTo('.visit-photo img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.visit-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
  }, { scope: root });

  return (
    <div className="visit-page" ref={root}>
      <PageHead kicker={`OPEN ${HOURS.label.toUpperCase()}`} title="Night Windows" ar="شبابيك آخر الليل"
        lede="Three windows, lit from six in the evening until four in the morning. Order ahead and it’s waiting on the brass tray." />

      <p className={`open-now ${open ? 'on' : ''}`} role="status">
        <span className="bulb" aria-hidden="true" />{open ? 'The windows are open right now.' : 'Closed right now. We open at 6 PM.'}
      </p>

      <div className="boards">
        {BRANCHES.map(b => (
          <article key={b.id} className={`board ${branch.id === b.id ? 'picked' : ''} ${open ? 'lit' : ''}`}>
            <div className="board-bulbs" aria-hidden="true" />
            <span className="board-no">WINDOW No.{b.no}</span>
            <h2 className="riso">{b.name}</h2>
            <p className="board-area">{b.area}</p>
            <dl>
              <div><dt>ADDRESS</dt><dd>{b.address}</dd></div>
              <div><dt>HOURS</dt><dd>{HOURS.label}</dd></div>
              <div><dt>PHONE</dt><dd><a href={`tel:${b.phone.replace(/\s/g, '')}`}>{b.phone}</a></dd></div>
            </dl>
            <div className="board-acts">
              <button type="button" className="btn" onClick={e => { setBranch(b.id); go('order', e); }}>Pick up here</button>
              <a className="link" href={mapsUrl(b)} target="_blank" rel="noopener">Directions ↗</a>
            </div>
          </article>
        ))}
      </div>

      <figure className="visit-photo">
        <img src="/assets/night-shop.webp" alt="A Bazooka night window, lit up at 3 AM" />
        <figcaption><span lang="ar">الساعة ٣ الفجر</span> 3:00 AM, and the spit is still turning.</figcaption>
      </figure>
    </div>
  );
}

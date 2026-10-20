import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { useBasket } from '../lib/basket';
import { linkTo, useRouter } from '../lib/router';
import { rupees } from '../data/menu';
import { mapsUrl, prettyTime } from '../data/branches';
import { usePageIntro } from '../components/PageHead';

/**
 * The ticket prints line by line out of the brass slot, ORDER FIRED · بالهنا thumps onto it, and "Tear off your
 * stub" rips the bottom off along the perforation.
 */
export function ConfirmPage() {
  const root = useRef<HTMLDivElement>(null);
  const { go } = useRouter();
  const { placed } = useBasket();
  const [torn, setTorn] = useState(false);

  usePageIntro(root, tl => {
    if (!placed) return;
    tl.fromTo('.cf-ticket', { yPercent: -100 }, { yPercent: 0, duration: 1.1, ease: 'steps(18)' }, 0.2)
      .fromTo('.cf-stamp', { scale: 3, rotation: -35, autoAlpha: 0 }, { scale: 1, rotation: -12, autoAlpha: 1, duration: 0.3, ease: 'power4.in' }, 1.35)
      .fromTo('.cf-paper', { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1,.25)' }, 1.62)
      .fromTo('.cf-next > *', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.5 }, 1.5);
  });

  useGSAP(() => {
    if (!torn || RM) return;
    gsap.timeline()
      .to('.cf-stub', { y: 40, rotation: 9, duration: 0.25, ease: 'power2.out' })
      .to('.cf-stub', { y: 140, rotation: -4, autoAlpha: 0.95, duration: 0.6, ease: 'bounce.out' });
  }, { scope: root, dependencies: [torn] });

  if (!placed) {
    return (
      <div className="confirm-page" ref={root}>
        <div className="cf-empty">
          <span className="kicker">NO TICKET</span>
          <h1 className="riso">Nothing fired yet</h1>
          <p>Orders live on this page until you refresh it. Start a new tray from the menu.</p>
          <a className="btn big" {...linkTo(go, 'menu')}>To the menu →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="confirm-page" ref={root}>
      <div className="cf">
        <div className="cf-slot printer-slot" />
        <div className="cf-clip">
          <div className="cf-ticket">
            <div className="cf-paper thermal">
              <div className="r-head">
                <div className="r-ar" lang="ar">مطعم بازوكا للشاورما</div>
                <div>TICKET {placed.code}</div>
                <div>FOR {placed.name.toUpperCase()}</div>
              </div>
              <div className="cf-when">
                <span>PICK UP {placed.night.toUpperCase()}</span>
                <b>{prettyTime(placed.pickup)}</b>
                <span>WINDOW No.{placed.branch.no} · {placed.branch.name.toUpperCase()}</span>
              </div>
              <ul className="r-lines">
                {placed.lines.map(l => <li key={l.item.id} className="r-line"><span>{String(l.qty).padStart(2, '0')}x {l.item.name.toUpperCase()}</span><b>{rupees(l.item.price * l.qty)}</b></li>)}
              </ul>
              <div className="r-line r-total"><span>TOTAL · المجموع</span><span>{rupees(placed.total)}</span></div>
              <p className="tk-pay">PAY AT THE WINDOW</p>
              <div className="cf-stamp" aria-hidden="true"><b>ORDER FIRED</b><span lang="ar">بالهنا</span></div>
            </div>
            <div className={`cf-stub thermal ${torn ? 'torn' : ''}`}>
              <span>STUB · {placed.code}</span>
              <b>{prettyTime(placed.pickup)}</b>
            </div>
          </div>
        </div>
      </div>

      <div className="cf-next">
        <h1 className="riso">Order fired.</h1>
        <p>Show ticket <b>{placed.code}</b> at window No.{placed.branch.no} in {placed.branch.name}. This order lives only on this page, so keep it open (or screenshot it).</p>
        <div className="cf-acts">
          <button type="button" className="btn" onClick={() => setTorn(true)} disabled={torn}>{torn ? 'Stub torn ✓' : 'Tear off your stub ✂'}</button>
          <a className="link" href={mapsUrl(placed.branch)} target="_blank" rel="noopener">Directions ↗</a>
          <a className="link" {...linkTo(go, 'menu')}>Order something else →</a>
        </div>
      </div>
    </div>
  );
}

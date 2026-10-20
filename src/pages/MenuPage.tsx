import { useRef, type MouseEvent } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { flyToTray, useBasket } from '../lib/basket';
import { linkTo, useRouter } from '../lib/router';
import { FEATURES, rupees, SIDES } from '../data/menu';
import { HOURS } from '../data/branches';
import { PageHead, usePageIntro } from '../components/PageHead';
import { Heat } from '../components/Heat';

/**
 * Tonight's programme. The wraps and the box are feature posters pasted up on a wall; the sides and the jallab are
 * matchboxes whose drawers slide open on hover. "+ Add" sends the food arcing into the tray.
 */
export function MenuPage() {
  const root = useRef<HTMLDivElement>(null);
  const { go } = useRouter();
  const { add } = useBasket();

  usePageIntro(root);

  useGSAP(() => {
    if (RM) return;
    gsap.fromTo('.poster', { y: 140, rotation: (i: number) => (i % 2 ? 7 : -7), opacity: 0 }, {
      y: 0, rotation: (i: number) => [-1.5, 1, -0.5, 1.5, -1][i % 5], opacity: 1, duration: 0.8, ease: 'back.out(1.5)', stagger: 0.09,
      scrollTrigger: { trigger: '.posters', start: 'top 85%' },
    });
    gsap.fromTo('.mbox', { y: 80, opacity: 0, rotation: -6 }, {
      y: 0, opacity: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.07,
      scrollTrigger: { trigger: '.mboxes', start: 'top 88%' },
    });
  }, { scope: root });

  const addFrom = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    add(id);
    const img = e.currentTarget.closest('[data-item]')?.querySelector<HTMLImageElement>('img');
    flyToTray(img);
    if (!RM) gsap.fromTo(e.currentTarget, { scale: 0.85 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1,.35)' });
  };

  return (
    <div className="menu-page" ref={root}>
      <PageHead kicker={`TONIGHT’S PROGRAMME · ${HOURS.label.toUpperCase()}`} title="The Menu" ar="قائمة الطعام"
        lede="Every saroukh is carved off the charcoal spit to order, rolled tight in saj and seared in the iron press. Pay at the window when you collect." />

      <section className="menu-sec" aria-labelledby="feat-h">
        <div className="sec-bar"><h2 id="feat-h" className="kicker">FEATURE PRESENTATIONS · الأفلام الرئيسية</h2></div>
        <div className="posters">
          {FEATURES.map((f, i) => (
            <article key={f.id} className={`poster ink-${f.ink} ${f.kind === 'platter' ? 'wide' : ''}`} data-item={f.id}>
              <div className="poster-bar"><span>FEATURE No.{String(i + 1).padStart(2, '0')}</span><span>{rupees(f.price)}</span></div>
              <a className="poster-art" {...linkTo(go, 'dish', f.id)} aria-label={`${f.name}: details`}>
                <img src={f.img} alt={f.name} />
              </a>
              <div className="poster-body">
                <div className="poster-ar" lang="ar">{f.ar}</div>
                <h3><a {...linkTo(go, 'dish', f.id)}>{f.name}</a></h3>
                <p>{f.hook}</p>
                <div className="poster-meta"><Heat level={f.heat} />{f.serves && <span className="serves">SERVES {f.serves}</span>}</div>
                <div className="poster-acts">
                  <button type="button" className="btn" onClick={e => addFrom(e, f.id)}>+ Add · {rupees(f.price)}</button>
                  <a className="link" {...linkTo(go, 'dish', f.id)}>Details →</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="menu-sec" aria-labelledby="sides-h">
        <div className="sec-bar"><h2 id="sides-h" className="kicker">SHORT SUBJECTS · SIDES & DRINKS</h2></div>
        <div className="mboxes">
          {SIDES.map((s, i) => (
            <article key={s.id} className={`mbox ink-${s.ink}`} data-item={s.id}>
              <a className="mbox-tray" {...linkTo(go, 'dish', s.id)} aria-label={`${s.name}: details`}>
                <img src={s.img} alt={s.name} />
              </a>
              <div className="mbox-sleeve">
                <small>No.{String(i + 1).padStart(2, '0')} · {s.hook.replace(/\.$/, '').toUpperCase()}</small>
                <b lang="ar">{s.ar}</b>
              </div>
              <div className="mbox-body">
                <h3><a {...linkTo(go, 'dish', s.id)}>{s.name}</a></h3>
                <button type="button" className="btn sm" onClick={e => addFrom(e, s.id)}>+ {rupees(s.price)}</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

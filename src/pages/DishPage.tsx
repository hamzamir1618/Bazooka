import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { flyToTray, useBasket } from '../lib/basket';
import { linkTo, useRouter } from '../lib/router';
import { FEATURES, itemById, rupees, SIDES } from '../data/menu';
import { usePageIntro } from '../components/PageHead';
import { Heat } from '../components/Heat';

const KIND_LABEL = { wrap: 'FEATURE PRESENTATION', platter: 'FEATURE PRESENTATION', side: 'SHORT SUBJECT', drink: 'STREET ELIXIR' };

/**
 * One item's poster. The food swings up onto the poster over the turning brass reticle, the price ticket slaps on,
 * and for the wraps the five cross-section slices fan out to show what's inside.
 */
export function DishPage({ id }: { id: string }) {
  const it = itemById(id)!;
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLImageElement>(null);
  const { go } = useRouter();
  const { add } = useBasket();
  const [qty, setQty] = useState(1);

  const list = it.kind === 'side' || it.kind === 'drink' ? SIDES : FEATURES;
  const at = list.findIndex(i => i.id === it.id);
  const next = list[(at + 1) % list.length];
  const pairs = it.pairs.map(p => itemById(p)!).filter(Boolean);
  const isWrap = it.kind === 'wrap';

  usePageIntro(root, tl => tl
    .fromTo('.dish-img', { y: 220, rotation: -30, scale: 0.6, autoAlpha: 0 }, { y: 0, rotation: isWrap ? -8 : 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.5)' }, 0)
    .fromTo('.dish-ticket', { scale: 2.4, rotation: -40, autoAlpha: 0 }, { scale: 1, rotation: 6, autoAlpha: 1, duration: 0.35, ease: 'power4.in' }, 0.6)
    .fromTo('.dish-stage', { x: 0 }, { x: 6, duration: 0.05, yoyo: true, repeat: 3, ease: 'none' }, 0.95)
    .fromTo('.strata li', { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.07 }, 0.7)
    .fromTo('.dish-buy, .dish-info > *:not(.strata)', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05 }, 0.5));

  useGSAP(() => {
    gsap.to('.dish-scope', { rotation: 360, duration: 40, ease: 'none', repeat: -1 });
    if (RM) return;
    gsap.fromTo('.pair', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.pairs', start: 'top 90%' } });
  }, { scope: root });

  const buy = () => {
    add(it.id, qty);
    flyToTray(hero.current);
    if (!RM) gsap.fromTo('.dish-img', { scale: 1.12 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,.35)' });
  };

  return (
    <div className={`dish-page ink-${it.ink}`} ref={root}>
      <div className="dish">
        <div className="dish-stage">
          <svg className="dish-scope" viewBox="0 0 260 260" aria-hidden="true">
            <circle cx="130" cy="130" r="118" fill="none" stroke="#D99B26" strokeWidth="3" />
            <circle cx="130" cy="130" r="92" fill="none" stroke="#0D1326" strokeWidth="1.5" strokeDasharray="8 6" />
            <rect x="48" y="48" width="164" height="164" fill="none" stroke="#1B3BF5" strokeWidth="2.5" transform="rotate(45 130 130)" />
          </svg>
          {it.heat >= 2 && <img className="dish-splash" src="/assets/chilli-splash.webp" alt="" />}
          <img ref={hero} className="dish-img" src={it.img} alt={it.name} />
          <div className="dish-ticket">
            <span className="t-top">ADMIT ONE · تذكرة</span>
            <span className="t-price">{rupees(it.price)}</span>
            {it.serves && <span className="t-stub">SERVES {it.serves}</span>}
          </div>
        </div>

        <div className="dish-info">
          <a className="back link" {...linkTo(go, 'menu')}>← The menu</a>
          <span className="kicker ph-k">{KIND_LABEL[it.kind]}</span>
          <h1 className="riso ph-t">{it.name.split(' ').map((w, i) => <span key={i}>{i > 0 && ' '}<span className="ph-w">{w}</span></span>)}</h1>
          <div className="dish-ar ph-ar" lang="ar">{it.ar}</div>
          <p className="dish-desc">{it.desc}</p>
          <div className="dish-meta">
            <Heat level={it.heat} />
            {it.allergens.length > 0 && <span className="allergens">CONTAINS: {it.allergens.join(', ').toUpperCase()}</span>}
          </div>

          {isWrap && it.inside && (
            <div className="strata-wrap">
              <span className="kicker">WHAT’S INSIDE · من الخارج للداخل</span>
              <ol className="strata">
                {it.inside.map((layer, i) => (
                  <li key={layer}><img src={`/assets/slice-${i + 1}.webp`} alt="" /><span>{String(i + 1).padStart(2, '0')}</span>{layer}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="dish-buy">
            <div className="qty" role="group" aria-label="Quantity">
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="One less">−</button>
              <output aria-live="polite">{qty}</output>
              <button type="button" onClick={() => setQty(q => Math.min(20, q + 1))} aria-label="One more">+</button>
            </div>
            <button type="button" className="btn big" onClick={buy}>Add to tray · {rupees(it.price * qty)}</button>
          </div>
          <p className="fine">Allergen details are a sample. Ask at the window if you have an allergy.</p>
        </div>
      </div>

      <section className="pairs" aria-labelledby="pairs-h">
        <h2 id="pairs-h" className="kicker">GOES WELL WITH · يمشي معه</h2>
        <div className="pair-row">
          {pairs.map(p => (
            <a key={p.id} className={`pair ink-${p.ink}`} {...linkTo(go, 'dish', p.id)}>
              <img src={p.img} alt="" />
              <span className="pair-ar" lang="ar">{p.ar}</span>
              <span className="pair-n">{p.name}</span>
              <span className="pair-p">{rupees(p.price)}</span>
            </a>
          ))}
          <a className="pair next" {...linkTo(go, 'dish', next.id)}>
            <span className="kicker">NEXT {list === FEATURES ? 'FEATURE' : 'SUBJECT'}</span>
            <img src={next.img} alt="" />
            <span className="pair-n">{next.name} →</span>
          </a>
        </div>
      </section>
    </div>
  );
}

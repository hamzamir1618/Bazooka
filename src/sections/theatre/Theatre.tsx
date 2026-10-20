import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM, ScrollTrigger, vars } from '../../lib/motion';
import { attachBeatStepper } from '../../lib/beats';
import { flyToTray, useBasket } from '../../lib/basket';
import { linkTo, useRouter } from '../../lib/router';
import { FEATURES, itemById, NIGHT_TRAY, rupees } from '../../data/menu';
import { HOURS } from '../../data/branches';
import { buildTheatre, nearestLabel } from './timeline';

const SCROLL_PER_UNIT = 0.85; // viewport heights of scroll per timeline second
const art = (n: string) => `/assets/${n}.webp`;

/** The kiosk shelf: the four sides and drinks plus the Arabi box. */
const SHELF = [
  { id: 'toum', sleeve: 'No.01 · GARLIC ARTILLERY', ar: 'ثوم بازوكا', color: 'var(--vermilion)' },
  { id: 'shatta-oil', sleeve: 'No.02 · FIRE STARTER', ar: 'زيت شطة', color: 'var(--cobalt)' },
  { id: 'torshi', sleeve: 'No.03 · ACID & CRUNCH', ar: 'طرشي لفت', color: 'var(--pistachio)' },
  { id: 'box', sleeve: 'No.04 · HEAVY PLATTER', ar: 'بوكس عربي', color: 'var(--nile)', ink: 'var(--ochre)' },
  { id: 'jallab', sleeve: 'No.05 · STREET ELIXIR', ar: 'جلاب بيروت', color: 'var(--ochre)', ink: 'var(--nile)' },
];
const BAR_INK = ['var(--vermilion)', 'var(--cobalt)', 'var(--pistachio)', 'var(--ochre)', 'var(--nile)'];

/** Re-measure on real resizes only (phones fire height changes as the URL bar slides). */
function useViewportKey() {
  const [key, setKey] = useState(() => `${innerWidth}x${innerHeight}`);
  useEffect(() => {
    let w = innerWidth, h = innerHeight, t = 0;
    const on = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        if (Math.abs(innerWidth - w) < 2 && Math.abs(innerHeight - h) < 140) return;
        w = innerWidth; h = innerHeight;
        setKey(`${w}x${h}`);
      }, 250);
    };
    addEventListener('resize', on);
    return () => { clearTimeout(t); removeEventListener('resize', on); };
  }, []);
  return key;
}

/**
 * The home page's scroll story: 15 beats in one pinned viewport (hero poster → iron clamp → rocket launch →
 * 5-slice chop → sword cleave → rotisserie orbit → power cut & match strike → matchbox kiosk → 3 AM shutter →
 * night window → receipt). Ported from design/prototype.html; the reel bar bottom-left shows the stage.
 */
export function Theatre() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLSpanElement>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const snap = useRef(!RM);
  const [snapOn, setSnapOn] = useState(!RM);
  const viewport = useViewportKey();
  const { go, revealed } = useRouter();
  const { add, addMany } = useBasket();

  useGSAP(() => {
    const el = root.current!;
    const { tl, HUD } = buildTheatre(el);
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: () => `+=${Math.round(tl.duration() * innerHeight * SCROLL_PER_UNIT)}`,
      pin: true,
      scrub: RM ? true : 0.5,
      animation: tl,
      onToggle: self => bar.current?.classList.toggle('on', self.isActive),
    });
    // the reel bar follows the (scrub-smoothed) timeline, not the raw scroll position
    tl.eventCallback('onUpdate', () => {
      const hud = HUD[nearestLabel(tl)];
      if (stage.current && stage.current.textContent !== hud) stage.current.textContent = hud;
      if (meter.current) meter.current.style.width = `${(tl.progress() * 100).toFixed(1)}%`;
    });
    const detach = attachBeatStepper(st, tl, () => snap.current);
    el.dataset.beats = String(Object.keys(tl.labels).length);
    if (location.search.includes('test')) Object.assign(window, { __bz: { tl, st } });
    return detach;
  }, { scope: root, dependencies: [viewport], revertOnUpdate: true });

  // the hero pops in once the intro plates have lifted; the reticle never stops turning
  useGSAP(() => {
    gsap.to('#heroScope', { rotation: 360, duration: 38, ease: 'none', repeat: -1 });
    if (!revealed || RM) return;
    gsap.fromTo('.hero-pop', { scale: 0.6, rotation: -14, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.6)' });
  }, { scope: root, dependencies: [revealed] });

  const tilt = (e: MouseEvent) => {
    if (RM) return;
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    gsap.to('#heroTilt', { rotationY: nx * 16, rotationX: -ny * 12, duration: 0.5, overwrite: 'auto' });
  };

  const addFrom = (id: string, img: HTMLImageElement | null | undefined) => { add(id); flyToTray(img); };

  const strike = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    const img = e.currentTarget.querySelector<HTMLImageElement>('.mb-prod img');
    addFrom(id, img);
    if (!RM && img) gsap.fromTo(img, { scale: 1.25, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
  };

  const orderTray = (e: MouseEvent<HTMLButtonElement>) => {
    const p = { clientX: e.clientX, clientY: e.clientY };
    const done = () => { addMany(NIGHT_TRAY); go('order', p); };
    if (RM) { done(); return; }
    gsap.timeline({ onComplete: done })
      .fromTo('#paidStamp', { xPercent: -50, yPercent: -50, scale: 2.6, rotation: -30, opacity: 0 }, { scale: 1, rotation: -12, opacity: 1, duration: 0.3, ease: 'back.out(2.5)' })
      .to('#receiptInner', { rotation: -6, y: 30, duration: 0.45, ease: 'back.out(2)' }, 0.1)
      .to({}, { duration: 0.35 });
  };

  const original = itemById('original')!;

  return (
    <>
      <section className="theatre" ref={root} id="reel" aria-label="The Bazooka story">
        <div className="world">

          {/* ======================= SCENE 3 · ROTISSERIE ORBIT (bottom layer) ======================= */}
          <div className="scene" id="scDrum">
            <img src={art('tile-wall')} className="tile-backdrop" id="tileBackdrop" alt="" />
            <div className="tile-vignette" />
            <div className="marquee-wrap"><img src={art('cinema-marquee')} id="drumMarquee" alt="" /></div>
            <img src={art('charcoal-embers')} id="embers" alt="" />
            <div className="cone-wrap"><img src={art('spit-cone')} id="cone" alt="A charcoal rotisserie spit" /></div>
            {FEATURES.map(f => <div key={f.id} className="orb-dish"><img src={f.img} alt="" /></div>)}

            <div className="drum-col">
              <span className="kicker">THE CHARCOAL SPIT · 5 FEATURES</span>
              <h2 className="riso">The Spit Arsenal</h2>
              <div className="dish-stack">
                {FEATURES.map((f, i) => (
                  <article key={f.id} className="dish-card">
                    <div className="bar" style={{ background: BAR_INK[i], color: f.ink === 'ochre' ? 'var(--nile)' : f.ink === 'nile' ? 'var(--ochre)' : 'var(--sand)' }}>
                      <span>SPIT {String(i + 1).padStart(2, '0')} / 05</span><span>{rupees(f.price)}</span>
                    </div>
                    <div className="body">
                      <div className="ar" style={{ color: f.ink === 'ochre' ? 'var(--nile)' : f.ink === 'nile' ? 'var(--vermilion)' : `var(--${f.ink})` }}>{f.ar}</div>
                      <h3>{f.name}</h3>
                      <p>{f.desc}</p>
                      <div className="dish-acts">
                        <button type="button" className="btn sm" onClick={() => addFrom(f.id, root.current?.querySelectorAll<HTMLImageElement>('.orb-dish img')[i])}>+ Add · {rupees(f.price)}</button>
                        <a className="link" {...linkTo(go, 'dish', f.id)}>See the dish →</a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="dish-dots" aria-hidden="true">{FEATURES.map(f => <span key={f.id} />)}</div>
            </div>

            <div id="drumBlackout" />
            <div className="power-cut">⚡ انقطعت الكهربا · POWER CUT ⚡</div>
          </div>

          {/* ======================= SCENE 4 · MATCHBOX KIOSK ======================= */}
          <div className="scene" id="scKiosk">
            <div className="kiosk-head">
              <span className="kicker">STRIKE · SLIDE · POP</span>
              <h2 className="riso">The Matchbox Kiosk</h2>
              <div className="ar">كشك الكبريت</div>
              <p>Every Cairo matchbox strikes a spark and pops out a side. Tap a box to add it to your tray.</p>
            </div>
            <div className="shelf">
              {SHELF.map(s => {
                const it = itemById(s.id)!;
                return (
                  <button key={s.id} type="button" className="mb" onClick={e => strike(e, s.id)} aria-label={`Add ${it.name}, ${rupees(it.price)}`}>
                    <span className="mb-prod"><img src={it.img} alt="" /></span>
                    <span className="mb-drawer"><span>+{rupees(it.price)}</span></span>
                    <span className="mb-sleeve" style={{ background: s.color, color: s.ink }}><small>{s.sleeve}</small><b>{s.ar}</b></span>
                    <span className="mb-spark" />
                    <span className="mb-label">{it.name.toUpperCase()}<em>+{rupees(it.price)}</em></span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================= SCENE 5 · 3 AM NIGHT WINDOW ======================= */}
          <div className="scene" id="scNight">
            <img src={art('night-shop')} id="nightBg" alt="The night window" />
            <div className="night-shade" />
            <div className="marquee-wrap"><img src={art('cinema-marquee')} alt="" /></div>
            <div className="night-head" id="nightHead">
              <span className="kicker">THE NIGHT WINDOW · {HOURS.label.toUpperCase()}</span>
              <h2 className="riso">Open till the call to prayer</h2>
              <div className="ar">شباك آخر الليل</div>
              <p>Pull up to the window, the brass tray lands, and your ticket prints hot.</p>
            </div>
            <div className="receipt-col">
              <div className="printer-slot" />
              <div className="receipt-clip">
                <div id="receiptInner" className="thermal">
                  <div className="r-head">
                    <div className="r-ar">مطعم بازوكا للشاورما</div>
                    <div>NIGHT WINDOW · 03:00</div>
                  </div>
                  <div className="r-lines">
                    {NIGHT_TRAY.map(id => { const it = itemById(id)!; return <div key={id} className="r-line"><span>01x {it.name.toUpperCase()}</span><b>{rupees(it.price)}</b></div>; })}
                  </div>
                  <div className="r-line r-total"><span>TOTAL · المجموع</span><span>{rupees(NIGHT_TRAY.reduce((a, id) => a + itemById(id)!.price, 0))}</span></div>
                  <button type="button" className="tear" onClick={orderTray}>ORDER THIS TRAY ✂</button>
                  <div id="paidStamp">ORDER FIRED · بالهنا</div>
                </div>
              </div>
            </div>
            <div className="feast" aria-hidden="true">
              <div className="f-tray"><img src={art('brass-tray')} alt="" /></div>
              <div className="f-wrap"><img src={art('saroukh-hero')} alt="" /></div>
              <div className="f-box"><img src={art('arabi-box')} alt="" /></div>
              <div className="f-toum"><img src={art('toum-mortar')} alt="" /></div>
              <div className="f-jallab"><img src={art('jallab-glass')} alt="" /></div>
              <div className="f-pickle"><img src={art('pickle-jar')} alt="" /></div>
            </div>
          </div>

          {/* ======================= SCENE 2 · ANATOMY (two cleave halves) ======================= */}
          <div className="scene" id="scAnatomy">
            {(['tl', 'br'] as const).map(half => (
              <div key={half} className={`cut-half ${half}`} aria-hidden={half === 'br' || undefined}>
                <div className="ana-title">
                  <span className="kicker">THE 5-SLICE CUTAWAY</span>
                  <h2 className="riso">Anatomy of the Saroukh</h2>
                  <div className="ar">تشريح الصاروخ</div>
                </div>
                <div className="slice-row">
                  {original.inside!.map((layer, i) => (
                    <div key={layer} className="slice-item">
                      <img src={art(`slice-${i + 1}`)} alt={half === 'tl' ? `Slice ${i + 1}: ${layer}` : ''} />
                      <span className="slice-tag">{String(i + 1).padStart(2, '0')} · {layer.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div id="anaWrapClip"><div id="anaWrap"><img src={art('saroukh-hero')} alt="" /></div></div>
            <svg id="slashLine" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <line x1="104" y1="-4" x2="-4" y2="104" stroke="#D99B26" strokeWidth="16" vectorEffect="non-scaling-stroke" strokeLinecap="round" opacity="0.55" />
              <line x1="104" y1="-4" x2="-4" y2="104" stroke="#FFF6D8" strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
            </svg>
            <img src={art('knife')} id="knife" alt="" />
          </div>

          {/* ======================= SCENE 1 · HERO (top layer) ======================= */}
          <div className="scene" id="scHero" onPointerMove={tilt}>
            <div className="poster-frame" />
            <div className="hero-header" id="heroHeader">
              <h1 className="riso">BAZOOKA</h1>
              <div className="ar" lang="ar">صاروخ شاورما</div>
            </div>
            <div className="hero-watermark" id="heroWatermark" aria-hidden="true">صاروخ</div>

            <div className="hero-side l" id="heroSideL">
              <span className="kicker">NOW SHOWING · يعرض الآن</span>
              <div className="tagline" lang="ar">أقوى صاروخ <br />في البلد</div>
              <p className="tag-en">The foil-wrapped rocket, charcoal-carved and served from the night window till 4 AM.</p>
              <dl className="specs">
                <div><dt>CALIBER</dt><dd>380 G</dd></div>
                <div><dt>LENGTH</dt><dd>32 CM</dd></div>
                <div><dt>SPIT</dt><dd>450 °C</dd></div>
                <div><dt>FOIL</dt><dd>3-PLY</dd></div>
              </dl>
            </div>

            <div className="hero-side r" id="heroSideR">
              <a className="ticket" {...linkTo(go, 'dish', original.id)} aria-label={`${original.name}, ${rupees(original.price)}`}>
                <span className="t-top">ADMIT ONE · تذكرة</span>
                <span className="t-price">{rupees(original.price)}</span>
                <span className="t-name">EL-BAZOOKA ORIGINAL</span>
                <span className="t-ar">الأصلي</span>
                <span className="t-stub">No. 0380 · LAST SHOW 04:00</span>
              </a>
              <div className="stars"><b>★★★★★</b>“A DIRECT HIT”<br />THE NIGHT EDITION</div>
            </div>

            <div className="hero-scope-wrap" aria-hidden="true">
              <svg id="heroScope" viewBox="0 0 260 260">
                <circle cx="130" cy="130" r="118" fill="none" stroke="#D99B26" strokeWidth="3" />
                <circle cx="130" cy="130" r="92" fill="none" stroke="#0D1326" strokeWidth="1.5" strokeDasharray="8 6" />
                <rect x="48" y="48" width="164" height="164" fill="none" stroke="#1B3BF5" strokeWidth="2.5" transform="rotate(45 130 130)" />
              </svg>
            </div>
            <img src={art('chilli-splash')} id="heroChilli" alt="" />

            <div className="hero-tilt" id="heroTilt">
              <div className="hero-pop">
                <div id="heroRocket">
                  <div id="heroExhaust"><img src={art('chilli-splash')} alt="" /></div>
                  <img src={original.img} id="heroWrapImg" alt="The Bazooka: a foil-wrapped saroukh shawarma" />
                </div>
                <div className="orb hf1" style={{ width: 'min(30vw, 220px)', left: '2%', top: '-30%' }}><img src={art('foil-curl')} alt="" style={vars({ '--r': '-12deg', '--t': '3.4s' })} /></div>
                <div className="orb hf2" style={{ width: 'min(24vw, 180px)', left: '30%', bottom: '-34%' }}><img src={art('foil-curl')} alt="" style={vars({ '--r': '25deg', '--t': '2.9s' })} /></div>
                <div className="orb hf3" style={{ width: 'min(22vw, 165px)', right: '4%', top: '-38%' }}><img src={art('foil-curl')} alt="" style={vars({ '--r': '65deg', '--t': '3.8s' })} /></div>
                <div className="orb hg1" style={{ width: 'min(10vw, 84px)', right: '-6%', top: '-6%' }}><img src={art('garnish-1')} alt="" style={vars({ '--r': '18deg', '--t': '2.6s' })} /></div>
                <div className="orb hg2" style={{ width: 'min(11vw, 96px)', right: '-2%', bottom: '-24%' }}><img src={art('garnish-2')} alt="" style={vars({ '--r': '-25deg', '--t': '3.1s' })} /></div>
                <div className="orb hg3" style={{ width: 'min(12vw, 104px)', left: '4%', bottom: '-28%' }}><img src={art('garnish-3')} alt="" style={vars({ '--r': '14deg', '--t': '3.6s' })} /></div>
                <div className="orb hg4" style={{ width: 'min(10vw, 86px)', left: '-8%', top: '-4%' }}><img src={art('garnish-4')} alt="" style={vars({ '--r': '-32deg', '--t': '2.8s' })} /></div>
              </div>
            </div>

            <img src={art('iron-press')} id="heroPress" alt="" />
            <div className="steam" /><div className="steam" /><div className="steam" />

            <div className="hero-ribbon" id="heroRibbonL">فك القصدير · SCROLL TO UNPEEL <span className="scroll-cue">↓</span></div>
            <div className="hero-ribbon" id="heroRibbonR">OPEN 6 PM – 4 AM · EVERY NIGHT</div>
          </div>

          {/* ======================= OVERLAYS ======================= */}
          <div className="trail" aria-hidden="true"><div className="band b-v" /><div className="band b-c" /><div className="band b-n" /></div>
          <div className="matchfx" aria-hidden="true">
            <div className="striker" />
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="spark" />)}
            <div className="flame" />
            <div className="match" />
          </div>
          <div className="flame-ring" aria-hidden="true" />
          <div className="shutter" aria-hidden="true">
            <div className="ar">شباك آخر الليل</div>
            <div className="clock">03:00 AM</div>
            <small>THE CITY SLEEPS · THE SPIT DOESN’T</small>
            <div className="handle" />
          </div>

          <div className="stamp" id="stSear" style={{ left: '8%', top: '24%' }} aria-hidden="true"><b>طَشّ!</b><i>TSSSHH · IRON-SEARED</i></div>
          <div className="stamp ochre" id="stLaunch" style={{ right: '8%', top: '22%' }} aria-hidden="true"><b>انطلاق!</b><i>LIFT-OFF · 380G</i></div>
          <div className="stamp" id="stCrash" style={{ left: '7%', top: '34%' }} aria-hidden="true"><b>طاخ!</b><i>TOUCHDOWN</i></div>
          <div className="stamp cobalt" id="stCleave" style={{ right: '9%', top: '30%' }} aria-hidden="true"><b>شَقّ!</b><i>CLEAVED IN TWO</i></div>
          <div className="stamp" id="stShutter" style={{ left: '50%', top: '16%' }} aria-hidden="true"><b>طراخ!</b><i>SHUTTER DOWN</i></div>
        </div>
      </section>

      <div className="reel-bar" ref={bar} aria-live="off">
        <span className="reel-stage" ref={stage}>STAGE 01 · THE SAROUKH</span>
        <span className="reel-meter" aria-hidden="true"><span ref={meter} /></span>
        {!RM && (
          <button type="button" className="reel-snap" aria-pressed={snapOn} title="One scroll flick plays one beat"
            onClick={() => { snap.current = !snap.current; setSnapOn(snap.current); }}>
            {snapOn ? 'SNAP ON' : 'SNAP OFF'}
          </button>
        )}
      </div>
    </>
  );
}

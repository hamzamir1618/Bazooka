import { gsap, RM } from '../../lib/motion';

/**
 * The home page's master timeline, ported from design/prototype.html. Each beat ends on a label (its resting
 * frame); the beat stepper glides one label per scroll flick. Every scene is a layer inside one pinned viewport.
 *
 * Built inside the Theatre's useGSAP scope, so string selectors only match inside the theatre.
 * Initial states are set here and the timeline only uses .to() (plus fromTo with immediateRender: false), so
 * scrubbing backwards always lands on the same frames.
 */
export function buildTheatre(root: HTMLElement) {
  const $$ = <T extends Element = HTMLElement>(s: string) => [...root.querySelectorAll<T & HTMLElement>(s)];
  const W = innerWidth, H = innerHeight, narrow = W < 760;

  /* ---- initial states ---- */
  gsap.set('#heroWrapImg', { filter: 'drop-shadow(14px 18px 0 rgba(13,19,38,0.92)) brightness(1) sepia(0) saturate(1)' });
  gsap.set('#drumMarquee', { filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.85)) brightness(1) grayscale(0)' });
  gsap.set('#scKiosk', { filter: 'brightness(1) saturate(1)', clipPath: 'circle(0% at 50% 58%)' });
  gsap.set('#heroPress', { xPercent: -50, yPercent: -60, y: -H * 1.1, rotation: -18 });
  gsap.set('#heroExhaust', { scale: 0, autoAlpha: 0 });
  gsap.set('.steam', { xPercent: -50, yPercent: -50, scale: 0.3, autoAlpha: 0 });
  gsap.set('.trail .band', { scaleX: 0 });
  gsap.set('.stamp', { autoAlpha: 0, scale: 2.6, rotation: -24 });
  gsap.set('#stShutter', { xPercent: -50 });

  gsap.set('.ana-title', { autoAlpha: 0, y: -40 });
  gsap.set('#slashLine', { clipPath: 'inset(0% 0% 100% 100%)' });
  gsap.set('.slice-item', { autoAlpha: 0, scale: 0.3, y: -60, rotation: -40 });
  gsap.set('#anaWrap', { y: -H, rotation: -50 });
  gsap.set('#knife', { x: W * 1.1, y: -H * 0.9, rotation: 180, xPercent: -50 });

  gsap.set('#embers', { xPercent: -50 });
  gsap.set('.cone-wrap', { xPercent: -50 });
  gsap.set('.dish-card', { autoAlpha: 0, rotationX: -90 });
  gsap.set('.dish-card:first-child', { autoAlpha: 1, rotationX: 0 });
  gsap.set(['.orb-dish', '.drum-col'], { autoAlpha: 0 });

  gsap.set('.matchfx .match', { x: -W * 0.3 });
  gsap.set('.matchfx .striker', { xPercent: -50, y: 120, autoAlpha: 0 });
  gsap.set('.matchfx .flame', { scale: 0 });
  gsap.set('.matchfx .spark', { scale: 0 });

  gsap.set('.mb-prod', { xPercent: -50, yPercent: 60, scale: 0.25, autoAlpha: 0 });
  gsap.set('.shutter', { yPercent: -101 });
  gsap.set('#receiptInner', { yPercent: -101 });

  gsap.set('#scNight', { autoAlpha: 0 });
  gsap.set('#nightHead', { autoAlpha: 0, x: -60 });
  gsap.set('.f-tray', { xPercent: -50 });
  gsap.set('.f-wrap', { xPercent: -50 });
  gsap.set('.f-tray img', { x: -W, rotation: -30 });
  gsap.set('.f-wrap img', { y: -H, rotation: 40 });
  gsap.set('.f-box img', { x: -W * 0.5, y: -H * 0.4, rotation: -60 });
  gsap.set('.f-jallab img', { x: W * 0.6, rotation: 8 });
  gsap.set(['.f-toum img', '.f-pickle img'], { y: H * 0.45 });

  /* ---- rotisserie orbit: the active dish swings to the front-right of the cone, the rest recede ---- */
  const dishes = $$('.orb-dish');
  const dots = $$('.dish-dots span');
  const orbit = { a: 0 };
  const layoutOrbit = () => {
    const R = narrow ? W * 0.32 : Math.min(W * 0.23, 380);
    const present = narrow ? 0 : 0.95;
    dishes.forEach((el, i) => {
      const th = (i - orbit.a) * (Math.PI * 2 / 5) + present;
      const depth = Math.cos(th);
      let d = Math.abs(i - orbit.a) % 5;
      d = Math.min(d, 5 - d);
      const focus = Math.max(0, 1 - d);
      gsap.set(el, {
        xPercent: -50, yPercent: -50,
        x: Math.sin(th) * R,
        y: depth * R * 0.22,
        scale: 0.3 + 0.2 * (depth + 1) / 2 + 0.55 * focus,
        zIndex: depth > 0.15 ? 6 : 2,
        filter: `brightness(${(0.35 + 0.65 * Math.max(focus, (depth + 1) / 3)).toFixed(3)})`,
      });
    });
    const k = Math.round(orbit.a);
    dots.forEach((dot, i) => dot.classList.toggle('on', i === k));
  };
  layoutOrbit();

  /* ---- the master timeline ---- */
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  // each label's HUD text names the frame you rest on at that label
  const HUD: Record<string, string> = { start: 'STAGE 01 · THE SAROUKH' };
  let cur = 0;
  tl.addLabel('start', 0);

  const beat = (label: string, hud: string, dur: number, build: (t: number) => void) => {
    build(cur);
    cur += dur;
    tl.addLabel(label, cur);
    HUD[label] = hud;
  };
  const amp = RM ? 0 : 1;
  const shake = (t: number, a = 16, dur = 0.16) => {
    a *= amp;
    tl.to('.world', {
      keyframes: { x: [0, -a, a * 0.8, -a * 0.5, a * 0.25, 0], y: [0, a * 0.6, -a * 0.5, a * 0.3, -a * 0.1, 0], easeEach: 'none' },
      duration: dur, ease: 'none',
    }, t);
  };
  const stamp = (sel: string, tIn: number, tOut: number | null) => {
    tl.to(sel, { autoAlpha: 1, scale: 1, rotation: -8, duration: 0.12, ease: 'back.out(2.4)' }, tIn);
    if (tOut != null) tl.to(sel, { autoAlpha: 0, scale: 0.85, duration: 0.1, ease: 'power1.in' }, tOut);
  };

  /* SCENE 1 · HERO */
  beat('unpeel', 'STAGE 01 · FOIL TORNADO', 1, t => {
    const fly: [string, number, number, number][] = [
      ['.hf1', -42, -40, -160], ['.hf2', -30, 45, 140], ['.hf3', 40, -42, 180],
      ['.hg1', 45, -30, 220], ['.hg2', 44, 40, -200], ['.hg3', -40, 42, 200], ['.hg4', -46, -26, -230],
    ];
    fly.forEach(([s, x, y, r], i) => tl.to(s, { x: W * x / 100, y: H * y / 100, rotation: r, scale: 1.5, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, t + i * 0.035));
    tl.to('#heroChilli', { x: W * 0.32, rotation: 30, scale: 1.3, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, t + 0.1)
      .to('#heroRocket', { rotation: -6, scale: 0.92, duration: 0.6 }, t + 0.2)
      .to('.hero-scope-wrap', { scale: 1.5, opacity: 0.4, duration: 0.8 }, t)
      .to('#heroSideL', { x: -18, rotation: -2, duration: 0.5, ease: 'back.out(2)' }, t + 0.1)
      .to('#heroSideR', { x: 18, rotation: 2, duration: 0.5, ease: 'back.out(2)' }, t + 0.1)
      .to('#heroWatermark', { scale: 1.08, duration: 0.8 }, t);
  });

  beat('clamp', 'STAGE 01 · CAST-IRON CLAMP', 1, t => {
    tl.to('#heroPress', { y: 0, rotation: -4, duration: 0.42, ease: 'power4.in' }, t)
      .to('#heroRocket', { scaleY: 0.78, scaleX: 1.04, duration: 0.08, ease: 'power2.out' }, t + 0.42)
      .to('#heroWrapImg', { filter: 'drop-shadow(14px 18px 0 rgba(13,19,38,0.92)) brightness(0.72) sepia(0.45) saturate(1.6)', duration: 0.3 }, t + 0.42)
      .to('#scHero', { backgroundColor: '#E4D3AE', duration: 0.3 }, t + 0.42);
    shake(t + 0.42, 22, 0.2);
    stamp('#stSear', t + 0.46, t + 1.02);
    $$('.steam').forEach((s, i) => {
      tl.to(s, { autoAlpha: 0.9, scale: 1.1, x: (i - 1) * W * 0.12, y: -H * 0.06, duration: 0.25, ease: 'power2.out' }, t + 0.46 + i * 0.04)
        .to(s, { autoAlpha: 0, scale: 1.8, y: -H * 0.3, duration: 0.3, ease: 'power1.in' }, t + 0.72 + i * 0.04);
    });
  });

  beat('launch', 'STAGE 02 · TOUCHDOWN', 2.25, t => {
    // the press springs off, the seared wrap re-inflates and ignites its shatta exhaust
    tl.to('#heroPress', { y: -H * 1.2, rotation: 24, duration: 0.3, ease: 'power3.in' }, t)
      .to('#heroRocket', { scaleY: 1, scaleX: 1, rotation: 0, scale: 1, duration: 0.18, ease: 'back.out(3)' }, t + 0.08)
      .to('#heroExhaust', { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'back.out(2)' }, t + 0.2)
      .to('#heroExhaust', { scaleX: 1.6, scaleY: 1.25, duration: 0.3, ease: 'power1.in' }, t + 0.4)
      .to(['#heroHeader', '#heroRibbonL', '#heroRibbonR', '.hero-scope-wrap'], { autoAlpha: 0, y: 40, duration: 0.2 }, t + 0.25)
      .to('#heroSideL', { x: -W * 0.3, autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, t + 0.25)
      .to('#heroSideR', { x: W * 0.3, autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, t + 0.25)
      .to('#heroWatermark', { autoAlpha: 0, duration: 0.25 }, t + 0.25);
    shake(t + 0.3, 10, 0.3);
    stamp('#stLaunch', t + 0.3, t + 0.66);
    // lift-off along the wrap's own 2 o'clock axis; the exhaust plates streak after it and swallow the poster
    tl.to('#heroTilt', { x: W * 0.95, y: -H * 0.75, scale: 0.55, duration: 0.4, ease: 'power3.in' }, t + 0.5)
      .to('.trail .b-v', { scaleX: 1, duration: 0.2, ease: 'power2.out' }, t + 0.8)
      .to('.trail .b-c', { scaleX: 1, duration: 0.2, ease: 'power2.out' }, t + 0.86)
      .to('.trail .b-n', { scaleX: 1, duration: 0.2, ease: 'power2.out' }, t + 0.92)
      .to('.trail .b-n', { scaleY: 14, duration: 0.24, ease: 'power2.in' }, t + 1.04)
      .set('#scHero', { autoAlpha: 0 }, t + 1.29)
      .set('.trail', { autoAlpha: 0 }, t + 1.3)
      .to('.ana-title', { autoAlpha: 1, y: 0, duration: 0.26, ease: 'back.out(2)' }, t + 1.32);

    // SCENE 2 · ANATOMY: the rocket comes back down
    tl.to('#anaWrap', { y: 0, rotation: 0, duration: 0.36, ease: 'power4.in' }, t + 1.4)
      .to('#anaWrap', { scaleY: 0.86, scaleX: 1.05, duration: 0.06, yoyo: true, repeat: 1 }, t + 1.76);
    shake(t + 1.76, 18, 0.18);
    stamp('#stCrash', t + 1.78, t + 2.27);
    tl.to('#knife', { x: W * 0.86, y: -H * 0.22, duration: 0.3, ease: 'power2.out' }, t + 1.9);
  });

  beat('chop', 'STAGE 02 · 5-SLICE CUTAWAY', 1.5, t => {
    [0.74, 0.62, 0.5, 0.38, 0.26].forEach((cx, k) => {
      const at = t + k * 0.26;
      tl.to('#knife', { x: W * cx, y: -H * 0.22, duration: 0.1, ease: 'power1.inOut' }, at)
        .to('#knife', { y: H * 0.1, duration: 0.08, ease: 'power4.in' }, at + 0.1)
        .to('#anaWrapClip', { clipPath: `inset(-30% ${(k + 1) * 20}% -30% -30%)`, duration: 0.02, ease: 'none' }, at + 0.18)
        .to(`.slice-item:nth-child(${5 - k})`, { autoAlpha: 1, scale: 1, y: 0, rotation: 0, duration: 0.22, ease: 'back.out(2.2)' }, at + 0.18)
        .to('#knife', { y: -H * 0.22, duration: 0.08, ease: 'power2.out' }, at + 0.18);
      shake(at + 0.18, 6, 0.08);
    });
    tl.to('#knife', { x: W * 0.92, y: -H * 0.55, rotation: 140, duration: 0.2 }, t + 1.3);
  });

  beat('cleave', 'STAGE 03 · SPIT 01 / 05', 1.3, t => {
    // the knife cocks at the upper-right corner, then slashes the diagonal seam
    tl.to('#knife', { x: W * 1.02, y: -H * 0.48, rotation: 225, scale: 1.3, duration: 0.25, ease: 'power2.out' }, t)
      .set('#scDrum', { autoAlpha: 1 }, t)
      .set('#slashLine', { autoAlpha: 1 }, t + 0.3)
      .to('#slashLine', { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.14, ease: 'power4.in' }, t + 0.3)
      .to('#knife', { x: -W * 0.2, y: H * 0.95, duration: 0.16, ease: 'power4.in' }, t + 0.3);
    shake(t + 0.44, 26, 0.24);
    stamp('#stCleave', t + 0.46, t + 1.0);
    tl.to('#slashLine', { autoAlpha: 0, duration: 0.2 }, t + 0.62)
      .to('.cut-half.tl', { xPercent: -70, yPercent: -95, rotation: -14, duration: 0.6, ease: 'power3.in' }, t + 0.5)
      .to('.cut-half.br', { xPercent: 70, yPercent: 95, rotation: 12, duration: 0.6, ease: 'power3.in' }, t + 0.56)
      .fromTo('#cone', { scale: 0.7, y: 80 }, { scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)', immediateRender: false }, t + 0.66)
      .to('.orb-dish', { autoAlpha: 1, duration: 0.3 }, t + 0.8)
      .fromTo('.drum-col', { x: -80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.35, ease: 'back.out(1.6)', immediateRender: false }, t + 0.85)
      .set('#scAnatomy', { autoAlpha: 0 }, t + 1.28);
  });

  /* SCENE 3 · ROTISSERIE ORBIT */
  const cards = $$('.dish-card');
  for (let i = 1; i < 5; i++) {
    beat(`spit${i + 1}`, `STAGE 03 · SPIT ${String(i + 1).padStart(2, '0')} / 05`, 0.8, t => {
      tl.to(orbit, { a: i, duration: 0.6, ease: 'power3.inOut', onUpdate: layoutOrbit }, t)
        .to(cards[i - 1], { rotationX: 90, autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, t + 0.05)
        .to(cards[i], { rotationX: 0, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.8)' }, t + 0.3)
        .to('#embers', { scale: 1.18, duration: 0.15, yoyo: true, repeat: 1 }, t + 0.2)
        .to('#tileBackdrop', { xPercent: -1.2 * i, duration: 0.6 }, t);
    });
  }

  beat('blackout', 'STAGE 04 · THE MATCHBOX KIOSK', 1.5, t => {
    const diag = Math.hypot(W, H);
    tl.to('#drumBlackout', { keyframes: { opacity: [0, 0.7, 0.15, 0.85, 0.4, 0.95], easeEach: 'none' }, duration: 0.3, ease: 'none' }, t)
      .to('#drumMarquee', { filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.85)) brightness(0.2) grayscale(0.8)', duration: 0.3, ease: 'steps(4)' }, t)
      .to('.power-cut', { autoAlpha: 1, duration: 0.05 }, t + 0.25)
      .set('.matchfx', { autoAlpha: 1 }, t + 0.32)
      .to('.matchfx .striker', { y: 0, autoAlpha: 1, duration: 0.2, ease: 'back.out(2)' }, t + 0.32)
      .to('.matchfx .match', { x: 0, duration: 0.14, ease: 'power4.in' }, t + 0.55);
    $$('.matchfx .spark').forEach((s, i) => {
      const ang = -Math.PI * (0.1 + 0.8 * i / 7);
      tl.to(s, { scale: 1, x: Math.cos(ang) * 140, y: Math.sin(ang) * 110, duration: 0.12, ease: 'power2.out' }, t + 0.68)
        .to(s, { scale: 0, duration: 0.1 }, t + 0.8);
    });
    shake(t + 0.68, 8, 0.12);
    tl.to('.matchfx .flame', { scale: 1, duration: 0.14, ease: 'back.out(3)' }, t + 0.7)
      .to('.matchfx .flame', { scaleY: 1.3, scaleX: 0.85, duration: 0.08, yoyo: true, repeat: 3 }, t + 0.84)
      // the flame blooms into a hole burnt straight through to the sunlit kiosk
      .set('.flame-ring', { autoAlpha: 1 }, t + 1.0)
      .to('#scKiosk', { clipPath: 'circle(150% at 50% 58%)', duration: 0.45, ease: 'power2.in' }, t + 1.0)
      .to('.flame-ring', { width: diag * 3, height: diag * 3, margin: -diag * 1.5, duration: 0.45, ease: 'power2.in' }, t + 1.0)
      .to(['.matchfx', '.power-cut'], { autoAlpha: 0, duration: 0.15 }, t + 1.1)
      .set(['.flame-ring', '#scDrum'], { autoAlpha: 0 }, t + 1.46);
  });

  /* SCENE 4 · MATCHBOX KIOSK: one strike sets off the whole shelf, box to box like a fuse */
  beat('boxes', 'STAGE 04 · SIDES & DRINKS', 1.5, t0 => {
    $$('.mb').forEach((mb, i) => {
      const q = (s: string) => mb.querySelector(s);
      const t = t0 + 0.05 + i * 0.2;
      tl.set(q('.mb-spark'), { autoAlpha: 1, scale: 0.2 }, t)
        .to(q('.mb-spark'), { scale: 3, duration: 0.2, ease: 'power2.out' }, t)
        .to(q('.mb-spark'), { autoAlpha: 0, duration: 0.08 }, t + 0.14)
        .to(q('.mb-sleeve'), { keyframes: { rotation: [0, -4, 3, 0], easeEach: 'none' }, duration: 0.14, ease: 'none' }, t)
        .to(q('.mb-drawer'), { xPercent: 34, duration: 0.25, ease: 'power3.out' }, t + 0.12)
        .to(q('.mb-prod'), { yPercent: 0, scale: 1, autoAlpha: 1, duration: 0.32, ease: 'back.out(2.4)' }, t + 0.2)
        .to(q('.mb-prod'), { rotation: i % 2 ? 4 : -4, duration: 0.2 }, t + 0.45);
      shake(t + 0.2, 5, 0.08);
    });
  });

  /* TRANSITION · NIGHT SHUTTER */
  beat('shutter', '03:00 AM · SHUTTER DOWN', 1, t => {
    tl.to('#scKiosk', { filter: 'brightness(0.45) saturate(0.6)', duration: 0.3 }, t)
      .to('.shutter', { yPercent: 0, duration: 0.45, ease: 'bounce.out' }, t + 0.1);
    shake(t + 0.28, 20, 0.2);
    stamp('#stShutter', t + 0.3, null);
    tl.set('#scNight', { autoAlpha: 1 }, t + 0.99)
      .set('#scKiosk', { autoAlpha: 0 }, t + 0.99);
  });

  /* SCENE 5 · NIGHT WINDOW */
  beat('feast', 'STAGE 05 · THE NIGHT WINDOW', 1.9, t0 => {
    tl.to('#stShutter', { autoAlpha: 0, duration: 0.1 }, t0)
      .to('.shutter', { keyframes: { yPercent: [0, -8, -4, -101], easeEach: 'power2.inOut' }, duration: 0.6, ease: 'none' }, t0)
      .fromTo('#nightBg', { scale: 1.18 }, { scale: 1, duration: 0.8, ease: 'power2.out', immediateRender: false }, t0 + 0.1)
      .to('#nightHead', { autoAlpha: 1, x: 0, duration: 0.35, ease: 'back.out(1.8)' }, t0 + 0.5);
    const t = t0 + 0.5;
    tl.to('.f-tray img', { x: 0, rotation: 0, duration: 0.4, ease: 'power3.out' }, t)         // tray skids down the counter
      .to('.f-tray img', { rotation: 3, duration: 0.08, yoyo: true, repeat: 1 }, t + 0.38)
      .to('.f-wrap img', { y: 0, rotation: -6, duration: 0.3, ease: 'bounce.out' }, t + 0.42) // the saroukh drops onto it
      .to('.f-box img', { x: 0, y: 0, rotation: -4, duration: 0.36, ease: 'back.out(1.6)' }, t + 0.62) // carton tossed in
      .to('.f-jallab img', { x: 0, rotation: 0, duration: 0.36, ease: 'power3.out' }, t + 0.72)  // jallab slides in
      .to('.f-toum img', { y: 0, duration: 0.3, ease: 'back.out(2.2)' }, t + 0.86)              // toum and torshi pop up
      .to('.f-pickle img', { y: 0, duration: 0.3, ease: 'back.out(2.2)' }, t + 0.94);
    shake(t + 0.6, 8, 0.12);
  });

  beat('receipt', 'STAGE 05 · YOUR TICKET', 1, t => {
    tl.to('#receiptInner', { yPercent: 0, duration: 0.7, ease: 'steps(16)' }, t);
    // on phones the ticket needs the headline's spot
    if (narrow) tl.to('#nightHead', { autoAlpha: 0, y: -30, duration: 0.2 }, t);
  });
  // keep the timeline as long as its last label so every beat sits inside 0–1
  tl.set({}, {}, cur);

  return { tl, HUD };
}

/** The label nearest the timeline's playhead. */
export function nearestLabel(tl: gsap.core.Timeline) {
  const now = tl.time();
  let label = 'start', best = Infinity;
  for (const [name, t] of Object.entries(tl.labels)) {
    const d = Math.abs(t - now);
    if (d < best) { best = d; label = name; }
  }
  return label;
}

import type { ScrollTrigger } from './motion';
import { getLenis } from './scroll';

/**
 * Beat stepper: inside a pinned, scrubbed section, one flick of the wheel (or one swipe / arrow key) glides to the
 * next label of its timeline. A flick that lands mid-glide is never dropped: it chains on to the beat after the one
 * in flight. Trackpad momentum counts as the same gesture; a fresh swipe on top of it doesn't. Past the last beat,
 * normal scrolling takes over. Needs Lenis (off with reduced motion, where scrolling is left alone).
 */
export function attachBeatStepper(st: ScrollTrigger, tl: gsap.core.Timeline, enabled: () => boolean) {
  const lenis = getLenis();
  if (!lenis) return () => {};
  const beats = Object.values(tl.labels).sort((a, b) => a - b);
  const beatY = (i: number) => st.start + (st.end - st.start) * (beats[i] / tl.duration());
  let lastInput = 0, lastAbs = 0, lastDir = 0, lastStepAt = 0;
  // Lenis reports its current position mid-glide, so remember where we're headed
  let headingTo = -1, arriveAt = 0;

  const nearestBeat = () => {
    const p = (lenis.targetScroll - st.start) / (st.end - st.start) * tl.duration();
    let k = 0;
    beats.forEach((t, i) => { if (Math.abs(t - p) < Math.abs(beats[k] - p)) k = i; });
    return k;
  };
  const inside = (dir: number) => {
    const y = lenis.targetScroll;
    if (y < st.start - 2 || y > st.end + 2) return false;
    if (dir > 0 && nearestBeat() === beats.length - 1 && y >= st.end - 2) return false; // leave past the last beat
    if (dir < 0 && nearestBeat() === 0 && y <= st.start + 2) return false;              // and before the first
    return true;
  };
  const step = (dir: number) => {
    const from = performance.now() < arriveAt ? headingTo : nearestBeat();
    const to = Math.max(0, Math.min(beats.length - 1, from + dir));
    if (to === from) return;
    const duration = Math.min(1.4, 0.55 + Math.abs(beats[to] - beats[from]) * 0.42);
    lastStepAt = performance.now();
    headingTo = to;
    arriveAt = lastStepAt + duration * 1000;
    lenis.scrollTo(beatY(to), { duration, easing: x => 1 - Math.pow(1 - x, 3), lock: true, force: true });
  };
  const claim = (e: Event, dir: number) => {
    if (!enabled() || !inside(dir)) return false;
    e.preventDefault();
    e.stopImmediatePropagation();
    return true;
  };

  const onWheel = (e: WheelEvent) => {
    const dir = Math.sign(e.deltaY);
    if (!dir || !claim(e, dir)) return;
    const now = e.timeStamp; // input time, unaffected by busy frames
    const abs = Math.abs(e.deltaY);
    const sinceStep = now - lastStepAt;
    const fresh =
      (now - lastInput > 140 && sinceStep > 180) ||           // the wheel went quiet: new flick
      dir !== lastDir ||                                       // reversed direction
      (abs > lastAbs * 1.8 && abs > 12 && sinceStep > 250) ||  // new swipe on top of decaying momentum
      (sinceStep > 500 && abs >= lastAbs && abs >= 40);        // still pushing hard: keep going
    lastInput = now;
    lastAbs = abs;
    lastDir = dir;
    if (fresh && abs > 2) { step(dir); lastStepAt = now; }
  };
  const onKey = (e: KeyboardEvent) => {
    const dir = ({ ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 } as Record<string, number>)[e.key];
    if (!dir || (e.target as Element | null)?.closest?.('button, a, input, textarea, select')) return;
    if (!claim(e, dir)) return;
    if (!e.repeat || performance.now() - lastStepAt > 300) step(dir);
  };
  let touchY: number | null = null;
  const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY; };
  const onTouchMove = (e: TouchEvent) => {
    if (touchY == null) return;
    const dir = Math.sign(touchY - e.touches[0].clientY);
    if (dir) claim(e, dir);
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchY == null) return;
    const dy = touchY - e.changedTouches[0].clientY;
    touchY = null;
    if (Math.abs(dy) > 30 && enabled() && inside(Math.sign(dy))) step(Math.sign(dy));
  };

  addEventListener('wheel', onWheel, { passive: false, capture: true });
  addEventListener('keydown', onKey, { capture: true });
  addEventListener('touchstart', onTouchStart, { passive: true });
  addEventListener('touchmove', onTouchMove, { passive: false });
  addEventListener('touchend', onTouchEnd);
  return () => {
    removeEventListener('wheel', onWheel, { capture: true });
    removeEventListener('keydown', onKey, { capture: true });
    removeEventListener('touchstart', onTouchStart);
    removeEventListener('touchmove', onTouchMove);
    removeEventListener('touchend', onTouchEnd);
  };
}

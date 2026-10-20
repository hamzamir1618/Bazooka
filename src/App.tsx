import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { RM, ScrollTrigger } from './lib/motion';
import { scrollToY } from './lib/scroll';
import { BasketProvider } from './lib/basket';
import { hashOf, RouterContext, routeFromHash, TRANSITION, type Point, type Route, type View } from './lib/router';
import { Intro } from './components/Intro';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { TransitionOverlay, type OverlayHandle } from './components/TransitionOverlay';
import { Home } from './pages/Home';
import { MenuPage } from './pages/MenuPage';
import { DishPage } from './pages/DishPage';
import { StoryPage } from './pages/StoryPage';
import { VisitPage } from './pages/VisitPage';
import { OrderPage } from './pages/OrderPage';
import { ConfirmPage } from './pages/ConfirmPage';

// Never let a transition that fails to finish lock up navigation.
const atMost = <T,>(p: Promise<T>, fallback: T, ms = 4000) => Promise.race([p, new Promise<T>(r => setTimeout(() => r(fallback), ms))]);
const same = (a: Route, b: Route) => a.view === b.view && (a.param ?? '') === (b.param ?? '');

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [intro, setIntro] = useState(!RM);
  const [revealed, setRevealed] = useState(RM);
  const overlay = useRef<OverlayHandle>(null);
  const current = useRef(route);
  const busy = useRef(false);

  const swap = useCallback((to: Route) => {
    // commit the new page while the screen is covered, then re-measure the scroll triggers
    flushSync(() => setRoute(to));
    current.current = to;
    scrollToY(0, { immediate: true });
    ScrollTrigger.refresh();
  }, []);

  const go = useCallback(async (view: View, from?: Point, param?: string) => {
    const to: Route = { view, param };
    if (busy.current) return;
    if (same(to, current.current)) { scrollToY(0); return; }
    busy.current = true;
    try { history.pushState(null, '', hashOf(to)); } catch { /* sandboxed frames may refuse */ }
    try {
      if (RM || !overlay.current) { swap(to); return; }
      const kind = TRANSITION[view];
      await atMost(overlay.current.cover(kind, to, from), undefined);
      swap(to);
      await atMost(overlay.current.uncover(kind), undefined);
    } finally {
      busy.current = false;
    }
  }, [swap]);

  // browser back/forward
  useEffect(() => {
    const onPop = () => { const r = routeFromHash(); if (!same(r, current.current)) go(r.view, undefined, r.param); };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, [go]);

  // late fonts and images shift layout; re-measure once everything is in
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    return () => removeEventListener('load', refresh);
  }, []);

  const router = useMemo(() => ({ route, go, revealed }), [route, go, revealed]);

  return (
    <RouterContext.Provider value={router}>
      <BasketProvider>
        {intro && <Intro onReveal={() => setRevealed(true)} onDone={() => { setIntro(false); ScrollTrigger.refresh(); }} />}
        <Nav />
        <main key={hashOf(route)} className={`page page-${route.view}`}>
          {route.view === 'home' && <Home />}
          {route.view === 'menu' && <MenuPage />}
          {route.view === 'dish' && <DishPage id={route.param!} />}
          {route.view === 'story' && <StoryPage />}
          {route.view === 'visit' && <VisitPage />}
          {route.view === 'order' && <OrderPage />}
          {route.view === 'confirm' && <ConfirmPage />}
        </main>
        <Footer />
        <TransitionOverlay ref={overlay} />
        <div className="grain" aria-hidden="true" />
      </BasketProvider>
    </RouterContext.Provider>
  );
}

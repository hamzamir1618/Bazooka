import { createContext, useContext } from 'react';
import type React from 'react';
import { itemById } from '../data/menu';

export type View = 'home' | 'menu' | 'dish' | 'story' | 'visit' | 'order' | 'confirm';
export const VIEWS: View[] = ['home', 'menu', 'dish', 'story', 'visit', 'order', 'confirm'];

export type Transition = 'plates' | 'curtain' | 'slash' | 'iris' | 'shutter' | 'flame' | 'stamp';

/** Every destination arrives through its own scene change, each one a contraption from the home-page reel. */
export const TRANSITION: Record<View, Transition> = {
  home: 'plates',    // the three silkscreen plates sweep across, then off
  menu: 'curtain',   // the cinema's red curtains close, then part on the programme
  dish: 'slash',     // the carving sword cleaves the screen; the halves slide apart
  story: 'iris',     // an old-film iris closes to black, then opens
  visit: 'shutter',  // the 3 AM steel shutter slams down, then rolls up
  order: 'flame',    // a struck match's flame spreads from the click
  confirm: 'stamp',  // a ticket slides up and ORDER FIRED thumps onto it
};

/** Kicker, English word and Arabic word shown mid-transition. */
export function labelOf(view: View, param?: string): [string, string, string] {
  switch (view) {
    case 'home': return ['Now showing', 'Bazooka', 'بازوكا'];
    case 'menu': return ['Tonight’s programme', 'The Menu', 'قائمة الطعام'];
    case 'dish': {
      const it = itemById(param);
      return ['Feature presentation', it?.name ?? 'The Menu', it?.ar ?? 'الصاروخ'];
    }
    case 'story': return ['Since 1968', 'The Story', 'الحكاية'];
    case 'visit': return ['Open till 4 AM', 'Night Windows', 'شباك آخر الليل'];
    case 'order': return ['Pickup', 'Your Tray', 'الصينية'];
    case 'confirm': return ['Ticket printed', 'Order Fired', 'بالهنا'];
  }
}

/** Which nav link is lit for each page. */
export const NAV_OF: Record<View, View> = { home: 'home', menu: 'menu', dish: 'menu', story: 'story', visit: 'visit', order: 'order', confirm: 'order' };

/** `param` is the item id on `dish`. */
export interface Route { view: View; param?: string }

/** The click that started a navigation (some wipes spread from it). */
export interface Point { clientX: number; clientY: number }

interface RouterValue {
  route: Route;
  go: (to: View, from?: Point, param?: string) => void;
  /** True once the intro plates have lifted. */
  revealed: boolean;
}

export const RouterContext = createContext<RouterValue>({ route: { view: 'home' }, go: () => {}, revealed: true });
export const useRouter = () => useContext(RouterContext);

export const hashOf = (r: Route) => `#${r.view}${r.param ? `/${r.param}` : ''}`;

export function routeFromHash(): Route {
  const [v, param] = window.location.hash.slice(1).split('/');
  if (v === 'dish' && !itemById(param)) return { view: 'menu' };
  return VIEWS.includes(v as View) ? { view: v as View, param } : { view: 'home' };
}

/** Link props: a real href (so it opens in a new tab) that plays the transition on a plain click. */
export function linkTo(go: RouterValue['go'], view: View, param?: string) {
  return {
    href: hashOf({ view, param }),
    onClick: (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      go(view, e, param);
    },
  };
}

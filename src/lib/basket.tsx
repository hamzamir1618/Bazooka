import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ITEMS, type Item } from '../data/menu';
import { BRANCHES, type Branch } from '../data/branches';
import { gsap, RM } from './motion';

// The tray, the chosen branch and the placed order, in memory only. There is no ordering backend yet, so a refresh
// clears everything (the confirmation page says so).

export type Line = { item: Item; qty: number };
export type Placed = { code: string; branch: Branch; pickup: Date; night: string; name: string; phone: string; lines: Line[]; total: number };

type Ctx = {
  lines: Line[];
  count: number;
  total: number;
  add: (id: string, n?: number) => void;
  addMany: (ids: string[]) => void;
  setQty: (id: string, qty: number) => void;
  branch: Branch;
  setBranch: (id: string) => void;
  placed: Placed | null;
  place: (o: { pickup: Date; night: string; name: string; phone: string }) => Placed;
};

const BasketContext = createContext<Ctx>(null as unknown as Ctx);
export const useBasket = () => useContext(BasketContext);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [qty, setQtyMap] = useState<Record<string, number>>({});
  const [branchId, setBranchId] = useState(BRANCHES[0].id);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const add = useCallback((id: string, n = 1) => setQtyMap(q => ({ ...q, [id]: Math.min(20, (q[id] ?? 0) + n) })), []);
  const addMany = useCallback((ids: string[]) => setQtyMap(q => {
    const next = { ...q };
    ids.forEach(id => { next[id] = Math.min(20, (next[id] ?? 0) + 1); });
    return next;
  }), []);
  const setQty = useCallback((id: string, n: number) => setQtyMap(q => {
    const next = { ...q };
    if (n <= 0) delete next[id]; else next[id] = Math.min(n, 20);
    return next;
  }), []);

  const lines = useMemo<Line[]>(() => ITEMS.filter(i => qty[i.id]).map(item => ({ item, qty: qty[item.id] })), [qty]);
  const branch = BRANCHES.find(b => b.id === branchId) ?? BRANCHES[0];

  const value = useMemo<Ctx>(() => {
    const total = lines.reduce((a, l) => a + l.item.price * l.qty, 0);
    const count = lines.reduce((a, l) => a + l.qty, 0);
    return {
      lines, total, count, add, addMany, setQty, branch, placed,
      setBranch: setBranchId,
      place: o => {
        const p: Placed = { ...o, code: makeCode(), branch, lines, total };
        setPlaced(p);
        setQtyMap({});
        return p;
      },
    };
  }, [lines, add, addMany, setQty, branch, placed]);

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

function makeCode() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'BZK-' + Array.from({ length: 4 }, () => a[(Math.random() * a.length) | 0]).join('');
}

/**
 * Sends a copy of `img` arcing from where it sits into the nav's tray pill (or the floating tray sticker).
 * Purely visual: call `add()` as well.
 */
export function flyToTray(img: HTMLImageElement | null | undefined) {
  if (RM || !img) return;
  const target = [...document.querySelectorAll<HTMLElement>('[data-tray-target]')]
    .map(el => ({ el, r: el.getBoundingClientRect() }))
    .find(t => t.r.width > 0 && t.r.bottom > 0 && t.r.top < innerHeight);
  if (!target) return;
  const from = img.getBoundingClientRect();
  if (!from.width) return;
  const ghost = img.cloneNode() as HTMLImageElement;
  ghost.removeAttribute('class');
  ghost.removeAttribute('id');
  Object.assign(ghost.style, {
    position: 'fixed', left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`,
    objectFit: 'contain', zIndex: '1200', pointerEvents: 'none', margin: '0',
  });
  document.body.appendChild(ghost);
  const dx = target.r.left + target.r.width / 2 - (from.left + from.width / 2);
  const dy = target.r.top + target.r.height / 2 - (from.top + from.height / 2);
  const s = Math.min(1, 46 / Math.max(from.width, from.height));
  gsap.timeline({ onComplete: () => ghost.remove() })
    .to(ghost, { x: dx, duration: 0.75, ease: 'power1.inOut' }, 0)
    .to(ghost, { y: dy, duration: 0.75, ease: 'back.in(1.6)' }, 0)
    .to(ghost, { scale: s, rotation: 300, duration: 0.75, ease: 'power2.in' }, 0)
    .fromTo(target.el, { scale: 1 }, { scale: 1.25, rotation: -8, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, 0.72);
}

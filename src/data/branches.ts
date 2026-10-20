// SAMPLE DATA: branch names, addresses, phone numbers and hours are placeholders.

export interface Branch {
  id: string;
  no: string;
  name: string;
  area: string;
  address: string;
  phone: string;
}

export const BRANCHES: Branch[] = [
  { id: 'gulberg', no: '01', name: 'Gulberg', area: 'Lahore', address: 'MM Alam Road, Gulberg III, Lahore', phone: '+92 300 0000 001' },
  { id: 'dha', no: '02', name: 'DHA', area: 'Lahore', address: 'Y Block Market, DHA Phase 3, Lahore', phone: '+92 300 0000 002' },
  { id: 'johar', no: '03', name: 'Johar Town', area: 'Lahore', address: 'Main Boulevard, Johar Town, Lahore', phone: '+92 300 0000 003' },
];

export const branchById = (id?: string) => BRANCHES.find(b => b.id === id);

/** Every window opens at 6 PM and closes at 4 AM the next morning. Minutes from the opening day's midnight. */
export const HOURS = { open: 18 * 60, close: 28 * 60, label: '6 PM – 4 AM, every night' };

export const mapsUrl = (b: Branch) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`;

const minutesNow = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** Open if it's after 6 PM, or before 4 AM (still last night's service). */
export const openNow = (d = new Date()) => {
  const m = minutesNow(d);
  return m >= HOURS.open || m < HOURS.close - 24 * 60;
};

/**
 * Pickup slots every 15 minutes in the current night's service (if any are left at least 20 minutes out),
 * otherwise in tonight's / tomorrow night's.
 */
export function pickupSlots(now = new Date()): { night: string; slots: Date[] } {
  const m = minutesNow(now);
  // midnight of the day this service window opened
  const base = new Date(now);
  base.setHours(0, 0, 0, 0);
  if (m < HOURS.close - 24 * 60) base.setDate(base.getDate() - 1);

  for (let add = 0; add < 2; add++) {
    const day = new Date(base);
    day.setDate(base.getDate() + add);
    const sinceBase = (now.getTime() - day.getTime()) / 60000;
    const first = Math.max(HOURS.open, Math.ceil((sinceBase + 20) / 15) * 15);
    const slots: Date[] = [];
    for (let t = first; t <= HOURS.close - 15; t += 15) slots.push(new Date(day.getTime() + t * 60000));
    // the current window (whether it opens later today or is still running past midnight) is "tonight"
    if (slots.length) return { night: add === 0 ? 'Tonight' : 'Tomorrow night', slots };
  }
  return { night: 'Tonight', slots: [] };
}

export const prettyTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

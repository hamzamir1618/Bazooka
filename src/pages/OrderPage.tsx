import { useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { flyToTray, useBasket } from '../lib/basket';
import { linkTo, useRouter } from '../lib/router';
import { ITEMS, rupees } from '../data/menu';
import { BRANCHES, pickupSlots, prettyTime } from '../data/branches';
import { PageHead, usePageIntro } from '../components/PageHead';

/**
 * Order for pickup: the tray (change counts, or add anything from the menu strip), the window, a pickup time from
 * tonight's 15-minute slots, and a name. The thermal ticket on the right prints the order as it changes.
 */
export function OrderPage() {
  const root = useRef<HTMLDivElement>(null);
  const { go } = useRouter();
  const { lines, count, total, add, setQty, branch, setBranch, place } = useBasket();
  const { night, slots } = useMemo(() => pickupSlots(), []);
  const [slot, setSlot] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tried, setTried] = useState(false);

  usePageIntro(root, tl => tl
    .fromTo('.ord-step', { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.08 }, 0.3)
    .fromTo('.ticket-col', { yPercent: -30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'steps(10)' }, 0.4));

  // each new line prints onto the ticket
  useGSAP(() => {
    if (RM) return;
    gsap.fromTo('.tk-lines li:last-child', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.35, ease: 'steps(8)' });
  }, { scope: root, dependencies: [lines.length] });

  const pickup = slots[slot];
  const problem = !count ? 'Add at least one thing to the tray.' : !pickup ? 'Pick a pickup time.' : !name.trim() ? 'Add a name for the ticket.' : '';

  const quick = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    add(id);
    flyToTray(e.currentTarget.querySelector('img'));
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTried(true);
    if (problem) {
      if (!RM) gsap.fromTo('.tk', { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1,.2)' });
      return;
    }
    place({ pickup, night, name: name.trim(), phone: phone.trim() });
    const b = (e.currentTarget.querySelector('.place') as HTMLElement).getBoundingClientRect();
    go('confirm', { clientX: b.left + b.width / 2, clientY: b.top + b.height / 2 });
  };

  return (
    <div className="order-page" ref={root}>
      <PageHead kicker="PICKUP · PAY AT THE WINDOW" title="Your Tray" ar="الصينية"
        lede="Pick a window and a time. We carve it off the spit so it’s hot when you pull up. No payment online: you pay when you collect." />

      <form className="ord" onSubmit={submit} noValidate>
        <div className="ord-col">
          <section className="ord-step" aria-labelledby="s1">
            <h2 id="s1"><span className="ord-n">1</span> The tray</h2>
            {lines.length ? (
              <ul className="lines">
                {lines.map(l => (
                  <li key={l.item.id} className="line">
                    <img src={l.item.img} alt="" />
                    <div className="line-t">
                      <a {...linkTo(go, 'dish', l.item.id)}>{l.item.name}</a>
                      <span>{rupees(l.item.price)} each</span>
                    </div>
                    <div className="qty sm" role="group" aria-label={`How many ${l.item.name}`}>
                      <button type="button" onClick={() => setQty(l.item.id, l.qty - 1)} aria-label={l.qty === 1 ? `Remove ${l.item.name}` : 'One less'}>{l.qty === 1 ? '×' : '−'}</button>
                      <output>{l.qty}</output>
                      <button type="button" onClick={() => setQty(l.item.id, l.qty + 1)} aria-label="One more">+</button>
                    </div>
                    <b className="line-sum">{rupees(l.item.price * l.qty)}</b>
                  </li>
                ))}
              </ul>
            ) : <p className="empty">The tray’s empty. Tap anything below, or <a {...linkTo(go, 'menu')}>browse the menu</a>.</p>}
            <div className="quick" aria-label="Add to the tray">
              {ITEMS.map(i => (
                <button key={i.id} type="button" className="quick-b" onClick={e => quick(e, i.id)}>
                  <img src={i.img} alt="" /><span>+ {i.name}</span><small>{rupees(i.price)}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="ord-step" aria-labelledby="s2">
            <h2 id="s2"><span className="ord-n">2</span> Which window?</h2>
            <div className="branches" role="radiogroup" aria-labelledby="s2">
              {BRANCHES.map(b => (
                <button key={b.id} type="button" role="radio" aria-checked={branch.id === b.id} className={`branch ${branch.id === b.id ? 'on' : ''}`} onClick={() => setBranch(b.id)}>
                  <b>No.{b.no} · {b.name}</b><span>{b.address}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="ord-step" aria-labelledby="s3">
            <h2 id="s3"><span className="ord-n">3</span> Pickup <em>{night.toLowerCase()}</em></h2>
            {slots.length ? (
              <div className="slots" role="radiogroup" aria-labelledby="s3">
                {slots.map((s, i) => <button key={s.getTime()} type="button" role="radio" aria-checked={i === slot} className={`slot ${i === slot ? 'on' : ''}`} onClick={() => setSlot(i)}>{prettyTime(s)}</button>)}
              </div>
            ) : <p className="empty">No pickup times left tonight. Come to the window instead.</p>}
          </section>

          <section className="ord-step" aria-labelledby="s4">
            <h2 id="s4"><span className="ord-n">4</span> Whose is it?</h2>
            <div className="fields">
              <label className="field"><span>Name on the ticket</span>
                <input value={name} onChange={e => setName(e.target.value)} autoComplete="given-name" maxLength={30} aria-invalid={tried && !name.trim()} placeholder="Ayesha" />
              </label>
              <label className="field"><span>Phone (optional)</span>
                <input value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" maxLength={20} placeholder="+92 3xx xxxxxxx" />
              </label>
            </div>
          </section>
        </div>

        <aside className="ticket-col" aria-label="Order summary">
          <div className="printer-slot" />
          <div className="tk thermal">
            <div className="r-head">
              <div className="r-ar" lang="ar">مطعم بازوكا للشاورما</div>
              <div>WINDOW No.{branch.no} · {branch.name.toUpperCase()}</div>
              <div>{pickup ? `${night.toUpperCase()} · ${prettyTime(pickup)}` : 'PICK A TIME'}</div>
            </div>
            <ul className="tk-lines r-lines">
              {lines.length ? lines.map(l => <li key={l.item.id} className="r-line"><span>{String(l.qty).padStart(2, '0')}x {l.item.name.toUpperCase()}</span><b>{rupees(l.item.price * l.qty)}</b></li>)
                : <li className="r-line muted"><span>— NOTHING YET —</span></li>}
            </ul>
            <div className="r-line r-total"><span>TOTAL · المجموع</span><span>{rupees(total)}</span></div>
            <p className="tk-pay">PAY AT THE WINDOW · CASH OR CARD</p>
            {tried && problem && <p className="tk-problem" role="alert">{problem}</p>}
            <button className="tear place" type="submit">FIRE THE ORDER ✂</button>
          </div>
        </aside>
      </form>
    </div>
  );
}

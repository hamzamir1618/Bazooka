import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { linkTo, useRouter, type View } from '../lib/router';
import { Theatre } from '../sections/theatre/Theatre';

const COMING: { view: View; no: string; title: string; ar: string; line: string; img: string; ink: string }[] = [
  { view: 'menu', no: '01', title: 'The full programme', ar: 'القائمة', line: 'Five features, four sides, one jallab.', img: '/assets/saroukh-shatta.webp', ink: 'var(--vermilion)' },
  { view: 'visit', no: '02', title: 'Find a night window', ar: 'الفروع', line: 'Three windows, open 6 PM to 4 AM.', img: '/assets/night-shop.webp', ink: 'var(--cobalt)' },
  { view: 'order', no: '03', title: 'Order for pickup', ar: 'اطلب', line: 'Pick a time. It’s hot when you arrive.', img: '/assets/brass-tray.webp', ink: 'var(--pistachio)' },
];

/** The landing page: the 15-beat reel, then three "coming attractions" tickets into the rest of the site. */
export function Home() {
  const { go } = useRouter();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (RM) return;
    gsap.fromTo('.coming-card', { y: 120, rotation: (i: number) => [-8, 6, -5][i], opacity: 0 }, {
      y: 0, rotation: (i: number) => [-2, 1.5, -1][i], opacity: 1, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.12,
      scrollTrigger: { trigger: '.coming', start: 'top 75%' },
    });
  }, { scope: root });

  return (
    <div ref={root}>
      <Theatre />
      <section className="coming" aria-labelledby="coming-h">
        <span className="kicker">COMING ATTRACTIONS · قريباً</span>
        <h2 id="coming-h" className="riso">After the credits</h2>
        <div className="coming-row">
          {COMING.map(c => (
            <a key={c.view} className="coming-card" {...linkTo(go, c.view)} style={{ ['--ink' as string]: c.ink }}>
              <span className="cc-no">No.{c.no}</span>
              <img src={c.img} alt="" />
              <span className="cc-ar" lang="ar">{c.ar}</span>
              <span className="cc-t">{c.title}</span>
              <span className="cc-l">{c.line}</span>
              <span className="cc-go">→</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

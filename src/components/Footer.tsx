import { linkTo, useRouter } from '../lib/router';
import { BRANCHES, HOURS } from '../data/branches';

export function Footer() {
  const { go } = useRouter();
  return (
    <footer className="footer">
      <div className="kufic-band" aria-hidden="true" />
      <div className="footer-in">
        <div className="footer-sign">
          <div className="footer-ar" lang="ar">بالهنا والشفا</div>
          <div className="footer-en riso">Bazooka</div>
          <p>Foil-wrapped saroukh shawarma, carved off the charcoal spit. {HOURS.label}.</p>
        </div>
        <nav className="footer-col" aria-label="Footer">
          <span className="kicker">THE PROGRAMME</span>
          <a {...linkTo(go, 'menu')}>Menu</a>
          <a {...linkTo(go, 'story')}>Our story</a>
          <a {...linkTo(go, 'visit')}>Night windows</a>
          <a {...linkTo(go, 'order')}>Order for pickup</a>
        </nav>
        <div className="footer-col">
          <span className="kicker">NIGHT WINDOWS</span>
          {BRANCHES.map(b => <span key={b.id}>No.{b.no} · {b.name}, {b.area}</span>)}
        </div>
      </div>
      <p className="footer-note">© {new Date().getFullYear()} Bazooka. Menu, prices, branches and hours shown are sample details.</p>
    </footer>
  );
}

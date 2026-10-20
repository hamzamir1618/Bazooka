import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { linkTo, useRouter } from '../lib/router';
import { CHAPTERS } from '../data/story';
import { PageHead, usePageIntro } from '../components/PageHead';

/**
 * The story as four reels of film. Each chapter's picture slides in from its side as it scrolls up, its title
 * plates misregister and settle, and the Ruqaa pull quotes swing in between chapters.
 */
export function StoryPage() {
  const root = useRef<HTMLDivElement>(null);
  const { go } = useRouter();

  usePageIntro(root);

  useGSAP(() => {
    if (RM) return;
    gsap.utils.toArray<HTMLElement>('.chapter').forEach((ch, i) => {
      const dir = i % 2 ? 1 : -1;
      gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 78%' } })
        .fromTo(ch.querySelector('.ch-art'), { xPercent: 40 * dir, rotation: 10 * dir, opacity: 0 }, { xPercent: 0, rotation: dir * -2, opacity: 1, duration: 0.9, ease: 'back.out(1.4)' })
        .fromTo(ch.querySelectorAll('.ch-no, .ch-k, .ch-t, .ch-ar, .ch-p'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out' }, 0.15);
      // the picture drifts against the scroll
      gsap.fromTo(ch.querySelector('.ch-art img'), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.utils.toArray<HTMLElement>('.pull').forEach(p => {
      gsap.fromTo(p, { skewY: 18, scale: 0.7, opacity: 0 }, { skewY: -5, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(2)', scrollTrigger: { trigger: p, start: 'top 85%' } });
    });
  }, { scope: root });

  return (
    <div className="story-page" ref={root}>
      <PageHead kicker="NOW SHOWING · A STORY IN FOUR REELS" title="The Story" ar="حكاية الصاروخ"
        lede="How a late-show snack rolled in a tin kiosk became a shawarma called a bazooka." />
      {CHAPTERS.map((c, i) => (
        <div key={c.no}>
          <article className={`chapter ${i % 2 ? 'flip' : ''}`}>
            <div className="ch-art"><img src={c.img} alt="" /><span className="ch-sprockets" aria-hidden="true" /></div>
            <div className="ch-text">
              <span className="ch-no">REEL {c.no}</span>
              <span className="kicker ch-k">{c.kicker}</span>
              <h2 className="riso ch-t">{c.title}</h2>
              <div className="ch-ar" lang="ar">{c.ar}</div>
              <p className="ch-p">{c.text}</p>
            </div>
          </article>
          {c.quote && <blockquote className="pull" lang="ar">{c.quote}</blockquote>}
        </div>
      ))}
      <div className="story-end">
        <a className="btn big" {...linkTo(go, 'menu')}>See tonight’s programme →</a>
      </div>
    </div>
  );
}

// Visual review helper (not part of CI): screenshots every home-reel beat and every page.
//   npx vite preview --port 4179   (in another terminal, after `npm run build`)
//   node tests/shots.mjs [width] [height] [out-dir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const [W = '1440', H = '900', OUT = 'tests/.shots'] = process.argv.slice(2);
const BASE = process.env.BASE ?? 'http://localhost:4179/';
const out = resolve(OUT);
mkdirSync(out, { recursive: true });
const tag = `${W}x${H}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +W, height: +H } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(`${BASE}?test#home`);
await page.waitForTimeout(4000);
const labels = await page.evaluate(() => Object.entries(window.__bz.tl.labels).sort((a, b) => a[1] - b[1]));
let n = 0;
for (const [name, t] of labels) {
  await page.evaluate(t => {
    const { tl, st } = window.__bz;
    const y = st.start + (st.end - st.start) * (t / tl.duration());
    window.scrollTo(0, y);
  }, t);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${out}/${tag}-home-${String(n++).padStart(2, '0')}-${name}.png` });
}
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(1600);
await page.screenshot({ path: `${out}/${tag}-home-99-coming.png` });

for (const hash of ['menu', 'dish/original', 'dish/shatta', 'dish/jallab', 'story', 'visit', 'order']) {
  await page.goto(`${BASE}?test#${hash}`);
  await page.waitForTimeout(3500);
  // scroll through so scroll-triggered entrances have played
  for (let y = 0; y < (await page.evaluate(() => document.documentElement.scrollHeight)); y += 400) {
    await page.evaluate(y => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${tag}-${hash.replace('/', '-')}.png`, fullPage: true });
}
console.log('errors', JSON.stringify(errors));
await browser.close();

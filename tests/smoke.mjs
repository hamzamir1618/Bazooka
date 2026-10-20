// App smoke test: serves the production build (`npm run build` first) and drives it in headless Chromium.
// Fails on script errors, broken images, a malformed home reel, or a broken order flow.
//   npm run build && npm test
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const PORT = 4188;
const BASE = `http://localhost:${PORT}/`;
const failures = [];
function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures.push(name);
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'pipe' });
const stop = () => { try { process.platform === 'win32' ? spawn('taskkill', ['/pid', String(server.pid), '/T', '/F']) : server.kill(); } catch { /* already gone */ } };
let serverLog = '';
server.stdout.on('data', d => { serverLog += d; });
server.stderr.on('data', d => { serverLog += d; });
for (let i = 0; ; i++) {
  try { if ((await fetch(BASE)).ok) break; } catch { /* not up yet */ }
  if (i > 60 || server.exitCode != null) { stop(); throw new Error(`preview server did not start:
${serverLog}`); }
  await new Promise(r => setTimeout(r, 500));
}

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const broken = () => page.evaluate(() => [...document.images].filter(i => i.getAttribute('src') && i.complete && !i.naturalWidth).map(i => i.src.slice(-40)));
  const heading = () => page.evaluate(() => document.querySelector('main h1')?.textContent?.trim() ?? '');

  // ---- home reel ----
  await page.goto(`${BASE}?test#home`);
  await page.waitForTimeout(4500);
  const reel = await page.evaluate(() => ({ beats: Object.keys(window.__bz.tl.labels).length, pinned: window.__bz.st.end > window.__bz.st.start }));
  check('home: reel has 15 beats', reel.beats === 15, `found ${reel.beats}`);
  check('home: reel is pinned', reel.pinned);

  // three wheel flicks, spaced like a person, should land exactly three beats in
  await page.mouse.move(720, 450);
  for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(1500); }
  await page.waitForTimeout(1200);
  const at = await page.evaluate(() => {
    const { tl } = window.__bz;
    const hit = Object.entries(tl.labels).find(([, t]) => Math.abs(t - tl.time()) < 0.05);
    return hit ? hit[0] : `between@${tl.time().toFixed(2)}`;
  });
  check('home: three flicks = three beats', at === 'launch', `landed on ${at}`);

  await page.evaluate(() => { const { st } = window.__bz; window.scrollTo(0, st.end); });
  await page.waitForTimeout(2000);
  check('home: reaches the last beat', await page.evaluate(() => window.__bz.tl.progress() > 0.98));
  check('home: all images load', (await broken()).length === 0, (await broken()).join(', '));

  // ---- every page by URL ----
  for (const [hash, h1] of [['menu', 'The Menu'], ['dish/lamb', 'Dibs'], ['story', 'The Story'], ['visit', 'Night Windows'], ['order', 'Your Tray'], ['confirm', 'Nothing fired yet']]) {
    await page.goto(`${BASE}#${hash}`);
    await page.waitForTimeout(2500);
    const h = await heading();
    check(`#${hash}: renders`, h.replace(/\s+/g, ' ').toLowerCase().includes(h1.toLowerCase()), `h1 "${h}"`);
  }
  await page.goto(`${BASE}#dish/not-a-dish`);
  await page.waitForTimeout(2000);
  check('#dish/<unknown>: falls back to the menu', (await heading()).toLowerCase().includes('the menu'));

  // ---- order flow, through the page transitions ----
  await page.goto(`${BASE}#menu`);
  await page.waitForTimeout(2500);
  await page.click('.poster[data-item="original"] .btn');
  await page.click('.mbox[data-item="jallab"] .btn');
  await page.waitForTimeout(900);
  check('menu: + Add fills the tray', (await page.textContent('.nav-tray b')) === '2');

  // the nav slides away while scrolling down; the floating tray ticket stays
  await page.click('.tray-sticker');
  await page.waitForTimeout(3500);
  check('tray ticket opens the order page (flame wipe)', (await heading()).toLowerCase().includes('your tray'));
  check('order: lines listed', (await page.locator('.line').count()) === 2);
  await page.click('.place');
  await page.waitForTimeout(600);
  check('order: blocks a missing name', await page.isVisible('.tk-problem'));
  await page.fill('.field input >> nth=0', 'Ayesha');
  await page.click('.place');
  await page.waitForTimeout(4500);
  const code = await page.evaluate(() => document.querySelector('.cf-paper .r-head')?.textContent ?? '');
  check('confirm: ticket printed (stamp wipe)', /BZK-[A-Z0-9]{4}/.test(code), code.slice(0, 60));
  check('confirm: tray emptied', (await page.textContent('.nav-tray b')) === '0');

  await page.goBack();
  await page.waitForTimeout(3500);
  check('back button returns to the order page', (await heading()).toLowerCase().includes('your tray'));

  check('no script errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();

  // ---- reduced motion: no intro, no wipes, everything readable ----
  const rm = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const p2 = await rm.newPage();
  const rmErrors = [];
  p2.on('pageerror', e => rmErrors.push(e.message));
  await p2.goto(`${BASE}#menu`);
  await p2.waitForTimeout(1500);
  check('reduced motion: no intro plates', (await p2.locator('.intro').count()) === 0);
  check('reduced motion: menu visible at once', await p2.isVisible('.poster[data-item="original"]'));
  await p2.click('.nav ul a >> text=Visit');
  await p2.waitForTimeout(800);
  check('reduced motion: navigation swaps instantly', (await p2.evaluate(() => document.querySelector('main h1')?.textContent ?? '')).toLowerCase().includes('night'));
  check('reduced motion: no script errors', rmErrors.length === 0, rmErrors.join(' | '));
  await rm.close();
} finally {
  await browser.close();
  stop();
}
console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed');
process.exit(failures.length ? 1 : 0);

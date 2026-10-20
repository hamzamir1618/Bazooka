// Smoke test: opens each page in headless Chromium and fails on script errors,
// broken images, a malformed timeline, or reels that never connect.
//
//   npm test   (run `python design/scripts/build_share.py` first for the share checks)
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DESIGN = resolve(import.meta.dirname, '..');
const url = rel => pathToFileURL(resolve(DESIGN, rel)).href;
const EXPECTED_BEATS = 15;
const failures = [];

function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
  if (!ok) failures.push(name);
}

async function openPage(ctx, rel) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url(rel), { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  return { page, errors };
}

async function brokenImages(page) {
  return page.evaluate(() => [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.alt || i.src.slice(0, 60)));
}

async function testPrototype(ctx, rel) {
  const { page, errors } = await openPage(ctx, rel);
  const info = await page.evaluate(() => ({
    beats: Object.keys(tl.labels).length,
    duration: tl.duration(),
    pinned: !!st && st.end > st.start
  }));
  check(`${rel}: timeline has ${EXPECTED_BEATS} beats`, info.beats === EXPECTED_BEATS, `found ${info.beats}`);
  check(`${rel}: scroll theatre is pinned`, info.pinned);

  // scroll to the last beat and make sure the finale renders
  await page.evaluate(() => lenis.scrollTo(st.end, { immediate: true, force: true }));
  await page.waitForTimeout(2000);
  const end = await page.evaluate(() => ({
    progress: tl.progress(),
    hud: document.getElementById('hudStage').textContent
  }));
  check(`${rel}: reaches the final beat`, end.progress > 0.98, `progress ${end.progress.toFixed(2)}, HUD "${end.hud}"`);

  const broken = await brokenImages(page);
  check(`${rel}: all images load`, broken.length === 0, broken.join(', '));
  check(`${rel}: no script errors`, errors.length === 0, errors.join(' | '));
  await page.close();
}

async function testReelHost(ctx, rel, tabSelector, statusId, expectText) {
  const { page, errors } = await openPage(ctx, rel);
  await page.waitForTimeout(2000);
  await page.click(tabSelector);
  await page.waitForTimeout(2000);
  const status = await page.textContent('#' + statusId);
  check(`${rel}: embedded reel responds to controls`, status.includes(expectText), `status "${status}"`);
  const broken = await brokenImages(page);
  check(`${rel}: all images load`, broken.length === 0, broken.join(', '));
  check(`${rel}: no script errors`, errors.length === 0, errors.join(' | '));
  await page.close();
}

const browser = await chromium.launch();

// Source pages (fonts and libraries come from CDNs)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await testPrototype(ctx, 'prototype.html');
  await testReelHost(ctx, 'index.html', '#simTabs [data-label="boxes"]', 'simStatus', 'MATCHBOX');
  await testReelHost(ctx, 'review.html', '#simTabs [data-label="boxes"]', 'simStatus', 'MATCHBOX');
  await ctx.close();
}

// Share builds must work with the network switched off
const shareFiles = ['share/BAZOOKA-Prototype.html', 'share/BAZOOKA-Design-Review.html'];
if (shareFiles.every(f => existsSync(resolve(DESIGN, f)))) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const requests = [];
  await ctx.route(/^https?:/, r => { requests.push(r.request().url()); r.abort(); });
  await testPrototype(ctx, shareFiles[0]);
  await testReelHost(ctx, shareFiles[1], '#simTabs [data-label="boxes"]', 'simStatus', 'MATCHBOX');
  check('share builds: no network requests', requests.length === 0, requests.slice(0, 3).join(', '));
  await ctx.close();
} else {
  check('share builds exist (run build_share.py first)', false);
}

await browser.close();
console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed');
process.exit(failures.length ? 1 : 0);

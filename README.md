# BAZOOKA (بازوكا)

Website for BAZOOKA, a shawarma brand built around the "Saroukh" (rocket): the long, foil-wrapped saj wrap. It's styled as a 1968 Cairo cinema poster, with silkscreen inks, misregistered riso headlines and bilingual Arabic/English type.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run preview    # serves the production build
npm test           # smoke test against the production build (needs `npx playwright install chromium` once)
```

## Deploy

Hosted on Vercel, connected to this GitHub repo: pushes to `main` deploy to production and pull requests get preview URLs. `vercel.json` sets the build (`npm ci`, `npm run build`, `dist/`) and cache headers. The site uses hash routing, so it needs no rewrites. `.vercelignore` leaves the source art, design prototype and tests out of the upload. Node is pinned to 22.x in `package.json`, the same version CI uses.

## Stack

React 18, TypeScript, Vite, GSAP 3 with ScrollTrigger (`@gsap/react`), Lenis smooth scroll. No router library: pages are switched in `App.tsx` so each switch can run its own full-screen transition. The URL hash deep-links: `#menu`, `#dish/<id>`, `#story`, `#visit`, `#order`, `#confirm`.

## Screens

| URL | What | Arrives through |
| --- | --- | --- |
| `#home` | The 15-beat scroll reel, then three "coming attractions" tickets | Three silkscreen plates sweep across |
| `#menu` | Feature posters (wraps, box) and matchboxes (sides, jallab) | The cinema's red curtains close and part |
| `#dish/<id>` | One item: food over the brass reticle, price ticket, what's inside, pairings | The carving sword cleaves the screen |
| `#story` | Four "reels" of brand story | An old-film iris closes and opens |
| `#visit` | The night windows (branches), with live open/closed bulbs | The 3 AM steel shutter |
| `#order` | Tray, window, pickup slot, name; the thermal ticket prints as you go | A struck match's flame spreads from the click |
| `#confirm` | The ticket prints and ORDER FIRED · بالهنا thumps on; tear off the stub | A ticket slides up and gets stamped |

### The home reel

One pinned viewport; one scroll flick plays one beat (`SNAP` in the reel bar switches to free scrolling):

1. hero poster
2. foil tornado
3. iron clamp
4. rocket launch and touchdown
5. 5-slice chop
6. sword cleave
7. rotisserie orbit, one beat per dish (5 beats)
8. power cut and match strike
9. matchbox chain reaction
10. 3 AM shutter
11. night-window feast
12. receipt

The dish cards, matchboxes and receipt are live: they add to the tray, link to dish pages, or order the whole tray.

## Where things live

| Path | What |
| --- | --- |
| `src/App.tsx` | Page switching, transitions, intro, providers |
| `src/sections/theatre/` | The home reel: `Theatre.tsx` (markup + wiring), `timeline.ts` (the 15 beats) |
| `src/lib/beats.ts` | The one-flick-one-beat stepper |
| `src/lib/router.tsx` | Views, the transition for each, hash parsing, `linkTo()` |
| `src/lib/basket.tsx` | Tray, chosen window, placed order (in memory), and the fly-to-tray animation |
| `src/components/TransitionOverlay.tsx` | The seven page transitions |
| `src/data/` | Menu, branches and hours, story copy (all sample data) |
| `src/styles/` | `tokens.css` (inks, fonts), `base.css`, `chrome.css` (nav, footer, transitions), `theatre.css` (home reel), `pages.css` |
| `public/assets/` | The processed WebP cutouts and scenes (from `design/assets/`) |
| `design/` | Approval material: prototype, design spec, manager review doc, asset pipeline. See `context.md` |
| `tests/smoke.mjs` | CI smoke test; `tests/shots.mjs` screenshots every beat and page for review |

## Placeholders to replace before launch

- Menu names, descriptions, prices (PKR) and allergens: `src/data/menu.ts`.
- Branch names, addresses, phone numbers and hours: `src/data/branches.ts`. Hours are 6 PM to 4 AM for every branch.
- The brand story, including "since 1968": `src/data/story.ts`.
- Ordering is front-end only: placing an order sends nothing, and a refresh clears it. The site tells customers to pay at the window.

## Design prototype and share files

```bash
python design/scripts/build_share.py   # design/share/: single-file prototype + manager review doc
npm run test:design                    # smoke test for those
```

CI runs both suites on every push and attaches `dist/` and the share files as artifacts.

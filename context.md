# BAZOOKA (بازوكا) — Project Context & Handoff Specification

> **Last Updated:** October 16, 2026  
> **Workspace Root:** `D:\OFFICE WORK\WeZero\franchise-os\BAZOOKA`  
> **Current Phase:** Production site v1 built at the repo root (React 18 + TypeScript + Vite + GSAP + Lenis): the 15-beat reel as the home page, plus Menu, Dish, Story, Visit, Order and Confirm screens with themed transitions and an in-memory pickup tray. See `README.md`. The design prototype (`design/prototype.html`) and the manager review doc remain as approval material.
> **Guardrail status:** The palette and type in §2 are canonical (confirmed Oct 16, 2026). Guardrails are now *soft* constraints: deviate when it clearly improves the experience.

---

## 1. Brand Concept & Aesthetic North Star

**BAZOOKA (`بازوكا`)** is an innovative, visually alive shawarma restaurant web experience where scrolling feels like an adventure through a series of physical, mechanical contraptions rather than a static page.

- **Core Cultural Hook — The "Saroukh" (`صاروخ` — Rocket):** In Cairo, Beirut, and Damascus street-food slang, a long, tightly rolled, foil-wrapped saj shawarma cylinder is called a *Saroukh* (Rocket) or *Bazooka*.
- **Aesthetic Era:** **1968 Cairo & Beirut Silkscreen Lithography, Vintage Matchbox Labels (Helmi el-Touni / Mohieddin el-Labbad school), and Hand-Painted Arabic Cinema Posters (*Aflam* / أفلام).**
- **Tactile Print Finish:** Raw unbleached cardstock (`#EBE1C9`) overprinted with deep Nile Midnight (`#0D1326`), Al-Ahram Cobalt (`#1B3BF5`), Pomegranate Vermilion (`#D9232E`), Damascus Pistachio (`#0D9463`), and Syrian Brass Ochre (`#D99B26`), complete with subtle halftone dot grain, Kufic geometric borders, and 2-plate Risograph ink misregistration (`Cobalt` + `Vermilion`).

### CRITICAL GUARDRAILS — ZERO `RUSSRUSS` OVERLAP
An early draft was rejected for looking too close to the sibling project `RUSSRUSS`. **Never re-introduce any of the following:**
1. **NO `Shrikhand` or groovy 1970s Western fonts** (`Fraunces`, `Space Grotesk`).
2. **NO sunny yellow (`#FFD23F`), hot magenta pink (`#FF3B7F`), tangerine (`#FF7A00`), or warm cream (`#FFFDF5`) backgrounds.**
3. **NO `RUSSRUSS` motifs:** No rotating sun-ray bursts, no circular rotating SVG text rings, no daisy/rainbow/peace stickers, no iris-circle fruit wheel, no horizontal card train, and no striped fabric awning dropping onto a stand.

---

## 2. Color System & Typography Tokens

### Silkscreen Ink Palette
```css
:root {
  --nile: #0D1326;        /* Deep Midnight Indigo Ink (Key-plate, borders, cutaway & night ground) */
  --nile-m: #16203D;      /* Press Plate Navy (Secondary dark surfaces & cards) */
  --sand: #EBE1C9;        /* Unbleached Newsprint / Matchbox Cardstock (Primary light ground) */
  --sand-d: #DCD0B2;      /* Aged Litho Paper (Secondary warm ground) */
  --cobalt: #1B3BF5;      /* Al-Ahram Silkscreen Cobalt Blue (Plate 01, misregistration A) */
  --vermilion: #D9232E;   /* Pomegranate / Fez Overprint Red (Plate 02, cinema ribbons, misregistration B) */
  --pistachio: #0D9463;   /* Damascus Litho Mint-Pistachio Green (Plate 03, herbs, paid stamps) */
  --ochre: #D99B26;       /* Syrian Brass / Mustard Litho Gold (Plate 04, reticles, borders, saj crust) */
  --foil: #D8E0E8;        /* Brushed Aluminum Shawarma Foil */
}
```

### Bilingual Typography Stack (Google Fonts)
- **Arabic Display (Geometric Kufic):** `'Reem Kufi'` (`700`, `800`) — architectural block Kufic headlines, matchbox titles, and bilingual lockups.
- **Arabic Brush Callouts (Cinema Poster *Aflam*):** `'Aref Ruqaa'` (`700`) — expressive diagonal brush banners (`transform: skewY(-5deg)`).
- **Latin Poster Display:** `'Dela Gothic One'` (`400`) — ultra-heavy, flat-shouldered woodblock Latin headlines with 2-plate Cobalt/Vermilion Risograph text-shadow (`text-shadow: -4px -3px 0 var(--cobalt), 4px 3px 0 var(--vermilion)`).
- **Architectural Body Sans:** `'Syne'` (`600`, `700`, `800`) — body copy and dish descriptions.
- **Spec / Ticket Monospace:** `'Chivo Mono'` (`500`, `700`, `800`) — registration marks (`⊕`), caliber weights (`CALIBER 380G`), prices, and thermal order receipts.

---

## 3. Complete Asset Inventory (20 Raw Renders → 29 Processed WebP Cutouts & Scenes)

All raw Nano Banana Pro renders live in `D:\OFFICE WORK\WeZero\franchise-os\BAZOOKA\assets\*.jpg`.  
The automated Python pipeline (`D:\OFFICE WORK\WeZero\franchise-os\BAZOOKA\design\scripts\cutouts.py`) uses `Pillow`, `numpy`, and `scipy.ndimage` border-seeded flood-fill + soft edge alpha decontamination + automatic column splitting to output **29 optimized `.webp` files** into `D:\OFFICE WORK\WeZero\franchise-os\BAZOOKA\design\assets\`:

### Phase 1 Core Cutouts & Scenes (Prompts `BZ01`–`BZ12`)
| Prompt ID | Raw File in `/assets/` | Processed WebP in `/design/assets/` | Type | Target Contraption / Section |
| :--- | :--- | :--- | :--- | :--- |
| **BZ01** | `hero shwarma.jpg` | `saroukh-hero.webp` | Cutout | Stage 01 Hero Foil Tornado & Barrel Dive + Drum Face 01 |
| **BZ02a** | `shwarma variant 1.jpg` | `saroukh-shatta.webp` | Cutout | Stage 03 Rotisserie Drum Face 02 (*Shatta Napalm*) |
| **BZ02b** | `shwarma variant 2.jpg` | `saroukh-lamb.webp` | Cutout | Stage 03 Rotisserie Drum Face 03 (*Dibs & Caramelized Lamb*) |
| **BZ02c** | `shwarma variant 3.jpg` | `saroukh-toum.webp` | Cutout | Stage 03 Rotisserie Drum Face 04 (*Toum Overdose*) |
| **BZ03** | `cross section.jpg` | `slices-row.webp` + **`slice-1.webp` .. `slice-5.webp`** | 6 Cutouts | Stage 02 Cutaway Cross-Section Scanner (5 individual pinwheels) |
| **BZ04** | `carving knife.jpg` | `knife.webp` | Cutout | Stage 02 Slicing Scrubber + **Diagonal Sword Slash Split-Screen Cleave** |
| **BZ05** | `meat split.jpg` | `spit-cone.webp` | Cutout | Stage 03 Central Towering Charcoal Rotisserie Spit Axis |
| **BZ06** | `foil.jpg` | `foil-curl.webp` | Cutout | Stage 01 Orbiting Silver Foil Tornado Ribbons |
| **BZ07** | `toum.jpg` | `toum-mortar.webp` | Cutout | Stage 04 Matchbox Drawer 01 + Stage 05 Night Counter Feast |
| **BZ08** | `pickle jar.jpg` | `pickle-jar.webp` | Cutout | Stage 04 Matchbox Drawer 03 + Stage 05 Night Counter Feast |
| **BZ09** | `chilli splash.jpg` | `chilli-splash.webp` | Cutout | Stage 01 Hero Arc + Stage 04 Matchbox Drawer 02 & Shatta Wave |
| **BZ10** | `shwarma box.jpg` | `arabi-box.webp` | Cutout | Stage 03 Drum Face 05 + Stage 04 Matchbox 04 + Night Counter |
| **BZ11** | `wall.jpg` | `tile-wall.webp` | 16:9 Scene | Stage 03 Damascus/Cairo Ceramic Tile & Brass Dado Backdrop |
| **BZ12** | `shop.jpg` | `night-shop.webp` | 16:9 Scene | Stage 05 Finale 3:00 AM Night Kiosk Window & Steel Counter |

### Phase 2 Bonus Expansion Cutouts (Prompts `BZ13`–`BZ18`)
| Prompt ID | Raw File in `/assets/` | Processed WebP in `/design/assets/` | Type | Target Contraption / Transition |
| :--- | :--- | :--- | :--- | :--- |
| **BZ13** | `garnishes.jpg` | `garnishes-row.webp` + **`garnish-1.webp` .. `garnish-4.webp`** | 5 Cutouts | Flying 3D Garnish Shrapnel (1: Sumac Fry, 2: Blistered Green Chili, 3: Roasted Purple Onion Ring, 4: Fresh Parsley Leaf) in Hero & Sword Cleave |
| **BZ14** | `ember and coals.jpg` | `charcoal-embers.webp` | Cutout | Stage 03 Floating Incandescent Charcoal Embers & Sparks around `spit-cone.webp` |
| **BZ15** | `plate and paper.jpg` | `brass-tray.webp` | Cutout | Stage 05 Engraved Syrian Brass Landing Platter on the Night Counter |
| **BZ16** | `cocktail.jpg` | `jallab-glass.webp` | Cutout | Stage 04 Matchbox Drawer 05 (*Frosty Beirut Ruby Jallab & Pine Nuts*) + Night Counter |
| **BZ17** | `stamp and sear.jpg` | `iron-press.webp` | Cutout | **Cast-Iron Griddle Clamp & Sear Transition** between Hero and Cutaway Scanner |
| **BZ18** | `arch and bulbs.jpg` | `cinema-marquee.webp` | Cutout | Ornate 1968 Cairo Cinema Bulb & Pierced Brass Proscenium Arch pinning the top of Stage 03 & Stage 05 |

> **Re-running the asset pipeline:** Whenever new raw renders are added to `/assets/`, run:
> ```powershell
> python design/scripts/cutouts.py
> ```

---

## 4. Scroll Choreography: One Pinned Theatre, 15 Beats, 6 Contraptions & 5 Transitions

### Architecture (`design/prototype.html`)
- **One pinned theatre (`#theatre`).** All scenes are stacked layers inside a single 100vh viewport, driven by one GSAP master timeline (`tl`) via ScrollTrigger (`scrub: 0.7`). Scenes hand off to each other directly, so there is no "dead" scroll between sections. A FIN card follows the pin.
- **Beats.** The master timeline is built from `beat(label, hud, duration, build)` calls. Every beat ends on a label, which is the resting state.
- **Beat stepper.** Inside the theatre, one wheel flick, swipe or arrow key glides Lenis to the next beat (0.4–1.1s glide, `scrub: 0.4`). Input is **never dropped**: a flick during a glide chains on to the beat after the one in flight. Gestures are separated by quiet gaps (>140ms), direction changes, or a fresh swipe spiking above decaying trackpad momentum; a sustained hard push steps again every ~500ms. Scrolling past the last beat releases to normal scroll. The HUD `SNAP` button toggles it off for free scrubbing; `prefers-reduced-motion` starts with it off and disables screen shake.
- **Impact language.** Key beats land with a screen shake on `#world` plus an Aref Ruqaa onomatopoeia stamp: طَشّ! (sear), انطلاق! (lift-off), طاخ! (touchdown), شَقّ! (cleave), طراخ! (shutter).
- **Live misregistration.** Scroll velocity drives `--mis`, which pushes the cobalt and vermilion text-shadow plates of every `.riso-h` apart. At rest they snap back into register.
- **Embed mode (`prototype.html?embed&at=<label>`).** This hides the HUD, intro and FIN card and pauses the timeline. The page then answers `postMessage` commands `{bz:true, cmd:'seek', time}` / `{cmd:'play', from, to}` and reports `{cmd:'ready'|'state'}` back. `design/index.html` uses this for its live reel and all nine labs, so the spec always shows the real build.

### Beat Sequence
| # | Label | Scene / Transition | What happens |
| :-- | :-- | :-- | :-- |
| 0 | `start` | **Contraption 01 · Litho intro → Hero** | Nile, cobalt and vermilion plates wipe off on load; the wrap springs in as the title plates snap into register. Foil curls and garnishes idle-bob. |
| 1 | `unpeel` | Contraption 02 · Hero | 3 `foil-curl` + 4 `garnish-*` blast out in a tornado spiral; the reticle swells. |
| 2 | `clamp` | Contraption 02 · Hero | `iron-press` drops from above onto the wrap: the wrap squashes, the poster sears, steam rises, طَشّ! |
| 3 | `launch` | **Transition 1 · Rocket Launch & Touchdown** | Press springs off, `chilli-splash` ignites as exhaust at the foil tail, انطلاق!, the saroukh lifts off on its 2 o'clock axis. Vermilion, cobalt and Nile plate bands streak along the flight path, and the Nile band swallows the screen. The Anatomy title lands and the wrap crash-lands horizontally (طاخ!). |
| 4 | `chop` | Contraption 03 · Anatomy | `knife` chops right-to-left 5×; each chop clips the wrap and pops the matching `slice-N` into the row with its stratum tag. |
| 5 | `cleave` | **Transition 2 · Sword Slash Cleave** | Knife cocks top-right, slashes corner to corner (glowing SVG seam), شَقّ!; the two triangle halves fall away onto the rotisserie scene. |
| 6–9 | `spit2`–`spit5` | Contraption 04 · Rotisserie Orbit | 5 dishes orbit `spit-cone` on an elliptical ring; each beat swings the next dish to the front-right of the cone, flips the menu card (left column) and flares `charcoal-embers`. Framed by `cinema-marquee` over `tile-wall`. |
| 10 | `blackout` | **Transition 3 · Power Cut & Match Strike** | Bulbs flicker out to black ("POWER CUT"); a CSS matchbox striker rises, a match strikes, sparks burst, and the flame blooms into a ring that burns a hole through to the sunlit kiosk. |
| 11 | `boxes` | Contraption 05 · Matchbox Kiosk | One flick lights the shelf like a fuse, box to box: phosphor spark on the striker, sleeve jolts, drawer slides out (price), product springs up out of the box. The full line-up: `toum-mortar`, `chilli-splash`, `pickle-jar`, `arabi-box`, `jallab-glass`. |
| 12 | `shutter` | **Transition 4 · 3 AM Shutter Slam** | Kiosk dims, a corrugated shutter bounces down with طراخ! and a 03:00 AM clock. |
| 13 | `feast` | **Transition 5 · Shutter Lift** → Contraption 06 | Shutter rolls up on `night-shop` under `cinema-marquee`, the headline slides in, then `brass-tray` skids down the counter, the saroukh drops onto it, the carton is tossed in, the jallab slides in, toum and torshi pop up from behind the counter. |
| 14 | `receipt` | Contraption 06 · Night Window | The ticket prints out of the brass slot (stepped). **TEAR TICKET & FIRE ORDER ✂** stamps `ORDER FIRED · بالهنا`. |

### Sharing
Run `python design/scripts/build_share.py` after any change to `prototype.html` or `review.html`. It writes two self-contained files to `design/share/` (~6 MB each) with every sprite, font and script inlined. They open from an email attachment with no internet connection. The review doc embeds the whole prototype and serves it to its reels from a `blob:` URL (`#embed&at=<label>`).

### Pricing
All prices are in rupees (`Rs`), as placeholders: wraps Rs 850–1,450 (Original 850 · Shatta 950 · Lamb 1,150 · Toum 900 · Box Arabi 1,450); sides and drinks: toum and shatta Rs 150, torshi Rs 200, jallab Rs 450.

### Layout Rules Learned in Review
- Every prop needs a job: nothing should enter and leave without doing something. The press used to slide in beside the wrap and back out, which read as random.
- Never half-hide a product. Matchbox products now pop fully *above* their box; the drawer only reveals a price strip.
- Night window composition: headline top-left, receipt top-right, feast spread along the counter with the tray centred. The window's centre stays clear.
- Rest states are never blank: every label is a composed frame.
- The hero is a full cinema poster, with no dead side columns: a "Now Showing" billing block with tagline and spec sheet on the left, a tilted admit-one price ticket and review stars on the right, and a giant outlined Kufi "صاروخ" watermark behind. On phones these collapse to the tagline under the title and a compact ticket above the ribbon.
- Every flick must pay off. Repetitive beats are merged (one chain reaction instead of five identical box beats), and near-empty rest frames are folded into the next beat. The orbit keeps one beat per dish so each menu card can be read.
- Animated elements never rely on a CSS `transform` (GSAP owns them). Static centring uses wrappers or `xPercent`/`yPercent`.

---

## 5. Production Site (built) & Sibling Projects (`WeZero/franchise-os`)

The production site lives at the repo root; `README.md` has the screens, transitions and file map, has the working rules and pitfalls. Decisions made with the user (Oct 20, 2026): a full sibling-style site rather than a single page; ordering as an in-memory pickup tray (pay at the window, nothing sent); placeholder branches (three in Lahore, 6 PM–4 AM) until real details arrive.


When transitioning from `design/prototype.html` to the full production application at the root of `BAZOOKA/`:
- **Framework:** React 18 + TypeScript + Vite (matching sibling projects `RUSSRUSS`, `STACC-Deli`, `KOI`, `GRUFF` in `D:\OFFICE WORK\WeZero\franchise-os\`).
- **Animation Engine:** `gsap` (`^3.12.5` with `ScrollTrigger` and `useGSAP` / `gsap.context()`) + `lenis` (`^1.1.13`) synced via `gsap.ticker`.
- **Assets Location:** `design/assets/*.webp` are copied into `public/assets/` (minus the two reference rows `slices-row` and `garnishes-row`). Re-copy after re-running the cutout pipeline.

---

## 6. Current File Structure
```text
D:\OFFICE WORK\WeZero\franchise-os\BAZOOKA\
├── assets\                        # 20 raw Nano Banana Pro renders (.jpg)
├── design\
│   ├── assets\                    # 29 processed transparent cutouts & scenes (.webp)
│   ├── scripts\
│   │   ├── cutouts.py             # Automated white-knockout + column-splitter script
│   │   └── build_share.py         # Builds the single-file, offline share copies (below)
│   ├── index.html                 # INTERNAL spec: 29-sprite vault, tokens, live reel + 9 labs, all 18 image prompts
│   ├── review.html                # MANAGER-FACING review doc: concept, how to review, live reel, 9 moments, palette/type, open questions
│   ├── prototype.html             # Single-theatre scroll prototype, 15 beats, beat stepper, embed mode
│   ├── vendor\                    # Download cache for fonts + GSAP/Lenis used by the share build
│   └── share\                     # BAZOOKA-Prototype.html + BAZOOKA-Design-Review.html: send these, nothing else needed
└── context.md                     # This complete handoff specification
```

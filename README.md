# BAZOOKA (بازوكا)

Landing page design for BAZOOKA, a shawarma brand built around the "Saroukh" (rocket) wrap, styled as a 1968 Cairo cinema poster.

- `design/prototype.html`: the scroll prototype (15 beats, one per scroll flick)
- `design/review.html`: design review doc for stakeholders
- `design/index.html`: internal design spec, asset vault and image prompts
- `design/assets/`: 29 processed WebP cutouts and scenes; `assets/` holds the 20 raw renders
- `context.md`: full project handoff notes

## Shareable single files

```sh
python design/scripts/build_share.py
```

Writes `design/share/BAZOOKA-Prototype.html` and `design/share/BAZOOKA-Design-Review.html`, which open offline with nothing else. CI also attaches them to every run as the `bazooka-share` artifact.

## Tests

```sh
npm install && npx playwright install chromium
npm test
```

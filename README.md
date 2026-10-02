# Bernico — website

A rebuild of the Bernico site in the visual language of ferrari.com.

## Where things live

```
bernico-ferrari/
  *.html          ← the 21 built pages. Open index.html directly, or deploy the folder as-is.
  css/ferrari.css ← the whole design system (one file)
  js/ferrari.js   ← the whole engine (one file, no dependencies)
  assets/         ← images, video, fonts

  src/            ← page bodies only (edit these)
  _partials/      ← shared <head>, header + menu, footer
  build.sh        ← inlines the partials into the built pages
  tools/models.json ← the model data (specs, copy, photos)
  tools/gen.js      ← regenerates the 12 model pages from that data
```

The built `*.html` files at the root are plain, standalone HTML — no build step is
required to view or deploy them.

## The range

| | Models |
|---|---|
| **Racing** | F1 Xtreme · F2 Xtreme · TS Model · FTX 27 R · 43 Leverage |
| **Leisure — rigid** | F2 Xtreme · F1 Xtreme · FTX 27 · VC 35 · 43 Leverage |
| **Leisure — RIB** | 7 · 7.6 · 8 · RX10 · RXP14 |

F1 Xtreme, F2 Xtreme and 43 Leverage appear in both families. Rather than duplicate
them, each has **one page with a Racing / Leisure spec toggle** — same running surface,
two trims. That is 12 model pages, not 15.

## Pages (21)

`index` · `racing` · `leisure` · `models` (all boats, filterable) ·
12 model pages · `used-boats` · `services` · `news` · `contact` · `ticket`

## Editing

**Model copy and specs** → `tools/models.json`, then:

```bash
node tools/gen.js --force && bash build.sh
```

Without `--force`, gen.js skips files that already exist, so hand edits are safe.

**Header, menu, footer** → `_partials/`, then `bash build.sh` — all 21 pages update.

**Anything else** → `src/*.html`, then `bash build.sh`. Each src file starts with two
comment lines that become the page title and meta description.

## Specifications are provisional

Only the **RIB 7** carries real figures (7.46 m, 2.5 m, ±870 kg, 120 mph, 7 persons,
150–300 L). Every other model is marked `"provisional": true` in `models.json`, which
prints *"Provisional specification — figures to be confirmed"* under its spec table.
Replace the `—` values with real ones and set the flag to `false` to remove that line.

Photography is placeholder too — reassign `img.hero` / `img.stick` / `img.plate` per
model in `models.json`.

## Typography — Söhne Breit (from abyachts.com)

Measured from the live AB Yachts stylesheet, not guessed:

| Role | AB Yachts uses | Here |
|---|---|---|
| `h1–h4` and all display type | `soehneBreit-Dreiviertelfett` — **Söhne Breit**, the *extended* semibold cut | `--font-display`, `font-stretch: 118%`, weight 600 |
| Body copy | `soehne-Buch` — Söhne Buch, normal width | `--font`, `font-stretch: 100%`, weight 400 |

**Söhne is a commercial typeface from Klim Type Foundry and is not bundled here.**
The stacks name it first, so licensing it and adding an `@font-face` for
`Söhne` / `Söhne Breit` is all that is needed — nothing else changes.

Until then the stand-in is **Archivo**, loaded as a variable font with its
`wdth` axis (62–125). `font-stretch: 118%` drives that axis, which is what
reproduces the extended Breit width. Every heading, nav item, button, label,
spec key and breadcrumb uses it; body copy stays at normal width, exactly as
AB Yachts does it.

Adjust `--display-wdth` and `--display-wght` in `:root` to taste.

## The rest of the design system

Calibrated against values measured from the live ferrari.com:

| | Value |
|---|---|
| Paper / ink | `#ffffff` / `#181818` |
| Body | 14px, weight 400 |
| Hero `h1` | `clamp(24px, 2.5vw, 34px)`, weight 600, uppercase |
| Nav / buttons | 12px, letter-spacing ~1px |
| Buttons | padding `12px 30px`, border `0.8px`, radius `2px` |
| Red `#ff2800` | Scroll progress bar and the opener rule. Nothing else. |

### Model imagery: black & white, colour on hover

`.card--model` and `.idx--model` render their photo in `grayscale(1)` and transition to
full colour over 0.75s on hover. It is applied **only** to model cards and range rows —
editorial, location and service photography stays in colour. Touch devices
(`@media (hover:none)`) always show colour, since they have no hover state.

### Parallax

`[data-px="0.12"]` on an image inside a `.px-wrap` frame. One rAF loop drives every
element on the page, transform only. The `.px` class oversizes the image to 122% so the
frame never shows an edge — each frame carries ±51–76px of headroom against a maximum
travel of ±22px.

Speeds in use: cover `0.12` · plates `0.16` · banner media `0.09` · copy `-0.03`
(drifts against its image) · sticky media `0.08` · cards `0.04–0.05`.

The model pages also use a **sticky media column** (`.stick`) — the photograph holds
while the feature list scrolls past it.

## The engine

`js/ferrari.js` is one IIFE. Every module is opt-in — it runs only if its markup is present.

| Module | Hook |
|---|---|
| Opener | `#op` — 3.25s dwell, then a curtain split |
| Header hide/reveal | `#hd` |
| Mega menu | `#mnu` + `#brg` |
| Scroll reveals | `[data-r]`, stagger via `--i` |
| Cover carousel | `#cov` |
| Drag rails | `[data-rail]` |
| Parallax | `[data-px]` |
| Spec toggle | `[data-tog]` + `.tog-panel[data-trim]` |
| Filter | `#fbar` + `[data-cat]` |
| Hover-play video | `.vc` |
| Typing placeholder | `[data-typing]` |
| Forms | `form[data-form]` |

Respects `prefers-reduced-motion` throughout — parallax is skipped entirely.

## The race record on the home page

The `#record` band on the home page is **all verifiable fact**, sourced as follows:

| Claim | Source |
|---|---|
| 2015 — won the Venezia–Rimini leg, UIM Class V1 World Championship (Bernico–New Star, Bernico 43 Leverage) | powerboating.be |
| 2014 — race 2 winner, Abu Dhabi World Championship, V1 (Nico Bertels & Frank Hemelaer) | powerboating.be |
| 2014 — race 1 winner, Grand Prix of Italy, Terracina, V1 | powerboating.be |
| 2015 — Bernico F3 Xtreme averaged 75.2 mph at Coniston Power Boat Records Week; epoxy hull under 500 kg | epoxycraft.com / Wessex Resins |
| 8 of 10 titles taken on a Bernico, European Waterski Racing Championships, Cadiz (Arcos) | skirace.net |
| Belgian and world titles in Formula 1, 2 and 3; boats handmade; RIBs based on racing hulls | itboat.com |

Nothing in that section is invented. **Verify each line with the client before
publishing** — the waterski championship year was not stated in the source, so
that row deliberately carries no year.

## The loading screen (opener)

It shows **once per visit**, not on every page. An inline script in `<head>`
(see `_partials/head.html`) checks `sessionStorage` and, on later pages, adds
`no-opener` to `<html>`; the stylesheet then hides `.op` before the body paints,
so there is no flash. `js/ferrari.js` also removes the element and never takes
the scroll lock in that case.

- **Once per visit** (default) — returns next time the browser is reopened.
- **Once ever, per browser** — change `sessionStorage` to `localStorage` in that
  one line of `_partials/head.html`, then `bash build.sh`.
- **Preview it any time** — append `?opener=1` or `#opener` to any URL. The hash
  form also works on hosts that strip query strings on clean-URL redirects
  (`npx serve` does this, which is why `/leisure.html?opener=1` loses the flag
  locally but `/leisure#opener` works).
- Storage blocked (private mode) falls back to showing it — never breaks.

## Notes

- Forms are front-end only. Wire `form[data-form]` to your endpoint in `forms()`.
- Fonts load from Google Fonts (Archivo); offline it falls back to Helvetica/Arial.
- `assets/preview.mp4` (64 MB) and `assets/usedboats.mp4` (61 MB) should be compressed
  before going live.
- **Retired:** Centura 32 / 32 S, Speedera 26 and Revolante 48 were Flynt Yachts
  template names carried over from the original build. They are gone from the range.
  Their pages (`revolante-48.html`, `bernico-r7.html`) were removed — say the word if
  any are still current products.
- **Photography rights:** `assets/models/43-leverage/04.jpg` came from a Facebook
  export in the client Drive. A sibling frame from the same shoot carried a visible
  **© Raffaello Bastiani** watermark — it has been moved to `_quarantine/` and is not
  referenced anywhere. Clear rights on the racing photography before going live.
- **Photos supplied:** the Drive folder had images for **F1 Xtreme** (15) and
  **43 Leverage** (4) only. The folders for F2 Xtreme, FTX 27, RIB 7 / 7.6 / 8,
  RX10, RXP14, VC 35, TS Model and FTX 27 R were empty, so those models still use
  placeholder photography from the original project.
- The original site is untouched at `D:\final bernico (3)`.

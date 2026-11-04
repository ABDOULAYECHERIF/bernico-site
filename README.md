# Bernico — website

A rebuild of the Bernico site in the visual language of ferrari.com.

## Where things live

```
bernico-ferrari/
  *.html          ← the 35 built pages. Open index.html directly, or deploy the folder as-is.
  css/ferrari.css ← the whole design system (one file)
  js/ferrari.js   ← the whole engine (one file, no dependencies)
  assets/         ← images, video, fonts
  _originals/     ← full-resolution client photography, not deployed
  _quarantine/    ← images with unresolved rights, referenced nowhere

  src/            ← page bodies only (edit these)
  _partials/      ← shared <head>, header + menu, footer
  build.sh        ← inlines the partials into the built pages
  tools/models.json ← the model data (specs, copy, photos)
  tools/gen.js      ← regenerates the 26 model pages from that data
```

The built `*.html` files at the root are plain, standalone HTML — no build step is
required to view or deploy them.

> **Edit `src/`, never the built pages.** `build.sh` overwrites every root `*.html`
> from `src/` + `_partials/`. A hand edit made directly to a root page is destroyed
> the next time anyone builds. (This happened once: the root pages carried corrected
> contact details and a Cloudinary hero video that `src/` did not have. The two are
> back in sync as of 4 November 2026 — keep them that way.)

## The range

Given by Nico Bertels on 3 November 2026. This supersedes every earlier list.

| | Models |
|---|---|
| **Racing** | F3 Xtreme · VC35 R · P1 Racing · F1TS · F1 & F2 Circuit *(coming soon)* |
| **Leisure — rigid** | F3 · F2 · F1 · CCX · GTS · FTX S · FTX B · FTX 33 *(coming soon)* · Leverage · Leverage Quad · VC35 |
| **Leisure — RIB** | R7 · RX8 *(render)* · RX10 · RX10 X · RXP 11 · RXP13 · RXP14 · B52 · B60 *(render)* |
| **Legacy** | FTX 27 · FTX 27 R · 7.6 · 8 |

25 names, 22 pages. Three hulls are sold in both trims and have **one page with a
trim toggle** rather than two near-identical pages:

| Leisure name | Racing name |
|---|---|
| F3 | F3 Xtreme |
| VC35 | VC35 R |
| Leverage | P1 Racing |

`racingName` in `models.json` carries the competition name; the racing listings and
the spec toggle use it, the leisure listings use `name`.

### Open questions for the client

Three things are implied by his lists rather than stated, and all three are flagged
in OCT HQ against the Bernico website rebuild:

1. **Are the dual-trim pairings right?** F3/F3 Xtreme, VC35/VC35 R and
   Leverage/P1 Racing are treated as one hull in two trims. If any pair is actually
   two different boats, it needs splitting into two pages.
2. **Are the dropped models retired?** F1 Xtreme, F2 Xtreme, FTX 27, FTX 27 R, the
   7.6 and the 8 are not on his new lists. F1 Xtreme and F2 Xtreme were read as
   renames to F1 and F2; the other four were moved to **Legacy**. Their pages are
   kept so nothing 404s.
3. **The speed record.** He writes "speed record with Bernico F2 Xtreme". The
   Coniston Power Boat Records Week source credits the **F3 Xtreme** at 75.2 mph.
   The home page now states his version, without a figure.

### Renamed pages

`f1-xtreme` → `f1` · `f2-xtreme` → `f2` · `ts-model` → `f1ts` ·
`43-leverage` → `leverage` · `vc-35` → `vc35` · `rib-7` → `r7`

The old files are deleted and every internal link was updated. **There are no
redirects** — add them if any of these URLs has been shared.

## Editing

**Model copy and specs** → `tools/models.json`, then:

```bash
node tools/gen.js --force && bash build.sh
```

Without `--force`, gen.js skips files that already exist, so hand edits are safe.

**Header, menu, footer** → `_partials/`, then `bash build.sh` — all 35 pages update.

**Anything else** → `src/*.html`, then `bash build.sh`. Each src file starts with two
comment lines that become the page title and meta description.

### Model states `gen.js` understands

| Flag | Effect |
|---|---|
| `racingName` | competition name; drives the spec toggle and the racing listings |
| `pending` | name known, nothing else — a short page instead of invented copy |
| `comingSoon` | "Coming soon" badge, no spec table, "Register your interest" CTA |
| `render` | the page says the imagery is CGI, not a delivered boat |
| `legacy` | "Legacy" badge, kept-for-owners CTA, listed under `models.html#legacy` |
| `gallery` | extra photographs, shown as a drag rail |
| `img.placeholder` | the page says the photography is a stand-in |

## Specifications are provisional

Only the **R7** carries real figures (7.46 m, 2.5 m, ±870 kg, 120 mph, 7 persons,
150–300 L). Every other model is marked `"provisional": true` in `models.json`, which
prints *"Provisional specification — figures to be confirmed"* under its spec table.
Replace the `—` values with real ones and set the flag to `false` to remove that line.

## Photography

Real client photography exists for **three models only**:

| Model | Folder | Shots |
|---|---|---|
| F1 | `assets/models/f1-xtreme/` | 15 |
| Leverage / P1 Racing | `assets/models/43-leverage/` | 4 |
| RX10 | `assets/models/rx10/` | 12 |

Every other model uses a stand-in from the original project, and its page says so.
Those are flagged `img.placeholder: true` in `models.json` — clear the flag when real
photography replaces them.

**The RX10 set is entirely detail work** — cockpit, throttles, seating, hardtop,
fuel filler. There is no exterior or on-water frame in it, which matters because the
first home-page slide is meant to be an RX10 *start picture*. It currently uses the
most cinematic frame available (`05.jpg`, the helm). A wide exterior shot would be
better and is worth asking for.

The originals were 8–15 MB each (145 MB for the folder). They were resized to 2400 px
at quality 82 — 4 MB for the folder — and the originals moved to `_originals/rx10/`,
which is git-ignored and not deployed.

**Rights:** `assets/models/43-leverage/04.jpg` came from a Facebook export in the
client Drive. A sibling frame from the same shoot carried a visible
**© Raffaello Bastiani** watermark — it is in `_quarantine/` and referenced nowhere.
Clear rights on the racing photography before going live.

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
reproduces the extended Breit width.

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
frame never shows an edge.

Speeds in use: cover `0.12` · plates `0.16` · banner media `0.09` · copy `-0.03`
(drifts against its image) · sticky media `0.08` · cards `0.04–0.05`.

## The engine

`js/ferrari.js` is one IIFE. Every module is opt-in — it runs only if its markup is present.

| Module | Hook |
|---|---|
| Opener | `#op` — a ~1.4s logo flash |
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

The mega menu's featured image is keyed by `data-f`, an **index into the
`.mnu__f img` list**. There is one image per group (racing, rigid, RIBs, legacy,
pre-owned, services, news, contact) rather than one per model — with 22 models and
19 of them on stand-in photography, per-model images would have been misleading as
well as unmaintainable. If you add an image, every `data-f` after it shifts.

## The record on the home page

The `#record` band is **Nico Bertels' own figures**, as supplied on 3 November 2026:
8× world champion in offshore pleasure navigation (with 8 Belgian and 2 Italian wins),
vice world champion and overall winner at Venice–Rimini in V1 offshore racing, 20+
world titles in waterski racing, 2× British champion in the OCR championship, a speed
record with the F2 Xtreme, and the five-boat racing programme.

This replaced a researched version sourced from powerboating.be, epoxycraft, skirace.net
and itboat.com. Where the two differed, his version was used — he is the source of truth
on his own record. The one unresolved conflict is the speed-record model, noted above.

## Contact details

Per the client, 3 November 2026:

```
BERNICO
BN Constructions
Victordumonlaan 6
2830 Willebroek
BTW BE0425214148
management@bernico.eu
```

**No telephone number appears anywhere on the site**, at his request. There are no
`tel:` links. The email is `.eu`, not `.be`.

> The street spelling is his: "Victordumonlaan". Belgian sources give it as
> *Victor Dumonlaan* or *Victor Dumontlaan*. Worth confirming before launch.

## The loading screen (opener)

A brand flash, not a loader: a fixed ~1.4s that never waits on `window.load`.

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
  (`npx serve` does this).
- Storage blocked (private mode) falls back to showing it — never breaks.

## Notes

- Forms are front-end only. Wire `form[data-form]` to your endpoint in `forms()`.
- Fonts load from Google Fonts (Archivo); offline it falls back to Helvetica/Arial.
- `assets/preview.mp4` (64 MB) and `assets/usedboats.mp4` (61 MB) should be compressed
  before going live.
- The home page's second slide is meant to be a **B52 start picture**. No B52
  photography exists yet, so it carries a stand-in RIB frame marked with a comment in
  `src/index.html`. Slide 3 is unchanged, as asked.
- The Cloudinary hero video that used to be slide 1 was displaced by the RX10 picture.
  It is still in git history (`cf083e9`) if it should come back somewhere.
- **Retired as Flynt Yachts template contamination:** Centura 32 / 32 S, Speedera 26
  and Revolante 48 were never Bernico boats. They are not in the range and are not
  Legacy candidates.
- The original site is untouched at `D:\final bernico (3)`.

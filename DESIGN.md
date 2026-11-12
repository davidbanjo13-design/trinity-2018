---
version: 1
name: Trinity-2018-Reunion
description: >
  A modern premium dark interface for a school reunion. Near-black canvas with
  a single warm gold voltage, a high-contrast serif display against a neutral
  UI sans, and film grain over everything. The nostalgia comes from the serif
  and the warmth of the gold; the restraint — one accent, hairline borders, no
  second colour — is what stops it reading as a party flyer. Extracted from the
  live stylesheet rather than designed on paper, so these are the real values
  in use, not an aspiration.

colors:
  # Canvas, darkest to lightest
  ink: "#07080B"            # page background
  ink-raised: "#0D0F15"     # cards, elevated surfaces
  ink-input: "#10131A"      # form fields
  line: "rgba(255,255,255,0.09)"        # hairline borders
  line-strong: "rgba(255,255,255,0.16)" # hover / emphasis borders

  # Type
  text: "#F3F4F6"           # primary copy
  muted: "#9AA1AD"          # secondary copy
  faint: "#646B78"          # tertiary — LARGE TEXT ONLY, see contrast note

  # The single accent. Everything that matters is gold; nothing else is.
  primary: "#E9B949"
  primary-soft: "#F3D389"   # hover
  primary-dim: "rgba(233,185,73,0.14)"  # focus rings, tinted fills
  on-primary: "#0A0A0A"     # text on a gold fill

  # Semantic
  negative: "#FF6B6B"
  positive: "#5FD39B"

typography:
  display:
    fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif"
    note: >
      High-contrast serif, used at large sizes only. Italic is reserved for the
      one accented line in a heading — it is the emphasis mechanism, not decoration.
  sans:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    note: "All UI, body copy, labels and buttons."

  # Every size is fluid. Minimum is the phone value, maximum the desktop one.
  scale:
    hero:        { font: display, size: "clamp(2.1rem, 9.4vw, 6.6rem)",  lineHeight: 0.98, tracking: "-0.03em" }
    counter:     { font: display, size: "clamp(5rem, 24vw, 13rem)",      lineHeight: 1,    note: "tabular-nums" }
    section:     { font: display, size: "clamp(2rem, 7vw, 3.5rem)",      lineHeight: 1.06 }
    subsection:  { font: display, size: "clamp(1.9rem, 6.5vw, 3rem)",    lineHeight: 1.08 }
    lede:        { font: sans,    size: "clamp(1.2rem, 4vw, 1.5rem)",    lineHeight: 1.6 }
    body:        { font: sans,    size: "clamp(1.05rem, 3.2vw, 1.2rem)", lineHeight: 1.75 }
    ui:          { font: sans,    size: "1rem",     lineHeight: 1.5, note: "16px floor stops iOS zooming form fields on focus" }
    label:       { font: sans,    size: "0.85rem",  weight: 600 }
    hint:        { font: sans,    size: "0.8rem" }
    eyebrow:     { font: sans,    size: "0.72rem",  weight: 600, tracking: "0.26em", transform: uppercase, color: primary }

spacing:
  page-gutter: "clamp(1.25rem, 5vw, 3rem)"
  section-y: "clamp(5rem, 13vw, 9rem)"
  measure: "42rem"       # reading column
  measure-wide: "68rem"  # grids and galleries

radii:
  pill: "999px"     # buttons
  card: "14px"
  panel: "18px"
  field: "10px"
  photo: "4px"
  image: "2px"

shadows:
  lift: "0 0.75rem 2.5rem -0.5rem rgba(233,185,73,0.45)"   # gold button hover
  card: "0 1.5rem 3.5rem -1rem rgba(0,0,0,0.8)"            # floating photo cards
  focus: "0 0 0 3px rgba(233,185,73,0.14)"

motion:
  ease: "cubic-bezier(0.22, 1, 0.36, 1)"
  reveal: "0.9s–1.1s"
  micro: "0.2s–0.3s"
  note: >
    Every motion path has a prefers-reduced-motion branch, and nothing that
    carries content is hidden behind an animation that might not run.

texture:
  grain: >
    An SVG fractal-noise overlay at 0.035 opacity, fixed over the whole page.
    Cheap, and it does most of the work of making flat near-black look
    photographic rather than empty.
  glow: >
    A single gold radial gradient behind the hero. One light source, warm,
    off-centre.

---

## Contrast — measured, not assumed

| Pair | Ratio | Verdict |
|---|---|---|
| `text` on `ink` | 18.20:1 | AA body |
| `primary` on `ink` | 10.97:1 | AA body |
| `on-primary` on `primary` | 10.84:1 | AA body |
| `muted` on `ink` | 7.70:1 | AA body |
| `muted` on `ink-raised` | 7.37:1 | AA body |
| **`faint` on `ink`** | **3.73:1** | **large text only — fails AA for body** |
| **`faint` on `ink-raised`** | **3.57:1** | **large text only — fails AA for body** |

**Known issue.** `faint` is currently used for small text in several places —
form hints, the counter label and hint, footer lines, the scatter note. At
those sizes it is below the 4.5:1 AA threshold. Lifting `faint` to roughly
`#7C8492` would clear it without materially changing the look. Not changed
yet: it alters the feel of the whole page and that is the owner's call.

## Rules this system actually follows

1. **One accent.** Gold carries every CTA, every active state, every number
   that matters. Adding a second accent would halve the meaning of the first.
2. **Serif for feeling, sans for function.** Headlines and the counter are
   serif; anything a person has to read, scan or operate is Inter.
3. **Borders over shadows,** except where something genuinely floats. Depth
   mostly comes from a hairline and a slightly lighter surface.
4. **Everything fluid.** No fixed breakpoint type. Sizes clamp between a phone
   value and a desktop value.
5. **Nothing essential behind JavaScript.** Content is visible before the
   animation layer loads, and stays visible if it never does.

## Adapted from

Written from this project's own stylesheet, with the structure and vocabulary
of the `design-md` skill's reference systems. Closest relatives in that
collection are `claude` (serif display on a tinted canvas) and `binance` (a
single warm accent on near-black) — neither was copied; the palette, type and
proportions here are the project's own.

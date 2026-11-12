---
version: 3
name: Trinity-2018-Reunion
description: >
  An Apple-derived dark interface for a school reunion, with no interface
  colour at all. Neutral black and charcoal tiles where the colour change
  itself is the section divider, SF Pro at display sizes with negative
  tracking, long copy set light and airy, and white as the only interactive
  value. Every bit of colour on the page comes from the photographs. No
  decorative gradients, no grain, no shadows on chrome — the only elevation
  in the system is one soft drop under photography resting on a surface.

adapted-from: >
  awesome-design-md/design-md/apple — structure, typographic discipline and
  chrome rules. NOT its palette: Apple's Action Blue (#0066cc) is their brand
  mark. This project went further and dropped interface colour altogether —
  white is the interactive value and the photographs carry the colour. No
  serif anywhere, because Apple has none.

colors:
  # Two tiles. The change between them IS the divider — there are no rules
  # or borders between sections anywhere.
  ink: "#000000"          # tile A — hero, memories wall, signup
  ink-tile: "#1d1d1f"     # tile B — story, counter, footer
  ink-raised: "#272729"   # a card sitting on a tile
  ink-input: "#1d1d1f"
  line: "rgba(255,255,255,0.10)"
  line-strong: "rgba(255,255,255,0.22)"

  text: "#f5f5f7"
  muted: "#a1a1a6"
  faint: "#86868b"

  # White is the interactive value. The previous gold referred to nothing
  # about this school, this year or this photograph, and arbitrary colour is
  # what makes a page look generated.
  action: "#ffffff"
  action-soft: "#d2d2d7"
  action-dim: "rgba(255,255,255,0.14)"
  on-action: "#000000"

  # Semantic state, not brand.
  negative: "#ff453a"
  positive: "#30d158"

typography:
  # System stack only. SF Pro on Apple hardware, Roboto on Android, Segoe on
  # Windows — and zero webfont requests, which is what Apple actually ships.
  display: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

  scale:
    hero:      { size: "clamp(2.3rem, 6.4vw, 4rem)", weight: 600, lineHeight: 1.04, tracking: "-0.018em" }
    counter:   { size: "clamp(4.5rem, 20vw, 11rem)",   weight: 600, lineHeight: 1,    tracking: "-0.03em", note: "tabular-nums" }
    section:   { size: "clamp(1.9rem, 4.8vw, 2.75rem)", weight: 600, lineHeight: 1.1,  tracking: "-0.012em" }
    lead:      { size: "clamp(1.2rem, 3.1vw, 1.75rem)", weight: 400, lineHeight: 1.16, tracking: "0.004em" }
    body-airy: { size: "clamp(1.15rem, 2.6vw, 1.6rem)", weight: 300, lineHeight: 1.5,  tracking: "-0.008em",
                 note: "Long copy. Weight 300 at size with 1.5 leading is why the story is pleasant to scroll." }
    ui:        { size: "1rem",      weight: 400, note: "16px floor stops iOS zooming form fields" }
    button:    { size: "1.0625rem", weight: 400, note: "17px regular — Apple CTAs are small and quiet" }
    label:     { size: "0.85rem",   weight: 600 }

spacing:
  page-gutter: "clamp(1.5rem, 5vw, 3rem)"
  section-y: "clamp(4.5rem, 9vw, 6.5rem)"
  measure: "42rem"
  measure-wide: "68rem"

radii:
  card: "18px"
  field: "11px"
  chip: "8px"
  photo: "5px"
  pill: "999px"

shadows:
  # Exactly one. Nothing else in the system has elevation.
  imagery: "rgba(0,0,0,0.55) 0 1.5rem 3.5rem -1rem"
  focus: "0 0 0 3px rgba(255,255,255,0.14)"

motion:
  ease: "cubic-bezier(0.22, 1, 0.36, 1)"
  note: "Every path has a prefers-reduced-motion branch. Nothing carrying content hides behind an animation."

---

## Contrast — measured

| Pair | Ratio | |
|---|---|---|
| `text` on `ink` | 19.29:1 | AA body |
| `text` on `ink-tile` | 15.46:1 | AA body |
| `action` on `ink` | 21.00:1 | AA body |
| `on-action` on `action` | 21.00:1 | AA body |
| `muted` on `ink` | 8.16:1 | AA body |
| `muted` on `ink-tile` | 6.54:1 | AA body |
| `faint` on `ink` | 5.80:1 | AA body |
| `faint` on `ink-tile` | 4.65:1 | AA body |

Everything clears AA for body text, placeholders included — the detector
caught two hardcoded leftovers from the v1 palette (a footer grey at 2.1:1 and
every form placeholder at 2.2:1) that the token work had missed.

## Rules

1. **The colour change is the divider.** Tiles alternate `ink` / `ink-tile`.
   No borders, no rules, no gradients between sections.
2. **No interface colour.** White carries every CTA, focus ring and active
   state. The photographs are the only source of colour on the page, which is
   why they read as the content rather than as illustration.
3. **No decorative chrome.** No grain, no glows, no gradient meshes, no shadow
   on any headline or control. One drop-shadow exists, under photography.
4. **Negative tracking at display sizes.** `-0.018em` on the hero, `-0.012em`
   on section heads. This is the most recognisable thing about the type.
5. **Long copy is light and airy.** Weight 300, 1.5 leading, generous measure.
6. **CTAs are small.** 17px regular in a tight pill. Confidence, not volume.
7. **No webfonts.** System stack only.
8. **No eyebrows.** A small label above a heading is banned outright. The
   heading carries its own weight.
9. **The browser's own surfaces are themed** — selection, caret, scrollbar,
   underline offset. They ship with defaults belonging to no design system.
10. **One authored motion moment**, not an entrance on every section. Here it
   is the hero photograph resolving out of blur as it decodes.

## Hero composition

The photograph leads and the words sit beneath it, Apple product-tile style,
rather than type over a full-bleed image. The source is 4:5 and so is the
frame, so nothing is cropped. Its width is bounded by viewport height as well
as width (`min(25rem, 66vw, 34svh)`) and the gaps scale with height too, so the
photo and the words share one screen from 600px tall upward — verified.

## What changed from v1

v3 removed the gold entirely, recomposed the hero around the photograph,
deleted the scroll indicator and both eyebrows, and themed the browser
surfaces. v1 was a gold-on-near-black system with Instrument Serif display type, film
grain, a gold hero glow and hairline dividers. v2 removes all of it. The serif
went because Apple has no serif and a display serif was the single thing most
at odds with the rest. Blue-black (#07080B) went neutral (#000000). The two
Google Fonts requests went entirely.

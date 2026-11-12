---
version: 2
name: Trinity-2018-Reunion
description: >
  An Apple-derived dark interface for a school reunion. Neutral black and
  charcoal tiles where the colour change itself is the section divider, SF Pro
  at display sizes with negative tracking, long copy set light and airy, and a
  single gold accent carrying every interactive element. No decorative
  gradients, no grain, no shadows on chrome — the only elevation in the whole
  system is one soft drop under photography resting on a surface. The
  restraint is the design.

adapted-from: >
  awesome-design-md/design-md/apple — structure, typographic discipline and
  chrome rules. NOT its palette: Apple's Action Blue (#0066cc) is their brand
  mark, so gold stays as this project's single accent and is used exactly the
  way Apple uses blue. No serif anywhere, because Apple has none.

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

  primary: "#E9B949"
  primary-soft: "#F3D389"
  primary-dim: "rgba(233,185,73,0.16)"
  on-primary: "#000000"

  negative: "#ff6b6b"
  positive: "#5fd39b"

typography:
  # System stack only. SF Pro on Apple hardware, Roboto on Android, Segoe on
  # Windows — and zero webfont requests, which is what Apple actually ships.
  display: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

  scale:
    hero:      { size: "clamp(2.6rem, 8.2vw, 5.6rem)", weight: 600, lineHeight: 1.05, tracking: "-0.015em" }
    counter:   { size: "clamp(4.5rem, 20vw, 11rem)",   weight: 600, lineHeight: 1,    tracking: "-0.03em", note: "tabular-nums" }
    section:   { size: "clamp(1.9rem, 4.8vw, 2.75rem)", weight: 600, lineHeight: 1.1,  tracking: "-0.012em" }
    lead:      { size: "clamp(1.2rem, 3.1vw, 1.75rem)", weight: 400, lineHeight: 1.16, tracking: "0.004em" }
    body-airy: { size: "clamp(1.15rem, 2.6vw, 1.6rem)", weight: 300, lineHeight: 1.5,  tracking: "-0.008em",
                 note: "Long copy. Weight 300 at size with 1.5 leading is why the story is pleasant to scroll." }
    ui:        { size: "1rem",      weight: 400, note: "16px floor stops iOS zooming form fields" }
    button:    { size: "1.0625rem", weight: 400, note: "17px regular — Apple CTAs are small and quiet" }
    label:     { size: "0.85rem",   weight: 600 }
    eyebrow:   { size: "0.72rem",   weight: 600, tracking: "0.26em", transform: uppercase, color: primary }

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
  # Exactly one, matching Apple's spec. Nothing else in the system has elevation.
  imagery: "rgba(0,0,0,0.22) 3px 5px 30px"
  focus: "0 0 0 3px rgba(233,185,73,0.16)"

motion:
  ease: "cubic-bezier(0.22, 1, 0.36, 1)"
  note: "Every path has a prefers-reduced-motion branch. Nothing carrying content hides behind an animation."

---

## Contrast — measured

| Pair | Ratio | |
|---|---|---|
| `text` on `ink` | 19.29:1 | AA body |
| `text` on `ink-tile` | 15.46:1 | AA body |
| `primary` on `ink` | 11.50:1 | AA body |
| `on-primary` on `primary` | 11.50:1 | AA body |
| `muted` on `ink` | 8.16:1 | AA body |
| `muted` on `ink-tile` | 6.54:1 | AA body |
| `faint` on `ink` | 5.80:1 | AA body |
| `faint` on `ink-tile` | 4.65:1 | AA body |

Everything clears AA for body text. The v1 palette's `faint` (#646B78) was
3.73:1 and failed; moving to Apple's neutral greys fixed it as a side effect.

## Rules

1. **The colour change is the divider.** Tiles alternate `ink` / `ink-tile`.
   No borders, no rules, no gradients between sections.
2. **One accent.** Gold carries every CTA, focus ring, active state and the
   counter. There is no second brand colour, exactly as Apple has no second
   blue.
3. **No decorative chrome.** No grain, no glows, no gradient meshes, no shadow
   on any headline or control. One drop-shadow exists, under photography.
4. **Negative tracking at display sizes.** `-0.015em` on the hero, `-0.012em`
   on section heads. This is the most recognisable thing about the type.
5. **Long copy is light and airy.** Weight 300, 1.5 leading, generous measure.
6. **CTAs are small.** 17px regular in a tight pill. Confidence, not volume.
7. **No webfonts.** System stack only.

## What changed from v1

v1 was a gold-on-near-black system with Instrument Serif display type, film
grain, a gold hero glow and hairline dividers. v2 removes all of it. The serif
went because Apple has no serif and a display serif was the single thing most
at odds with the rest. Blue-black (#07080B) went neutral (#000000). The two
Google Fonts requests went entirely.

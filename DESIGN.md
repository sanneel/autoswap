# AutoSwap — Glass / Soft-Futurism Design System

Premium car-exchange marketplace, Georgian-first. Frosted vibrancy materials, layered translucency, one warm copper accent reserved for CTAs. The cars are the content; glass is the frame. (Adapted from the Apple glass reference; see PRODUCT.md for strategy.)

## 1. Visual Theme & Atmosphere

Soft futurism showroom. Light sage-green base, frosted panels floating over subtle atmospheric gradients, car photography at full contrast (the road-and-forest hero photo is a keep). Every chrome surface (nav, filter bars, modals) is translucent; every content surface (cards, forms) is elevated glass. Hardware-adjacent — surfaces imply physical depth.

Mood: calm, premium, trustworthy. Not: beige, saturated forest-green panels, classifieds clutter.

## 2. Color Palette & Roles

```
/* base (light) */
--bg:                  #f2f6f1      /* light sage page base */
--bg-atmo-1:           #e6ede4      /* soft gradient stop — green haze */
--bg-atmo-2:           #e9efe7      /* soft gradient stop — mist */
--bg-elevated:         #ffffff
--separator:           rgba(56,64,56,0.14)
--text:                #161a15      /* green-cast ink */
--text-secondary:      rgba(48,58,48,0.76)
--text-tertiary:       rgba(48,58,48,0.66)

/* accent — single calm action color, deep forest green (replaced copper).
   No orange/red anywhere; green carries all interactive states. */
--accent:              #1e4d34      /* deep green — primary actions ONLY */
--accent-hover:        #163a27
--accent-soft:         rgba(30,77,52,0.12)    /* focus halos, tint washes */

/* semantic (cash difference chips) */
--positive:            #2e7741     /* owner adds money */
--negative:            #b23a2e     /* owner asks money */
--neutral-info:        #3a6c8f     /* even swap */

/* vibrancy materials (alpha over backdrop blur) */
--material-thin:       rgba(255,255,255,0.55)
--material-regular:    rgba(255,255,255,0.72)
--material-thick:      rgba(255,255,255,0.88)

/* dark surfaces (footer, cinematic bands) — green-cast ink, never blue-black */
--ink:                 #101410
--ink-elevated:        #191f18
--material-dark:       rgba(20,26,21,0.65)
```

Rules:
- Copper is the ONLY accent. It appears on primary CTAs, active states, and nothing decorative.
- Cash chips use the semantic trio at low-alpha tint fills, never saturated blocks.
- No beige (#F4F4EF family) and no forest green (#12351F family) anywhere.

## 3. Typography Rules

Georgian script coverage is mandatory.

- **Display / headings:** `Noto Sans Georgian` 700–800, tight tracking (-0.02em), used LARGE. Headings earn their size; no timid 24px section titles.
- **Body / UI:** `Noto Sans Georgian` 400–600, fallback `system-ui`.
- **Numeric / data (prices, mileage, years):** `JetBrains Mono` 500–600, `tabular-nums`.

Scale: 12 / 13 / 15 / 17 / 22 / 28 / 36 / 48 / 64. Body 17px touch, 15px dense desktop.

## 4. Component Stylings

**Buttons (KEEP the copper CTA identity)**
- Primary: `--accent` fill, white text, radius 12, padding 12/24, weight 600. Hover: `--accent-hover`, slight lift (translateY(-1px)).
- Secondary: `--material-regular` + blur, 1px `--separator`, text `--text`.
- Ghost: text-only copper, no border.

**Listing cards**
- `--material-thick` over blur 20px, radius 18, NO 1px hard border — hairline `rgba(255,255,255,0.6)` inner stroke + soft ambient shadow `0 8px 32px rgba(16,19,25,0.08)`.
- Image edge-to-edge at card top, radius follows card.
- Price in mono, large; meta in `--text-secondary`.

**Nav / header**
- Sticky, `--material-thin` + `backdrop-filter: blur(24px) saturate(180%)`, hairline bottom separator. No solid fills.

**Sheets / modals**
- `--material-regular` over blur 30px, radius 20, backdrop dimmed `rgba(16,19,25,0.35)`.

**Inputs**
- `--material-thick` fill, no border, radius 12, padding 12/16.
- Focus: 4px halo `--accent-soft`.

**Filter bars / chips**
- Pill radius, `--material-regular`, active chip = copper text + `--accent-soft` fill.

## 5. Layout Principles

- 8pt base unit: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- Container 1200px; generous section padding (96px+ desktop, 56px mobile).
- Touch targets ≥44px.
- Content edge-to-edge; chrome floats above it.
- The hero "I have / I want" two-car swap stage is the signature layout moment — give it space and depth.

## 6. Depth & Elevation

Three layers: atmospheric gradient base → glass panels (blur + alpha) → content (photos, text at full contrast). Soft ambient shadows only (`0 8px 32px rgba(16,19,25,0.08)`); never hard drop-shadows over a material.

Fallback: where `backdrop-filter` is unsupported, materials resolve to solid `#ffffff` at 96% opacity.

## 7. Do's and Don'ts

**Do**
- `backdrop-filter: blur(24px) saturate(180%)` on all chrome surfaces.
- One copper accent per screen, spent on the primary action.
- Let car photography carry the color; keep surfaces neutral.
- `prefers-reduced-motion`: swap transforms for opacity fades.

**Don't**
- Beige backgrounds, green panels, or any return to the v1 palette.
- Hard 1px borders on cards.
- Multiple accents or saturated decorative fills.
- Timid typography — headings go big or not at all.

## 8. Responsive Behavior

- Mobile-first: cards go single column, filter bar becomes horizontal scroll pills, hero cars stack vertically with the swap icon rotated 90°.
- `env(safe-area-inset-*)` respected (PWA manifest exists).
- `@media (prefers-color-scheme: dark)` optional later; light is canonical.

## 9. Agent Prompt Guide

Bias: cool near-white base with atmospheric gradients, frosted glass panels (blur+alpha) instead of solid fills or borders, copper #a14e21 as the single accent on CTAs, Noto Sans Georgian display-large headings, JetBrains Mono tabular numerals for prices/specs, radius 12–20, soft ambient shadows.

Reject: beige/cream backgrounds, forest green, bordered gray cards, purple gradients, timid same-size typography, multi-accent surfaces.

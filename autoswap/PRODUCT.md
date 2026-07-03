# Product

## Register

product

(The home page leans brand — it sells the idea of swapping cars — but every other
surface is task UI: browse, list, offer, chat, account. Product register is the
default; the home hero may borrow brand permissions.)

## Users

Georgian car owners (Tbilisi and regions) who want to *swap* cars rather than
sell-then-buy. They are used to myauto.ge and Facebook Marketplace: dense
listings, phone-first contact, photos with watermarks, prices in GEL and USD.
They browse on mid-range Android phones and on desktop at work. Trust is the
scarce resource — a marketplace that looks fake or machine-made loses them
before the first tap.

## Product Purpose

List your car, browse what others are swapping, send a structured swap offer
(car + optional cash adjustment), get matched automatically, chat after
acceptance. Success: a user lists a real car and receives/accepts a real offer.

## Brand Personality

Mechanical, trustworthy, garage-floor honest. Three words: **workshop, ledger,
handshake**. The feel of a well-kept service logbook, not a startup deck.
Confidence comes from density and precision (real numbers, tabular figures,
clear states), not from polish effects.

## Anti-references

- Generic AI/SaaS landing pages: purple-blue gradients, glassmorphism, glowing
  blobs, hero-metric stat rows, identical icon-card grids, uppercase tracked
  eyebrow labels above every section.
- Sterile "premium" car sites (black + gold, cinematic full-bleed video).
- shadcn/Tailwind default look: oversized radii, Inter everywhere, centered
  hero with two pill buttons.

## Design Principles

1. **Earned familiarity** — marketplace affordances people already know from
   myauto.ge; the tool disappears into the task.
2. **Instrument-cluster precision** — tabular numerals, mono for plates/prices/
   codes, exact alignment; data looks measured, not decorated.
3. **One loud thing per screen** — copper accent reserved for the primary
   action; everything else stays in the green/ivory neutrals.
4. **States are designed, not defaulted** — hover/focus/disabled/empty/loading
   all deliberate; skeletons over spinners.
5. **Hand-built texture over template gloss** — asymmetry, varied rhythm, real
   photography; never a pattern repeated identically section after section.

## Constraints (owner-set, June 2026)

- Never write or edit Georgian copy — owner handles all user-facing text.
- "De-AI" passes are design-only: colors, icons, radii, shadows, logo,
  typography, spacing, markup classes. Not copy, not features, not page
  structure.
- Keep the engine-sound buttons on the hero cars (bmw-rev.mp3 / porsche-rev.mp3).
- myauto.ge-watermarked listing photos are intentional test data.
- Fake header phone (+995 599 11 22 33) and demo auth are accepted test-mode
  artifacts.

## Accessibility & Inclusion

WCAG 2.1 AA: body text ≥4.5:1, large text ≥3:1, visible focus rings on every
interactive element, 44px touch targets, `prefers-reduced-motion` alternatives
for every animation. Georgian script must render correctly everywhere (Noto
Georgian families); numerals stay tabular.

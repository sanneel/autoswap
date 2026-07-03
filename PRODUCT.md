# Product

## Register

brand

## Users

Georgian car owners (Tbilisi, Batumi, Kutaisi) who want to trade their car for a different one without the hassle of selling first. They browse on mobile and desktop, often in the evening, comparing what owners want in return and what cash difference is involved. Secondary: car enthusiasts window-shopping premium swaps. Interface language is Georgian (ka).

## Product Purpose

AutoSwap is a car-exchange marketplace: list your car, state what you want in return (and the cash difference you'd add or ask), and match with real owners looking for your car. Success = a visitor immediately understands the "swap, don't sell" concept from the hero, trusts the platform enough to browse listings, and either sends an offer or lists their own car.

## Brand Personality

Premium, calm, precise. The feel of a high-end car configurator crossed with Apple product pages: frosted glass surfaces, soft depth, generous space, one warm accent. The cars are the heroes — the UI is the showroom glass around them. Confidence without shouting.

## Anti-references

- The previous AutoSwap look: warm beige/cream page background, dark forest-green header and panels, generic bordered listing cards, default-feeling typography. Do not drift back to it.
- Classifieds-market clutter (myauto.ge-style dense link grids, badge noise, competing accents).
- Generic AI-slop aesthetics: purple gradients on white, Inter-everywhere sameness, flat gray cards.

## Design Principles

1. **Cars are the content, glass is the frame.** Photography and vehicle imagery get maximum contrast and space; chrome (nav, panels, filters) stays translucent and quiet.
2. **One accent, spent on action.** The warm copper accent is reserved for CTAs and key interactive moments — never for decoration. (The copper CTA buttons are an explicit keep from the previous design.)
3. **Depth over borders.** Hierarchy comes from layered translucency, blur, and soft shadow — not from 1px borders and filled boxes.
4. **Show the swap.** The two-car "I have / I want" pairing is the signature brand moment; every page should echo the exchange metaphor.
5. **Georgian-first typography.** Type must render beautifully in Georgian script; display and body faces are chosen for ka coverage, not just Latin looks.

## Accessibility & Inclusion

- WCAG AA contrast for text on glass surfaces (test against the blurred backdrop, not the base color).
- Frosted/translucent panels must have a solid-color fallback where `backdrop-filter` is unsupported.
- Respect `prefers-reduced-motion`: disable parallax/large transitions, keep opacity fades.
- Hit targets ≥ 44px on mobile; the audience browses heavily on phones.

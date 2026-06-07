# SwapRide — "Pit Lane" design system

> The brand voice of an automotive press kit, the spatial economy of a Swiss train timetable, the swagger of a paddock pit board.

## Why this direction

SwapRide is a peer-to-peer **trade** marketplace, not a dating app or a Carmax clone. Two strangers are about to exchange six-figure assets based on photos and a chat. Every pixel needs to earn trust through **precision** — not warmth, not playfulness. The aesthetic borrows from places where trust is signaled through restraint:

- 1970s–80s automotive press releases (precise typography, sharp grids)
- FIA timing screens (mono numerals, rank cards)
- Vintage workshop manuals (cream paper, ink linework)
- Modern editorial magazines (Apartamento, Cabana, Top Gear) — generous whitespace plus dense data when it matters

If users open the app and think *"this looks like it belongs in the lobby of a vintage Porsche showroom,"* we've won.

## Tokens

### Color (light theme is primary; dark is a future variant)

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F3EFE6` | App background — warm cream, the page |
| `surface` | `#FFFFFF` | Cards, sheets — slightly elevated from paper |
| `ink` | `#0E0E10` | Text, borders, icons — near-black with cool undertone |
| `graphite` | `#1B1B1F` | Slightly softer ink for body text |
| `mist` | `#8A8782` | Muted text, captions |
| `borderSoft` | `#D9D3C7` | Secondary dividers |
| `signal` | `#E63429` | The accent. Interested CTA, active matches, paywall, warnings of consequence |
| `signalInk` | `#B22A21` | Signal pressed/hover |
| `olive` | `#5B6B2D` | Match success — vintage racing green, NOT Material's `#00C853` |
| `amber` | `#C68B2D` | "Wants money" warning, attention |

**Use signal-red sparingly** — it should mean *something is committed and high-stakes*. If 5 things on a screen are red, none of them matter.

### Type

- **Display + body**: Bricolage Grotesque (Google Fonts). Variable, characterful, slightly editorial. Weight 400 for body, 700–800 for display. Tight tracking on headlines (`-0.02em`).
- **Mono**: JetBrains Mono (Google Fonts). Used for stats, prices, mileage, IDs, lap times — anything that benefits from tabular alignment and an instrument-cluster feel.

```
display1   Bricolage Grotesque 800, 32/36, tracking -0.03em
display2   Bricolage Grotesque 700, 22/26, tracking -0.02em
title      Bricolage Grotesque 600, 17/22
body       Bricolage Grotesque 400, 15/22
caption    Bricolage Grotesque 500, 12/16 UPPERCASE tracking +0.10em
mono       JetBrains Mono 500, 13/18, tabular figures
monoLg     JetBrains Mono 600, 18/22, tabular figures
```

### Spacing

Increments of 4: `4, 8, 12, 16, 20, 24, 32, 48`. Side gutters are **24px**, not 16. We earn the extra whitespace.

### Borders & shadows

- **Borders win.** 1px solid ink lines define cards, dividers, instrument grids.
- **No shadows** anywhere. We're on paper.
- Radius: `0` for "sharp" elements (section labels, chips), `12` for buttons and inputs, `20` for hero cards. Never `999` (no pill buttons except the segmented swipe actions).

## Signature components

### Section label

Every screen opens with a tiny eyebrow: `01 / DISCOVER` or `MATCHES · 02 ACTIVE`. Uppercase, tracked, separated by a `·` or `/`. This is the lap-time aesthetic.

### Stat row (instrument cluster)

```
+----------+----------+----------+
| YEAR     | MILEAGE  | FUEL     |
| 2019     | 82,000   | DIESEL   |
+----------+----------+----------+
```

Vertical 1px dividers between cells. Mono numerals top-aligned, caption labels above. Used on swipe card, profile, match cards.

### Money chip

`+€5,000` or `−€3,000` — explicit sign, mono font, signal-red for "wants money" and olive for "will add money." A "Straight swap" chip just reads `EVEN`.

### Swipe card

Vertical 3:4. Top 70% is the photo (full-bleed, no rounded corners on top). Bottom 30% is a white block with a hairline divider, hosting:
- Title (Bricolage 800 24pt)
- Caption row with year · mileage · fuel
- Two compact info rows (money + desired-in-return)

The card itself has a 1px ink border. No shadow.

### Bottom nav

Four destinations, all-caps labels, mono. Selected gets a 2px ink underline (not a Material pill). Inactive gets `mist` color.

## Voice / micro-copy

- Tone: **direct, slightly mechanical, never coy.** "MUTUAL INTEREST CONFIRMED" beats "It's a match! 🎉".
- Empty states explain in one sentence what the user needs to do, no exclamation marks.
- Errors: "BLOCKED — contact info is locked until purchase." Period. No apology.

## What we deliberately reject

- ❌ Soft purple→pink gradients
- ❌ Generic Material 3 oversaturated tonal palettes
- ❌ Inter, Roboto, Space Grotesk
- ❌ Drop shadows
- ❌ Emoji in product copy (use them only when the *user* types them)
- ❌ Bouncy Material ripples
- ❌ Bottom sheets that round at the top

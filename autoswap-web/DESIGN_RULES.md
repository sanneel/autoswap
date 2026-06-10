# AutoSwap Design Rules

## Visual Principles

### Core Values
1. **Product-first** — Every visual element serves the product, not decoration
2. **Trust through clarity** — Clear hierarchy, honest content, no hype
3. **Practical premium** — Clean and professional, not flashy or trendy
4. **Human-made** — Design should feel intentional, not template-generated

### Design Philosophy
- Show real product, not mockups
- Use concrete language over buzzwords
- Prefer function over decoration
- Maintain visual consistency across all pages

---

## Forbidden AI-Generated Patterns

### Colors & Gradients
- ❌ Purple/blue neon gradients
- ❌ Glassmorphism (translucent cards with blur)
- ❌ Random glowing borders
- ❌ Gradient text (especially rainbow/multicolor)
- ❌ Over-saturated color palettes

### Shapes & Effects
- ❌ Floating abstract blobs
- ❌ Random 3D icons or illustrations
- ❌ Excessive drop shadows
- ❌ Too many rounded corners (no 999px radius)
- ❌ Perfectly symmetrical sections
- ❌ Decorative dividers that add no value

### Layout & Content
- ❌ Generic "Trusted by 10,000+ users" claims (unless real)
- ❌ Fake testimonials with stock avatars
- ❌ Vague slogans ("Revolutionize your workflow")
- ❌ Fake dashboard mockups
- ❌ AI-style illustrations
- ❌ Generic feature grids with shallow text
- ❌ Overuse of badges, pills, and chips

### Motion & Interaction
- ❌ Excessive animations
- ❌ Bouncy/popping effects
- ❌ Loading spinners that spin endlessly
- ❌ Parallax effects that distract

### Typography
- ❌ Multiple font families competing
- ❌ Gradient text for headings
- ❌ Over-stylized text with excessive weight variation

---

## Typography Rules

### Font Selection
- Use **Plus Jakarta Sans** for body text (current)
- Consider a more distinctive display font for headlines
- Never use more than 2 font families

### Hierarchy
```
H1: 4.2rem, weight 800, tight letter-spacing (-0.01em)
H2: 1.8rem, weight 700, line-height 1.15
H3: 1.08rem, weight 700
Body: 1rem, weight 400-500, line-height 1.6
Caption: 0.78rem, uppercase, tracked (+0.08em)
```

### Rules
- Use weight sparingly — heavy text should be intentional
- Limit font sizes to established scale
- Never use font sizes below 0.78rem for functional text

---

## Spacing Rules

### Grid System
- Base unit: 4px
- Page max-width: 1180px
- Side gutters: 16px (mobile), 24px (tablet+)
- Section spacing: 44px vertical
- Component gaps: 8-16px

### Vertical Rhythm
- Consistent spacing between sections
- 12px base for tight components
- 24px for grouped elements
- 44px for major sections

---

## Component Rules

### Buttons
- **Primary**: Green background (#147a55), white text, 8px radius, no shadow
- **Secondary**: White background, green text, subtle border
- **Danger**: White background, red text, red border
- **Ghost**: Transparent, just text with hover state
- Min-height: 44px (touch-friendly)
- Weight: 800

### Cards
- Border: 1px solid var(--line)
- Border-radius: 8px
- Background: var(--surface)
- Shadows: Only where needed, use subtle values
- Padding: 16-20px

### Badges/Chips
- Use sparingly for status only
- No gradient backgrounds
- Subtle borders, not heavy outlines

### Icons
- Use Lucide React (current)
- Size: 15-18px for inline, 20-22px for standalone
- Color: Inherit from parent or use muted

---

## Color System

### Current Palette (Keep)
```
--bg: #f6f3ee        (warm cream background) ✅
--surface: #ffffff   (white cards) ✅
--ink: #17201c       (dark text) ✅
--muted: #68736e     (secondary text) ✅
--line: #d8d2c8      (borders) ✅
--green: #147a55     (primary actions) ✅
--green-dark: #0d513a (hover states) ✅
```

### Do Not Add
- Purple or blue primary colors
- Neon variants
- Gradient backgrounds on large areas
- High saturation accents

---

## Copywriting Rules

### Voice
- Direct, specific, practical
- No buzzwords or hype
- Clear value proposition
- Honest about what the product does

### Bad Examples
- "Unlock the future of seamless intelligent automation"
- "AI-powered platform to revolutionize your experience"
- "Join thousands of satisfied users"

### Good Examples
- "Swap cars with people who want what you're offering"
- "Send an offer, get a response, complete the trade"
- "Real listings from real owners"

### Guidelines
- Describe what the user can do, not abstract benefits
- Use specific numbers/terms when available
- Avoid superlatives without evidence
- Write for the user, not marketing

---

## Motion Rules

### Allowed
- Hover transitions (150-200ms ease)
- Focus states for accessibility
- Subtle opacity changes

### Forbidden
- Loading animations that distract
- Parallax scrolling
- Bouncy/popping micro-interactions
- Fade-in-on-scroll effects (unless critical)
- Continuous animations

### Timing
- Default transition: 180ms ease
- Hover effects: 150-200ms
- Never animate more than 300ms

---

## Layout Rules

### Structure
- Single-column on mobile (< 680px)
- Two-column on tablet (680-980px)
- Multi-column on desktop (> 980px)
- Never use perfectly symmetrical 3-column layouts

### Spacing
- Keep gutters consistent
- Group related content
- Use whitespace to create hierarchy
- Don't fill every pixel

### Navigation
- Simple top bar, no mega-menus
- Clear call-to-action placement
- Responsive collapse on mobile

---

## Page-Specific Rules

### Homepage Hero
- Direct headline (what it does)
- Single clear CTA
- No decorative elements
- Product screenshot OR simple text

### Features/Sections
- Single column or asymmetric
- No icon-heavy grids
- Specific descriptions, not generic
- Real examples only

### Footer
- Minimal, functional links
- No fake social proof
- Clear contact/info structure

---

## Examples

### Good vs Bad

**Button:**
- ✅ Good: Solid green, subtle border on hover, 44px height
- ❌ Bad: Gradient background, glow effect, rounded pill

**Card:**
- ✅ Good: White, 1px border, 8px radius, subtle shadow
- ❌ Bad: Glassmorphism, heavy shadow, rounded to infinity

**Section:**
- ✅ Good: Left-aligned, clear heading, specific subtext
- ❌ Bad: Centered, decorative icons, vague copy

**Form:**
- ✅ Good: Clean labels, clear inputs, no decorative elements
- ❌ Bad: Floating labels, animated hints, excessive styling

---

## Implementation Notes

1. **Current state**: The codebase already follows most of these rules
2. **Key improvements needed**:
   - Sharpen typography hierarchy
   - Reduce shadows in some areas
   - Make hero more direct
   - Clean up generic section copy
3. **Testing**: Run `npm run typecheck` and `npm run build` after changes

---

## Checklist

Before any UI change, verify:
- [ ] No purple/blue gradients
- [ ] No glassmorphism
- [ ] No fake testimonials or social proof
- [ ] No vague marketing copy
- [ ] Consistent border radius (8px max)
- [ ] Purposeful shadows only
- [ ] Direct, specific language
- [ ] Touch-friendly targets (44px min)
- [ ] Accessible color contrast
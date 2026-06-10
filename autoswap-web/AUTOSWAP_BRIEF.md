# AutoSwap Brief

## What AutoSwap Is

AutoSwap is a peer-to-peer car marketplace focused on **swaps**, not sales. Users list their vehicles, browse others' listings, and when mutual interest exists, they can exchange cars with optional cash adjustments.

**Core concept**: Trade your car for someone else's, with money added if values don't match.

---

## Target Users

### Primary
- Car owners looking to change vehicles without selling
- People who want to upgrade/downgrade based on needs
- Drivers who prefer trading over selling/buying

### Secondary
- Families swapping between seasonal vehicles
- Small business owners rotating fleet
- Collectors trading between models

### User Context
- Current MVP targets Georgian market (Tbilisi, Batumi, Kutaisi)
- Users speak Georgian, can read Cyrillic
- Mobile-first, desktop supported
- Price-sensitive market (cash adjustments matter)

---

## Main Problem Solved

### Before AutoSwap
- Selling a car requires: listing, responding to inquiries, negotiating, meeting strangers
- Buying requires: extensive searching, financing, registration hassle
- Trading between two people with different cars was nearly impossible

### With AutoSwap
- List your car with what you want in exchange
- Owners of desired cars see your listing
- Mutual interest triggers contact
- Simple, direct communication

---

## Key User Flows

### 1. Listing a Car
1. User signs in/up
2. Clicks "Add car" button
3. Enters make, model, year, mileage, photos
4. Describes what car they want in return
5. Optionally adds cash adjustment preference
6. Listing appears in feed

### 2. Making an Offer
1. User browses feed
2. Finds interesting car
3. Opens detail page
4. Selects one of their cars to offer
5. Adds optional cash adjustment
6. Sends offer
7. Waits for response

### 3. Responding to Offers
1. Owner sees incoming offer in offers page
2. Reviews offered car details
3. Accepts, rejects, or sends counter
4. If accepted, chat opens with both users

### 4. Chatting
1. Conversation created when offer accepted
2. Both users can message
3. Contact info protected until trust established
4. Direct negotiation for meeting/exchange

---

## Core Features

### Listings
- Create car listing with details
- Upload up to 10 photos
- Specify desired swap targets (make/model/category)
- Show cash adjustment preference (+/- amount)
- Edit or delete own listings

### Discovery
- Browse all active listings
- Search by make, model, location
- Filter results
- View detail pages

### Offers
- Send offer from your vehicle
- Specify cash adjustment direction/amount
- Add message to owner
- Track incoming vs sent offers
- Accept, reject, or cancel

### Messaging
- Real-time chat after offer accepted
- Contact protection (no phone/email until unlocked)
- Message history

### Auth
- Sign up/sign in (Google, Apple, or phone OTP)
- Protected routes require auth
- Session persistence

---

## Tone of Voice

### Direct and Practical
- "List your car, find a match, make the trade"
- No hype, no buzzwords
- Clear instructions at every step

### Honest and Transparent
- Show real listings, real prices
- No fake metrics or testimonials
- Acknowledge when features are incomplete

### Professional but Human
- Formal enough for trust
- Friendly enough for engagement
- Georgian language for local market

### Language Style
- Short sentences
- Action-oriented
- Specific over generic
- Avoid: "revolutionize", "seamless", "AI-powered", "cutting-edge"

---

## Current Product State

### Working
- ✅ Landing page with feed
- ✅ Vehicle detail pages
- ✅ Auth flow (Google, Apple, phone OTP)
- ✅ Search and filtering
- ✅ Demo mode with sample data
- ✅ Offers page with accept/reject/cancel
- ✅ Messages page with conversations

### Needs Work
- 🔶 Listings creation form (basic, needs polish)
- 🔶 Real-time message updates
- 🔶 Profile management
- 🔶 Mobile optimization

### TODO / Unknown
- ❓ Payment integration for cash adjustments
- ❓ Actual vehicle photo upload (currently Unsplash demos)
- ❓ Push notifications
- ❓ Review/rating system
- ❓ Dispute resolution flow
- ❓ In-person exchange coordination

---

## Visual Direction

### Current Design
- Warm cream background (#f6f3ee)
- White cards with subtle borders
- Green accent (#147a55) for primary actions
- Plus Jakarta Sans typography
- 8px border radius
- Minimal shadows

### Style Reference
- Clean, professional, not flashy
- Trustworthy marketplace feel
- Practical over decorative
- Mobile-first responsive

### What's Working
- ✅ Restrained color palette
- ✅ Clear typography hierarchy
- ✅ Simple navigation
- ✅ Direct copy
- ✅ No fake marketing

### What Needs Improvement
- 🔶 Hero could be more product-focused
- 🔶 Some sections feel generic
- 🔶 Typography could be more distinctive
- 🔶 Shadows in some places excessive

---

## Technical Notes

### Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Supabase (Auth, Postgres, Realtime)
- CSS (no Tailwind, custom globals.css)

### Key Files
- `src/app/page.tsx` — Landing page
- `src/app/globals.css` — Design system
- `src/components/` — Shared components
- `src/lib/` — Utilities, types, supabase

### Database
- `vehicles` — Listings
- `offers` — Sent proposals
- `conversations` — Accepted offer chats
- `messages` — Chat messages
- `profiles` — User info

---

## Questions / Decisions Needed

1. **Photo Upload**: Real Supabase storage or continue with Unsplash demos?
2. **Payment Flow**: How to handle cash exchanges in person?
3. **Contact Unlock**: Is RevenueCat paywall needed for web too?
4. **Localization**: Keep Georgian only or add English?
5. **Mobile App**: Continue with Flutter or focus on web first?

---

## Success Metrics (Future)

- Listings created per day
- Offers sent per listing
- Offer acceptance rate
- Messages per conversation
- Return users

---

## References

- Design system: `DESIGN_RULES.md`
- Database schema: `supabase/schema.sql`
- Setup guide: `supabase/README.md`
- Original Flutter docs: `docs/SETUP.md`
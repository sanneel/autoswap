# Project Brief: SwapRide

## Overview

**SwapRide** is a peer-to-peer car-swap marketplace MVP built for a solo founder. Users can list their cars, browse others' cars, express interest via swipes, and when two users mutually like each other's cars, a match is created enabling real-time chat. Optional cash adjustments allow users to sweeten deals.

## Problem Statement

Traditional car swap platforms are complex, fee-heavy, and lack trust. SwapRide simplifies this by:
- Creating a Tinder-like swiping experience for car discovery
- Automating the matching process server-side
- Protecting user contact info behind a paywall until trust is established
- Enabling real-time chat for negotiation

## Solution

### Mobile App (Flutter)
A cross-platform mobile app enabling:
- User authentication (email-based via Supabase Auth)
- Profile creation with photo upload
- Car listing with up to 10 photos per vehicle
- Swipe-based discovery (interested/not interested)
- Automatic matching when mutual interest exists
- Real-time chat (contact info protected until paywall unlocked)
- RevenueCat-powered paywall for contact unlock

### Web Dashboard (Next.js)
A lightweight web interface for:
- User authentication
- Basic profile management
- Car browsing and discovery
- Match viewing and messaging

## Target Users

- Solo car owners looking to trade up or swap for different needs
- Couples wanting to exchange vehicles seasonally
- Small business owners with fleet rotation needs

## MVP Features

### Authentication
- Email/password sign up and sign in
- Profile onboarding (name, location, bio, avatar)

### Car Management
- Add cars with make, model, year, description
- Upload up to 10 photos per car
- Set swap preferences (what cars you're interested in)
- Edit and delete cars

### Discovery
- Swipe interface showing available cars
- Filter by preferences
- Pull-to-refresh feed

### Matching
- Server-side matching when mutual interest exists
- Match notifications
- Match list with last message preview

### Chat
- Real-time messaging via Supabase Realtime
- Contact info blocked until paywall unlocked
- Read receipts (future)

### Paywall
- RevenueCat integration
- Lifetime contact unlock purchase
- Cross-device entitlement sync via webhook

### Reports
- Flag users/cars for spam, fake, scam, abuse
- Manual admin review (out of scope for MVP)

## Out of Scope (MVP+)

- Web image picker (desktop UX issues)
- Localization
- Admin/moderation app
- Push notification sending server
- Multi-currency support
- Advanced search and filtering
- Payment processing for cash adjustments
- Escrow services

## Technology Stack

### Mobile
- Flutter 3.22+ / Dart 3
- Riverpod for state management
- GoRouter for navigation
- Supabase Flutter SDK

### Backend
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Supabase Edge Functions (for webhooks)
- RevenueCat webhook handler

### Web
- Next.js 16 / React 19
- TypeScript
- Supabase SSR

### External Services
- RevenueCat (payments)
- Firebase Cloud Messaging (push notifications)

## Database Schema (Key Tables)

- `profiles` — user profiles with contact unlock status
- `cars` — vehicle listings with metadata
- `car_photos` — photo storage references
- `desired_vehicles` — swap preference rules
- `vehicle_preferences` — car attribute preferences
- `swipes` — user actions on cars
- `matches` — mutual interest records
- `messages` — chat messages
- `reports` — abuse reports

## Key Technical Decisions

### Server-Side Matching
The matching engine runs in PostgreSQL via triggers. When a user swipes "interested":
1. `handle_swipe()` trigger fires
2. Checks if the other party has swiped "interested" on any of the current user's cars
3. `try_create_matches_for_pair()` creates match records for all compatible car pairs
4. Uniqueness constraint prevents duplicates

### Contact Protection
Contact info filtering is implemented in `lib/core/utils/contact_filter.dart`. The filter catches:
- Email addresses
- URLs
- Phone-like digit sequences
- Social media handles (@, Insta, WhatsApp, Telegram, t.me)

### Realtime Updates
Only `messages` and `matches` tables are in the Supabase Realtime publication, keeping WebSocket traffic minimal.

## Success Metrics (Future)

- Number of matches created
- Messages per match ratio
- Paywall conversion rate
- Average session duration
- Daily active users

## Development Team

- **Solo founder** — full-stack development
- **Claude** — AI pair programmer, main builder
- **OpenHands** — automation environment, CI/CD

## Timeline

MVP phase: Core features only, no polish beyond functional requirements.
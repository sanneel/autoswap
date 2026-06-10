# Architecture Overview

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Quick Reference

### Stack
- **Flutter** (mobile app) with Riverpod + GoRouter
- **Next.js** (web dashboard) with React 19
- **Supabase** (backend: Auth, Postgres, Storage, Realtime)

### Mobile App Structure (`lib/`)
```
lib/
├── main.dart                 # Entry point
├── app.dart                  # MaterialApp.router
├── bootstrap.dart            # Service initialization
├── core/                     # Shared utilities
│   ├── config/               # Environment config
│   ├── di/                   # Riverpod providers
│   ├── router/               # GoRouter configuration
│   ├── theme/                # Design system tokens
│   ├── utils/                # Utilities (contact_filter, validators)
│   └── widgets/              # Shared widgets
├── features/                 # Feature modules
│   ├── auth/                 # Authentication
│   ├── profile/              # User profiles
│   ├── cars/                 # Car management
│   ├── home/                 # Discovery feed
│   ├── matches/              # Match list
│   ├── chat/                 # Real-time messaging
│   ├── paywall/             # RevenueCat integration
│   └── reports/              # Abuse reporting
└── services/                 # External services
    ├── revenuecat_service.dart
    └── notifications_service.dart
```

### Key Architecture Decisions

1. **Repository Pattern** — All data access through repositories in `features/*/data/`
2. **Riverpod DI** — All providers registered in `core/di/providers.dart`
3. **Server-side Matching** — Postgres triggers handle match creation
4. **Contact Protection** — Filter in `core/utils/contact_filter.dart`
5. **Minimal Realtime** — Only `messages` and `matches` in Supabase Realtime publication

### Database
See `supabase/schema.sql` for schema and `supabase/policies.sql` for RLS policies.

### Design System
See `docs/DESIGN.md` for the "Pit Lane" design system with Bricolage Grotesque typography and signal-red accents.
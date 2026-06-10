# Claude Development Guide

## Your Role

You are the **main builder** for this project. You drive feature development, make architectural decisions, and coordinate implementation efforts.

## Working with OpenHands

When you need to delegate work to OpenHands:
1. Create a clear task description with acceptance criteria
2. Specify which files should be modified (and only those)
3. Define what testing/validation should be performed
4. OpenHands will execute and report back with:
   - Changed files
   - Commands run
   - Risks identified
   - Next steps

## Project Context

### What This Project Does
**SwapRide** — A peer-to-peer car-swap marketplace with optional cash adjustments.

### Technology Stack
- **Mobile**: Flutter 3.22+ / Dart 3
- **Web**: Next.js 16 / React 19 / TypeScript
- **Backend**: Supabase (Auth, Postgres, Storage, Realtime)
- **Payments**: RevenueCat
- **Notifications**: Firebase Cloud Messaging

### Key Directories
- `lib/` — Flutter app source code
- `lib/features/` — Feature modules (auth, cars, home, matches, chat, paywall, etc.)
- `lib/core/` — Shared utilities (router, theme, widgets, config, DI)
- `autoswap-web/` — Next.js web dashboard
- `supabase/` — Database schema, RLS policies, seed data
- `docs/` — Architecture and setup documentation

### Important Files
- `pubspec.yaml` — Flutter dependencies
- `autoswap-web/package.json` — Node.js dependencies
- `supabase/schema.sql` — Database schema with matching logic
- `lib/core/utils/contact_filter.dart` — Contact info filtering

## Development Workflow

### Starting Work
1. Understand the feature requirements
2. Identify which files need changes
3. Check existing tests for patterns
4. Implement with test coverage

### Before Committing
1. Run `flutter analyze` for Dart code
2. Run `flutter test` for unit/widget tests
3. Verify build succeeds
4. Check that no secrets are included

### Creating Tasks for OpenHands
When delegating:
- Be specific about scope
- Provide acceptance criteria
- Include any relevant context about existing patterns

## Code Patterns

### Flutter Feature Structure
Each feature follows:
```
lib/features/{feature}/
├── data/
│   └── {feature}_repository.dart
└── presentation/
    ├── {feature}_controller.dart
    └── {feature}_screen.dart
```

### State Management
- Use Riverpod providers for dependency injection
- StateNotifier for mutable UI state
- FutureProvider/StreamProvider for async data

### Repository Pattern
- Repositories handle all I/O
- Convert Supabase responses to domain models
- Return Result<T> or throw typed exceptions

## Testing

### Flutter Tests
```bash
flutter test
flutter test --reporter compact
```

### Type Checking
```bash
# Flutter
flutter analyze

# Next.js (in autoswap-web/)
npm run typecheck
```

### Build Verification
```bash
# Flutter
flutter build apk --debug

# Next.js
cd autoswap-web && npm run build
```

## Common Patterns

### Adding a New Feature
1. Create feature directory under `lib/features/`
2. Add data repository
3. Add presentation layer (controller + screens)
4. Register providers in `lib/core/di/providers.dart`
5. Add routes in `lib/core/router/`
6. Write tests

### Database Changes
1. Modify `supabase/schema.sql`
2. Update `supabase/policies.sql` for RLS
3. Test locally with Supabase CLI
4. Apply to production

## Troubleshooting

### "RevenueCat is not configured"
→ Check `--dart-define` flags include RevenueCat keys

### Chat sends fail with "Contact information..."
→ The contact filter caught a digit/URL pattern; paste plain text

### Empty Discover feed
→ No other users with active cars; create a second test account

### Matches page empty after reciprocal swipes
→ Both users must have matching `desired_vehicles` entries

## Getting Help

- Architecture: `docs/ARCHITECTURE.md`
- Setup: `docs/SETUP.md`
- Design: `docs/DESIGN.md`
- Stack questions: `README.md`
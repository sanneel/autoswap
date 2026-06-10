# Task Board

This file tracks current and upcoming tasks for the SwapRide project.

## Active Tasks

### [P1] Flutter Test Coverage Expansion
- **Status**: TODO
- **Assigned to**: Claude
- **Description**: Add unit and widget tests for repositories and controllers to improve test coverage beyond the existing contact_filter tests.
- **Acceptance Criteria**:
  - Add tests for all repositories (auth, cars, chat, matches, profile, paywall, reports)
  - Add widget tests for key screens
  - All tests pass with `flutter test`
- **Files to modify**:
  - `test/` directory
  - `lib/features/*/data/*_repository.dart`
  - `lib/features/*/presentation/*_controller.dart`
- **Notes**: Currently only `test/widget_test.dart` exists with contact_filter tests.

### [P1] Next.js TypeScript Strict Mode
- **Status**: TODO
- **Assigned to**: Claude
- **Description**: Enable strict TypeScript checks and fix any type errors in the web dashboard.
- **Acceptance Criteria**:
  - `npm run typecheck` passes with no errors
  - `npm run build` succeeds
  - No `any` type usage in production code
- **Files to modify**:
  - `autoswap-web/src/**/*.ts` and `*.tsx`
  - `autoswap-web/tsconfig.json`
- **Notes**: Web is in early stages, types should be strict from the start.

### [P2] Web Dashboard - Vehicle CRUD
- **Status**: TODO
- **Assigned to**: 
- **Description**: Complete vehicle listing creation, editing, and deletion in the web dashboard.
- **Acceptance Criteria**:
  - User can create new vehicle listing with photos
  - User can edit existing vehicles
  - User can delete own vehicles
  - Photos upload to Supabase Storage
- **Files to modify**:
  - `autoswap-web/src/app/listings/new/page.tsx`
  - `autoswap-web/src/app/vehicles/[id]/page.tsx`
  - `autoswap-web/src/app/actions.ts`
- **Notes**: Currently only a placeholder page exists.

### [P2] Web Dashboard - Auth Integration
- **Status**: TODO
- **Assigned to**: 
- **Description**: Complete the authentication flow in the web dashboard using Supabase SSR.
- **Acceptance Criteria**:
  - Sign up / sign in flows work
  - Session persists across page refreshes
  - Protected routes redirect to auth
  - Sign out works
- **Files to modify**:
  - `autoswap-web/src/app/auth/page.tsx`
  - `autoswap-web/src/app/auth/callback/route.ts`
  - `autoswap-web/src/lib/supabase/`
- **Notes**: Auth callback exists but UI needs completion.

### [P2] Flutter - Deep Linking Support
- **Status**: TODO
- **Assigned to**: 
- **Description**: Add deep linking support for sharing vehicles and matches via URL.
- **Acceptance Criteria**:
  - `swapride://vehicle/123` opens vehicle detail
  - `swapride://match/456` opens chat for match
  - Universal links work on iOS/Android
- **Files to modify**:
  - `lib/main.dart`
  - `lib/core/router/`
  - `android/app/src/main/AndroidManifest.xml`
  - `ios/Runner/Info.plist`
- **Notes**: GoRouter supports deep linking but configuration is needed.

### [P3] Web Dashboard - Offers Page
- **Status**: TODO
- **Assigned to**: 
- **Description**: Implement the offers/cash adjustment page for the web dashboard.
- **Acceptance Criteria**:
  - Display offers for user's matches
  - Allow sending counter-offers
  - Track offer status (pending, accepted, declined)
- **Files to modify**:
  - `autoswap-web/src/app/offers/page.tsx`
  - `autoswap-web/src/lib/types.ts`
- **Notes**: Page exists as placeholder, needs logic.

### [P3] Flutter - Error Boundary Implementation
- **Status**: TODO
- **Assigned to**: 
- **Description**: Add error boundaries and improve error handling across the app.
- **Acceptance Criteria**:
  - Errors don't crash the app
  - User-friendly error messages displayed
  - Errors logged for debugging
- **Files to modify**:
  - `lib/app.dart`
  - `lib/core/widgets/`
- **Notes**: App needs graceful error handling for production.

### [P3] Documentation - API Reference
- **Status**: TODO
- **Assigned to**: 
- **Description**: Document the Flutter app's public API for repositories and services.
- **Acceptance Criteria**:
  - All public methods have docstrings
  - Repository interfaces documented
  - Service APIs documented
- **Files to modify**:
  - `lib/features/*/data/*.dart`
  - `lib/services/*.dart`
- **Notes**: Internal documentation only currently.

## Completed Tasks

| Task | Completed | Notes |
|------|-----------|-------|
| Multi-agent workflow setup | 2026-06-10 | AGENTS.md, CLAUDE.md, CI, scripts |
| Repository structure | MVP | Feature-first architecture |

## Task Templates

### Feature Task
```markdown
### [Feature Name]
- **Status**: 
- **Assigned to**: 
- **Description**: 
- **Acceptance Criteria**: 
  - 
  - 
- **Files to modify**: 
- **Notes**: 
```

### Bug Task
```markdown
### [Bug Title]
- **Status**: 
- **Priority**: 
- **Description**: 
- **Steps to reproduce**: 
- **Expected behavior**: 
- **Actual behavior**: 
- **Files to investigate**: 
```

### Research Task
```markdown
### [Research Topic]
- **Status**: 
- **Goal**: 
- **Questions to answer**: 
  - 
  - 
- **Deliverable**: 
```

## Priority Guide

| Priority | Description |
|----------|-------------|
| P0 | Critical - blocks development |
| P1 | High - should complete soon |
| P2 | Medium - planned for near term |
| P3 | Low - nice to have |

## Notes

- Tasks are created by Claude and tracked here for visibility
- OpenHands receives task assignments via direct communication
- This file serves as a lightweight task tracker without external dependencies
- Claude assigns tasks to OpenHands based on priority and dependencies
# Agent Guidelines

## Role Overview

- **Claude** is the main builder. Claude drives feature development, makes architectural decisions, and coordinates the overall implementation.
- **OpenHands** is the automation environment. OpenHands handles task execution, CI/CD, and integration work.

## Working Rules

### Task Assignment
- Agents must work only on assigned tasks.
- Agents must not edit unrelated files.
- Agents must stay within their designated scope unless explicitly asked to expand.

### Security
- Agents must not commit secrets, tokens, API keys, .env files, or credentials.
- Never push `.env` files, `google-services.json`, `GoogleService-Info.plist`, or any file containing real credentials.
- Use `.env.example` as a template for environment configuration.

### Code Quality
- Agents must run tests/lint/typecheck/build when available.
- Verify code compiles and passes linting before marking tasks complete.
- For Flutter: run `flutter analyze` and `flutter test`.
- For Next.js: run `npm run typecheck` and `npm run build`.

### Handoff Protocol
When completing a task, agents must summarize:
1. **Changed files** — list all modified and created files
2. **Commands run** — testing, linting, build commands executed
3. **Risks** — any potential issues or considerations
4. **Next steps** — what needs to happen next to continue progress

## Environment

### Stack
- **Flutter** (3.22+) + **Dart 3** for mobile app
- **Next.js 16** + **React 19** + **TypeScript** for web dashboard
- **Supabase** for backend (Auth, Postgres, Storage, Realtime)
- **Riverpod** for state management
- **GoRouter** for navigation

### Key Commands
```bash
# Flutter
flutter pub get
flutter analyze
flutter test
flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...

# Next.js (in autoswap-web/)
npm install
npm run typecheck
npm run build
npm run dev
```

### Repository Structure
```
lib/                    # Flutter app source
├── features/           # Feature modules (auth, cars, chat, etc.)
├── core/               # Shared utilities, router, theme
├── services/           # RevenueCat, Notifications
autoswap-web/           # Next.js web dashboard
supabase/               # Database schema and policies
docs/                   # Architecture and setup docs
```

## Communication

When Claude assigns a task to OpenHands:
1. Claude provides clear task description and acceptance criteria
2. OpenHands executes the task and reports back with summary
3. Claude reviews and provides feedback or moves to next task

## Secrets Management

- All secrets stored in environment variables or `--dart-define` flags
- Never hardcode secrets in source code
- Use `.env.example` as reference for required variables
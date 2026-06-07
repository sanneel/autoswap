# Architecture

A pragmatic Clean Architecture, feature-first.

## Layers

```
                  ┌──────────────────────────┐
   UI / widgets   │  features/*/presentation │
                  └─────────────┬────────────┘
                                │ Riverpod
                  ┌─────────────▼────────────┐
   Controllers    │  StateNotifier / Provider│
                  └─────────────┬────────────┘
                                │
                  ┌─────────────▼────────────┐
   Repositories   │  features/*/data/*_repo  │  ← single source of truth for I/O
                  └──────┬───────────┬───────┘
                         │           │
              Supabase   │           │  RevenueCat / FCM
                   ┌─────▼─┐     ┌───▼─────┐
                   │Postgres│    │services/│
                   │Realtime│    └─────────┘
                   │Storage │
                   └────────┘
```

- Screens consume `AsyncValue` from `*Provider` or `StreamProvider`.
- Controllers (`StateNotifier`s) own ephemeral UI state; they delegate I/O to repositories.
- Repositories speak directly to the Supabase client; they convert raw `Map`s into domain models and return `Result<T>` or throw typed exceptions.
- All wiring lives in `core/di/providers.dart` — no service locator, no singletons.

## Data flow example: sending a chat message

1. `ChatScreen` collects the text and calls `ChatController.send()`.
2. The controller reads `contactUnlockedProvider` (`FutureProvider<bool>`) and the current user id, then calls `ChatRepository.send(...)`.
3. The repository runs the contact filter; on hit it throws `ContactBlockedException`. Otherwise it inserts into `messages`.
4. The Supabase realtime stream `chatRepository.watch(matchId)` (consumed by `messagesStreamProvider`) emits the new row, which rebuilds the chat list.

## Why no codegen for models?

Freezed + json_serializable were intentionally skipped: the schema is small (8 tables), every model has a hand-written `fromMap`/`toInsert`, and reading the SQL alongside Dart in this repo is the quickest way to understand the system. If the model count doubles, switch to codegen.

## Riverpod conventions

- `*Provider` — pure data (`Provider`, `FutureProvider`, `StreamProvider`).
- `*ControllerProvider` — mutable feature state (`StateNotifierProvider<Controller, AsyncValue<…>>`).
- Side effects on auth changes (RevenueCat identify/reset, push token) live in `bootstrap.dart` so they happen exactly once.

## Matching engine

Server-side, in Postgres:

1. `swipes` table records every "interested" / "not_interested" action.
2. On insert, `handle_swipe` runs (`SECURITY DEFINER` so it can read across users).
3. If the swipe is "interested", it checks whether the other party has *ever* swiped "interested" on any of the current swiper's cars.
4. If yes, it calls `try_create_matches_for_pair(uid_a, uid_b)` which enumerates each pair of active cars between the two users and inserts a match row for every pair where `desired_vehicles` on both sides accept the other's car.
5. Uniqueness `(user_a, user_b, car_a, car_b)` with `user_a < user_b` guarantees idempotency.

Matching logic is therefore atomic, transactional, and decoupled from the client.

## Realtime

Only `messages` and `matches` are added to the `supabase_realtime` publication, which keeps Supabase's WS traffic minimal. The chat screen and matches screen subscribe through `SupabaseClient.from(...).stream(primaryKey: [...])`.

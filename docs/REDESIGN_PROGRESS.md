# Redesign progress — Pit Lane

Tracks which screens have been migrated to the Pit Lane design system documented in `DESIGN.md`. Update this file when adding or polishing a screen.

## Status

| Screen | File | Status |
|---|---|---|
| Theme tokens | `lib/core/theme/app_colors.dart` | ✅ Done |
| Typography scale | `lib/core/theme/app_typography.dart` | ✅ Done |
| MaterialApp theme | `lib/core/theme/app_theme.dart` | ✅ Done |
| `SectionLabel` widget | `lib/core/widgets/section_label.dart` | ✅ Done |
| `HairlineCard` widget | `lib/core/widgets/hairline_card.dart` | ✅ Done |
| `StatRow` + `StatCell` | `lib/core/widgets/stat_row.dart` | ✅ Done |
| `MoneyChip` | `lib/core/widgets/money_chip.dart` | ✅ Done |
| `PrimaryButton` (3 variants + meta) | `lib/core/widgets/primary_button.dart` | ✅ Done |
| `EmptyState` editorial layout | `lib/core/widgets/empty_state.dart` | ✅ Done |
| Sign in | `features/auth/.../sign_in_screen.dart` | ✅ Done |
| Sign up | `features/auth/.../sign_up_screen.dart` | ✅ Done |
| Reset password | `features/auth/.../reset_password_screen.dart` | ✅ Done |
| Onboard profile | `features/profile/.../onboard_profile_screen.dart` | ✅ Done |
| Home / Discover (swipe card) | `features/home/...` | ✅ Done |
| Matches | `features/matches/.../matches_screen.dart` | ✅ Done |
| Chat list (Inbox) | `features/chat/.../chats_screen.dart` | ✅ Done |
| Chat room | `features/chat/.../chat_screen.dart` | ✅ Done |
| Profile | `features/profile/.../profile_screen.dart` | ✅ Done |
| Paywall | `features/paywall/.../paywall_screen.dart` | ✅ Done |
| Reports | `features/reports/.../report_screen.dart` | ✅ Done |
| Root shell (bottom nav) | `features/shell/root_shell.dart` | ✅ Done |
| My cars list | `features/cars/.../my_cars_screen.dart` | ✅ Done (softer pass) |
| Create / edit car | `features/cars/.../create_car_screen.dart` | ✅ Done (chip selectors, no boxy dropdowns) |
| Swap preferences | `features/cars/.../swap_preferences_screen.dart` | ✅ Done (3-tile money selector, category chips) |
| `LoadingView` | `lib/core/widgets/loading_view.dart` | ✅ Done (slim linear bar + uppercase caption) |

## Iteration log

### v1.2 — admin screens (loop iters 2 + 3)
- `create_car_screen.dart`: numbered field labels, **pill chip selectors** for fuel + transmission (replaces boxy dropdowns), section eyebrow "07 / NEW LISTING", "Add the essentials." display headline
- `swap_preferences_screen.dart`: 3-tile money selector with sub-labels ("Even / Straight swap", "Want money / They top up", "Add money / You top up"), in-exchange-for cards with horizontal **category pills**, removed all radio-list aesthetics

### v1.1 — softening pass (loop iter 1)
User feedback: *"UI is bad, very overloaded. Every button is squared, don't make like that."*
- Button corner radius: `12 → 22` (PrimaryButton), `12 → 22` (theme), action buttons `12 → 28` (more pillow-y)
- Card radius: `0 → 18` (HairlineCard default), `0 → 18` (theme CardTheme)
- Input radius: `12 → 16`
- Default card border: `borderInk → borderSoft` (warm tan instead of near-black)
- Removed ink-bar headers on match cards' top strip — softened to borderSoft
- Removed the 4px ink tick on Inbox rows
- Refresh icon-chip → circular
- Chat send button → circle (was square)
- Swipe card chrome: removed LOT badge + owner pill overlay; replaced with single owner row on photo gradient
- Dropped instrument-cluster `StatRow` from swipe card → inline soft stats with thin dividers (less boxy)
- Paywall hero block: square → 28px radius
- Demo banner on sign-in: square → 22px radius with `clipBehavior`

## Live screenshots of the current state

Captured on emulator-5554 (Android 17 API 37, x86_64), saved to `/screens/`:

| # | File | Status |
|---|---|---|
| 01 | screens/01-signin.png | ✅ |
| 02 | screens/02-signup.png | ✅ |
| 03 | screens/03-discover.png | ✅ stat row fix applied |
| 04 | screens/04-matches.png | ✅ |
| 05 | screens/05-inbox.png | ✅ |
| 06 | screens/06-profile.png | ✅ |
| 07 | screens/07-paywall.png | ✅ |
| 08 | screens/08-chat.png | ✅ empty state |
| 10 | screens/10-chat-populated.png | ✅ |

## Picking the next screen

Choose by **frequency × visibility**:
1. Swipe card and Matches — every session
2. Profile, Chat list — most sessions
3. Auth flow — first session only
4. My cars / Create / Prefs — power-user only

The remaining three (`my_cars`, `create_car`, `swap_preferences`) are admin-flow screens; redesign with the same idiom: `SectionLabel` eyebrow at top, `HairlineCard` containers, `StatRow` for any numerics, mono for prices/years/mileage, signal-red only for irreversible CTAs.

## How to continue with `/loop`

Drop a file into the project root or invoke:

```
/loop Continue applying the Pit Lane design system (see docs/DESIGN.md) to the next pending screen in docs/REDESIGN_PROGRESS.md. Update the table when done. Run `flutter analyze` after each change. Stop when the table shows all rows ✅.
```

Each iteration picks one screen, edits it, marks it done. The model decides its own pacing.

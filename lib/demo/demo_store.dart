import 'dart:async';

import '../features/cars/data/models/car.dart';
import '../features/chat/data/models/message.dart';
import '../features/matches/data/models/match.dart';
import '../features/profile/data/models/profile.dart';
import 'demo_data.dart';

/// In-memory demo backend. Activated automatically when Supabase env vars
/// are missing, so the app boots into a fully-functional offline sandbox.
///
/// State lives on static members — this is intentional for an MVP demo. Riverpod
/// providers consult [isActive] inside repositories to choose the demo branch.
class DemoStore {
  DemoStore._();

  /// True when running without real Supabase credentials.
  static bool isActive = false;

  /// Currently signed-in demo user id. null = signed out.
  static String? currentUserId;

  /// The fixed demo user (so we can pre-seed cars / matches for them).
  static const demoUserId = 'demo-alex';

  static bool contactUnlocked = false;

  // --- streams used to fake real-time
  static final StreamController<void> _session =
      StreamController<void>.broadcast();
  static Stream<void> get sessionChanges => _session.stream;

  static final StreamController<List<SwapMatch>> _matchesController =
      StreamController<List<SwapMatch>>.broadcast();
  static Stream<List<SwapMatch>> get matchesChanges =>
      _matchesController.stream;

  static final Map<String, StreamController<List<ChatMessage>>>
      _chatControllers = {};

  // --- mutable working set populated by [DemoData.seed]
  static final Map<String, Profile> profiles = {};
  static final List<Car> cars = [];
  static final List<SwapMatch> matches = [];
  static final Map<String, List<ChatMessage>> messagesByMatch = {};
  static final Set<String> swipedCarIds = {};

  /// Map of car-id -> owner-id. When the demo user swipes "interested" on one
  /// of these cars, a match is instantly created (simulating reciprocal interest).
  static final Map<String, String> mutualInterestCarToOwner = {};

  /// Idempotent.
  static void init() {
    if (profiles.isNotEmpty) return;
    DemoData.seed();
  }

  // --- session

  static void signIn({String? withName}) {
    currentUserId = demoUserId;
    if (withName != null && withName.trim().isNotEmpty) {
      final me = profiles[demoUserId];
      if (me != null) {
        profiles[demoUserId] = me.copyWith(fullName: withName.trim());
      }
    }
    _session.add(null);
    _matchesController.add(List.of(matches));
  }

  static void signOut() {
    currentUserId = null;
    swipedCarIds.clear();
    contactUnlocked = false;
    _session.add(null);
  }

  // --- chat streams

  static Stream<List<ChatMessage>> watchMessages(String matchId) {
    final c = _chatControllers.putIfAbsent(
      matchId,
      () => StreamController<List<ChatMessage>>.broadcast(),
    );
    Future.microtask(() {
      if (!c.isClosed) {
        c.add(List.of(messagesByMatch[matchId] ?? const []));
      }
    });
    return c.stream;
  }

  static void addMessage(String matchId, ChatMessage m) {
    final list = messagesByMatch.putIfAbsent(matchId, () => []);
    list.add(m);
    _chatControllers[matchId]?.add(List.of(list));
  }

  static void markMessagesRead(String matchId, String viewerId) {
    final list = messagesByMatch[matchId];
    if (list == null) return;
    var changed = false;
    for (var i = 0; i < list.length; i++) {
      final m = list[i];
      if (m.senderId != viewerId && m.readAt == null) {
        list[i] = m.copyWith(readAt: DateTime.now());
        changed = true;
      }
    }
    if (changed) _chatControllers[matchId]?.add(List.of(list));
  }

  // --- match creation on swipe

  /// If [carId] is in the mutual-interest preset, create a SwapMatch with the
  /// demo user as one party. Returns the new match, or null if nothing happened.
  static SwapMatch? maybeCreateMatchOnInterestedSwipe(String carId) {
    final ownerId = mutualInterestCarToOwner[carId];
    final me = currentUserId;
    if (ownerId == null || me == null) return null;

    final alreadyMatched = matches.any((m) =>
        (m.userA == me && m.userB == ownerId) ||
        (m.userA == ownerId && m.userB == me));
    if (alreadyMatched) return null;

    final myCar = cars.firstWhere(
      (c) => c.ownerId == me,
      orElse: () => cars.first,
    );
    final theirCar = cars.firstWhere((c) => c.id == carId);

    // Canonical order: user_a < user_b (lex).
    final ua = me.compareTo(ownerId) < 0 ? me : ownerId;
    final ub = me.compareTo(ownerId) < 0 ? ownerId : me;
    final ca = ua == me ? myCar : theirCar;
    final cb = ua == me ? theirCar : myCar;

    final match = SwapMatch(
      id: 'match-${DateTime.now().millisecondsSinceEpoch}',
      userA: ua,
      userB: ub,
      carA: ca,
      carB: cb,
      status: 'active',
      createdAt: DateTime.now(),
    );
    matches.insert(0, match);
    _matchesController.add(List.of(matches));
    return match;
  }

  // --- counters
  static int countMatches({
    required String userId,
    String status = 'active',
  }) =>
      matches
          .where((m) =>
              (m.userA == userId || m.userB == userId) && m.status == status)
          .length;
}

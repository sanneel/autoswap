import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../data/models/profile.dart';

final myProfileProvider = FutureProvider<Profile?>((ref) async {
  ref.watch(authStateChangesProvider);
  return ref.watch(profileRepositoryProvider).getMine();
});

final profileStatsProvider = FutureProvider<({int activeMatches, int completedSwaps})>(
  (ref) async {
    final id = ref.watch(currentUserIdProvider);
    if (id == null) return (activeMatches: 0, completedSwaps: 0);
    final repo = ref.watch(profileRepositoryProvider);
    final a = await repo.countActiveMatches(id);
    final c = await repo.countCompletedSwaps(id);
    return (activeMatches: a, completedSwaps: c);
  },
);

class ProfileController extends StateNotifier<AsyncValue<Profile?>> {
  ProfileController(this._ref) : super(const AsyncValue.loading()) {
    _load();
  }
  final Ref _ref;

  Future<void> _load() async {
    try {
      final p = await _ref.read(profileRepositoryProvider).getMine();
      state = AsyncValue.data(p);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> saveBasics({
    required String fullName,
    String? city,
    String? country,
    String? phone,
    String? bio,
  }) async {
    final id = _ref.read(currentUserIdProvider);
    if (id == null) return;
    final current = state.value;
    final next = (current ?? Profile(id: id, fullName: fullName)).copyWith(
      fullName: fullName,
      city: city,
      country: country,
      phone: phone,
      bio: bio,
    );
    final saved =
        await _ref.read(profileRepositoryProvider).upsertMine(next);
    state = AsyncValue.data(saved);
    _ref.invalidate(myProfileProvider);
  }

  Future<void> uploadAvatar(File file) async {
    final id = _ref.read(currentUserIdProvider);
    if (id == null) return;
    final res = await _ref
        .read(storageRepositoryProvider)
        .uploadAvatar(file, userId: id);
    await _ref.read(profileRepositoryProvider).updateAvatar(res.url);
    final p = await _ref.read(profileRepositoryProvider).getMine();
    state = AsyncValue.data(p);
    _ref.invalidate(myProfileProvider);
  }
}

final profileControllerProvider =
    StateNotifierProvider<ProfileController, AsyncValue<Profile?>>(
  (ref) => ProfileController(ref),
);

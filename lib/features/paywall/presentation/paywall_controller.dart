import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';

final contactUnlockedProvider = FutureProvider<bool>((ref) async {
  ref.watch(authStateChangesProvider);
  return ref.watch(paywallRepositoryProvider).isUnlocked();
});

class PaywallController extends StateNotifier<AsyncValue<bool>> {
  PaywallController(this._ref) : super(const AsyncValue.data(false));
  final Ref _ref;

  Future<bool> purchase() async {
    state = const AsyncValue.loading();
    try {
      final ok = await _ref.read(paywallRepositoryProvider).purchase();
      state = AsyncValue.data(ok);
      _ref.invalidate(contactUnlockedProvider);
      return ok;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> restore() async {
    state = const AsyncValue.loading();
    try {
      final ok = await _ref.read(paywallRepositoryProvider).restore();
      state = AsyncValue.data(ok);
      _ref.invalidate(contactUnlockedProvider);
      return ok;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }
}

final paywallControllerProvider =
    StateNotifierProvider<PaywallController, AsyncValue<bool>>(
  (ref) => PaywallController(ref),
);

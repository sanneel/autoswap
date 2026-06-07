import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/error/failures.dart';
import '../data/auth_repository.dart';

class AuthController extends StateNotifier<AsyncValue<void>> {
  AuthController(this._repo, this._ref) : super(const AsyncValue.data(null));
  final AuthRepository _repo;
  final Ref _ref;

  Future<Failure?> signIn(String email, String password) async {
    state = const AsyncValue.loading();
    final res = await _repo.signIn(email: email, password: password);
    return res.when(
      ok: (_) {
        state = const AsyncValue.data(null);
        return null;
      },
      err: (f) {
        state = AsyncValue.error(f, StackTrace.current);
        return f;
      },
    );
  }

  Future<Failure?> signUp(String email, String password) async {
    state = const AsyncValue.loading();
    final res = await _repo.signUp(email: email, password: password);
    return res.when(
      ok: (_) {
        state = const AsyncValue.data(null);
        return null;
      },
      err: (f) {
        state = AsyncValue.error(f, StackTrace.current);
        return f;
      },
    );
  }

  Future<Failure?> sendPasswordReset(String email) async {
    state = const AsyncValue.loading();
    final res = await _repo.sendPasswordReset(email);
    return res.when(
      ok: (_) {
        state = const AsyncValue.data(null);
        return null;
      },
      err: (f) {
        state = AsyncValue.error(f, StackTrace.current);
        return f;
      },
    );
  }

  Future<void> signOut() async {
    await _repo.signOut();
    await _ref.read(notificationsServiceProvider).clearTokenOnLogout();
    await _ref.read(revenueCatServiceProvider).reset();
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AsyncValue<void>>(
  (ref) => AuthController(ref.watch(authRepositoryProvider), ref),
);

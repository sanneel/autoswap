import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/error/failures.dart';
import '../../../core/utils/result.dart';
import '../../../demo/demo_store.dart';

class AuthRepository {
  AuthRepository(this._supabase);
  final SupabaseClient _supabase;

  User? get currentUser => _supabase.auth.currentUser;
  Stream<AuthState> get changes => _supabase.auth.onAuthStateChange;

  Future<Result<void>> signIn({
    required String email,
    required String password,
  }) async {
    if (DemoStore.isActive) {
      // Demo mode: any credentials are accepted.
      DemoStore.signIn();
      return const Ok(null);
    }
    try {
      final res = await _supabase.auth
          .signInWithPassword(email: email, password: password);
      if (res.user == null) {
        return const Err(AuthFailure('Invalid credentials'));
      }
      return const Ok(null);
    } on AuthException catch (e) {
      return Err(AuthFailure(e.message));
    } catch (e) {
      return Err(UnknownFailure(e.toString()));
    }
  }

  Future<Result<void>> signUp({
    required String email,
    required String password,
  }) async {
    if (DemoStore.isActive) {
      DemoStore.signIn();
      return const Ok(null);
    }
    try {
      final res = await _supabase.auth.signUp(email: email, password: password);
      if (res.user == null) {
        return const Err(AuthFailure('Sign-up failed'));
      }
      return const Ok(null);
    } on AuthException catch (e) {
      return Err(AuthFailure(e.message));
    } catch (e) {
      return Err(UnknownFailure(e.toString()));
    }
  }

  Future<Result<void>> sendPasswordReset(String email) async {
    if (DemoStore.isActive) {
      // Pretend we sent an email.
      return const Ok(null);
    }
    try {
      await _supabase.auth.resetPasswordForEmail(email);
      return const Ok(null);
    } on AuthException catch (e) {
      return Err(AuthFailure(e.message));
    } catch (e) {
      return Err(UnknownFailure(e.toString()));
    }
  }

  Future<void> signOut() async {
    if (DemoStore.isActive) {
      DemoStore.signOut();
      return;
    }
    await _supabase.auth.signOut();
  }
}

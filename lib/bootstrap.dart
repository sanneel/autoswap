import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/config/env.dart';
import 'core/di/providers.dart';
import 'demo/demo_store.dart';

/// Initializes Supabase, Firebase, RevenueCat and FCM.
Future<ProviderContainer> bootstrap() async {
  // No Supabase env -> demo mode: pre-seed in-memory data, skip real auth.
  if (!Env.hasSupabase) {
    debugPrint(
      'SwapRide demo mode active — Supabase env vars missing. '
      'Sign in with any credentials, browse pre-seeded data.',
    );
    DemoStore.isActive = true;
    DemoStore.init();
  }
  // Supabase still needs to be initialized so providers don't crash, even in
  // demo mode (none of the demo paths actually touch the network).
  await Supabase.initialize(
    url: Env.hasSupabase ? Env.supabaseUrl : 'http://127.0.0.1:54321',
    anonKey: Env.hasSupabase ? Env.supabaseAnonKey : 'placeholder-anon-key',
    debug: kDebugMode,
  );

  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase init skipped: $e');
  }

  final container = ProviderContainer();

  // RevenueCat — identify if already signed in.
  final userId = container.read(supabaseProvider).auth.currentUser?.id;
  await container.read(revenueCatServiceProvider).init(appUserId: userId);

  // FCM — request perms + persist push token.
  await container.read(notificationsServiceProvider).init();

  // Identify on subsequent auth changes.
  container.read(supabaseProvider).auth.onAuthStateChange.listen((s) async {
    final id = s.session?.user.id;
    if (id != null) {
      await container.read(revenueCatServiceProvider).identify(id);
    } else {
      await container.read(revenueCatServiceProvider).reset();
    }
  });

  return container;
}

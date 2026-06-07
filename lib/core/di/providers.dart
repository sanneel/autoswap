import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../features/auth/data/auth_repository.dart';
import '../../features/cars/data/cars_repository.dart';
import '../../features/cars/data/storage_repository.dart';
import '../../features/chat/data/chat_repository.dart';
import '../../features/home/data/feed_repository.dart';
import '../../features/matches/data/matches_repository.dart';
import '../../features/paywall/data/paywall_repository.dart';
import '../../features/profile/data/profile_repository.dart';
import '../../features/reports/data/reports_repository.dart';
import '../../services/notifications_service.dart';
import '../../services/revenuecat_service.dart';
import '../../demo/demo_store.dart';

/// Direct access to the Supabase client.
final supabaseProvider = Provider<SupabaseClient>((_) => Supabase.instance.client);

final loggerProvider = Provider<Logger>((_) => Logger());

/// Emits whenever the current auth session changes (real or demo).
final authStateChangesProvider = StreamProvider<Object?>((ref) {
  if (DemoStore.isActive) return DemoStore.sessionChanges;
  return ref.watch(supabaseProvider).auth.onAuthStateChange;
});

final currentUserIdProvider = Provider<String?>((ref) {
  ref.watch(authStateChangesProvider);
  if (DemoStore.isActive) return DemoStore.currentUserId;
  return ref.read(supabaseProvider).auth.currentUser?.id;
});

/// Single truth for "are we signed in?". Used by the router redirect.
final loggedInProvider = Provider<bool>((ref) {
  ref.watch(authStateChangesProvider);
  if (DemoStore.isActive) return DemoStore.currentUserId != null;
  return ref.read(supabaseProvider).auth.currentUser != null;
});

// ---- repositories
final authRepositoryProvider =
    Provider<AuthRepository>((ref) => AuthRepository(ref.watch(supabaseProvider)));

final profileRepositoryProvider = Provider<ProfileRepository>(
  (ref) => ProfileRepository(ref.watch(supabaseProvider)),
);

final carsRepositoryProvider =
    Provider<CarsRepository>((ref) => CarsRepository(ref.watch(supabaseProvider)));

final storageRepositoryProvider = Provider<StorageRepository>(
  (ref) => StorageRepository(ref.watch(supabaseProvider)),
);

final feedRepositoryProvider =
    Provider<FeedRepository>((ref) => FeedRepository(ref.watch(supabaseProvider)));

final matchesRepositoryProvider = Provider<MatchesRepository>(
  (ref) => MatchesRepository(ref.watch(supabaseProvider)),
);

final chatRepositoryProvider =
    Provider<ChatRepository>((ref) => ChatRepository(ref.watch(supabaseProvider)));

final reportsRepositoryProvider = Provider<ReportsRepository>(
  (ref) => ReportsRepository(ref.watch(supabaseProvider)),
);

final paywallRepositoryProvider = Provider<PaywallRepository>(
  (ref) => PaywallRepository(
    ref.watch(supabaseProvider),
    ref.watch(revenueCatServiceProvider),
  ),
);

// ---- services
final revenueCatServiceProvider =
    Provider<RevenueCatService>((_) => RevenueCatService());

final notificationsServiceProvider =
    Provider<NotificationsService>((ref) => NotificationsService(
          ref.watch(supabaseProvider),
        ));

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/reset_password_screen.dart';
import '../../features/auth/presentation/sign_in_screen.dart';
import '../../features/auth/presentation/sign_up_screen.dart';
import '../../features/cars/presentation/create_car_screen.dart';
import '../../features/cars/presentation/my_cars_screen.dart';
import '../../features/cars/presentation/swap_preferences_screen.dart';
import '../../features/chat/presentation/chat_screen.dart';
import '../../features/chat/presentation/chats_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/matches/presentation/matches_screen.dart';
import '../../features/paywall/presentation/paywall_screen.dart';
import '../../features/profile/presentation/onboard_profile_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/reports/presentation/report_screen.dart';
import '../../demo/demo_store.dart';
import '../../features/shell/root_shell.dart';
import '../di/providers.dart';
import 'routes.dart';

final routerProvider = Provider<GoRouter>((ref) {
  // Re-evaluate redirects on every auth event.
  ref.watch(authStateChangesProvider);
  final refreshStream = DemoStore.isActive
      ? DemoStore.sessionChanges
      : ref.watch(supabaseProvider).auth.onAuthStateChange;

  return GoRouter(
    initialLocation: Routes.signIn,
    refreshListenable: GoRouterRefreshStream(refreshStream),
    redirect: (context, state) {
      final loggedIn = ref.read(loggedInProvider);
      final loc = state.matchedLocation;

      final atAuth = loc == Routes.signIn ||
          loc == Routes.signUp ||
          loc == Routes.resetPassword;

      if (!loggedIn && !atAuth) return Routes.signIn;
      if (loggedIn && atAuth) return Routes.home;
      return null;
    },
    routes: [
      GoRoute(
        path: Routes.signIn,
        builder: (_, __) => const SignInScreen(),
      ),
      GoRoute(
        path: Routes.signUp,
        builder: (_, __) => const SignUpScreen(),
      ),
      GoRoute(
        path: Routes.resetPassword,
        builder: (_, __) => const ResetPasswordScreen(),
      ),
      GoRoute(
        path: Routes.onboardProfile,
        builder: (_, __) => const OnboardProfileScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => RootShell(child: child),
        routes: [
          GoRoute(
            path: Routes.home,
            builder: (_, __) => const HomeScreen(),
          ),
          GoRoute(
            path: Routes.matches,
            builder: (_, __) => const MatchesScreen(),
          ),
          GoRoute(
            path: Routes.chats,
            builder: (_, __) => const ChatsScreen(),
          ),
          GoRoute(
            path: Routes.profile,
            builder: (_, __) => const ProfileScreen(),
          ),
        ],
      ),
      GoRoute(
        path: Routes.myCars,
        builder: (_, __) => const MyCarsScreen(),
      ),
      GoRoute(
        path: Routes.createCar,
        builder: (_, __) => const CreateCarScreen(),
      ),
      GoRoute(
        path: Routes.editCar,
        builder: (_, state) => CreateCarScreen(
          carId: state.pathParameters['carId'],
        ),
      ),
      GoRoute(
        path: Routes.carPreferences,
        builder: (_, state) => SwapPreferencesScreen(
          carId: state.pathParameters['carId']!,
        ),
      ),
      GoRoute(
        path: Routes.chatRoom,
        builder: (_, state) => ChatScreen(
          matchId: state.pathParameters['matchId']!,
        ),
      ),
      GoRoute(
        path: Routes.paywall,
        builder: (_, __) => const PaywallScreen(),
      ),
      GoRoute(
        path: Routes.report,
        builder: (_, state) {
          final extra = state.extra as Map<String, dynamic>? ?? const {};
          return ReportScreen(
            reportedUserId: extra['userId'] as String?,
            reportedCarId: extra['carId'] as String?,
          );
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Route not found: ${state.uri}')),
    ),
  );
});

/// Bridges any [Stream] to [Listenable] so GoRouter refreshes on auth changes.
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _sub = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _sub;

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}

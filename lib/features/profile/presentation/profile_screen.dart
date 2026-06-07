import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/loading_view.dart';
import '../../../core/widgets/section_label.dart';
import '../../../core/widgets/stat_row.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../cars/presentation/cars_controller.dart';
import 'profile_controller.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(myProfileProvider);
    final carsAsync = ref.watch(myCarsProvider);
    final statsAsync = ref.watch(profileStatsProvider);

    return Scaffold(
      backgroundColor: AppColors.paper,
      body: SafeArea(
        child: profileAsync.when(
          loading: () => const LoadingView(),
          error: (e, _) => Center(
            child: Text('$e', style: AppType.body(color: AppColors.mist)),
          ),
          data: (profile) {
            if (profile == null) {
              return EmptyState(
                eyebrow: 'NEW USER',
                icon: Icons.person_outline,
                title: 'Set up\nyour\ngarage.',
                action: ElevatedButton(
                  onPressed: () => context.push(Routes.onboardProfile),
                  child: const Text('GET STARTED'),
                ),
              );
            }
            return RefreshIndicator(
              color: AppColors.ink,
              backgroundColor: AppColors.surface,
              onRefresh: () async {
                ref.invalidate(myProfileProvider);
                ref.invalidate(myCarsProvider);
                ref.invalidate(profileStatsProvider);
              },
              child: ListView(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: SectionLabel(
                          text: 'OWNER · ${profile.id.split('-').last.toUpperCase()}',
                          index: '04',
                        ),
                      ),
                      IconButton(
                        tooltip: 'Sign out',
                        onPressed: () async {
                          await ref
                              .read(authControllerProvider.notifier)
                              .signOut();
                          if (context.mounted) context.go(Routes.signIn);
                        },
                        icon: const Icon(Icons.logout, size: 18),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderSoft),
                    ),
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: AppColors.borderSoft),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: SizedBox(
                              width: 76,
                              height: 76,
                              child: profile.avatarUrl != null
                                  ? CachedNetworkImage(
                                      imageUrl: profile.avatarUrl!,
                                      fit: BoxFit.cover,
                                    )
                                  : Container(
                                      color: AppColors.surfaceSunken,
                                      alignment: Alignment.center,
                                      child: Text(
                                        profile.fullName.isEmpty
                                            ? '?'
                                            : profile.fullName[0].toUpperCase(),
                                        style: AppType.display2(),
                                      ),
                                    ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(profile.fullName,
                                  style: AppType.display2().copyWith(
                                      height: 1.0)),
                              const SizedBox(height: 6),
                              Text(
                                [profile.city, profile.country]
                                    .whereType<String>()
                                    .map((s) => s.toUpperCase())
                                    .join(' · '),
                                style: AppType.eyebrow(),
                              ),
                              if (profile.contactUnlocked) ...[
                                const SizedBox(height: 10),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                  color: AppColors.olive,
                                  child: Text(
                                    'CONTACT UNLOCKED',
                                    style: AppType.eyebrow(
                                        color: AppColors.surface),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // stats
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderSoft),
                    ),
                    child: StatRow(
                      borderTop: false,
                      borderBottom: false,
                      height: 72,
                      items: [
                        StatCell(
                          label: 'CARS',
                          value: carsAsync.maybeWhen(
                            data: (l) =>
                                l.length.toString().padLeft(2, '0'),
                            orElse: () => '——',
                          ),
                        ),
                        StatCell(
                          label: 'MATCHES',
                          value: statsAsync.maybeWhen(
                            data: (s) => s.activeMatches
                                .toString()
                                .padLeft(2, '0'),
                            orElse: () => '——',
                          ),
                        ),
                        StatCell(
                          label: 'SWAPS',
                          value: statsAsync.maybeWhen(
                            data: (s) => s.completedSwaps
                                .toString()
                                .padLeft(2, '0'),
                            orElse: () => '——',
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                  Text('05 — ADMINISTRATION', style: AppType.eyebrow()),
                  const SizedBox(height: 12),
                  _ListRow(
                    label: 'MY CARS',
                    sub: 'Manage your listings and photos',
                    onTap: () => context.push(Routes.myCars),
                  ),
                  _ListRow(
                    label: profile.contactUnlocked
                        ? 'CONTACT EXCHANGE'
                        : 'UNLOCK CONTACT EXCHANGE',
                    sub: profile.contactUnlocked
                        ? 'Phone, email and links are allowed'
                        : 'One-time purchase. Lifetime unlock.',
                    accent: !profile.contactUnlocked,
                    onTap: () => context.push(Routes.paywall),
                  ),
                  _ListRow(
                    label: 'REPORT',
                    sub: 'Spam, fake vehicle, scam, abuse',
                    onTap: () => context.push(Routes.report),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _ListRow extends StatelessWidget {
  const _ListRow({
    required this.label,
    required this.sub,
    required this.onTap,
    this.accent = false,
  });
  final String label;
  final String sub;
  final VoidCallback onTap;
  final bool accent;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.borderInk)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: AppType.eyebrow(
                      color: accent ? AppColors.signal : AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(sub, style: AppType.body(color: AppColors.mist)),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward,
              size: 18,
              color: accent ? AppColors.signal : AppColors.ink,
            ),
          ],
        ),
      ),
    );
  }
}

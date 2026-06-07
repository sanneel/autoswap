import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/car_data.dart';
import '../../../core/di/providers.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/loading_view.dart';
import '../../../core/widgets/money_chip.dart';
import 'matches_controller.dart';

class MatchesScreen extends ConsumerWidget {
  const MatchesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final viewerId = ref.watch(currentUserIdProvider);
    final async = ref.watch(matchesProvider);

    return Scaffold(
      backgroundColor: AppColors.paper,
      body: SafeArea(
        child: async.when(
          loading: () => const LoadingView(),
          error: (e, _) => Center(
            child: Text('$e', style: AppType.body(color: AppColors.mist)),
          ),
          data: (matches) {
            if (matches.isEmpty) {
              return const EmptyState(
                eyebrow: 'შეთავაზებები',
                icon: Icons.handshake_outlined,
                title: 'შეთავაზება ჯერ არ არის',
                message: 'როცა მფლობელი გაცვლას დაგიდასტურებს, აქ გამოჩნდება.',
              );
            }
            return RefreshIndicator(
              color: AppColors.signal,
              backgroundColor: AppColors.surface,
              onRefresh: () async => ref.invalidate(matchesProvider),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 88),
                children: [
                  Text('შეთავაზებები', style: AppType.display1()),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _Tab(text: 'შემომავალი', selected: true),
                      const SizedBox(width: 8),
                      _Tab(text: 'გაგზავნილი', selected: false),
                    ],
                  ),
                  const SizedBox(height: 12),
                  for (var i = 0; i < matches.length; i++) ...[
                    _OfferRow(match: matches[i], viewerId: viewerId ?? ''),
                    if (i != matches.length - 1) const SizedBox(height: 10),
                  ],
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({required this.text, required this.selected});
  final String text;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 42,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? AppColors.signalWash : AppColors.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: selected ? AppColors.signal : AppColors.borderSoft,
          ),
        ),
        child: Text(
          text,
          style: AppType.bodyStrong(
            color: selected ? AppColors.signal : AppColors.ink,
          ),
        ),
      ),
    );
  }
}

class _OfferRow extends StatelessWidget {
  const _OfferRow({required this.match, required this.viewerId});
  final dynamic match;
  final String viewerId;

  @override
  Widget build(BuildContext context) {
    final other = match.otherCarFor(viewerId);
    final mine = match.myCarFor(viewerId);

    return InkWell(
      onTap: () => context.push(Routes.chatRoomFor(match.id as String)),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.borderSoft),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _Thumb(url: mine.photos.isNotEmpty ? mine.photos.first.url : null),
                const SizedBox(width: 8),
                _Thumb(
                  url: other.photos.isNotEmpty ? other.photos.first.url : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${mine.title} ↔ ${other.title}',
                          style: AppType.title(),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 4),
                      Text(
                        '${CarData.label(other.fuelType)} · ${CarData.label(other.transmission)}',
                        style: AppType.bodySmall(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                MoneyChip(preference: other.preference),
                const Spacer(),
                Text('აქტიური', style: AppType.bodyStrong(color: AppColors.olive)),
                const SizedBox(width: 8),
                const Icon(Icons.chevron_right, color: AppColors.signal),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Thumb extends StatelessWidget {
  const _Thumb({required this.url});
  final String? url;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        width: 58,
        height: 58,
        child: url == null
            ? const ColoredBox(
                color: AppColors.surfaceSunken,
                child: Icon(Icons.directions_car, color: AppColors.mist),
              )
            : CachedNetworkImage(
                imageUrl: url!,
                fit: BoxFit.cover,
                placeholder: (_, __) =>
                    Container(color: AppColors.surfaceSunken),
                errorWidget: (_, __, ___) => const ColoredBox(
                  color: AppColors.surfaceSunken,
                  child: Icon(Icons.directions_car, color: AppColors.mist),
                ),
              ),
      ),
    );
  }
}

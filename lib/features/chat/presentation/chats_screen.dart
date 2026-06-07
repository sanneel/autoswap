import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/di/providers.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/loading_view.dart';
import '../../../core/widgets/section_label.dart';
import '../../matches/presentation/matches_controller.dart';

/// Conversation list = match list, presented as a phonebook.
class ChatsScreen extends ConsumerWidget {
  const ChatsScreen({super.key});

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
                eyebrow: 'NO CONVERSATIONS',
                icon: Icons.chat_bubble_outline,
                title: 'Inbox\nstands\nempty.',
                message:
                    'When you match with someone, the conversation opens here.',
              );
            }
            return ListView(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
              children: [
                SectionLabel(
                  text: 'INBOX',
                  index: '03',
                  trailing: Text(
                    '${matches.length} OPEN',
                    style: AppType.eyebrow(color: AppColors.ink),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.borderSoft),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children: [
                      for (var i = 0; i < matches.length; i++) ...[
                        _ChatRow(
                          match: matches[i],
                          viewerId: viewerId ?? '',
                          ordinal: i + 1,
                        ),
                        if (i != matches.length - 1)
                          Container(
                            height: 1,
                            color: AppColors.borderSoft,
                          ),
                      ],
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ChatRow extends StatelessWidget {
  const _ChatRow({
    required this.match,
    required this.viewerId,
    required this.ordinal,
  });
  final dynamic match;
  final String viewerId;
  final int ordinal;

  @override
  Widget build(BuildContext context) {
    final other = match.otherCarFor(viewerId);
    final cover =
        other.photos.isNotEmpty ? other.photos.first.url as String : null;

    return InkWell(
      onTap: () => context.push(Routes.chatRoomFor(match.id as String)),
      splashColor: Colors.transparent,
      highlightColor: const Color(0x08000000),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: SizedBox(
                width: 56,
                height: 56,
                child: cover != null
                    ? CachedNetworkImage(
                        imageUrl: cover, fit: BoxFit.cover)
                    : Container(
                        color: AppColors.surfaceSunken,
                        alignment: Alignment.center,
                        child: const Icon(Icons.directions_car,
                            color: AppColors.mist),
                      ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        (other.ownerName as String?)?.toUpperCase() ?? '—',
                        style: AppType.eyebrow(color: AppColors.ink),
                      ),
                      const SizedBox(width: 8),
                      Container(width: 4, height: 4, color: AppColors.mist),
                      const SizedBox(width: 8),
                      Text(
                        'M.${ordinal.toString().padLeft(2, '0')}',
                        style: AppType.mono(color: AppColors.mist),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    other.title as String,
                    style: AppType.title(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward, size: 18, color: AppColors.ink),
          ],
        ),
      ),
    );
  }
}

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/money_chip.dart';
import '../../../cars/data/models/car.dart';

/// Vertical swipe card. Softer than the v1: rounded corners, far less chrome.
/// One photo, owner avatar+name overlay, title, three compact stats, wants row.
class SwipeCard extends StatelessWidget {
  const SwipeCard({super.key, required this.car, this.lotNumber});
  final Car car;
  final String? lotNumber;

  @override
  Widget build(BuildContext context) {
    final cover = car.photos.isNotEmpty ? car.photos.first.url : null;
    final firstDesire =
        car.desired.isNotEmpty ? car.desired.first.describe() : 'Open to any';
    final ownerInitial = (car.ownerName ?? 'O')
        .trim()
        .split(' ')
        .map((w) => w.isEmpty ? '' : w[0])
        .take(2)
        .join()
        .toUpperCase();

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.borderSoft, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ===== Photo + owner badge =========================================
          Expanded(
            child: Stack(
              fit: StackFit.expand,
              children: [
                cover != null
                    ? CachedNetworkImage(
                        imageUrl: cover,
                        fit: BoxFit.cover,
                        placeholder: (_, __) =>
                            Container(color: AppColors.surfaceSunken),
                        errorWidget: (_, __, ___) => Container(
                          color: AppColors.surfaceSunken,
                          alignment: Alignment.center,
                          child: const Icon(Icons.directions_car,
                              size: 64, color: AppColors.mist),
                        ),
                      )
                    : Container(
                        color: AppColors.surfaceSunken,
                        alignment: Alignment.center,
                        child: const Icon(Icons.directions_car,
                            size: 64, color: AppColors.mist),
                      ),
                // Bottom gradient for legibility
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 110,
                  child: IgnorePointer(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.45),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                // Owner row (bottom-left, on gradient)
                Positioned(
                  left: 14,
                  right: 14,
                  bottom: 12,
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: AppColors.surface,
                        backgroundImage: car.ownerAvatarUrl != null
                            ? CachedNetworkImageProvider(car.ownerAvatarUrl!)
                            : null,
                        child: car.ownerAvatarUrl == null
                            ? Text(
                                ownerInitial,
                                style: AppType.bodySmall(color: AppColors.ink)
                                    .copyWith(fontWeight: FontWeight.w700),
                              )
                            : null,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          car.ownerName ?? 'Owner',
                          style: AppType.bodyStrong(color: AppColors.surface),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      MoneyChip(preference: car.preference),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ===== Caption ====================================================
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 16, 18, 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        car.make,
                        style: AppType.bodySmall(color: AppColors.mist),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        car.model,
                        style: AppType.display2().copyWith(height: 1.05),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (lotNumber != null)
                  Text(
                    'NO. $lotNumber',
                    style: AppType.mono(color: AppColors.mist),
                  ),
              ],
            ),
          ),

          // ===== Inline stats (soft, no heavy borders) ======================
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 4, 18, 12),
            child: Row(
              children: [
                _Stat(label: 'Year',  value: '${car.year}'),
                _StatDivider(),
                _Stat(label: 'KM',    value: Fmt.km(car.mileageKm).replaceAll(' km', '')),
                _StatDivider(),
                _Stat(label: 'Fuel',  value: car.fuelType),
                _StatDivider(),
                _Stat(label: 'Gear',  value: _gear(car.transmission)),
              ],
            ),
          ),

          // ===== Wants =====================================================
          Container(
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 16),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: AppColors.borderSoft)),
            ),
            child: Row(
              children: [
                Icon(Icons.swap_horiz,
                    size: 16, color: AppColors.signal),
                const SizedBox(width: 8),
                Expanded(
                  child: RichText(
                    overflow: TextOverflow.ellipsis,
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: 'Wants ',
                          style: AppType.body(color: AppColors.mist),
                        ),
                        TextSpan(
                          text: firstDesire,
                          style: AppType.bodyStrong(),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _gear(String t) => switch (t) {
        'automatic' => 'Auto',
        'manual' => 'Manual',
        'semi_automatic' => 'Semi',
        'cvt' => 'CVT',
        _ => t,
      };
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppType.bodySmall(color: AppColors.mist)),
          const SizedBox(height: 2),
          Text(
            value,
            style: AppType.bodyStrong(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _StatDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) =>
      Container(width: 1, height: 26, color: AppColors.borderSoft);
}

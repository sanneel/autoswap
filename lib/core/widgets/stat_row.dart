import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

/// Instrument-cluster style stat strip: vertical 1px dividers between cells,
/// uppercase eyebrow over a mono numeric value. Used on the swipe card,
/// match cards, profile, and chat header.
class StatRow extends StatelessWidget {
  const StatRow({
    super.key,
    required this.items,
    this.borderTop = true,
    this.borderBottom = true,
    this.height = 76,
  });

  final List<StatCell> items;
  final bool borderTop;
  final bool borderBottom;
  final double height;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border(
          top: borderTop
              ? const BorderSide(color: AppColors.borderInk)
              : BorderSide.none,
          bottom: borderBottom
              ? const BorderSide(color: AppColors.borderInk)
              : BorderSide.none,
        ),
      ),
      child: SizedBox(
        height: height,
        child: Row(
          children: [
            for (var i = 0; i < items.length; i++) ...[
              Expanded(child: items[i]),
              if (i != items.length - 1)
                Container(width: 1, color: AppColors.borderInk),
            ],
          ],
        ),
      ),
    );
  }
}

class StatCell extends StatelessWidget {
  const StatCell({
    super.key,
    required this.label,
    required this.value,
    this.valueColor = AppColors.ink,
  });

  final String label;
  final String value;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label.toUpperCase(), style: AppType.eyebrow()),
          const SizedBox(height: 6),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: AppType.monoLg(color: valueColor),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

/// The eyebrow label used at the top of every screen and section.
/// Renders as `01 / DISCOVER` with a 12px tick mark on the left edge.
class SectionLabel extends StatelessWidget {
  const SectionLabel({
    super.key,
    required this.text,
    this.index,
    this.trailing,
    this.color = AppColors.mist,
  });

  final String text;
  final String? index;
  final Widget? trailing;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final label = index == null ? text : '$index / $text';
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(width: 16, height: 1, color: color),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label.toUpperCase(),
            style: AppType.eyebrow(color: color),
            overflow: TextOverflow.ellipsis,
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}

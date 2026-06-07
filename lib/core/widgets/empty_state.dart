import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import 'section_label.dart';

/// Empty / done state. The layout is editorial: a small uppercase eyebrow,
/// the title in display weight, one direct sentence, optional CTA.
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.action,
    this.eyebrow = 'STATUS',
  });

  final IconData icon;
  final String title;
  final String? message;
  final Widget? action;
  final String eyebrow;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(32, 24, 32, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SectionLabel(text: eyebrow),
            const SizedBox(height: 32),
            Icon(icon, size: 40, color: AppColors.ink),
            const SizedBox(height: 20),
            Text(title, style: AppType.display2(), textAlign: TextAlign.left),
            if (message != null) ...[
              const SizedBox(height: 8),
              Text(message!, style: AppType.body(color: AppColors.mist)),
            ],
            if (action != null) ...[
              const SizedBox(height: 24),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

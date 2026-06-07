import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

enum PrimaryButtonVariant { ink, signal, outline }

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
    this.icon,
    this.variant = PrimaryButtonVariant.ink,
    this.meta,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData? icon;
  final PrimaryButtonVariant variant;
  final String? meta;

  @override
  Widget build(BuildContext context) {
    final isOutline = variant == PrimaryButtonVariant.outline;
    final isSignal = variant == PrimaryButtonVariant.signal;
    final bg = switch (variant) {
      PrimaryButtonVariant.ink => AppColors.signal,
      PrimaryButtonVariant.signal => AppColors.signal,
      PrimaryButtonVariant.outline => AppColors.surface,
    };
    final fg = isOutline ? AppColors.ink : AppColors.surface;
    final border = isOutline
        ? const BorderSide(color: AppColors.borderInk, width: 1.2)
        : BorderSide.none;

    final child = loading
        ? SizedBox(
            height: 22,
            width: 22,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              color: isSignal ? AppColors.surface : fg,
            ),
          )
        : Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18, color: fg),
                const SizedBox(width: 10),
              ],
              Text(label, style: AppType.button(color: fg)),
              if (meta != null) ...[
                const SizedBox(width: 12),
                Container(width: 1, height: 14, color: fg.withValues(alpha: 0.35)),
                const SizedBox(width: 12),
                Text(
                  meta!.toUpperCase(),
                  style: AppType.mono(color: fg).copyWith(fontSize: 11),
                ),
              ],
            ],
          );

    return SizedBox(
      width: double.infinity,
      height: 56,
      child: Material(
        color: bg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: border,
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: loading ? null : onPressed,
          splashColor: Colors.transparent,
          highlightColor: const Color(0x14000000),
          child: Center(child: child),
        ),
      ),
    );
  }
}

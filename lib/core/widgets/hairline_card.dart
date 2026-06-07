import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// A flat surface with a 1px ink border and no shadow. Our default container.
class HairlineCard extends StatelessWidget {
  const HairlineCard({
    super.key,
    required this.child,
    this.padding,
    this.color = AppColors.surface,
    this.borderColor = AppColors.borderSoft,
    this.borderWidth = 1,
    this.radius = 18,
    this.onTap,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final Color color;
  final Color borderColor;
  final double borderWidth;
  final double radius;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(radius),
      side: BorderSide(color: borderColor, width: borderWidth),
    );
    final content = Material(
      color: color,
      shape: shape,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        splashColor: Colors.transparent,
        highlightColor: const Color(0x08000000),
        child: Padding(
          padding: padding ?? const EdgeInsets.all(20),
          child: child,
        ),
      ),
    );
    return content;
  }
}

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

/// Pit Lane loading view: a slim ink track + uppercase eyebrow caption.
/// No big spinning rings, no Material 3 oversaturated indicator.
class LoadingView extends StatelessWidget {
  const LoadingView({super.key, this.message = 'LOADING'});
  final String? message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Slim, low-contrast horizontal progress indicator that matches
            // the rest of the design — thin track, ink fill, no rounded ends.
            ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: const SizedBox(
                height: 3,
                child: LinearProgressIndicator(
                  backgroundColor: AppColors.borderSoft,
                  valueColor: AlwaysStoppedAnimation(AppColors.ink),
                  minHeight: 3,
                ),
              ),
            ),
            if (message != null) ...[
              const SizedBox(height: 14),
              Text(
                message!.toUpperCase(),
                style: AppType.eyebrow(color: AppColors.ink),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

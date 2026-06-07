import 'package:flutter/material.dart';

import '../../features/cars/data/models/swap_preference.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class MoneyChip extends StatelessWidget {
  const MoneyChip({super.key, required this.preference});
  final SwapPreference? preference;

  @override
  Widget build(BuildContext context) {
    final pref = preference;
    final (label, fg) = switch (pref?.moneyAdjustment) {
      MoneyAdjustment.addsMoney =>
        ('+ ${_fmt(pref!.moneyAmount)} ${pref.currency}', AppColors.olive),
      MoneyAdjustment.wantsMoney =>
        ('+ ${_fmt(pref!.moneyAmount)} ${pref.currency} უნდა', AppColors.amber),
      _ => ('თანხის გარეშე', AppColors.ink),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: fg, width: 1),
        color: AppColors.surface,
      ),
      child: Text(label, style: AppType.bodySmall(color: fg)),
    );
  }

  static String _fmt(num? v) {
    if (v == null) return '0';
    final s = v.toInt().toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
      buf.write(s[i]);
    }
    return buf.toString();
  }
}

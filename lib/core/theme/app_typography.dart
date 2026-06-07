import 'dart:ui';

import 'package:flutter/material.dart';

import 'app_colors.dart';

class AppType {
  const AppType._();

  static const _family = String.fromEnvironment('AUTO_SWAP_FONT');

  static TextStyle display1({Color color = AppColors.ink}) => TextStyle(
        color: color,
        fontFamily: _family.isEmpty ? null : _family,
        fontWeight: FontWeight.w700,
        fontSize: 24,
        height: 1.22,
      );

  static TextStyle display2({Color color = AppColors.ink}) => TextStyle(
        color: color,
        fontFamily: _family.isEmpty ? null : _family,
        fontWeight: FontWeight.w700,
        fontSize: 20,
        height: 1.25,
      );

  static TextStyle headline({Color color = AppColors.ink}) => TextStyle(
        color: color,
        fontFamily: _family.isEmpty ? null : _family,
        fontWeight: FontWeight.w700,
        fontSize: 18,
        height: 1.3,
      );

  static TextStyle title({Color color = AppColors.ink}) => TextStyle(
        color: color,
        fontFamily: _family.isEmpty ? null : _family,
        fontWeight: FontWeight.w600,
        fontSize: 16,
        height: 1.35,
      );

  static TextStyle body({Color color = AppColors.graphite}) => TextStyle(
        color: color,
        fontFamily: _family.isEmpty ? null : _family,
        fontWeight: FontWeight.w400,
        fontSize: 15,
        height: 1.5,
      );

  static TextStyle bodyStrong({Color color = AppColors.ink}) => TextStyle(
        color: color,
        fontFamily: _family.isEmpty ? null : _family,
        fontWeight: FontWeight.w600,
        fontSize: 15,
        height: 1.45,
      );

  static TextStyle bodySmall({Color color = AppColors.mist}) => TextStyle(
        color: color,
        fontFamily: _family.isEmpty ? null : _family,
        fontWeight: FontWeight.w400,
        fontSize: 13,
        height: 1.45,
      );

  static TextStyle eyebrow({Color color = AppColors.mist}) => TextStyle(
        color: color,
        fontFamily: _family.isEmpty ? null : _family,
        fontWeight: FontWeight.w600,
        fontSize: 12,
        height: 1.25,
      );

  static TextStyle button({Color color = AppColors.surface}) => TextStyle(
        color: color,
        fontFamily: _family.isEmpty ? null : _family,
        fontWeight: FontWeight.w700,
        fontSize: 15,
      );

  static TextStyle mono({Color color = AppColors.ink}) => TextStyle(
        color: color,
        fontWeight: FontWeight.w500,
        fontSize: 13,
        height: 1.35,
        fontFeatures: const [FontFeature.tabularFigures()],
      );

  static TextStyle monoLg({Color color = AppColors.ink}) => TextStyle(
        color: color,
        fontWeight: FontWeight.w600,
        fontSize: 18,
        height: 1.2,
        fontFeatures: const [FontFeature.tabularFigures()],
      );
}

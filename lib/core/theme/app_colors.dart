import 'package:flutter/material.dart';

class AppColors {
  const AppColors._();

  static const paper = Color(0xFFF8F8F7);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceSunken = Color(0xFFF3F7FB);

  static const ink = Color(0xFF181C20);
  static const graphite = Color(0xFF181C20);
  static const mist = Color(0xFF6B7280);
  static const muted = Color(0xFF9CA3AF);

  static const borderInk = Color(0xFFE7E8EA);
  static const borderSoft = Color(0xFFE7E8EA);

  static const signal = Color(0xFF183B63);
  static const signalInk = Color(0xFF12314F);
  static const signalWash = Color(0xFFF3F7FB);

  static const olive = Color(0xFF2F7D57);
  static const oliveWash = Color(0xFFEAF4EF);

  static const amber = Color(0xFFA8741A);

  @Deprecated('Use AppColors.signal')
  static const primary = signal;
  @Deprecated('Use AppColors.signalInk')
  static const primaryDark = signalInk;
  @Deprecated('Use AppColors.signal')
  static const accent = signal;
  @Deprecated('Use AppColors.paper')
  static const background = paper;
  @Deprecated('Use AppColors.ink')
  static const textPrimary = ink;
  @Deprecated('Use AppColors.mist')
  static const textSecondary = mist;
  @Deprecated('Use AppColors.borderSoft')
  static const border = borderSoft;
  @Deprecated('Use AppColors.olive')
  static const success = olive;
  @Deprecated('Use AppColors.signal')
  static const danger = signal;
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app_colors.dart';
import 'app_typography.dart';

class AppTheme {
  const AppTheme._();

  static ThemeData light() {
    const scheme = ColorScheme(
      brightness: Brightness.light,
      primary: AppColors.signal,
      onPrimary: AppColors.surface,
      secondary: AppColors.ink,
      onSecondary: AppColors.surface,
      surface: AppColors.surface,
      onSurface: AppColors.ink,
      error: AppColors.amber,
      onError: AppColors.surface,
    );

    final base = ThemeData(
      useMaterial3: false,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.paper,
      canvasColor: AppColors.paper,
      splashColor: const Color(0x0F183B63),
      highlightColor: const Color(0x0A183B63),
      dividerColor: AppColors.borderSoft,
      visualDensity: VisualDensity.standard,
      textTheme: Typography.blackMountainView
          .apply(bodyColor: AppColors.ink, displayColor: AppColors.ink),
    );

    return base.copyWith(
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.paper,
        foregroundColor: AppColors.ink,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleSpacing: 16,
        titleTextStyle: AppType.headline(),
        iconTheme: const IconThemeData(color: AppColors.ink, size: 22),
        systemOverlayStyle: SystemUiOverlayStyle.dark,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        hintStyle: AppType.body(color: AppColors.mist),
        labelStyle: AppType.eyebrow(),
        floatingLabelStyle: AppType.eyebrow(color: AppColors.signal),
        floatingLabelBehavior: FloatingLabelBehavior.always,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: _inputBorder(AppColors.borderSoft),
        enabledBorder: _inputBorder(AppColors.borderSoft),
        focusedBorder: _inputBorder(AppColors.signal, width: 1.4),
        errorBorder: _inputBorder(AppColors.amber),
        focusedErrorBorder: _inputBorder(AppColors.amber, width: 1.4),
        errorStyle: AppType.bodySmall(color: AppColors.amber),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.signal,
          foregroundColor: AppColors.surface,
          elevation: 0,
          shadowColor: Colors.transparent,
          surfaceTintColor: Colors.transparent,
          minimumSize: const Size(double.infinity, 52),
          padding: const EdgeInsets.symmetric(horizontal: 18),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(8)),
          ),
          textStyle: AppType.button(),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.ink,
          side: const BorderSide(color: AppColors.borderSoft, width: 1),
          minimumSize: const Size(double.infinity, 52),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(8)),
          ),
          textStyle: AppType.button(color: AppColors.ink),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.signal,
          textStyle: AppType.bodyStrong(color: AppColors.signal),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shadowColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: const BorderRadius.all(Radius.circular(8)),
          side: BorderSide(color: AppColors.borderSoft, width: 1),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.surface,
        elevation: 0,
        indicatorColor: AppColors.signalWash,
        surfaceTintColor: Colors.transparent,
        height: 64,
        labelTextStyle: WidgetStatePropertyAll(AppType.eyebrow()),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: selected ? AppColors.signal : AppColors.mist,
            size: 22,
          );
        }),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderSoft,
        thickness: 1,
        space: 0,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surface,
        side: const BorderSide(color: AppColors.borderSoft),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
        ),
        labelStyle: AppType.bodySmall(color: AppColors.ink),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.ink,
        contentTextStyle: AppType.body(color: AppColors.surface),
        actionTextColor: AppColors.surface,
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
          side: BorderSide(color: AppColors.borderSoft),
        ),
        titleTextStyle: AppType.headline(),
        contentTextStyle: AppType.body(),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.signal,
        circularTrackColor: AppColors.borderSoft,
      ),
    );
  }

  static OutlineInputBorder _inputBorder(Color color, {double width = 1}) =>
      OutlineInputBorder(
        borderRadius: const BorderRadius.all(Radius.circular(8)),
        borderSide: BorderSide(color: color, width: width),
      );
}

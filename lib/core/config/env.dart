/// Compile-time configuration injected via `--dart-define`.
class Env {
  const Env._();

  static const supabaseUrl =
      String.fromEnvironment('SUPABASE_URL', defaultValue: '');
  static const supabaseAnonKey =
      String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');

  static const revenueCatAppleKey =
      String.fromEnvironment('REVENUECAT_APPLE_KEY', defaultValue: '');
  static const revenueCatGoogleKey =
      String.fromEnvironment('REVENUECAT_GOOGLE_KEY', defaultValue: '');

  static const contactUnlockEntitlement = String.fromEnvironment(
    'REVENUECAT_CONTACT_UNLOCK_ENTITLEMENT',
    defaultValue: 'contact_unlock',
  );
  static const contactUnlockProductId = String.fromEnvironment(
    'REVENUECAT_CONTACT_UNLOCK_PRODUCT',
    defaultValue: 'contact_unlock_lifetime',
  );

  static bool get hasSupabase =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}

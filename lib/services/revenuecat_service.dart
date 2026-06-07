import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

import '../core/config/env.dart';

class RevenueCatService {
  bool _initialized = false;

  Future<void> init({String? appUserId}) async {
    if (_initialized || kIsWeb) return;
    final apiKey = Platform.isIOS
        ? Env.revenueCatAppleKey
        : Platform.isAndroid
            ? Env.revenueCatGoogleKey
            : '';
    if (apiKey.isEmpty) return; // not configured — paywall will surface clearly

    await Purchases.setLogLevel(LogLevel.warn);
    final configuration = PurchasesConfiguration(apiKey)..appUserID = appUserId;
    await Purchases.configure(configuration);
    _initialized = true;
  }

  Future<void> identify(String userId) async {
    if (!_initialized) return;
    await Purchases.logIn(userId);
  }

  Future<void> reset() async {
    if (!_initialized) return;
    await Purchases.logOut();
  }

  Future<Offerings?> getOfferings() async {
    if (!_initialized) return null;
    try {
      return await Purchases.getOfferings();
    } catch (_) {
      return null;
    }
  }

  /// Returns true if user has the contact-unlock entitlement.
  Future<bool> hasContactUnlock() async {
    if (!_initialized) return false;
    try {
      final info = await Purchases.getCustomerInfo();
      return info.entitlements.active.containsKey(Env.contactUnlockEntitlement);
    } catch (_) {
      return false;
    }
  }

  /// Triggers the platform purchase flow. Returns true on success.
  Future<bool> purchaseContactUnlock() async {
    if (!_initialized) {
      throw StateError('RevenueCat is not configured');
    }
    final offerings = await Purchases.getOfferings();
    final current = offerings.current;
    Package? pkg;
    if (current != null) {
      // Try by product id first, else fall back to lifetime or first package.
      pkg = current.availablePackages.firstWhere(
        (p) => p.storeProduct.identifier == Env.contactUnlockProductId,
        orElse: () => current.lifetime ??
            (current.availablePackages.isNotEmpty
                ? current.availablePackages.first
                : throw StateError('No packages')),
      );
    }
    if (pkg == null) throw StateError('No offering available');
    final result = await Purchases.purchasePackage(pkg);
    return result.customerInfo.entitlements.active
        .containsKey(Env.contactUnlockEntitlement);
  }

  Future<bool> restorePurchases() async {
    if (!_initialized) return false;
    final info = await Purchases.restorePurchases();
    return info.entitlements.active.containsKey(Env.contactUnlockEntitlement);
  }
}

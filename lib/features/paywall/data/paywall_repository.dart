import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../demo/demo_store.dart';
import '../../../services/revenuecat_service.dart';

class PaywallRepository {
  PaywallRepository(this._supabase, this._rc);

  final SupabaseClient _supabase;
  final RevenueCatService _rc;

  Future<bool> isUnlocked() async {
    if (DemoStore.isActive) return DemoStore.contactUnlocked;

    final user = _supabase.auth.currentUser;
    if (user == null) return false;

    final row = await _supabase
        .from('profiles')
        .select('contact_unlocked')
        .eq('id', user.id)
        .maybeSingle();
    if (row != null && row['contact_unlocked'] == true) return true;

    final rc = await _rc.hasContactUnlock();
    if (rc) await _persistUnlock();
    return rc;
  }

  Future<bool> purchase() async {
    if (DemoStore.isActive) {
      // Fake purchase — just flip the flag.
      DemoStore.contactUnlocked = true;
      final id = DemoStore.currentUserId;
      if (id != null) {
        final p = DemoStore.profiles[id];
        if (p != null) {
          DemoStore.profiles[id] = p.copyWith(contactUnlocked: true);
        }
      }
      return true;
    }
    final ok = await _rc.purchaseContactUnlock();
    if (ok) await _persistUnlock();
    return ok;
  }

  Future<bool> restore() async {
    if (DemoStore.isActive) return DemoStore.contactUnlocked;
    final ok = await _rc.restorePurchases();
    if (ok) await _persistUnlock();
    return ok;
  }

  Future<void> _persistUnlock() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;
    await _supabase
        .from('profiles')
        .update({'contact_unlocked': true}).eq('id', user.id);
  }
}

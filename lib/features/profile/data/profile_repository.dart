import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../demo/demo_store.dart';
import 'models/profile.dart';

class ProfileRepository {
  ProfileRepository(this._supabase);
  final SupabaseClient _supabase;

  Future<Profile?> getMine() async {
    if (DemoStore.isActive) {
      final id = DemoStore.currentUserId;
      return id == null ? null : DemoStore.profiles[id];
    }
    final user = _supabase.auth.currentUser;
    if (user == null) return null;
    final row = await _supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .maybeSingle();
    return row == null ? null : Profile.fromMap(row);
  }

  Future<Profile?> getById(String id) async {
    if (DemoStore.isActive) return DemoStore.profiles[id];
    final row = await _supabase
        .from('profiles')
        .select()
        .eq('id', id)
        .maybeSingle();
    return row == null ? null : Profile.fromMap(row);
  }

  Future<Profile> upsertMine(Profile profile) async {
    if (DemoStore.isActive) {
      DemoStore.profiles[profile.id] = profile;
      return profile;
    }
    final res = await _supabase
        .from('profiles')
        .upsert(profile.toInsert())
        .select()
        .single();
    return Profile.fromMap(res);
  }

  Future<void> updateAvatar(String url) async {
    if (DemoStore.isActive) {
      final id = DemoStore.currentUserId;
      if (id == null) return;
      final p = DemoStore.profiles[id];
      if (p != null) DemoStore.profiles[id] = p.copyWith(avatarUrl: url);
      return;
    }
    final user = _supabase.auth.currentUser;
    if (user == null) return;
    await _supabase.from('profiles').update({'avatar_url': url}).eq('id', user.id);
  }

  Future<void> setContactUnlocked(bool unlocked) async {
    if (DemoStore.isActive) {
      DemoStore.contactUnlocked = unlocked;
      final id = DemoStore.currentUserId;
      if (id != null) {
        final p = DemoStore.profiles[id];
        if (p != null) {
          DemoStore.profiles[id] = p.copyWith(contactUnlocked: unlocked);
        }
      }
      return;
    }
    final user = _supabase.auth.currentUser;
    if (user == null) return;
    await _supabase
        .from('profiles')
        .update({'contact_unlocked': unlocked}).eq('id', user.id);
  }

  Future<int> countActiveMatches(String userId) async {
    if (DemoStore.isActive) {
      return DemoStore.countMatches(userId: userId, status: 'active');
    }
    final res = await _supabase
        .from('matches')
        .select('id')
        .or('user_a.eq.$userId,user_b.eq.$userId')
        .eq('status', 'active');
    return (res as List).length;
  }

  Future<int> countCompletedSwaps(String userId) async {
    if (DemoStore.isActive) {
      return DemoStore.countMatches(userId: userId, status: 'completed');
    }
    final res = await _supabase
        .from('matches')
        .select('id')
        .or('user_a.eq.$userId,user_b.eq.$userId')
        .eq('status', 'completed');
    return (res as List).length;
  }
}

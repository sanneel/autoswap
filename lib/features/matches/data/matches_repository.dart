import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../demo/demo_store.dart';
import 'models/match.dart';

class MatchesRepository {
  MatchesRepository(this._supabase);
  final SupabaseClient _supabase;

  Future<List<SwapMatch>> listFor(String viewerId) async {
    if (DemoStore.isActive) {
      return DemoStore.matches
          .where((m) => m.userA == viewerId || m.userB == viewerId)
          .toList();
    }

    final rows = await _supabase
        .from('matches')
        .select('*')
        .or('user_a.eq.$viewerId,user_b.eq.$viewerId')
        .order('created_at', ascending: false);

    final list = (rows as List).cast<Map<String, dynamic>>();
    if (list.isEmpty) return const [];

    final carIds = <String>{
      for (final r in list) ...[r['car_a'] as String, r['car_b'] as String],
    };
    final carRows = await _supabase
        .from('cars')
        .select('''
          *,
          car_photos(*),
          vehicle_preferences(*),
          profiles!cars_owner_id_fkey(id, full_name, avatar_url)
        ''')
        .inFilter('id', carIds.toList());

    final carsById = {
      for (final c in (carRows as List).cast<Map<String, dynamic>>())
        c['id'] as String: c,
    };

    return list
        .map((m) {
          final ca = carsById[m['car_a']];
          final cb = carsById[m['car_b']];
          if (ca == null || cb == null) return null;
          return SwapMatch.fromMap({
            ...m,
            'car_a_data': ca,
            'car_b_data': cb,
          });
        })
        .whereType<SwapMatch>()
        .toList();
  }

  Future<SwapMatch?> getById(String id) async {
    if (DemoStore.isActive) {
      return DemoStore.matches
          .where((m) => m.id == id)
          .cast<SwapMatch?>()
          .firstOrNull;
    }
    final row = await _supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (row == null) return null;
    final carRows = await _supabase
        .from('cars')
        .select('''
          *,
          car_photos(*),
          vehicle_preferences(*),
          profiles!cars_owner_id_fkey(id, full_name, avatar_url)
        ''')
        .inFilter('id', [row['car_a'], row['car_b']]);
    final carsById = {
      for (final c in (carRows as List).cast<Map<String, dynamic>>())
        c['id'] as String: c,
    };
    final ca = carsById[row['car_a']];
    final cb = carsById[row['car_b']];
    if (ca == null || cb == null) return null;
    return SwapMatch.fromMap({...row, 'car_a_data': ca, 'car_b_data': cb});
  }

  Future<void> markCompleted(String matchId) async {
    if (DemoStore.isActive) return;
    await _supabase
        .from('matches')
        .update({'status': 'completed'}).eq('id', matchId);
  }

  Future<void> archive(String matchId) async {
    if (DemoStore.isActive) return;
    await _supabase
        .from('matches')
        .update({'status': 'archived'}).eq('id', matchId);
  }

  Stream<List<SwapMatch>> watchFor(String viewerId) {
    if (DemoStore.isActive) {
      // Seed the stream with current matches, then emit on every change.
      return Stream<List<SwapMatch>>.multi((controller) {
        controller.add(DemoStore.matches
            .where((m) => m.userA == viewerId || m.userB == viewerId)
            .toList());
        final sub = DemoStore.matchesChanges.listen((all) {
          controller.add(all
              .where((m) => m.userA == viewerId || m.userB == viewerId)
              .toList());
        });
        controller.onCancel = sub.cancel;
      });
    }

    return _supabase
        .from('matches')
        .stream(primaryKey: ['id'])
        .order('created_at')
        .map((rows) => rows
            .where((r) => r['user_a'] == viewerId || r['user_b'] == viewerId)
            .toList())
        .asyncMap((rows) async {
          if (rows.isEmpty) return <SwapMatch>[];
          final carIds = <String>{
            for (final r in rows) ...[r['car_a'] as String, r['car_b'] as String],
          };
          final carRows = await _supabase
              .from('cars')
              .select('''
                *,
                car_photos(*),
                vehicle_preferences(*),
                profiles!cars_owner_id_fkey(id, full_name, avatar_url)
              ''')
              .inFilter('id', carIds.toList());
          final carsById = {
            for (final c in (carRows as List).cast<Map<String, dynamic>>())
              c['id'] as String: c,
          };
          return rows
              .map((m) {
                final ca = carsById[m['car_a']];
                final cb = carsById[m['car_b']];
                if (ca == null || cb == null) return null;
                return SwapMatch.fromMap({
                  ...m,
                  'car_a_data': ca,
                  'car_b_data': cb,
                });
              })
              .whereType<SwapMatch>()
              .toList();
        });
  }
}

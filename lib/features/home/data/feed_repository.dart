import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/constants/app_constants.dart';
import '../../../demo/demo_store.dart';
import '../../cars/data/models/car.dart';

class FeedRepository {
  FeedRepository(this._supabase);
  final SupabaseClient _supabase;

  /// Cars not owned by the viewer and not yet swiped on.
  Future<List<Car>> nextBatch({required String viewerId, int? limit}) async {
    if (DemoStore.isActive) {
      return DemoStore.cars
          .where((c) =>
              c.ownerId != viewerId && !DemoStore.swipedCarIds.contains(c.id))
          .take(limit ?? AppConstants.homeBatchSize)
          .toList();
    }

    // Fetch already-swiped car ids.
    final swipedRows = await _supabase
        .from('swipes')
        .select('car_id')
        .eq('swiper_id', viewerId);
    final swipedIds = (swipedRows as List)
        .map((e) => (e as Map)['car_id'] as String)
        .toSet();

    var query = _supabase
        .from('cars')
        .select('''
          *,
          car_photos(*),
          vehicle_preferences(*),
          desired_vehicles(*),
          profiles!cars_owner_id_fkey(id, full_name, avatar_url)
        ''')
        .eq('is_active', true)
        .neq('owner_id', viewerId);

    if (swipedIds.isNotEmpty) {
      final csv = swipedIds.join(',');
      query = query.not('id', 'in', '($csv)');
    }

    final rows = await query
        .order('created_at', ascending: false)
        .limit(limit ?? AppConstants.homeBatchSize);

    return (rows as List)
        .cast<Map<String, dynamic>>()
        .map(Car.fromMap)
        .toList();
  }

  /// Records a swipe. The DB trigger creates matches as appropriate; in demo,
  /// we consult the mutual-interest preset table.
  Future<void> recordSwipe({
    required String swiperId,
    required String carId,
    required bool interested,
    String? swiperCarId,
  }) async {
    if (DemoStore.isActive) {
      DemoStore.swipedCarIds.add(carId);
      if (interested) {
        DemoStore.maybeCreateMatchOnInterestedSwipe(carId);
      }
      return;
    }
    await _supabase.from('swipes').upsert({
      'swiper_id': swiperId,
      'car_id': carId,
      'action': interested ? 'interested' : 'not_interested',
      if (swiperCarId != null) 'swiper_car_id': swiperCarId,
    }, onConflict: 'swiper_id,car_id');
  }
}

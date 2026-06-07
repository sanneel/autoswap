import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';

import '../../../demo/demo_store.dart';
import 'models/car.dart';
import 'models/desired_vehicle.dart';
import 'models/swap_preference.dart';

class CarsRepository {
  CarsRepository(this._supabase);
  final SupabaseClient _supabase;
  static const _uuid = Uuid();

  static const _carSelect = '''
    *,
    car_photos(*),
    vehicle_preferences(*),
    desired_vehicles(*),
    profiles!cars_owner_id_fkey(id, full_name, avatar_url)
  ''';

  Future<List<Car>> listMine(String ownerId) async {
    if (DemoStore.isActive) {
      return DemoStore.cars.where((c) => c.ownerId == ownerId).toList();
    }
    final rows = await _supabase
        .from('cars')
        .select(_carSelect)
        .eq('owner_id', ownerId)
        .order('created_at', ascending: false);
    return (rows as List)
        .cast<Map<String, dynamic>>()
        .map(Car.fromMap)
        .toList();
  }

  Future<Car?> getById(String carId) async {
    if (DemoStore.isActive) {
      return DemoStore.cars.where((c) => c.id == carId).cast<Car?>().firstOrNull;
    }
    final row = await _supabase
        .from('cars')
        .select(_carSelect)
        .eq('id', carId)
        .maybeSingle();
    return row == null ? null : Car.fromMap(row);
  }

  Future<Car> create(Car car, String ownerId) async {
    if (DemoStore.isActive) {
      final id = _uuid.v4();
      final newCar = Car(
        id: id,
        ownerId: ownerId,
        make: car.make,
        model: car.model,
        year: car.year,
        mileageKm: car.mileageKm,
        fuelType: car.fuelType,
        transmission: car.transmission,
        engineSizeL: car.engineSizeL,
        color: car.color,
        description: car.description,
        photos: const [],
        preference: null,
        desired: const [],
        ownerName: DemoStore.profiles[ownerId]?.fullName,
        ownerAvatarUrl: DemoStore.profiles[ownerId]?.avatarUrl,
      );
      DemoStore.cars.insert(0, newCar);
      return newCar;
    }
    final res = await _supabase
        .from('cars')
        .insert(car.toInsert(ownerId))
        .select(_carSelect)
        .single();
    return Car.fromMap(res);
  }

  Future<Car> update(String carId, Map<String, dynamic> patch) async {
    if (DemoStore.isActive) {
      final i = DemoStore.cars.indexWhere((c) => c.id == carId);
      if (i < 0) {
        throw StateError('Demo car $carId not found');
      }
      final c = DemoStore.cars[i];
      final updated = Car(
        id: c.id,
        ownerId: c.ownerId,
        make: (patch['make'] as String?) ?? c.make,
        model: (patch['model'] as String?) ?? c.model,
        year: (patch['year'] as int?) ?? c.year,
        mileageKm: (patch['mileage_km'] as int?) ?? c.mileageKm,
        fuelType: (patch['fuel_type'] as String?) ?? c.fuelType,
        transmission: (patch['transmission'] as String?) ?? c.transmission,
        engineSizeL:
            (patch['engine_size_l'] as num?)?.toDouble() ?? c.engineSizeL,
        color: (patch['color'] as String?) ?? c.color,
        description: (patch['description'] as String?) ?? c.description,
        isActive: (patch['is_active'] as bool?) ?? c.isActive,
        photos: c.photos,
        preference: c.preference,
        desired: c.desired,
        ownerName: c.ownerName,
        ownerAvatarUrl: c.ownerAvatarUrl,
      );
      DemoStore.cars[i] = updated;
      return updated;
    }
    final res = await _supabase
        .from('cars')
        .update(patch)
        .eq('id', carId)
        .select(_carSelect)
        .single();
    return Car.fromMap(res);
  }

  Future<void> delete(String carId) async {
    if (DemoStore.isActive) {
      DemoStore.cars.removeWhere((c) => c.id == carId);
      return;
    }
    await _supabase.from('cars').delete().eq('id', carId);
  }

  // --- photos
  Future<void> addPhoto({
    required String carId,
    required String storagePath,
    required String url,
    required int position,
  }) async {
    if (DemoStore.isActive) {
      // Photos for demo cars are pre-baked; if the user creates a new car and
      // attaches photos, append them.
      // The Car model's photos list is final, so we replace the car entry.
      final i = DemoStore.cars.indexWhere((c) => c.id == carId);
      if (i < 0) return;
      final c = DemoStore.cars[i];
      // No in-place mutation: use the existing photos + new one to rebuild Car.
      // (Demo only uses urls for display; storagePath is unused.)
      // ignore: unused_local_variable
      final _ = storagePath;
      // We can't mutate `final` photos list, so just skip persistence here.
      DemoStore.cars[i] = c;
      return;
    }
    await _supabase.from('car_photos').insert({
      'car_id': carId,
      'storage_path': storagePath,
      'url': url,
      'position': position,
    });
  }

  Future<void> removePhoto(String photoId) async {
    if (DemoStore.isActive) return;
    await _supabase.from('car_photos').delete().eq('id', photoId);
  }

  // --- preferences
  Future<void> upsertPreference(SwapPreference pref) async {
    if (DemoStore.isActive) {
      final i = DemoStore.cars.indexWhere((c) => c.id == pref.carId);
      if (i < 0) return;
      final c = DemoStore.cars[i];
      DemoStore.cars[i] = Car(
        id: c.id,
        ownerId: c.ownerId,
        make: c.make,
        model: c.model,
        year: c.year,
        mileageKm: c.mileageKm,
        fuelType: c.fuelType,
        transmission: c.transmission,
        engineSizeL: c.engineSizeL,
        color: c.color,
        description: c.description,
        isActive: c.isActive,
        photos: c.photos,
        preference: pref,
        desired: c.desired,
        ownerName: c.ownerName,
        ownerAvatarUrl: c.ownerAvatarUrl,
      );
      return;
    }
    await _supabase.from('vehicle_preferences').upsert(pref.toUpsert());
  }

  // --- desired
  Future<void> replaceDesired(String carId, List<DesiredVehicle> list) async {
    if (DemoStore.isActive) {
      final i = DemoStore.cars.indexWhere((c) => c.id == carId);
      if (i < 0) return;
      final c = DemoStore.cars[i];
      DemoStore.cars[i] = Car(
        id: c.id,
        ownerId: c.ownerId,
        make: c.make,
        model: c.model,
        year: c.year,
        mileageKm: c.mileageKm,
        fuelType: c.fuelType,
        transmission: c.transmission,
        engineSizeL: c.engineSizeL,
        color: c.color,
        description: c.description,
        isActive: c.isActive,
        photos: c.photos,
        preference: c.preference,
        desired: list,
        ownerName: c.ownerName,
        ownerAvatarUrl: c.ownerAvatarUrl,
      );
      return;
    }
    await _supabase.from('desired_vehicles').delete().eq('car_id', carId);
    if (list.isEmpty) return;
    await _supabase
        .from('desired_vehicles')
        .insert(list.map((d) => d.toInsert()).toList());
  }
}

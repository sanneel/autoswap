import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../data/models/car.dart';
import '../data/models/desired_vehicle.dart';
import '../data/models/swap_preference.dart';

final myCarsProvider = FutureProvider<List<Car>>((ref) async {
  final id = ref.watch(currentUserIdProvider);
  if (id == null) return const [];
  return ref.watch(carsRepositoryProvider).listMine(id);
});

final carByIdProvider =
    FutureProvider.family<Car?, String>((ref, carId) async {
  return ref.watch(carsRepositoryProvider).getById(carId);
});

class CarsController {
  CarsController(this._ref);
  final Ref _ref;

  Future<Car> createCar(Car car) async {
    final id = _ref.read(currentUserIdProvider);
    if (id == null) throw StateError('Not signed in');
    final created = await _ref.read(carsRepositoryProvider).create(car, id);
    _ref.invalidate(myCarsProvider);
    return created;
  }

  Future<Car> updateCar(String carId, Map<String, dynamic> patch) async {
    final updated =
        await _ref.read(carsRepositoryProvider).update(carId, patch);
    _ref.invalidate(myCarsProvider);
    _ref.invalidate(carByIdProvider(carId));
    return updated;
  }

  Future<void> deleteCar(String carId) async {
    await _ref.read(carsRepositoryProvider).delete(carId);
    _ref.invalidate(myCarsProvider);
  }

  Future<void> addPhotoFromFile({
    required String carId,
    required File file,
    required int position,
  }) async {
    final id = _ref.read(currentUserIdProvider);
    if (id == null) return;
    final res = await _ref.read(storageRepositoryProvider).uploadCarPhoto(
          file,
          userId: id,
          carId: carId,
        );
    await _ref.read(carsRepositoryProvider).addPhoto(
          carId: carId,
          storagePath: res.path,
          url: res.url,
          position: position,
        );
    _ref.invalidate(carByIdProvider(carId));
    _ref.invalidate(myCarsProvider);
  }

  Future<void> savePreference(SwapPreference pref) async {
    await _ref.read(carsRepositoryProvider).upsertPreference(pref);
    _ref.invalidate(carByIdProvider(pref.carId));
    _ref.invalidate(myCarsProvider);
  }

  Future<void> saveDesired(String carId, List<DesiredVehicle> list) async {
    await _ref.read(carsRepositoryProvider).replaceDesired(carId, list);
    _ref.invalidate(carByIdProvider(carId));
    _ref.invalidate(myCarsProvider);
  }
}

final carsControllerProvider =
    Provider<CarsController>((ref) => CarsController(ref));

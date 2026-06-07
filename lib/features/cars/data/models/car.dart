import 'car_photo.dart';
import 'desired_vehicle.dart';
import 'swap_preference.dart';

class Car {
  const Car({
    required this.id,
    required this.ownerId,
    required this.make,
    required this.model,
    required this.year,
    required this.mileageKm,
    required this.fuelType,
    required this.transmission,
    required this.engineSizeL,
    required this.color,
    this.description,
    this.isActive = true,
    this.photos = const [],
    this.preference,
    this.desired = const [],
    this.ownerName,
    this.ownerAvatarUrl,
  });

  final String id;
  final String ownerId;
  final String make;
  final String model;
  final int year;
  final int mileageKm;
  final String fuelType;
  final String transmission;
  final double engineSizeL;
  final String color;
  final String? description;
  final bool isActive;

  final List<CarPhoto> photos;
  final SwapPreference? preference;
  final List<DesiredVehicle> desired;

  // Joined fields (when fetched with profile)
  final String? ownerName;
  final String? ownerAvatarUrl;

  String get title => '$make $model';
  String get subtitle => '$year · ${_yearlessMileage()} · $fuelType';

  String _yearlessMileage() {
    final s = mileageKm.toString();
    return '${s.replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]} ')} km';
  }

  factory Car.fromMap(Map<String, dynamic> m) {
    final photosRaw = (m['car_photos'] as List?) ?? const [];
    final desiredRaw = (m['desired_vehicles'] as List?) ?? const [];
    final prefRaw = m['vehicle_preferences'];
    final ownerRaw = m['profiles'];

    return Car(
      id: m['id'] as String,
      ownerId: m['owner_id'] as String,
      make: (m['make'] ?? '') as String,
      model: (m['model'] ?? '') as String,
      year: (m['year'] ?? 0) as int,
      mileageKm: (m['mileage_km'] ?? 0) as int,
      fuelType: (m['fuel_type'] ?? 'other') as String,
      transmission: (m['transmission'] ?? 'manual') as String,
      engineSizeL: ((m['engine_size_l'] ?? 0) as num).toDouble(),
      color: (m['color'] ?? '') as String,
      description: m['description'] as String?,
      isActive: (m['is_active'] ?? true) as bool,
      photos: photosRaw
          .cast<Map<String, dynamic>>()
          .map(CarPhoto.fromMap)
          .toList()
        ..sort((a, b) => a.position.compareTo(b.position)),
      preference: prefRaw is Map<String, dynamic>
          ? SwapPreference.fromMap(prefRaw)
          : (prefRaw is List && prefRaw.isNotEmpty)
              ? SwapPreference.fromMap(
                  (prefRaw.first as Map).cast<String, dynamic>())
              : null,
      desired: desiredRaw
          .cast<Map<String, dynamic>>()
          .map(DesiredVehicle.fromMap)
          .toList(),
      ownerName: ownerRaw is Map ? ownerRaw['full_name'] as String? : null,
      ownerAvatarUrl: ownerRaw is Map ? ownerRaw['avatar_url'] as String? : null,
    );
  }

  Map<String, dynamic> toInsert(String ownerId) => {
        'owner_id': ownerId,
        'make': make,
        'model': model,
        'year': year,
        'mileage_km': mileageKm,
        'fuel_type': fuelType,
        'transmission': transmission,
        'engine_size_l': engineSizeL,
        'color': color,
        if (description != null) 'description': description,
        'is_active': isActive,
      };
}

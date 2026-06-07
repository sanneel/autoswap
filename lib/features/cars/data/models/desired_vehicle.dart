import '../../../../core/constants/car_data.dart';

class DesiredVehicle {
  const DesiredVehicle({
    this.id,
    required this.carId,
    this.make,
    this.model,
    this.yearMin,
    this.yearMax,
    this.category = 'any',
  });

  final String? id;
  final String carId;
  final String? make;
  final String? model;
  final int? yearMin;
  final int? yearMax;
  final String category;

  factory DesiredVehicle.fromMap(Map<String, dynamic> m) => DesiredVehicle(
        id: m['id'] as String?,
        carId: m['car_id'] as String,
        make: m['make'] as String?,
        model: m['model'] as String?,
        yearMin: m['year_min'] as int?,
        yearMax: m['year_max'] as int?,
        category: (m['category'] ?? 'any') as String,
      );

  Map<String, dynamic> toInsert() => {
        'car_id': carId,
        'make': make,
        'model': model,
        'year_min': yearMin,
        'year_max': yearMax,
        'category': category,
      };

  String describe() {
    final parts = <String>[];
    if (make != null && make!.isNotEmpty) parts.add(make!);
    if (model != null && model!.isNotEmpty) parts.add(model!);
    if (parts.isEmpty && category != 'any') parts.add(CarData.label(category));
    if (parts.isEmpty) parts.add('ნებისმიერი მანქანა');
    if (yearMin != null || yearMax != null) {
      parts.add('${yearMin ?? '...'}-${yearMax ?? '...'}');
    }
    return parts.join(' ');
  }
}

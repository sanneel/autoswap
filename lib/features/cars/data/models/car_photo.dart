class CarPhoto {
  const CarPhoto({
    required this.id,
    required this.carId,
    required this.storagePath,
    required this.url,
    required this.position,
  });

  final String id;
  final String carId;
  final String storagePath;
  final String url;
  final int position;

  factory CarPhoto.fromMap(Map<String, dynamic> m) => CarPhoto(
        id: m['id'] as String,
        carId: m['car_id'] as String,
        storagePath: (m['storage_path'] ?? '') as String,
        url: (m['url'] ?? '') as String,
        position: (m['position'] ?? 0) as int,
      );
}

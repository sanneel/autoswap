import '../../../cars/data/models/car.dart';

class SwapMatch {
  const SwapMatch({
    required this.id,
    required this.userA,
    required this.userB,
    required this.carA,
    required this.carB,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final String userA;
  final String userB;
  final Car carA;
  final Car carB;
  final String status;
  final DateTime createdAt;

  /// Returns the *other* user's car for the given viewer.
  Car otherCarFor(String viewerId) => viewerId == userA ? carB : carA;
  Car myCarFor(String viewerId) => viewerId == userA ? carA : carB;
  String otherUserIdFor(String viewerId) => viewerId == userA ? userB : userA;

  factory SwapMatch.fromMap(Map<String, dynamic> m) {
    final carA = Car.fromMap((m['car_a_data'] as Map).cast<String, dynamic>());
    final carB = Car.fromMap((m['car_b_data'] as Map).cast<String, dynamic>());
    return SwapMatch(
      id: m['id'] as String,
      userA: m['user_a'] as String,
      userB: m['user_b'] as String,
      carA: carA,
      carB: carB,
      status: (m['status'] ?? 'active') as String,
      createdAt: DateTime.parse(m['created_at'] as String),
    );
  }
}

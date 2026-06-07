import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../demo/demo_store.dart';
import 'models/report.dart';

class ReportsRepository {
  ReportsRepository(this._supabase);
  final SupabaseClient _supabase;

  Future<void> submit({
    required String reporterId,
    String? reportedUserId,
    String? reportedCarId,
    required ReportReason reason,
    String? details,
  }) async {
    if (DemoStore.isActive) {
      // No-op: pretend the report was filed.
      return;
    }
    await _supabase.from('reports').insert({
      'reporter_id': reporterId,
      'reported_user_id': reportedUserId,
      'reported_car_id': reportedCarId,
      'reason': reason.db,
      'details': details,
    });
  }
}

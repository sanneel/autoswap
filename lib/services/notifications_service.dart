import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

@pragma('vm:entry-point')
Future<void> _onBackgroundMessage(RemoteMessage message) async {
  // Background handler — kept minimal. App will surface the message on resume.
  if (kDebugMode) {
    debugPrint('FCM background: ${message.messageId}');
  }
}

class NotificationsService {
  NotificationsService(this._supabase);
  final SupabaseClient _supabase;
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized || kIsWeb) return;
    try {
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission(alert: true, badge: true, sound: true);
      FirebaseMessaging.onBackgroundMessage(_onBackgroundMessage);
      messaging.onTokenRefresh.listen(_savePushToken);
      final token = await messaging.getToken();
      if (token != null) await _savePushToken(token);
      _initialized = true;
    } catch (e) {
      if (kDebugMode) debugPrint('FCM init skipped: $e');
    }
  }

  Future<void> _savePushToken(String token) async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;
    await _supabase
        .from('profiles')
        .update({'push_token': token}).eq('id', user.id);
  }

  Future<void> clearTokenOnLogout() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;
    await _supabase
        .from('profiles')
        .update({'push_token': null}).eq('id', user.id);
  }
}

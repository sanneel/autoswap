import 'dart:io';

import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';

import '../../../demo/demo_store.dart';

class StorageRepository {
  StorageRepository(this._supabase);
  final SupabaseClient _supabase;
  final _uuid = const Uuid();

  String _ext(String path) {
    final dot = path.lastIndexOf('.');
    if (dot == -1) return 'jpg';
    return path.substring(dot + 1).toLowerCase();
  }

  Future<({String path, String url})> uploadCarPhoto(
    File file, {
    required String userId,
    required String carId,
  }) async {
    if (DemoStore.isActive) {
      // No real upload — return a stable picsum URL keyed by the local seed.
      final seed = _uuid.v4();
      return (
        path: 'demo/$userId/$carId/$seed.jpg',
        url: 'https://picsum.photos/seed/$seed/800/600',
      );
    }
    final path = '$userId/$carId/${_uuid.v4()}.${_ext(file.path)}';
    await _supabase.storage.from('car-photos').upload(
          path,
          file,
          fileOptions: const FileOptions(upsert: false),
        );
    final url = _supabase.storage.from('car-photos').getPublicUrl(path);
    return (path: path, url: url);
  }

  Future<({String path, String url})> uploadAvatar(
    File file, {
    required String userId,
  }) async {
    if (DemoStore.isActive) {
      final seed = _uuid.v4();
      return (
        path: 'demo/$userId/avatar.jpg',
        url: 'https://i.pravatar.cc/200?u=$seed',
      );
    }
    final path = '$userId/avatar.${_ext(file.path)}';
    await _supabase.storage.from('avatars').upload(
          path,
          file,
          fileOptions: const FileOptions(upsert: true),
        );
    final url = _supabase.storage.from('avatars').getPublicUrl(path);
    return (path: path, url: url);
  }

  Future<void> deleteCarPhoto(String path) async {
    if (DemoStore.isActive) return;
    await _supabase.storage.from('car-photos').remove([path]);
  }
}

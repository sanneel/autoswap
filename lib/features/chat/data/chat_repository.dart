import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/contact_filter.dart';
import '../../../demo/demo_store.dart';
import 'models/message.dart';

class ChatRepository {
  ChatRepository(this._supabase);
  final SupabaseClient _supabase;
  static const _uuid = Uuid();

  Future<List<ChatMessage>> page(
    String matchId, {
    int limit = AppConstants.chatPageSize,
  }) async {
    if (DemoStore.isActive) {
      return List.of(DemoStore.messagesByMatch[matchId] ?? const []);
    }
    final rows = await _supabase
        .from('messages')
        .select()
        .eq('match_id', matchId)
        .order('created_at', ascending: true)
        .limit(limit);
    return (rows as List)
        .cast<Map<String, dynamic>>()
        .map(ChatMessage.fromMap)
        .toList();
  }

  Future<ChatMessage> send({
    required String matchId,
    required String senderId,
    required String body,
    required bool contactUnlocked,
  }) async {
    final trimmed = body.trim();
    if (trimmed.isEmpty) throw ArgumentError('Empty message');
    if (trimmed.length > AppConstants.maxMessageLength) {
      throw ArgumentError('Message too long');
    }
    if (!contactUnlocked && ContactFilter.containsContactInfo(trimmed)) {
      throw const ContactBlockedException();
    }

    if (DemoStore.isActive) {
      final msg = ChatMessage(
        id: _uuid.v4(),
        matchId: matchId,
        senderId: senderId,
        body: trimmed,
        createdAt: DateTime.now(),
      );
      DemoStore.addMessage(matchId, msg);
      return msg;
    }

    final res = await _supabase
        .from('messages')
        .insert({
          'match_id': matchId,
          'sender_id': senderId,
          'body': trimmed,
        })
        .select()
        .single();
    return ChatMessage.fromMap(res);
  }

  Future<void> markRead({required String matchId, required String viewerId}) async {
    if (DemoStore.isActive) {
      DemoStore.markMessagesRead(matchId, viewerId);
      return;
    }
    await _supabase
        .from('messages')
        .update({'read_at': DateTime.now().toIso8601String()})
        .eq('match_id', matchId)
        .neq('sender_id', viewerId)
        .filter('read_at', 'is', null);
  }

  Stream<List<ChatMessage>> watch(String matchId) {
    if (DemoStore.isActive) {
      return DemoStore.watchMessages(matchId);
    }
    return _supabase
        .from('messages')
        .stream(primaryKey: ['id'])
        .eq('match_id', matchId)
        .order('created_at')
        .map((rows) => rows.map(ChatMessage.fromMap).toList());
  }
}

class ContactBlockedException implements Exception {
  const ContactBlockedException();
  @override
  String toString() => ContactFilter.blockedMessage;
}

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../paywall/presentation/paywall_controller.dart';
import '../data/models/message.dart';

final messagesStreamProvider =
    StreamProvider.family<List<ChatMessage>, String>((ref, matchId) {
  return ref.watch(chatRepositoryProvider).watch(matchId);
});

class ChatController {
  ChatController(this._ref);
  final Ref _ref;

  Future<void> send(String matchId, String body) async {
    final id = _ref.read(currentUserIdProvider);
    if (id == null) throw StateError('Not signed in');
    final unlocked = _ref.read(contactUnlockedProvider).valueOrNull ?? false;
    await _ref.read(chatRepositoryProvider).send(
          matchId: matchId,
          senderId: id,
          body: body,
          contactUnlocked: unlocked,
        );
  }

  Future<void> markRead(String matchId) async {
    final id = _ref.read(currentUserIdProvider);
    if (id == null) return;
    await _ref
        .read(chatRepositoryProvider)
        .markRead(matchId: matchId, viewerId: id);
  }
}

final chatControllerProvider =
    Provider<ChatController>((ref) => ChatController(ref));

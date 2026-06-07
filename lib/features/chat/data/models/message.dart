class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.matchId,
    required this.senderId,
    required this.body,
    required this.createdAt,
    this.readAt,
  });

  final String id;
  final String matchId;
  final String senderId;
  final String body;
  final DateTime createdAt;
  final DateTime? readAt;

  bool get isRead => readAt != null;

  factory ChatMessage.fromMap(Map<String, dynamic> m) => ChatMessage(
        id: m['id'] as String,
        matchId: m['match_id'] as String,
        senderId: m['sender_id'] as String,
        body: (m['body'] ?? '') as String,
        createdAt: DateTime.parse(m['created_at'] as String),
        readAt: m['read_at'] != null
            ? DateTime.parse(m['read_at'] as String)
            : null,
      );

  ChatMessage copyWith({DateTime? readAt}) => ChatMessage(
        id: id,
        matchId: matchId,
        senderId: senderId,
        body: body,
        createdAt: createdAt,
        readAt: readAt ?? this.readAt,
      );
}

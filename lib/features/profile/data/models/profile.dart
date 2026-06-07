class Profile {
  const Profile({
    required this.id,
    required this.fullName,
    this.avatarUrl,
    this.city,
    this.country,
    this.phone,
    this.bio,
    this.contactUnlocked = false,
    this.createdAt,
  });

  final String id;
  final String fullName;
  final String? avatarUrl;
  final String? city;
  final String? country;
  final String? phone;
  final String? bio;
  final bool contactUnlocked;
  final DateTime? createdAt;

  factory Profile.fromMap(Map<String, dynamic> m) => Profile(
        id: m['id'] as String,
        fullName: (m['full_name'] ?? '') as String,
        avatarUrl: m['avatar_url'] as String?,
        city: m['city'] as String?,
        country: m['country'] as String?,
        phone: m['phone'] as String?,
        bio: m['bio'] as String?,
        contactUnlocked: (m['contact_unlocked'] ?? false) as bool,
        createdAt: m['created_at'] != null
            ? DateTime.parse(m['created_at'] as String)
            : null,
      );

  Map<String, dynamic> toInsert() => {
        'id': id,
        'full_name': fullName,
        if (avatarUrl != null) 'avatar_url': avatarUrl,
        if (city != null) 'city': city,
        if (country != null) 'country': country,
        if (phone != null) 'phone': phone,
        if (bio != null) 'bio': bio,
      };

  Profile copyWith({
    String? fullName,
    String? avatarUrl,
    String? city,
    String? country,
    String? phone,
    String? bio,
    bool? contactUnlocked,
  }) =>
      Profile(
        id: id,
        fullName: fullName ?? this.fullName,
        avatarUrl: avatarUrl ?? this.avatarUrl,
        city: city ?? this.city,
        country: country ?? this.country,
        phone: phone ?? this.phone,
        bio: bio ?? this.bio,
        contactUnlocked: contactUnlocked ?? this.contactUnlocked,
        createdAt: createdAt,
      );
}

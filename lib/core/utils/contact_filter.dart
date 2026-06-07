/// Detects attempts to share direct contact info inside chat messages while
/// the user has not unlocked communications. Patterns are deliberately
/// over-eager — false positives are preferable to leaks for the MVP.
class ContactFilter {
  const ContactFilter._();

  static final _patterns = <RegExp>[
    // Email
    RegExp(r'[\w.+-]+\s*@\s*[\w-]+\.[\w.-]+', caseSensitive: false),
    // URLs
    RegExp(r'\b(?:https?:\/\/|www\.)\S+', caseSensitive: false),
    RegExp(r'\b\S+\.(?:com|net|org|io|me|co|app|gg|xyz|pt|es|fr|de|uk)\b',
        caseSensitive: false),
    // Phone-ish: 7+ digits, optional separators, optional +
    RegExp(r'(?:(?:\+|00)\d[\s\-]?)?(?:\(?\d{2,4}\)?[\s\-]?){2,}\d{3,}'),
    // Common platform handles & references
    RegExp(r'\binsta(?:gram)?\b', caseSensitive: false),
    RegExp(r'\bwhats?app\b', caseSensitive: false),
    RegExp(r'\btelegram\b', caseSensitive: false),
    RegExp(r'\bt\.me\b', caseSensitive: false),
    RegExp(r'\bsignal\b', caseSensitive: false),
    RegExp(r'\bviber\b', caseSensitive: false),
    RegExp(r'\bsnapchat\b', caseSensitive: false),
    RegExp(r'@[A-Za-z0-9_.]{3,}'),
  ];

  /// Returns true if [text] looks like it contains contact info.
  static bool containsContactInfo(String text) {
    final normalized = text.replaceAll(RegExp(r'\s+'), ' ').trim();
    if (normalized.isEmpty) return false;
    for (final p in _patterns) {
      if (p.hasMatch(normalized)) return true;
    }
    return false;
  }

  static const blockedMessage =
      'Contact information can only be shared after unlocking communication.';
}

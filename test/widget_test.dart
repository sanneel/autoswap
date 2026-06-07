// Smoke test for the contact-filter logic. We avoid pumping the full app
// because it requires Supabase to be initialized at startup.

import 'package:flutter_test/flutter_test.dart';
import 'package:swapride/core/utils/contact_filter.dart';

void main() {
  group('ContactFilter', () {
    test('blocks emails', () {
      expect(ContactFilter.containsContactInfo('ping me at jane@example.com'),
          isTrue);
    });

    test('blocks phone-like sequences', () {
      expect(ContactFilter.containsContactInfo('call +351 912 345 678'), isTrue);
    });

    test('blocks URLs', () {
      expect(ContactFilter.containsContactInfo('see https://example.com'),
          isTrue);
    });

    test('blocks platform handles', () {
      expect(ContactFilter.containsContactInfo('add me on telegram @jane'),
          isTrue);
    });

    test('allows neutral chatter', () {
      expect(
        ContactFilter.containsContactInfo('I like your car, want to meet?'),
        isFalse,
      );
    });
  });
}

import 'package:intl/intl.dart';

class Fmt {
  const Fmt._();

  static String km(num value) =>
      '${NumberFormat.decimalPattern().format(value)} km';

  static String money(num? amount, String currency) {
    if (amount == null) return '';
    return NumberFormat.simpleCurrency(name: currency).format(amount);
  }

  static String time(DateTime when) {
    final now = DateTime.now();
    final sameDay = now.year == when.year &&
        now.month == when.month &&
        now.day == when.day;
    return sameDay ? DateFormat.Hm().format(when) : DateFormat.MMMd().format(when);
  }

  static String relative(DateTime when) {
    final diff = DateTime.now().difference(when);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat.yMMMd().format(when);
  }
}

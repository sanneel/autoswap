class Validators {
  const Validators._();

  static String? email(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Email is required';
    final re = RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$');
    if (!re.hasMatch(v)) return 'Enter a valid email';
    return null;
  }

  static String? password(String? value) {
    final v = value ?? '';
    if (v.length < 8) return 'At least 8 characters';
    return null;
  }

  static String? required(String? value, {String field = 'This field'}) {
    if (value == null || value.trim().isEmpty) return '$field is required';
    return null;
  }

  static String? positiveInt(String? value, {String field = 'Value'}) {
    final v = int.tryParse(value?.trim() ?? '');
    if (v == null || v < 0) return '$field must be a positive number';
    return null;
  }

  static String? year(String? value) {
    final v = int.tryParse(value?.trim() ?? '');
    if (v == null) return 'Year is required';
    final now = DateTime.now().year;
    if (v < 1900 || v > now + 1) return 'Year must be 1900–${now + 1}';
    return null;
  }
}

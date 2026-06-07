/// Lightweight result/failure pair used by repositories. Avoids importing a
/// heavy functional library while still giving callers a typed error channel.
sealed class Failure {
  const Failure(this.message);
  final String message;

  @override
  String toString() => message;
}

class AuthFailure extends Failure {
  const AuthFailure(super.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

class ValidationFailure extends Failure {
  const ValidationFailure(super.message);
}

class StorageFailure extends Failure {
  const StorageFailure(super.message);
}

class UnknownFailure extends Failure {
  const UnknownFailure(super.message);
}

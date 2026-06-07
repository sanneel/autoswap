import '../error/failures.dart';

sealed class Result<T> {
  const Result();

  R when<R>({
    required R Function(T value) ok,
    required R Function(Failure failure) err,
  }) {
    final self = this;
    if (self is Ok<T>) return ok(self.value);
    if (self is Err<T>) return err(self.failure);
    throw StateError('unreachable');
  }

  T? get valueOrNull => this is Ok<T> ? (this as Ok<T>).value : null;
  Failure? get failureOrNull => this is Err<T> ? (this as Err<T>).failure : null;
}

class Ok<T> extends Result<T> {
  const Ok(this.value);
  final T value;
}

class Err<T> extends Result<T> {
  const Err(this.failure);
  final Failure failure;
}

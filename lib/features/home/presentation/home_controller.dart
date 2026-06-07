import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../cars/data/models/car.dart';

class HomeState {
  HomeState({this.queue = const [], this.loading = false, this.error});
  final List<Car> queue;
  final bool loading;
  final Object? error;

  HomeState copyWith({List<Car>? queue, bool? loading, Object? error}) =>
      HomeState(
        queue: queue ?? this.queue,
        loading: loading ?? this.loading,
        error: error,
      );
}

class HomeController extends StateNotifier<HomeState> {
  HomeController(this._ref) : super(HomeState()) {
    refresh();
  }
  final Ref _ref;

  Future<void> refresh() async {
    final id = _ref.read(currentUserIdProvider);
    if (id == null) return;
    state = state.copyWith(loading: true, error: null);
    try {
      final cars =
          await _ref.read(feedRepositoryProvider).nextBatch(viewerId: id);
      state = HomeState(queue: cars, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e);
    }
  }

  Future<void> swipe(Car car, {required bool interested}) async {
    final id = _ref.read(currentUserIdProvider);
    if (id == null) return;
    final next = [...state.queue]..removeWhere((c) => c.id == car.id);
    state = state.copyWith(queue: next);
    await _ref.read(feedRepositoryProvider).recordSwipe(
          swiperId: id,
          carId: car.id,
          interested: interested,
        );

    if (next.length < 5) {
      // Quietly top up the queue without flashing the spinner.
      try {
        final more =
            await _ref.read(feedRepositoryProvider).nextBatch(viewerId: id);
        final seen = next.map((c) => c.id).toSet();
        final fresh = more.where((c) => !seen.contains(c.id)).toList();
        if (fresh.isNotEmpty) {
          state = state.copyWith(queue: [...next, ...fresh]);
        }
      } catch (_) {}
    }
  }
}

final homeControllerProvider =
    StateNotifierProvider<HomeController, HomeState>((ref) => HomeController(ref));

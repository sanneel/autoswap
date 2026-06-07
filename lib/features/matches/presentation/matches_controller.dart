import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../data/models/match.dart';

final matchesProvider = StreamProvider<List<SwapMatch>>((ref) async* {
  final id = ref.watch(currentUserIdProvider);
  if (id == null) {
    yield const [];
    return;
  }
  // Seed with a one-shot fetch so we render immediately, then keep streaming.
  final initial = await ref.read(matchesRepositoryProvider).listFor(id);
  yield initial;
  yield* ref.read(matchesRepositoryProvider).watchFor(id);
});

final matchByIdProvider =
    FutureProvider.family<SwapMatch?, String>((ref, id) async {
  return ref.read(matchesRepositoryProvider).getById(id);
});

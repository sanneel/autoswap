import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/loading_view.dart';
import '../../../core/widgets/money_chip.dart';
import '../../../core/widgets/section_label.dart';
import '../data/models/car.dart';
import 'cars_controller.dart';

class MyCarsScreen extends ConsumerWidget {
  const MyCarsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final carsAsync = ref.watch(myCarsProvider);
    return Scaffold(
      backgroundColor: AppColors.paper,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('My garage'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.ink,
        foregroundColor: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(28),
        ),
        onPressed: () => context.push(Routes.createCar),
        icon: const Icon(Icons.add),
        label: const Text('Add car'),
      ),
      body: carsAsync.when(
        loading: () => const LoadingView(),
        error: (e, _) => Center(
            child: Text('$e', style: AppType.body(color: AppColors.mist))),
        data: (cars) {
          if (cars.isEmpty) {
            return EmptyState(
              eyebrow: 'GARAGE EMPTY',
              icon: Icons.directions_car_outlined,
              title: 'Park your first\nlisting.',
              message: 'Add a car to start receiving swap offers.',
              action: ElevatedButton.icon(
                onPressed: () => context.push(Routes.createCar),
                icon: const Icon(Icons.add),
                label: const Text('Add a car'),
              ),
            );
          }
          return RefreshIndicator(
            color: AppColors.ink,
            backgroundColor: AppColors.surface,
            onRefresh: () async => ref.invalidate(myCarsProvider),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 120),
              children: [
                SectionLabel(
                  text: 'GARAGE',
                  index: '06',
                  trailing: Text(
                    '${cars.length.toString().padLeft(2, '0')} LISTED',
                    style: AppType.eyebrow(color: AppColors.ink),
                  ),
                ),
                const SizedBox(height: 16),
                for (var i = 0; i < cars.length; i++) ...[
                  _GarageRow(car: cars[i], ref: ref, context: context),
                  if (i != cars.length - 1) const SizedBox(height: 14),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _GarageRow extends StatelessWidget {
  const _GarageRow({
    required this.car,
    required this.ref,
    required this.context,
  });
  final Car car;
  final WidgetRef ref;
  final BuildContext context;

  @override
  Widget build(BuildContext _) {
    final cover = car.photos.isNotEmpty ? car.photos.first.url : null;
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(20),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push(Routes.prefsFor(car.id)),
        splashColor: Colors.transparent,
        highlightColor: const Color(0x08000000),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.borderSoft),
          ),
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: SizedBox(
                  width: 86,
                  height: 96,
                  child: cover != null
                      ? CachedNetworkImage(
                          imageUrl: cover, fit: BoxFit.cover)
                      : Container(
                          color: AppColors.surfaceSunken,
                          alignment: Alignment.center,
                          child: const Icon(Icons.directions_car,
                              color: AppColors.mist),
                        ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            car.title,
                            style: AppType.title(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        _MenuButton(car: car, ref: ref, context: context),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${car.year} · ${Fmt.km(car.mileageKm)} · ${car.fuelType}',
                      style: AppType.bodySmall(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        MoneyChip(preference: car.preference),
                        if (car.desired.isNotEmpty)
                          _PillTag(
                            icon: Icons.favorite_outline,
                            label: car.desired.first.describe(),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PillTag extends StatelessWidget {
  const _PillTag({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surfaceSunken,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.ink),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              label,
              style: AppType.bodySmall(color: AppColors.ink),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuButton extends StatelessWidget {
  const _MenuButton({required this.car, required this.ref, required this.context});
  final Car car;
  final WidgetRef ref;
  final BuildContext context;

  @override
  Widget build(BuildContext _) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.more_horiz, color: AppColors.mist),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(14)),
      ),
      onSelected: (v) async {
        if (v == 'edit') {
          context.push(Routes.editCarFor(car.id));
        } else if (v == 'prefs') {
          context.push(Routes.prefsFor(car.id));
        } else if (v == 'delete') {
          final ok = await showDialog<bool>(
            context: context,
            builder: (_) => AlertDialog(
              title: const Text('Delete car?'),
              content: const Text(
                  'This removes the listing, its photos and preferences.'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Delete'),
                ),
              ],
            ),
          );
          if (ok == true) {
            await ref.read(carsControllerProvider).deleteCar(car.id);
          }
        }
      },
      itemBuilder: (_) => const [
        PopupMenuItem(value: 'edit', child: Text('Edit')),
        PopupMenuItem(value: 'prefs', child: Text('Swap preferences')),
        PopupMenuItem(value: 'delete', child: Text('Delete')),
      ],
    );
  }
}

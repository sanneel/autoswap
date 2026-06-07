import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/car_data.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/loading_view.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/section_label.dart';
import '../data/models/desired_vehicle.dart';
import '../data/models/swap_preference.dart';
import 'cars_controller.dart';

class SwapPreferencesScreen extends ConsumerStatefulWidget {
  const SwapPreferencesScreen({super.key, required this.carId});
  final String carId;

  @override
  ConsumerState<SwapPreferencesScreen> createState() => _S();
}

class _S extends ConsumerState<SwapPreferencesScreen> {
  MoneyAdjustment _adjustment = MoneyAdjustment.none;
  final _amount = TextEditingController();
  final List<_DesiredDraft> _desired = [];
  bool _saving = false;
  bool _hydrated = false;

  @override
  void dispose() {
    _amount.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final pref = SwapPreference(
        carId: widget.carId,
        moneyAdjustment: _adjustment,
        moneyAmount: _adjustment == MoneyAdjustment.none
            ? null
            : num.tryParse(_amount.text.trim()),
      );
      await ref.read(carsControllerProvider).savePreference(pref);
      await ref.read(carsControllerProvider).saveDesired(
            widget.carId,
            _desired
                .where((d) => d.isNonEmpty)
                .map((d) => d.toModel(widget.carId))
                .toList(),
          );
      if (!mounted) return;
      context.go(Routes.myCars);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(carByIdProvider(widget.carId));
    return Scaffold(
      backgroundColor: AppColors.paper,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Swap preferences'),
      ),
      body: async.when(
        loading: () => const LoadingView(),
        error: (e, _) => Center(
            child: Text('$e', style: AppType.body(color: AppColors.mist))),
        data: (car) {
          if (car == null) return const Center(child: Text('Not found'));
          if (!_hydrated) {
            _adjustment = car.preference?.moneyAdjustment ?? MoneyAdjustment.none;
            if (car.preference?.moneyAmount != null) {
              _amount.text = car.preference!.moneyAmount!.toString();
            }
            _desired
              ..clear()
              ..addAll(car.desired.map(_DesiredDraft.fromModel));
            if (_desired.isEmpty) _desired.add(_DesiredDraft());
            _hydrated = true;
          }
          return SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
              children: [
                const SectionLabel(text: 'TRADE TERMS', index: '08'),
                const SizedBox(height: 16),
                Text('Set your terms\nfor ${car.title}.',
                    style: AppType.display2().copyWith(height: 1.1)),
                const SizedBox(height: 28),

                // Money options as pill toggle group
                Text('MONEY ADJUSTMENT', style: AppType.eyebrow()),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _OptionTile(
                        title: 'Even',
                        sub: 'Straight swap',
                        selected: _adjustment == MoneyAdjustment.none,
                        onTap: () => setState(
                            () => _adjustment = MoneyAdjustment.none),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _OptionTile(
                        title: 'Want money',
                        sub: 'They top up',
                        accent: AppColors.signal,
                        selected: _adjustment == MoneyAdjustment.wantsMoney,
                        onTap: () => setState(() =>
                            _adjustment = MoneyAdjustment.wantsMoney),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _OptionTile(
                        title: 'Add money',
                        sub: 'You top up',
                        accent: AppColors.olive,
                        selected: _adjustment == MoneyAdjustment.addsMoney,
                        onTap: () => setState(() =>
                            _adjustment = MoneyAdjustment.addsMoney),
                      ),
                    ),
                  ],
                ),
                if (_adjustment != MoneyAdjustment.none) ...[
                  const SizedBox(height: 14),
                  TextField(
                    controller: _amount,
                    keyboardType: TextInputType.number,
                    style: AppType.body(color: AppColors.ink),
                    decoration: const InputDecoration(
                      hintText: 'Amount (EUR)',
                      prefixText: '€ ',
                    ),
                  ),
                ],

                const SizedBox(height: 32),

                Text('IN EXCHANGE FOR', style: AppType.eyebrow()),
                const SizedBox(height: 4),
                Text(
                  'Tell us what you\'d trade your ${car.title} for.',
                  style: AppType.bodySmall(),
                ),
                const SizedBox(height: 14),

                for (var i = 0; i < _desired.length; i++) ...[
                  _DesiredCard(
                    draft: _desired[i],
                    index: i + 1,
                    onChanged: () => setState(() {}),
                    onRemove: _desired.length > 1
                        ? () => setState(() => _desired.removeAt(i))
                        : null,
                  ),
                  const SizedBox(height: 10),
                ],

                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton.icon(
                    onPressed: () =>
                        setState(() => _desired.add(_DesiredDraft())),
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Add another option'),
                  ),
                ),
                const SizedBox(height: 28),
                PrimaryButton(
                  label: 'Save preferences',
                  meta: 'GO',
                  loading: _saving,
                  onPressed: _save,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _OptionTile extends StatelessWidget {
  const _OptionTile({
    required this.title,
    required this.sub,
    required this.selected,
    required this.onTap,
    this.accent,
  });
  final String title;
  final String sub;
  final bool selected;
  final VoidCallback onTap;
  final Color? accent;

  @override
  Widget build(BuildContext context) {
    final border = selected ? (accent ?? AppColors.ink) : AppColors.borderSoft;
    final fill = selected
        ? (accent ?? AppColors.ink).withValues(alpha: 0.06)
        : AppColors.surface;
    return Material(
      color: fill,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: border, width: selected ? 1.6 : 1),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        splashColor: Colors.transparent,
        highlightColor: const Color(0x08000000),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppType.bodyStrong(
                  color: selected ? (accent ?? AppColors.ink) : AppColors.ink,
                ),
              ),
              const SizedBox(height: 2),
              Text(sub, style: AppType.bodySmall()),
            ],
          ),
        ),
      ),
    );
  }
}

class _DesiredDraft {
  String? make;
  String? model;
  String? yearMin;
  String? yearMax;
  String category = 'any';

  bool get isNonEmpty =>
      (make != null && make!.isNotEmpty) ||
      (model != null && model!.isNotEmpty) ||
      category != 'any';

  static _DesiredDraft fromModel(DesiredVehicle d) => _DesiredDraft()
    ..make = d.make
    ..model = d.model
    ..yearMin = d.yearMin?.toString()
    ..yearMax = d.yearMax?.toString()
    ..category = d.category;

  DesiredVehicle toModel(String carId) => DesiredVehicle(
        carId: carId,
        make: make?.isEmpty == true ? null : make,
        model: model?.isEmpty == true ? null : model,
        yearMin: int.tryParse(yearMin ?? ''),
        yearMax: int.tryParse(yearMax ?? ''),
        category: category,
      );
}

class _DesiredCard extends StatefulWidget {
  const _DesiredCard({
    required this.draft,
    required this.index,
    required this.onChanged,
    this.onRemove,
  });
  final _DesiredDraft draft;
  final int index;
  final VoidCallback onChanged;
  final VoidCallback? onRemove;

  @override
  State<_DesiredCard> createState() => _DesiredCardState();
}

class _DesiredCardState extends State<_DesiredCard> {
  late final _makeCtl = TextEditingController(text: widget.draft.make);
  late final _modelCtl = TextEditingController(text: widget.draft.model);
  late final _yMin = TextEditingController(text: widget.draft.yearMin);
  late final _yMax = TextEditingController(text: widget.draft.yearMax);

  @override
  void dispose() {
    _makeCtl.dispose();
    _modelCtl.dispose();
    _yMin.dispose();
    _yMax.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderSoft),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        children: [
          Row(
            children: [
              Text('OPTION ${widget.index.toString().padLeft(2, '0')}',
                  style: AppType.eyebrow()),
              const Spacer(),
              if (widget.onRemove != null)
                IconButton(
                  visualDensity: VisualDensity.compact,
                  onPressed: widget.onRemove,
                  icon: const Icon(Icons.close, size: 18, color: AppColors.mist),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _makeCtl,
                  style: AppType.body(color: AppColors.ink),
                  decoration: const InputDecoration(hintText: 'Make (any)'),
                  onChanged: (v) {
                    widget.draft.make = v;
                    widget.onChanged();
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _modelCtl,
                  style: AppType.body(color: AppColors.ink),
                  decoration: const InputDecoration(hintText: 'Model (any)'),
                  onChanged: (v) {
                    widget.draft.model = v;
                    widget.onChanged();
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _yMin,
                  keyboardType: TextInputType.number,
                  style: AppType.body(color: AppColors.ink),
                  decoration: const InputDecoration(hintText: 'Year min'),
                  onChanged: (v) {
                    widget.draft.yearMin = v;
                    widget.onChanged();
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _yMax,
                  keyboardType: TextInputType.number,
                  style: AppType.body(color: AppColors.ink),
                  decoration: const InputDecoration(hintText: 'Year max'),
                  onChanged: (v) {
                    widget.draft.yearMax = v;
                    widget.onChanged();
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Category as chip row
          Align(
            alignment: Alignment.centerLeft,
            child: Text('CATEGORY', style: AppType.eyebrow()),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                for (final c in CarData.vehicleCategories) ...[
                  _CategoryPill(
                    label: CarData.label(c),
                    selected: widget.draft.category == c,
                    onTap: () {
                      widget.draft.category = c;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(width: 8),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryPill extends StatelessWidget {
  const _CategoryPill({
    required this.label,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.ink : AppColors.surface,
      shape: StadiumBorder(
        side: BorderSide(
          color: selected ? AppColors.ink : AppColors.borderSoft,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        splashColor: Colors.transparent,
        highlightColor: const Color(0x14000000),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: Text(
            label,
            style: AppType.bodySmall(
              color: selected ? AppColors.surface : AppColors.ink,
            ).copyWith(fontWeight: FontWeight.w600),
          ),
        ),
      ),
    );
  }
}

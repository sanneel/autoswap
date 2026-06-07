import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/constants/car_data.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/loading_view.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/section_label.dart';
import '../data/models/car.dart';
import 'cars_controller.dart';

class CreateCarScreen extends ConsumerStatefulWidget {
  const CreateCarScreen({super.key, this.carId});
  final String? carId;

  @override
  ConsumerState<CreateCarScreen> createState() => _CreateCarScreenState();
}

class _CreateCarScreenState extends ConsumerState<CreateCarScreen> {
  final _formKey = GlobalKey<FormState>();
  final _make = TextEditingController();
  final _model = TextEditingController();
  final _year = TextEditingController();
  final _mileage = TextEditingController();
  final _engine = TextEditingController();
  final _description = TextEditingController();
  String _fuel = CarData.fuelTypes.first;
  String _transmission = CarData.transmissions.first;
  String _color = CarData.colors.first;

  bool _saving = false;
  String? _editingCarId;
  bool _hydrated = false;

  @override
  void dispose() {
    _make.dispose();
    _model.dispose();
    _year.dispose();
    _mileage.dispose();
    _engine.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final draft = Car(
        id: _editingCarId ?? '',
        ownerId: '',
        make: _make.text.trim(),
        model: _model.text.trim(),
        year: int.parse(_year.text.trim()),
        mileageKm: int.parse(_mileage.text.trim()),
        fuelType: _fuel,
        transmission: _transmission,
        engineSizeL: double.tryParse(_engine.text.trim()) ?? 0,
        color: _color,
        description: _description.text.trim().isEmpty
            ? null
            : _description.text.trim(),
      );
      late Car saved;
      if (_editingCarId == null) {
        saved = await ref.read(carsControllerProvider).createCar(draft);
      } else {
        final patch = draft.toInsert('')..remove('owner_id');
        saved = await ref
            .read(carsControllerProvider)
            .updateCar(_editingCarId!, patch);
      }
      if (!mounted) return;
      context.go(Routes.prefsFor(saved.id));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _addPhoto(String carId) async {
    final files = await ImagePicker()
        .pickMultiImage(maxWidth: 1600, imageQuality: 80);
    final carAsync = ref.read(carByIdProvider(carId));
    final existing = carAsync.value?.photos.length ?? 0;
    var pos = existing;
    for (final f in files) {
      if (pos >= AppConstants.maxCarPhotos) break;
      await ref.read(carsControllerProvider).addPhotoFromFile(
            carId: carId,
            file: File(f.path),
            position: pos++,
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.carId != null;
    _editingCarId = widget.carId;

    if (isEdit && !_hydrated) {
      final async = ref.watch(carByIdProvider(widget.carId!));
      return Scaffold(
        backgroundColor: AppColors.paper,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
          title: const Text('განცხადების შეცვლა'),
        ),
        body: async.when(
          loading: () => const LoadingView(),
          error: (e, _) => Center(
            child: Text('$e', style: AppType.body(color: AppColors.mist)),
          ),
          data: (car) {
            if (car == null) {
              return const Center(child: Text('განცხადება ვერ მოიძებნა'));
            }
            _make.text = car.make;
            _model.text = car.model;
            _year.text = car.year.toString();
            _mileage.text = car.mileageKm.toString();
            _engine.text = car.engineSizeL.toString();
            _description.text = car.description ?? '';
            _fuel = car.fuelType;
            _transmission = car.transmission;
            _color = car.color;
            _hydrated = true;
            return _form(car);
          },
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.paper,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('განცხადების დამატება'),
      ),
      body: _form(null),
    );
  }

  Widget _form(Car? carForPhotos) {
    return SafeArea(
      child: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
          children: [
            const SectionLabel(text: 'ახალი განცხადება', index: '01'),
            const SizedBox(height: 12),
            Text(
              widget.carId == null ? 'დაამატე მანქანა' : 'შეცვალე მანქანა',
              style: AppType.display1(),
            ),
            const SizedBox(height: 18),
            if (carForPhotos != null) ...[
              _Label('ფოტოები'),
              SizedBox(
                height: 88,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: carForPhotos.photos.length + 1,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) {
                    if (i == carForPhotos.photos.length) {
                      return InkWell(
                        onTap: () => _addPhoto(carForPhotos.id),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          width: 88,
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            border: Border.all(color: AppColors.borderSoft),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          alignment: Alignment.center,
                          child: const Icon(Icons.add_a_photo_outlined,
                              color: AppColors.signal),
                        ),
                      );
                    }
                    final photo = carForPhotos.photos[i];
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(photo.url,
                          width: 88, height: 88, fit: BoxFit.cover),
                    );
                  },
                ),
              ),
              const SizedBox(height: 18),
            ],
            _Label('მარკა'),
            DropdownButtonFormField<String>(
              initialValue: CarData.popularMakes.contains(_make.text)
                  ? _make.text
                  : null,
              items: CarData.popularMakes
                  .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                  .toList(),
              onChanged: (v) => _make.text = v ?? '',
              decoration: const InputDecoration(hintText: 'მაგ. Toyota'),
              validator: (v) => Validators.required(v, field: 'მარკა'),
            ),
            const SizedBox(height: 14),
            _Label('მოდელი'),
            TextFormField(
              controller: _model,
              style: AppType.body(color: AppColors.ink),
              decoration: const InputDecoration(hintText: 'მაგ. Prius'),
              validator: (v) => Validators.required(v, field: 'მოდელი'),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: _NumberField(
                    label: 'წელი',
                    controller: _year,
                    hint: '2018',
                    validator: Validators.year,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _NumberField(
                    label: 'გარბენი კმ',
                    controller: _mileage,
                    hint: '142000',
                    validator: (v) =>
                        Validators.positiveInt(v, field: 'გარბენი'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _Label('საწვავი'),
            _ChipRow(
              options: CarData.fuelTypes,
              selected: _fuel,
              onChanged: (v) => setState(() => _fuel = v),
            ),
            const SizedBox(height: 16),
            _Label('კოლოფი'),
            _ChipRow(
              options: CarData.transmissions,
              selected: _transmission,
              onChanged: (v) => setState(() => _transmission = v),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _NumberField(
                    label: 'ძრავი ლ',
                    controller: _engine,
                    hint: '1.8',
                    decimal: true,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _Label('ფერი'),
                      DropdownButtonFormField<String>(
                        initialValue: _color,
                        items: CarData.colors
                            .map((c) =>
                                DropdownMenuItem(value: c, child: Text(c)))
                            .toList(),
                        onChanged: (v) => setState(() => _color = v ?? _color),
                        decoration: const InputDecoration(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _Label('აღწერა'),
            TextFormField(
              controller: _description,
              maxLines: 4,
              style: AppType.body(color: AppColors.ink),
              decoration: const InputDecoration(
                hintText: 'მდგომარეობა, სერვისი, დაზიანებები ან სხვა დეტალი',
              ),
            ),
            const SizedBox(height: 24),
            PrimaryButton(
              label: widget.carId == null
                  ? 'შენახვა და გაგრძელება'
                  : 'ცვლილებების შენახვა',
              loading: _saving,
              onPressed: _save,
            ),
          ],
        ),
      ),
    );
  }
}

class _NumberField extends StatelessWidget {
  const _NumberField({
    required this.label,
    required this.controller,
    required this.hint,
    this.validator,
    this.decimal = false,
  });
  final String label;
  final TextEditingController controller;
  final String hint;
  final FormFieldValidator<String>? validator;
  final bool decimal;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Label(label),
        TextFormField(
          controller: controller,
          keyboardType: decimal
              ? const TextInputType.numberWithOptions(decimal: true)
              : TextInputType.number,
          style: AppType.body(color: AppColors.ink),
          decoration: InputDecoration(hintText: hint),
          validator: validator,
        ),
      ],
    );
  }
}

class _Label extends StatelessWidget {
  const _Label(this.text);
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(text, style: AppType.eyebrow()),
      );
}

class _ChipRow extends StatelessWidget {
  const _ChipRow({
    required this.options,
    required this.selected,
    required this.onChanged,
  });
  final List<String> options;
  final String selected;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (final o in options) ...[
            _Chip(
              label: CarData.label(o),
              selected: o == selected,
              onTap: () => onChanged(o),
            ),
            const SizedBox(width: 8),
          ],
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({
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
      color: selected ? AppColors.signalWash : AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: selected ? AppColors.signal : AppColors.borderSoft,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        splashColor: Colors.transparent,
        highlightColor: const Color(0x0F183B63),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Text(
            label,
            style: AppType.bodyStrong(
              color: selected ? AppColors.signal : AppColors.ink,
            ),
          ),
        ),
      ),
    );
  }
}

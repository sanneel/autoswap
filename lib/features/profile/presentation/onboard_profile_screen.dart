import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/section_label.dart';
import 'profile_controller.dart';

class OnboardProfileScreen extends ConsumerStatefulWidget {
  const OnboardProfileScreen({super.key});
  @override
  ConsumerState<OnboardProfileScreen> createState() => _S();
}

class _S extends ConsumerState<OnboardProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtl = TextEditingController();
  final _cityCtl = TextEditingController();
  final _countryCtl = TextEditingController();
  File? _avatar;
  bool _saving = false;

  @override
  void dispose() {
    _nameCtl.dispose();
    _cityCtl.dispose();
    _countryCtl.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    final x = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1024,
      maxHeight: 1024,
      imageQuality: 80,
    );
    if (x != null) setState(() => _avatar = File(x.path));
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await ref.read(profileControllerProvider.notifier).saveBasics(
            fullName: _nameCtl.text.trim(),
            city: _cityCtl.text.trim().isEmpty ? null : _cityCtl.text.trim(),
            country:
                _countryCtl.text.trim().isEmpty ? null : _countryCtl.text.trim(),
          );
      if (_avatar != null) {
        await ref
            .read(profileControllerProvider.notifier)
            .uploadAvatar(_avatar!);
      }
      if (!mounted) return;
      context.go(Routes.home);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.paper,
      appBar: AppBar(title: const Text('Set up profile')),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
            children: [
              const SectionLabel(text: 'IDENTIFICATION', index: '00'),
              const SizedBox(height: 20),
              Text('Your\ncalling\ncard.',
                  style: AppType.display1().copyWith(height: 1.0)),
              const SizedBox(height: 24),
              Center(
                child: GestureDetector(
                  onTap: _pickAvatar,
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      border: Border.all(color: AppColors.borderInk, width: 1.2),
                    ),
                    child: _avatar != null
                        ? Image.file(_avatar!, fit: BoxFit.cover)
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.add_a_photo_outlined, size: 24),
                              const SizedBox(height: 6),
                              Text('UPLOAD',
                                  style: AppType.eyebrow(color: AppColors.ink)),
                            ],
                          ),
                  ),
                ),
              ),
              const SizedBox(height: 28),
              Text('01 — FULL NAME', style: AppType.eyebrow()),
              const SizedBox(height: 6),
              TextFormField(
                controller: _nameCtl,
                style: AppType.body(color: AppColors.ink),
                validator: (v) => Validators.required(v, field: 'Name'),
                decoration: const InputDecoration(hintText: 'e.g. Alex Demo'),
              ),
              const SizedBox(height: 16),
              Text('02 — CITY', style: AppType.eyebrow()),
              const SizedBox(height: 6),
              TextFormField(
                controller: _cityCtl,
                style: AppType.body(color: AppColors.ink),
                decoration: const InputDecoration(hintText: 'e.g. Lisbon'),
              ),
              const SizedBox(height: 16),
              Text('03 — COUNTRY', style: AppType.eyebrow()),
              const SizedBox(height: 6),
              TextFormField(
                controller: _countryCtl,
                style: AppType.body(color: AppColors.ink),
                decoration: const InputDecoration(hintText: 'e.g. Portugal'),
              ),
              const SizedBox(height: 28),
              PrimaryButton(
                label: 'Continue',
                meta: 'GO',
                loading: _saving,
                onPressed: _save,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

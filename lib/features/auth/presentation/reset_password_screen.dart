import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/section_label.dart';
import 'auth_controller.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  const ResetPasswordScreen({super.key});
  @override
  ConsumerState<ResetPasswordScreen> createState() => _S();
}

class _S extends ConsumerState<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtl = TextEditingController();

  @override
  void dispose() {
    _emailCtl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final f = await ref
        .read(authControllerProvider.notifier)
        .sendPasswordReset(_emailCtl.text.trim());
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(f?.message ?? 'Reset link dispatched. Check your inbox.'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authControllerProvider);
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back),
        ),
        title: const Text('Reset password'),
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
            children: [
              const SectionLabel(text: 'RECOVERY', index: '00'),
              const SizedBox(height: 20),
              Text('Lost your\nkey?', style: AppType.display1().copyWith(height: 1.0)),
              const SizedBox(height: 12),
              Text(
                'Enter the email you signed up with. A single-use link will be '
                'sent your way.',
                style: AppType.body(color: AppColors.mist),
              ),
              const SizedBox(height: 28),
              Text('01 — EMAIL', style: AppType.eyebrow()),
              const SizedBox(height: 6),
              TextFormField(
                controller: _emailCtl,
                keyboardType: TextInputType.emailAddress,
                style: AppType.body(color: AppColors.ink),
                validator: Validators.email,
                decoration: const InputDecoration(hintText: 'you@example.com'),
              ),
              const SizedBox(height: 24),
              PrimaryButton(
                label: 'Send reset link',
                meta: 'SEND',
                loading: state.isLoading,
                onPressed: _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../demo/demo_store.dart';
import 'auth_controller.dart';

class SignUpScreen extends ConsumerStatefulWidget {
  const SignUpScreen({super.key});

  @override
  ConsumerState<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends ConsumerState<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtl = TextEditingController();
  final _passCtl = TextEditingController();

  @override
  void dispose() {
    _emailCtl.dispose();
    _passCtl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final failure = await ref
        .read(authControllerProvider.notifier)
        .signUp(_emailCtl.text.trim(), _passCtl.text);
    if (!mounted) return;
    if (failure != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(failure.message)),
      );
      return;
    }
    context.go(DemoStore.isActive ? Routes.home : Routes.onboardProfile);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authControllerProvider);
    return Scaffold(
      backgroundColor: AppColors.paper,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('რეგისტრაცია'),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 430),
            child: Form(
              key: _formKey,
              child: ListView(
                shrinkWrap: true,
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                children: [
                  Text('ანგარიშის შექმნა', style: AppType.display1()),
                  const SizedBox(height: 8),
                  Text(
                    'დამატე განცხადება და მიიღე გაცვლის შეთავაზებები.',
                    style: AppType.body(color: AppColors.mist),
                  ),
                  const SizedBox(height: 22),
                  _Label('ელფოსტა'),
                  TextFormField(
                    controller: _emailCtl,
                    keyboardType: TextInputType.emailAddress,
                    style: AppType.body(color: AppColors.ink),
                    validator: Validators.email,
                    decoration: const InputDecoration(hintText: 'name@example.com'),
                  ),
                  const SizedBox(height: 14),
                  _Label('პაროლი'),
                  TextFormField(
                    controller: _passCtl,
                    obscureText: true,
                    style: AppType.body(color: AppColors.ink),
                    validator: Validators.password,
                    decoration: const InputDecoration(hintText: 'მინიმუმ 8 სიმბოლო'),
                  ),
                  const SizedBox(height: 22),
                  PrimaryButton(
                    label: 'რეგისტრაცია',
                    loading: state.isLoading,
                    onPressed: _submit,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
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

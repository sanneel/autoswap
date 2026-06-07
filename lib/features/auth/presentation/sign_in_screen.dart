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

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
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
        .signIn(_emailCtl.text.trim(), _passCtl.text);
    if (!mounted) return;
    if (failure != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(failure.message)),
      );
    }
  }

  Future<void> _useDemoAccount() async {
    final failure = await ref
        .read(authControllerProvider.notifier)
        .signIn('demo@autoswap.ge', 'demopassword');
    if (!mounted) return;
    if (failure != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(failure.message)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authControllerProvider);
    final demo = DemoStore.isActive;

    return Scaffold(
      backgroundColor: AppColors.paper,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 430),
            child: Form(
              key: _formKey,
              child: ListView(
                shrinkWrap: true,
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
                children: [
                  Text('AutoSwap',
                      style: AppType.display1(color: AppColors.signal)),
                  const SizedBox(height: 8),
                  Text(
                    'მანქანის გაცვლის განცხადებები საქართველოში',
                    style: AppType.body(color: AppColors.mist),
                  ),
                  const SizedBox(height: 24),
                  if (demo) ...[
                    _DemoBox(onUseDemo: _useDemoAccount),
                    const SizedBox(height: 18),
                  ],
                  _Label('ელფოსტა'),
                  TextFormField(
                    controller: _emailCtl,
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.email],
                    style: AppType.body(color: AppColors.ink),
                    validator: Validators.email,
                    decoration: const InputDecoration(hintText: 'name@example.com'),
                  ),
                  const SizedBox(height: 14),
                  _Label('პაროლი'),
                  TextFormField(
                    controller: _passCtl,
                    obscureText: true,
                    autofillHints: const [AutofillHints.password],
                    style: AppType.body(color: AppColors.ink),
                    validator: Validators.password,
                    decoration: const InputDecoration(hintText: 'მინიმუმ 8 სიმბოლო'),
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () => context.push(Routes.resetPassword),
                      child: const Text('პაროლის აღდგენა'),
                    ),
                  ),
                  const SizedBox(height: 16),
                  PrimaryButton(
                    label: 'შესვლა',
                    loading: state.isLoading,
                    onPressed: _submit,
                  ),
                  const SizedBox(height: 14),
                  OutlinedButton(
                    onPressed: () => context.push(Routes.signUp),
                    child: const Text('რეგისტრაცია'),
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

class _DemoBox extends StatelessWidget {
  const _DemoBox({required this.onUseDemo});
  final VoidCallback onUseDemo;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderSoft),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('დემო რეჟიმი', style: AppType.title()),
          const SizedBox(height: 4),
          Text(
            'შეგიძლია პირდაპირ გახსნა სატესტო განცხადებები.',
            style: AppType.body(color: AppColors.mist),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: onUseDemo,
            child: const Text('დემო ანგარიშით შესვლა'),
          ),
        ],
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

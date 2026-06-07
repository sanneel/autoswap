import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/section_label.dart';
import 'paywall_controller.dart';

class PaywallScreen extends ConsumerWidget {
  const PaywallScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(paywallControllerProvider);
    final unlocked = ref.watch(contactUnlockedProvider).valueOrNull ?? false;

    return Scaffold(
      backgroundColor: AppColors.paper,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SectionLabel(text: 'CONTACT EXCHANGE', index: '✦'),
              const SizedBox(height: 28),
              // Hero block
              Container(
                decoration: BoxDecoration(
                  color: AppColors.ink,
                  borderRadius: BorderRadius.circular(28),
                ),
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: AppColors.signal,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text('LIFETIME UNLOCK',
                            style:
                                AppType.eyebrow(color: AppColors.surface)),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Exchange phone\nnumbers, emails,\nand links.',
                      style: AppType.display1(color: AppColors.surface)
                          .copyWith(height: 1.0),
                    ),
                    const SizedBox(height: 16),
                    Container(width: 32, height: 1, color: AppColors.surface),
                    const SizedBox(height: 16),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '€4.99',
                          style: AppType.display1(color: AppColors.signal)
                              .copyWith(fontSize: 48, height: 1.0),
                        ),
                        const SizedBox(width: 8),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Text(
                            'ONE-TIME',
                            style:
                                AppType.eyebrow(color: AppColors.surface),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              _Feature(num: '01', text: 'Applies to every current and future match'),
              _Feature(num: '02', text: 'Restore on any device with one tap'),
              _Feature(num: '03', text: 'No subscription. No expiry.'),

              const Spacer(),

              if (unlocked)
                PrimaryButton(
                  label: 'Continue',
                  meta: 'OK',
                  onPressed: () => context.pop(),
                )
              else ...[
                PrimaryButton(
                  label: 'Purchase',
                  meta: '€4.99',
                  variant: PrimaryButtonVariant.signal,
                  loading: state.isLoading,
                  onPressed: () async {
                    final ok = await ref
                        .read(paywallControllerProvider.notifier)
                        .purchase();
                    if (!context.mounted) return;
                    if (ok) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('UNLOCKED')),
                      );
                      context.pop();
                    }
                  },
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () =>
                      ref.read(paywallControllerProvider.notifier).restore(),
                  child: const Text('RESTORE PURCHASES'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _Feature extends StatelessWidget {
  const _Feature({required this.num, required this.text});
  final String num;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 36,
            child: Text(num, style: AppType.mono(color: AppColors.ink)),
          ),
          Expanded(child: Text(text, style: AppType.body())),
        ],
      ),
    );
  }
}

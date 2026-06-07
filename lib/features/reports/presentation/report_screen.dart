import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/di/providers.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/section_label.dart';
import '../data/models/report.dart';

class ReportScreen extends ConsumerStatefulWidget {
  const ReportScreen({super.key, this.reportedUserId, this.reportedCarId});
  final String? reportedUserId;
  final String? reportedCarId;

  @override
  ConsumerState<ReportScreen> createState() => _S();
}

class _S extends ConsumerState<ReportScreen> {
  ReportReason _reason = ReportReason.spam;
  final _details = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _details.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final id = ref.read(currentUserIdProvider);
    if (id == null) return;
    setState(() => _sending = true);
    try {
      await ref.read(reportsRepositoryProvider).submit(
            reporterId: id,
            reportedUserId: widget.reportedUserId,
            reportedCarId: widget.reportedCarId,
            reason: _reason,
            details: _details.text.trim().isEmpty
                ? null
                : _details.text.trim(),
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('FILED · OUR TEAM WILL REVIEW')),
      );
      context.pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.paper,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Report'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
          children: [
            const SectionLabel(text: 'INCIDENT REPORT', index: '✖'),
            const SizedBox(height: 20),
            Text('What happened?', style: AppType.display2()),
            const SizedBox(height: 16),
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: Border.all(color: AppColors.borderInk),
              ),
              child: Column(
                children: [
                  for (var i = 0; i < ReportReason.values.length; i++) ...[
                    _ReasonRow(
                      label: ReportReason.values[i].label,
                      code: 'R.${(i + 1).toString().padLeft(2, '0')}',
                      selected: _reason == ReportReason.values[i],
                      onTap: () =>
                          setState(() => _reason = ReportReason.values[i]),
                    ),
                    if (i != ReportReason.values.length - 1)
                      Container(height: 1, color: AppColors.borderSoft),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 28),
            Text('NOTES (OPTIONAL)', style: AppType.eyebrow()),
            const SizedBox(height: 6),
            TextField(
              controller: _details,
              maxLines: 5,
              style: AppType.body(color: AppColors.ink),
              decoration:
                  const InputDecoration(hintText: 'Anything else we should know?'),
            ),
            const SizedBox(height: 28),
            PrimaryButton(
              label: 'Submit report',
              meta: 'SEND',
              variant: PrimaryButtonVariant.signal,
              loading: _sending,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}

class _ReasonRow extends StatelessWidget {
  const _ReasonRow({
    required this.label,
    required this.code,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final String code;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
        child: Row(
          children: [
            Container(
              width: 18,
              height: 18,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.borderInk, width: 1.5),
                color: selected ? AppColors.ink : AppColors.surface,
              ),
              alignment: Alignment.center,
              child: selected
                  ? const Icon(Icons.check,
                      size: 12, color: AppColors.surface)
                  : null,
            ),
            const SizedBox(width: 14),
            Expanded(child: Text(label, style: AppType.bodyStrong())),
            Text(code, style: AppType.mono(color: AppColors.mist)),
          ],
        ),
      ),
    );
  }
}

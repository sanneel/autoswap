import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/di/providers.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/contact_filter.dart';
import '../../../core/widgets/loading_view.dart';
import '../../matches/presentation/matches_controller.dart';
import '../../paywall/presentation/paywall_controller.dart';
import '../data/chat_repository.dart';
import 'chat_controller.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key, required this.matchId});
  final String matchId;
  @override
  ConsumerState<ChatScreen> createState() => _S();
}

class _S extends ConsumerState<ChatScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(chatControllerProvider).markRead(widget.matchId);
    });
  }

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      await ref.read(chatControllerProvider).send(widget.matchId, text);
      _input.clear();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scroll.hasClients) {
          _scroll.animateTo(
            _scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeOut,
          );
        }
      });
    } on ContactBlockedException catch (_) {
      if (!mounted) return;
      _showBlockedDialog();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _showBlockedDialog() {
    showDialog<void>(
      context: context,
      builder: (_) => Dialog(
        backgroundColor: AppColors.surface,
        shape: const RoundedRectangleBorder(
          side: BorderSide(color: AppColors.borderInk),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
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
                  Text('BLOCKED',
                      style: AppType.eyebrow(color: AppColors.signal)),
                ],
              ),
              const SizedBox(height: 12),
              Text(ContactFilter.blockedMessage, style: AppType.body()),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('CLOSE'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.signal,
                      ),
                      onPressed: () {
                        Navigator.of(context).pop();
                        context.push(Routes.paywall);
                      },
                      child: const Text('UNLOCK'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final viewerId = ref.watch(currentUserIdProvider);
    final matchAsync = ref.watch(matchByIdProvider(widget.matchId));
    final messagesAsync =
        ref.watch(messagesStreamProvider(widget.matchId));
    final unlocked = ref.watch(contactUnlockedProvider).valueOrNull ?? false;

    return Scaffold(
      backgroundColor: AppColors.paper,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: matchAsync.when(
          loading: () => const Text('CHAT'),
          error: (_, __) => const Text('CHAT'),
          data: (m) {
            if (m == null) return const Text('CHAT');
            final other = m.otherCarFor(viewerId ?? '');
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  (other.ownerName ?? 'Unknown').toUpperCase(),
                  style: AppType.eyebrow(color: AppColors.ink),
                ),
                Text(
                  other.title,
                  style: AppType.title(),
                ),
              ],
            );
          },
        ),
        actions: [
          IconButton(
            tooltip: 'Report',
            onPressed: () {
              final m = matchAsync.value;
              context.push(
                Routes.report,
                extra: {'userId': m?.otherUserIdFor(viewerId ?? '')},
              );
            },
            icon: const Icon(Icons.flag_outlined),
          ),
        ],
      ),
      body: Column(
        children: [
          // unlock status strip
          Container(
            width: double.infinity,
            color: unlocked
                ? AppColors.olive.withValues(alpha: 0.08)
                : AppColors.signal.withValues(alpha: 0.06),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                Icon(
                  unlocked ? Icons.lock_open : Icons.lock_outline,
                  size: 14,
                  color: unlocked ? AppColors.olive : AppColors.signal,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    unlocked
                        ? 'CONTACT EXCHANGE UNLOCKED'
                        : 'CONTACT INFO BLOCKED — UNLOCK TO SHARE NUMBERS · EMAILS · LINKS',
                    style: AppType.eyebrow(
                      color: unlocked ? AppColors.olive : AppColors.signal,
                    ),
                  ),
                ),
                if (!unlocked)
                  GestureDetector(
                    onTap: () => context.push(Routes.paywall),
                    child: Text(
                      'UNLOCK ↗',
                      style: AppType.eyebrow(color: AppColors.signal)
                          .copyWith(decoration: TextDecoration.underline),
                    ),
                  ),
              ],
            ),
          ),

          // messages
          Expanded(
            child: messagesAsync.when(
              loading: () => const LoadingView(),
              error: (e, _) => Center(
                child: Text('$e', style: AppType.body(color: AppColors.mist)),
              ),
              data: (msgs) {
                if (msgs.isEmpty) {
                  return Center(
                    child: Text('SAY HI', style: AppType.eyebrow()),
                  );
                }
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (_scroll.hasClients) {
                    _scroll.jumpTo(_scroll.position.maxScrollExtent);
                  }
                });
                return ListView.builder(
                  controller: _scroll,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 12),
                  itemCount: msgs.length,
                  itemBuilder: (_, i) {
                    final m = msgs[i];
                    final mine = m.senderId == viewerId;
                    return _Bubble(message: m, mine: mine);
                  },
                );
              },
            ),
          ),

          // input
          Container(
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(top: BorderSide(color: AppColors.borderSoft)),
            ),
            child: SafeArea(
              top: false,
              child: Padding(
                padding:
                    const EdgeInsets.fromLTRB(12, 10, 12, 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _input,
                        minLines: 1,
                        maxLines: 4,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _send(),
                        style: AppType.body(color: AppColors.ink),
                        decoration: InputDecoration(
                          hintText: 'Type a message',
                          hintStyle:
                              AppType.body(color: AppColors.mist),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          filled: false,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 4,
                            vertical: 12,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      height: 48,
                      width: 48,
                      child: Material(
                        color: AppColors.signal,
                        shape: const CircleBorder(),
                        clipBehavior: Clip.antiAlias,
                        child: InkWell(
                          onTap: _send,
                          child: Center(
                            child: _sending
                                ? const SizedBox(
                                    height: 18,
                                    width: 18,
                                    child: CircularProgressIndicator(
                                      color: AppColors.surface,
                                      strokeWidth: 2.5,
                                    ),
                                  )
                                : const Icon(
                                    Icons.arrow_upward,
                                    color: AppColors.surface,
                                  ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.message, required this.mine});
  final dynamic message;
  final bool mine;

  @override
  Widget build(BuildContext context) {
    final color = mine ? AppColors.ink : AppColors.surface;
    final fg = mine ? AppColors.surface : AppColors.ink;
    final borderColor = mine ? AppColors.ink : AppColors.borderInk;
    final time = DateFormat.Hm().format(message.createdAt as DateTime);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment:
            mine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.78,
            ),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: borderColor, width: 1),
            ),
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Text(message.body as String, style: AppType.body(color: fg)),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment:
                mine ? MainAxisAlignment.end : MainAxisAlignment.start,
            children: [
              Text(time, style: AppType.mono(color: AppColors.mist)),
              if (mine) ...[
                const SizedBox(width: 6),
                Icon(
                  (message.isRead as bool) ? Icons.done_all : Icons.check,
                  size: 12,
                  color: AppColors.mist,
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

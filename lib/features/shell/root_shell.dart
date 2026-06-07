import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class RootShell extends StatelessWidget {
  const RootShell({super.key, required this.child});
  final Widget child;

  static const _destinations = [
    (route: Routes.home, icon: Icons.home_outlined, label: 'მთავარი'),
    (route: Routes.matches, icon: Icons.handshake_outlined, label: 'შეთავაზებები'),
    (route: Routes.chats, icon: Icons.chat_bubble_outline, label: 'შეტყობინებები'),
  ];

  static const _desktopLabels = [
    'განცხადებები',
    'შეთავაზებები',
    'შეტყობინებები',
  ];

  int _indexFor(BuildContext context) {
    final loc = GoRouterState.of(context).matchedLocation;
    final i = _destinations.indexWhere((d) => loc.startsWith(d.route));
    return i < 0 ? 0 : i;
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.sizeOf(context).width >= 900;
    final idx = _indexFor(context);

    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Column(
        children: [
          if (isDesktop) _DesktopHeader(selectedIndex: idx),
          Expanded(child: child),
        ],
      ),
      bottomNavigationBar: isDesktop ? null : _MobileNav(selectedIndex: idx),
    );
  }
}

class _DesktopHeader extends StatelessWidget {
  const _DesktopHeader({required this.selectedIndex});
  final int selectedIndex;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: Container(
        height: 68,
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(bottom: BorderSide(color: AppColors.borderSoft)),
        ),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1180),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  InkWell(
                    onTap: () => context.go(Routes.home),
                    child: Text(
                      'AutoSwap',
                      style: AppType.headline(color: AppColors.signal),
                    ),
                  ),
                  const SizedBox(width: 38),
                  for (var i = 0; i < RootShell._destinations.length; i++) ...[
                    _DesktopLink(
                      label: RootShell._desktopLabels[i],
                      selected: selectedIndex == i,
                      onTap: () => context.go(RootShell._destinations[i].route),
                    ),
                    const SizedBox(width: 22),
                  ],
                  const Spacer(),
                  TextButton(
                    onPressed: () => context.go(Routes.profile),
                    child: const Text('შესვლა'),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    height: 42,
                    child: ElevatedButton(
                      onPressed: () => context.go(Routes.createCar),
                      child: const Text('დაამატე განცხადება'),
                    ),
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

class _DesktopLink extends StatelessWidget {
  const _DesktopLink({
    required this.label,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Text(
          label,
          style: AppType.bodyStrong(
            color: selected ? AppColors.signal : AppColors.ink,
          ),
        ),
      ),
    );
  }
}

class _MobileNav extends StatelessWidget {
  const _MobileNav({required this.selectedIndex});
  final int selectedIndex;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.borderSoft, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: [
              for (var i = 0; i < RootShell._destinations.length; i++)
                Expanded(
                  child: _NavItem(
                    icon: RootShell._destinations[i].icon,
                    label: RootShell._destinations[i].label,
                    selected: i == selectedIndex,
                    onTap: () => context.go(RootShell._destinations[i].route),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final fg = selected ? AppColors.signal : AppColors.mist;
    return InkWell(
      onTap: onTap,
      splashColor: Colors.transparent,
      highlightColor: const Color(0x08000000),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: fg, size: 20),
          const SizedBox(height: 4),
          Text(label, style: AppType.eyebrow(color: fg).copyWith(fontSize: 10)),
          const SizedBox(height: 4),
          Container(
            width: 24,
            height: 2,
            color: selected ? AppColors.signal : Colors.transparent,
          ),
        ],
      ),
    );
  }
}

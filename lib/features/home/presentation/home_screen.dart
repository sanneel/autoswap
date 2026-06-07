import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/car_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/loading_view.dart';
import '../../../core/widgets/money_chip.dart';
import '../../cars/data/models/car.dart';
import 'home_controller.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(homeControllerProvider);
    final ctl = ref.read(homeControllerProvider.notifier);
    final isDesktop = MediaQuery.sizeOf(context).width >= 900;

    return Scaffold(
      backgroundColor: AppColors.paper,
      body: SafeArea(
        top: !isDesktop,
        child: Builder(
          builder: (_) {
            if (state.loading && state.queue.isEmpty) return const LoadingView();
            if (state.error != null && state.queue.isEmpty) {
              return Center(
                child: Text(
                  '${state.error}',
                  style: AppType.body(color: AppColors.mist),
                ),
              );
            }
            if (state.queue.isEmpty) {
              return EmptyState(
                eyebrow: 'განცხადებები',
                icon: Icons.directions_car_outlined,
                title: 'ამ ეტაპზე ახალი განცხადება არ არის',
                message: 'განაახლე სია ან მოგვიანებით შეამოწმე.',
                action: OutlinedButton(
                  onPressed: () => ctl.refresh(),
                  child: const Text('განახლება'),
                ),
              );
            }

            return RefreshIndicator(
              color: AppColors.signal,
              backgroundColor: AppColors.surface,
              onRefresh: ctl.refresh,
              child: isDesktop
                  ? _DesktopHome(
                      cars: state.queue,
                      onOffer: (car) => _showOfferSheet(context, car),
                    )
                  : _MobileHome(
                      cars: state.queue,
                      onOffer: (car) => _showOfferSheet(context, car),
                    ),
            );
          },
        ),
      ),
    );
  }

  void _showOfferSheet(BuildContext context, Car car) {
    final content = _OfferSheet(car: car);
    if (MediaQuery.sizeOf(context).width >= 900) {
      showDialog<void>(
        context: context,
        builder: (_) => Dialog(
          insetPadding: const EdgeInsets.all(24),
          child: SizedBox(width: 460, child: content),
        ),
      );
      return;
    }
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
      ),
      builder: (_) => content,
    );
  }
}

class _DesktopHome extends StatelessWidget {
  const _DesktopHome({required this.cars, required this.onOffer});
  final List<Car> cars;
  final ValueChanged<Car> onOffer;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1180),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(width: 24),
            const SizedBox(
              width: 278,
              child: _DesktopFilterPanel(),
            ),
            const SizedBox(width: 22),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(0, 22, 24, 48),
                children: [
                  _Intro(count: cars.length),
                  const SizedBox(height: 14),
                  const _SearchBox(),
                  const SizedBox(height: 14),
                  _ResultHeader(count: cars.length),
                  const SizedBox(height: 10),
                  for (var i = 0; i < cars.length; i++) ...[
                    _ListingRow(car: cars[i], onOffer: () => onOffer(cars[i])),
                    if (i != cars.length - 1) const SizedBox(height: 12),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MobileHome extends StatelessWidget {
  const _MobileHome({required this.cars, required this.onOffer});
  final List<Car> cars;
  final ValueChanged<Car> onOffer;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 640),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
          children: [
            _Intro(count: cars.length),
            const SizedBox(height: 14),
            const _SearchBox(),
            const SizedBox(height: 10),
            const _FilterRow(),
            const SizedBox(height: 14),
            for (var i = 0; i < cars.length; i++) ...[
              _ListingRow(car: cars[i], onOffer: () => onOffer(cars[i])),
              if (i != cars.length - 1) const SizedBox(height: 12),
            ],
          ],
        ),
      ),
    );
  }
}

class _Intro extends StatelessWidget {
  const _Intro({required this.count});
  final int count;

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.sizeOf(context).width >= 900;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (!isDesktop) ...[
          Text('AutoSwap', style: AppType.headline(color: AppColors.signal)),
          const SizedBox(height: 10),
        ],
        Text(
          'გაცვალე შენი მანქანა სხვა მანქანაში მარტივად და პირდაპირ',
          style: isDesktop ? AppType.display2() : AppType.display1(),
        ),
        const SizedBox(height: 6),
        Text(
          '$count აქტიური განცხადება',
          style: AppType.body(color: AppColors.mist),
        ),
      ],
    );
  }
}

class _SearchBox extends StatelessWidget {
  const _SearchBox();

  @override
  Widget build(BuildContext context) {
    return TextField(
      decoration: InputDecoration(
        prefixIcon: const Icon(Icons.search, color: AppColors.mist),
        hintText: 'მარკა, მოდელი ან ქალაქი',
        suffixIcon: IconButton(
          onPressed: () {},
          icon: const Icon(Icons.tune, color: AppColors.signal),
          tooltip: 'ფილტრები',
        ),
      ),
    );
  }
}

class _DesktopFilterPanel extends StatelessWidget {
  const _DesktopFilterPanel();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(0, 22, 0, 48),
      children: [
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.borderSoft),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('ფილტრები', style: TextStyle(
                color: AppColors.ink,
                fontWeight: FontWeight.w700,
                fontSize: 16,
                height: 1.35,
              )),
              SizedBox(height: 14),
              _SelectLike(label: 'რას აძლევ', value: 'ყველა მანქანა'),
              SizedBox(height: 12),
              _SelectLike(label: 'რას ეძებ', value: 'ჯიპი, სედანი'),
              SizedBox(height: 12),
              _SelectLike(label: 'ქალაქი', value: 'თბილისი'),
              SizedBox(height: 12),
              _SelectLike(label: 'თანხის სხვაობა', value: 'ნებისმიერი'),
              SizedBox(height: 14),
              _CheckLike(text: 'მხოლოდ შესაბამისი გაცვლები'),
            ],
          ),
        ),
      ],
    );
  }
}

class _SelectLike extends StatelessWidget {
  const _SelectLike({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppType.eyebrow()),
        const SizedBox(height: 7),
        Container(
          height: 42,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.borderSoft),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  value,
                  style: AppType.body(color: AppColors.ink),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const Icon(Icons.keyboard_arrow_down, color: AppColors.mist),
            ],
          ),
        ),
      ],
    );
  }
}

class _CheckLike extends StatelessWidget {
  const _CheckLike({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: AppColors.signalWash,
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: AppColors.signal),
          ),
          child: const Icon(Icons.check, color: AppColors.signal, size: 15),
        ),
        const SizedBox(width: 9),
        Expanded(child: Text(text, style: AppType.bodySmall(color: AppColors.ink))),
      ],
    );
  }
}

class _ResultHeader extends StatelessWidget {
  const _ResultHeader({required this.count});
  final int count;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text('ნაპოვნია $count განცხადება', style: AppType.bodyStrong()),
        const Spacer(),
        Text('ახალი განცხადებები', style: AppType.bodySmall()),
      ],
    );
  }
}

class _FilterRow extends StatelessWidget {
  const _FilterRow();

  @override
  Widget build(BuildContext context) {
    const filters = [
      'რას აძლევ',
      'რას ეძებ',
      'ქალაქი',
      'თანხის სხვაობა',
      'მხოლოდ შესაბამისი',
    ];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (final item in filters) ...[
            OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(0, 40),
                padding: const EdgeInsets.symmetric(horizontal: 12),
              ),
              child: Text(item),
            ),
            const SizedBox(width: 8),
          ],
        ],
      ),
    );
  }
}

class _ListingRow extends StatelessWidget {
  const _ListingRow({required this.car, required this.onOffer});
  final Car car;
  final VoidCallback onOffer;

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.sizeOf(context).width >= 900;
    final cover = car.photos.isNotEmpty ? car.photos.first.url : null;
    final wants = car.desired.isNotEmpty
        ? car.desired.map((d) => d.describe()).join(', ')
        : 'ღიაა შეთავაზებაზე';

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderSoft),
      ),
      clipBehavior: Clip.antiAlias,
      child: isDesktop
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _ListingImage(url: cover, width: 238, height: 178),
                Expanded(child: _ListingBody(car: car, wants: wants)),
                Container(
                  width: 198,
                  decoration: const BoxDecoration(
                    border: Border(left: BorderSide(color: AppColors.borderSoft)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        MoneyChip(preference: car.preference),
                        const SizedBox(height: 12),
                        _OfferButton(onPressed: onOffer),
                      ],
                    ),
                  ),
                ),
              ],
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _ListingImage(url: cover, width: 126, height: 124),
                    Expanded(child: _ListingBody(car: car, wants: wants)),
                  ],
                ),
                const Divider(),
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                  child: Row(
                    children: [
                      Flexible(child: MoneyChip(preference: car.preference)),
                      const SizedBox(width: 10),
                      Expanded(child: _OfferButton(onPressed: onOffer)),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}

class _ListingImage extends StatelessWidget {
  const _ListingImage({required this.url, required this.width, required this.height});
  final String? url;
  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: url == null
          ? const ColoredBox(
              color: AppColors.surfaceSunken,
              child: Icon(Icons.directions_car, color: AppColors.mist, size: 32),
            )
          : CachedNetworkImage(
              imageUrl: url!,
              fit: BoxFit.cover,
              placeholder: (_, __) => Container(color: AppColors.surfaceSunken),
              errorWidget: (_, __, ___) => const ColoredBox(
                color: AppColors.surfaceSunken,
                child: Icon(Icons.directions_car, color: AppColors.mist, size: 32),
              ),
            ),
    );
  }
}

class _ListingBody extends StatelessWidget {
  const _ListingBody({required this.car, required this.wants});
  final Car car;
  final String wants;

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.sizeOf(context).width >= 900;
    return Padding(
      padding: EdgeInsets.fromLTRB(14, 12, isDesktop ? 16 : 12, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '${car.make} ${car.model}',
            style: AppType.title(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text('${car.year} · ${Fmt.km(car.mileageKm)}', style: AppType.bodySmall()),
          const SizedBox(height: 6),
          Text(
            '${car.ownerName ?? 'მფლობელი'} · ${_city(car.ownerName)}',
            style: AppType.bodySmall(color: AppColors.mist),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _MetaChip(CarData.label(car.transmission)),
              _MetaChip(CarData.label(car.fuelType)),
              _MetaChip(car.color),
            ],
          ),
          const SizedBox(height: 10),
          Text('რას ეძებს', style: AppType.eyebrow()),
          const SizedBox(height: 3),
          Text(wants, style: AppType.body(), maxLines: isDesktop ? 2 : 1),
        ],
      ),
    );
  }

  String _city(String? ownerName) {
    if (ownerName == null) return 'თბილისი';
    if (ownerName.contains('ლაშა')) return 'ბათუმი';
    if (ownerName.contains('თამარ')) return 'ქუთაისი';
    if (ownerName.contains('ზურა')) return 'რუსთავი';
    return 'თბილისი';
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surfaceSunken,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderSoft),
      ),
      child: Text(text, style: AppType.bodySmall(color: AppColors.ink)),
    );
  }
}

class _OfferButton extends StatelessWidget {
  const _OfferButton({required this.onPressed});
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ElevatedButton(
        onPressed: onPressed,
        child: const Text(
          'შეთავაზების გაგზავნა',
          textAlign: TextAlign.center,
          maxLines: 2,
        ),
      ),
    );
  }
}

class _OfferSheet extends StatelessWidget {
  const _OfferSheet({required this.car});
  final Car car;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('შეთავაზების გაგზავნა', style: AppType.headline()),
            const SizedBox(height: 4),
            Text('${car.make} ${car.model} ${car.year}', style: AppType.body(color: AppColors.mist)),
            const SizedBox(height: 16),
            const _SheetField(
              icon: Icons.directions_car_outlined,
              text: 'ჩემი მანქანა: Toyota Prius 2018',
            ),
            const SizedBox(height: 8),
            const _SheetField(
              icon: Icons.payments_outlined,
              text: 'თანხა სურვილისამებრ',
            ),
            const SizedBox(height: 8),
            const _SheetField(
              icon: Icons.chat_bubble_outline,
              text: 'მოკლე შეტყობინება',
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 52,
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('შეთავაზების გაგზავნა'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SheetField extends StatelessWidget {
  const _SheetField({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderSoft),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: [
          Icon(icon, color: AppColors.signal, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: AppType.body(color: AppColors.mist))),
        ],
      ),
    );
  }
}

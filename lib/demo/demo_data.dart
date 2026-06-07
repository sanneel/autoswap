import '../features/cars/data/models/car.dart';
import '../features/cars/data/models/car_photo.dart';
import '../features/cars/data/models/desired_vehicle.dart';
import '../features/cars/data/models/swap_preference.dart';
import '../features/chat/data/models/message.dart';
import '../features/matches/data/models/match.dart';
import '../features/profile/data/models/profile.dart';
import 'demo_store.dart';

class DemoData {
  DemoData._();

  static const _alex = DemoStore.demoUserId;
  static const _sarah = 'demo-sarah';
  static const _mike = 'demo-mike';
  static const _anna = 'demo-anna';
  static const _tom = 'demo-tom';
  static const _lucia = 'demo-lucia';

  static const _carAlex = 'car-alex';
  static const _carSarah = 'car-sarah';
  static const _carMike = 'car-mike';
  static const _carAnna = 'car-anna';
  static const _carTom = 'car-tom';
  static const _carLucia = 'car-lucia';

  static void seed() {
    final profiles = <String, Profile>{
      _alex: Profile(
        id: _alex,
        fullName: 'გიორგი დემო',
        city: 'თბილისი',
        country: 'საქართველო',
        bio: 'ვტესტავ AutoSwap-ს დემო რეჟიმში.',
        avatarUrl: 'https://i.pravatar.cc/200?img=33',
      ),
      _sarah: Profile(
        id: _sarah,
        fullName: 'ნინო ლომიძე',
        city: 'თბილისი',
        country: 'საქართველო',
        avatarUrl: 'https://i.pravatar.cc/200?img=5',
      ),
      _mike: Profile(
        id: _mike,
        fullName: 'ლაშა კობახიძე',
        city: 'ბათუმი',
        country: 'საქართველო',
        avatarUrl: 'https://i.pravatar.cc/200?img=12',
      ),
      _anna: Profile(
        id: _anna,
        fullName: 'თამარ მაისურაძე',
        city: 'ქუთაისი',
        country: 'საქართველო',
        avatarUrl: 'https://i.pravatar.cc/200?img=8',
      ),
      _tom: Profile(
        id: _tom,
        fullName: 'ზურა ბერიძე',
        city: 'რუსთავი',
        country: 'საქართველო',
        avatarUrl: 'https://i.pravatar.cc/200?img=14',
      ),
      _lucia: Profile(
        id: _lucia,
        fullName: 'მარიამ ჩხეიძე',
        city: 'თბილისი',
        country: 'საქართველო',
        avatarUrl: 'https://i.pravatar.cc/200?img=16',
      ),
    };
    DemoStore.profiles.addAll(profiles);

    final carAlex = _car(
      id: _carAlex,
      ownerId: _alex,
      make: 'Toyota',
      model: 'Prius',
      year: 2018,
      mileageKm: 142000,
      fuelType: 'hybrid',
      transmission: 'automatic',
      engineSizeL: 1.8,
      color: 'თეთრი',
      description: 'მოვლილი პრიუსია. ტექდათვალიერება ახალი გავლილია.',
      photoCount: 3,
      preference: SwapPreference(
        carId: _carAlex,
        moneyAdjustment: MoneyAdjustment.none,
        currency: 'GEL',
      ),
      desired: [
        DesiredVehicle(carId: _carAlex, category: 'suv'),
        DesiredVehicle(carId: _carAlex, make: 'Lexus', model: 'RX'),
      ],
      profiles: profiles,
    );

    final carSarah = _car(
      id: _carSarah,
      ownerId: _sarah,
      make: 'Hyundai',
      model: 'Sonata',
      year: 2017,
      mileageKm: 118000,
      fuelType: 'hybrid',
      transmission: 'automatic',
      engineSizeL: 2.0,
      color: 'შავი',
      description: 'თბილისში დადის ყოველდღე. გაცვლა მინდა უფრო პატარა მანქანაში.',
      photoCount: 2,
      preference: SwapPreference(
        carId: _carSarah,
        moneyAdjustment: MoneyAdjustment.wantsMoney,
        moneyAmount: 2500,
        currency: 'GEL',
      ),
      desired: [
        DesiredVehicle(
          carId: _carSarah,
          make: 'Honda',
          model: 'Fit',
          category: 'hatchback',
        ),
      ],
      profiles: profiles,
    );

    final carMike = _car(
      id: _carMike,
      ownerId: _mike,
      make: 'BMW',
      model: 'X5',
      year: 2015,
      mileageKm: 156000,
      fuelType: 'diesel',
      transmission: 'automatic',
      engineSizeL: 3.0,
      color: 'ნაცრისფერი',
      description: 'დიზელი, კარგი კომპლექტაცია. ვეძებ სედანს ან ჰიბრიდს.',
      photoCount: 4,
      preference: SwapPreference(
        carId: _carMike,
        moneyAdjustment: MoneyAdjustment.none,
        currency: 'GEL',
      ),
      desired: [
        DesiredVehicle(carId: _carMike, category: 'sedan'),
        DesiredVehicle(carId: _carMike, make: 'Toyota', model: 'Camry'),
      ],
      profiles: profiles,
    );

    final carAnna = _car(
      id: _carAnna,
      ownerId: _anna,
      make: 'Mercedes-Benz',
      model: 'E-Class',
      year: 2016,
      mileageKm: 134000,
      fuelType: 'diesel',
      transmission: 'automatic',
      engineSizeL: 2.2,
      color: 'ვერცხლისფერი',
      description: 'ქუთაისშია. განვიხილავ ჯიპში გაცვლას თანხის დამატებით.',
      photoCount: 2,
      preference: SwapPreference(
        carId: _carAnna,
        moneyAdjustment: MoneyAdjustment.addsMoney,
        moneyAmount: 4000,
        currency: 'GEL',
      ),
      desired: [
        DesiredVehicle(carId: _carAnna, category: 'suv'),
        DesiredVehicle(carId: _carAnna, make: 'Toyota', model: 'Land Cruiser'),
      ],
      profiles: profiles,
    );

    final carTom = _car(
      id: _carTom,
      ownerId: _tom,
      make: 'Honda',
      model: 'Fit',
      year: 2019,
      mileageKm: 87000,
      fuelType: 'petrol',
      transmission: 'cvt',
      engineSizeL: 1.5,
      color: 'ლურჯი',
      description: 'ეკონომიური მანქანაა. ვეძებ პრიუსს ან სონატას.',
      photoCount: 2,
      preference: SwapPreference(
        carId: _carTom,
        moneyAdjustment: MoneyAdjustment.none,
        currency: 'GEL',
      ),
      desired: [
        DesiredVehicle(carId: _carTom, make: 'Toyota', model: 'Prius'),
        DesiredVehicle(carId: _carTom, make: 'Hyundai', model: 'Sonata'),
      ],
      profiles: profiles,
    );

    final carLucia = _car(
      id: _carLucia,
      ownerId: _lucia,
      make: 'Lexus',
      model: 'RX',
      year: 2014,
      mileageKm: 163000,
      fuelType: 'hybrid',
      transmission: 'automatic',
      engineSizeL: 3.5,
      color: 'შავი',
      description: 'სუფთა სალონი, კარგი საბურავები. გაცვლა მინდა უფრო ახალ სედანში.',
      photoCount: 3,
      preference: SwapPreference(
        carId: _carLucia,
        moneyAdjustment: MoneyAdjustment.wantsMoney,
        moneyAmount: 6000,
        currency: 'GEL',
      ),
      desired: [
        DesiredVehicle(carId: _carLucia, category: 'sedan'),
        DesiredVehicle(carId: _carLucia, make: 'Toyota', model: 'Camry'),
      ],
      profiles: profiles,
    );

    DemoStore.cars
      ..add(carAlex)
      ..addAll([carSarah, carMike, carAnna, carTom, carLucia]);

    DemoStore.mutualInterestCarToOwner.addAll({
      _carAnna: _anna,
      _carTom: _tom,
    });

    final mSarah = _match(
      id: 'match-sarah',
      otherUserId: _sarah,
      otherCar: carSarah,
      myCar: carAlex,
      hoursAgo: 6,
    );
    final mMike = _match(
      id: 'match-mike',
      otherUserId: _mike,
      otherCar: carMike,
      myCar: carAlex,
      hoursAgo: 2,
    );
    DemoStore.matches.addAll([mMike, mSarah]);

    final now = DateTime.now();
    DemoStore.messagesByMatch[mSarah.id] = [
      ChatMessage(
        id: 'msg-1',
        matchId: mSarah.id,
        senderId: _sarah,
        body: 'გამარჯობა, პრიუსი ისევ ხელმისაწვდომია?',
        createdAt: now.subtract(const Duration(hours: 2)),
        readAt: now.subtract(const Duration(hours: 1)),
      ),
      ChatMessage(
        id: 'msg-2',
        matchId: mSarah.id,
        senderId: _alex,
        body: 'კი, ხელმისაწვდომია. სონატაც ვნახე.',
        createdAt: now.subtract(const Duration(minutes: 90)),
        readAt: now.subtract(const Duration(minutes: 80)),
      ),
      ChatMessage(
        id: 'msg-3',
        matchId: mSarah.id,
        senderId: _sarah,
        body: 'შაბათს ნახვა გაწყობს?',
        createdAt: now.subtract(const Duration(minutes: 30)),
      ),
    ];
  }

  static List<CarPhoto> _photos(String carId, int count) => List.generate(
        count,
        (i) => CarPhoto(
          id: '$carId-p$i',
          carId: carId,
          storagePath: '',
          url: 'https://picsum.photos/seed/autoswap-$carId-$i/800/600',
          position: i,
        ),
      );

  static Car _car({
    required String id,
    required String ownerId,
    required String make,
    required String model,
    required int year,
    required int mileageKm,
    required String fuelType,
    required String transmission,
    required double engineSizeL,
    required String color,
    required String description,
    required int photoCount,
    required SwapPreference preference,
    required List<DesiredVehicle> desired,
    required Map<String, Profile> profiles,
  }) {
    final owner = profiles[ownerId];
    return Car(
      id: id,
      ownerId: ownerId,
      make: make,
      model: model,
      year: year,
      mileageKm: mileageKm,
      fuelType: fuelType,
      transmission: transmission,
      engineSizeL: engineSizeL,
      color: color,
      description: description,
      photos: _photos(id, photoCount),
      preference: preference,
      desired: desired,
      ownerName: owner?.fullName,
      ownerAvatarUrl: owner?.avatarUrl,
    );
  }

  static SwapMatch _match({
    required String id,
    required String otherUserId,
    required Car otherCar,
    required Car myCar,
    required int hoursAgo,
  }) {
    final me = DemoStore.demoUserId;
    final ua = me.compareTo(otherUserId) < 0 ? me : otherUserId;
    final ub = me.compareTo(otherUserId) < 0 ? otherUserId : me;
    final ca = ua == me ? myCar : otherCar;
    final cb = ua == me ? otherCar : myCar;
    return SwapMatch(
      id: id,
      userA: ua,
      userB: ub,
      carA: ca,
      carB: cb,
      status: 'active',
      createdAt: DateTime.now().subtract(Duration(hours: hoursAgo)),
    );
  }
}

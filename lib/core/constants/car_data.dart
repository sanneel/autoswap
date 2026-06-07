class CarData {
  const CarData._();

  static const popularMakes = <String>[
    'Toyota',
    'Mercedes-Benz',
    'BMW',
    'Hyundai',
    'Honda',
    'Lexus',
    'Nissan',
    'Ford',
    'Volkswagen',
    'Kia',
    'Subaru',
    'Audi',
    'Mazda',
    'Opel',
    'Mitsubishi',
    'სხვა',
  ];

  static const fuelTypes = <String>[
    'petrol',
    'diesel',
    'hybrid',
    'electric',
    'lpg',
    'other',
  ];

  static const transmissions = <String>[
    'automatic',
    'manual',
    'cvt',
    'semi_automatic',
  ];

  static const colors = <String>[
    'შავი',
    'თეთრი',
    'ნაცრისფერი',
    'ვერცხლისფერი',
    'ლურჯი',
    'წითელი',
    'მწვანე',
    'ყავისფერი',
    'სხვა',
  ];

  static const vehicleCategories = <String>[
    'any',
    'sedan',
    'hatchback',
    'suv',
    'coupe',
    'wagon',
    'pickup',
    'van',
    'electric',
    'hybrid',
  ];

  static String label(String enumValue) => switch (enumValue) {
        'petrol' => 'ბენზინი',
        'diesel' => 'დიზელი',
        'hybrid' => 'ჰიბრიდი',
        'electric' => 'ელექტრო',
        'lpg' => 'გაზი',
        'automatic' => 'ავტომატიკა',
        'manual' => 'მექანიკა',
        'semi_automatic' => 'ნახევრად ავტომატიკა',
        'cvt' => 'CVT',
        'any' => 'ნებისმიერი',
        'sedan' => 'სედანი',
        'hatchback' => 'ჰეჩბეკი',
        'suv' => 'ჯიპი',
        'coupe' => 'კუპე',
        'wagon' => 'უნივერსალი',
        'pickup' => 'პიკაპი',
        'van' => 'ვენი',
        'other' => 'სხვა',
        _ => enumValue,
      };
}

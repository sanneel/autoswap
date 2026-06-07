enum MoneyAdjustment { wantsMoney, addsMoney, none }

extension MoneyAdjustmentX on MoneyAdjustment {
  String get db => switch (this) {
        MoneyAdjustment.wantsMoney => 'wants_money',
        MoneyAdjustment.addsMoney => 'adds_money',
        MoneyAdjustment.none => 'none',
      };

  String get label => switch (this) {
        MoneyAdjustment.wantsMoney => 'თანხას ვითხოვ',
        MoneyAdjustment.addsMoney => 'თანხას დავამატებ',
        MoneyAdjustment.none => 'თანხის გარეშე',
      };

  static MoneyAdjustment fromDb(String? v) => switch (v) {
        'wants_money' => MoneyAdjustment.wantsMoney,
        'adds_money' => MoneyAdjustment.addsMoney,
        _ => MoneyAdjustment.none,
      };
}

class SwapPreference {
  const SwapPreference({
    required this.carId,
    this.moneyAdjustment = MoneyAdjustment.none,
    this.moneyAmount,
    this.currency = 'GEL',
  });

  final String carId;
  final MoneyAdjustment moneyAdjustment;
  final num? moneyAmount;
  final String currency;

  factory SwapPreference.fromMap(Map<String, dynamic> m) => SwapPreference(
        carId: m['car_id'] as String,
        moneyAdjustment: MoneyAdjustmentX.fromDb(m['money_adjustment'] as String?),
        moneyAmount: m['money_amount'] as num?,
        currency: (m['currency'] ?? 'GEL') as String,
      );

  Map<String, dynamic> toUpsert() => {
        'car_id': carId,
        'money_adjustment': moneyAdjustment.db,
        'money_amount':
            moneyAdjustment == MoneyAdjustment.none ? null : moneyAmount,
        'currency': currency,
      };

  String summary() {
    switch (moneyAdjustment) {
      case MoneyAdjustment.wantsMoney:
        return '${moneyAmount ?? 0} $currency დამატებით';
      case MoneyAdjustment.addsMoney:
        return '${moneyAmount ?? 0} $currency დავამატებ';
      case MoneyAdjustment.none:
        return 'თანხის გარეშე';
    }
  }
}

enum ReportReason { spam, fakeVehicle, scam, abuse, other }

extension ReportReasonX on ReportReason {
  String get db => switch (this) {
        ReportReason.spam => 'spam',
        ReportReason.fakeVehicle => 'fake_vehicle',
        ReportReason.scam => 'scam',
        ReportReason.abuse => 'abuse',
        ReportReason.other => 'other',
      };

  String get label => switch (this) {
        ReportReason.spam => 'Spam',
        ReportReason.fakeVehicle => 'Fake vehicle',
        ReportReason.scam => 'Scam',
        ReportReason.abuse => 'Abuse',
        ReportReason.other => 'Other',
      };
}

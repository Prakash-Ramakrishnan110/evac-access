import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:evacaccess_mobile/models/field_report.dart';
import 'package:evacaccess_mobile/models/shelter.dart';
import 'package:evacaccess_mobile/services/offline_storage_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('Offline Storage & Idempotency Key Tests', () {
    test('Offline queue saves and retrieves report with idempotency key', () async {
      final storage = OfflineStorageService();

      final report = FieldReportModel(
        id: 'local-test-1',
        idempotencyKey: 'mobile-uuid-test-999',
        incidentId: 'ODISHA-PURI-FLOOD-2026',
        reportType: 'HAZARD_INUNDATION',
        title: 'Grand Road Submerged',
        note: '[Water Depth: 35cm] Inundated',
        latitude: 19.8130,
        longitude: 85.8310,
        status: 'PENDING_REVIEW',
        isSynced: false,
        createdAt: DateTime.now(),
      );

      await storage.queueReport(report);

      final queued = await storage.getQueuedReports();
      expect(queued.length, equals(1));
      expect(queued.first.idempotencyKey, equals('mobile-uuid-test-999'));
      expect(queued.first.isSynced, isFalse);

      // Update to synced
      final syncedReport = report.copyWith(isSynced: true);
      await storage.updateQueuedReport(syncedReport);

      final updatedList = await storage.getQueuedReports();
      expect(updatedList.first.isSynced, isTrue);

      // Clear completed
      await storage.clearCompletedReports();
      final remaining = await storage.getQueuedReports();
      expect(remaining.isEmpty, isTrue);
    });
  });

  group('Shelter Tri-State Feature Model Tests', () {
    test('Shelter parses tri-state YES/NO/UNKNOWN values correctly', () {
      final json = {
        'id': 'sh-01',
        'code': 'SH-PURI-01',
        'name': 'Puri Zilla School',
        'address': 'Grand Road',
        'latitude': 19.8130,
        'longitude': 85.8310,
        'capacity_total': 300,
        'capacity_occupied': 140,
        'review_status': 'VERIFIED',
        'operating_status': 'OPEN',
        'features': [
          {'feature_key': 'wheelchair_ramp', 'label': 'Wheelchair Ramp', 'value': 'NO'},
          {'feature_key': 'backup_generator_oxygen', 'label': 'Oxygen Power', 'value': 'YES'},
          {'feature_key': 'accessible_toilet', 'label': 'Accessible Toilet', 'value': 'UNKNOWN'},
        ]
      };

      final shelter = ShelterModel.fromJson(json);
      expect(shelter.code, equals('SH-PURI-01'));
      expect(shelter.features.length, equals(3));

      final ramp = shelter.features.firstWhere((f) => f.featureKey == 'wheelchair_ramp');
      expect(ramp.value, equals('NO'));

      final toilet = shelter.features.firstWhere((f) => f.featureKey == 'accessible_toilet');
      expect(toilet.value, equals('UNKNOWN'));
    });
  });
}

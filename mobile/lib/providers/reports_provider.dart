import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../models/field_report.dart';
import '../services/api_service.dart';
import '../services/offline_storage_service.dart';

class ReportsProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  final OfflineStorageService _storage = OfflineStorageService();
  final Uuid _uuid = const Uuid();

  List<FieldReportModel> _queuedReports = [];
  bool _isSyncing = false;
  String? _syncStatusMessage;

  List<FieldReportModel> get queuedReports => _queuedReports;
  bool get isSyncing => _isSyncing;
  String? get syncStatusMessage => _syncStatusMessage;
  int get pendingCount => _queuedReports.where((r) => !r.isSynced).length;

  ReportsProvider() {
    loadQueuedReports();
  }

  Future<void> loadQueuedReports() async {
    _queuedReports = await _storage.getQueuedReports();
    notifyListeners();
  }

  Future<FieldReportModel> createReport({
    required String reportType,
    required String title,
    required String note,
    required double latitude,
    required double longitude,
    bool forceOffline = false,
  }) async {
    final idempotencyKey = 'mobile-${_uuid.v4()}';
    String incidentId = 'ODISHA-PURI-FLOOD-2026';
    try {
      incidentId = await _api.getIncidentId();
    } catch (_) {}

    final report = FieldReportModel(
      id: 'local-${DateTime.now().millisecondsSinceEpoch}',
      idempotencyKey: idempotencyKey,
      incidentId: incidentId,
      reportType: reportType,
      title: title,
      note: note,
      latitude: latitude,
      longitude: longitude,
      status: 'PENDING_REVIEW',
      isSynced: false,
      createdAt: DateTime.now(),
    );

    // Always queue locally first for safety
    await _storage.queueReport(report);
    _queuedReports.insert(0, report);
    notifyListeners();

    if (!forceOffline) {
      // Try immediate sync
      await _syncSingleReport(report);
    }

    return report;
  }

  Future<void> _syncSingleReport(FieldReportModel report) async {
    try {
      final res = await _api.submitFieldReport(report);
      if (res['success'] == true) {
        final serverData = res['data'] as Map<String, dynamic>? ?? {};
        final updated = report.copyWith(
          id: serverData['id']?.toString() ?? report.id,
          status: serverData['status'] ?? 'PENDING_REVIEW',
          isSynced: true,
          syncError: null,
        );
        await _storage.updateQueuedReport(updated);
        final idx = _queuedReports.indexWhere((r) => r.idempotencyKey == report.idempotencyKey);
        if (idx != -1) {
          _queuedReports[idx] = updated;
        }
        notifyListeners();
      } else {
        final updated = report.copyWith(syncError: res['error']);
        await _storage.updateQueuedReport(updated);
        final idx = _queuedReports.indexWhere((r) => r.idempotencyKey == report.idempotencyKey);
        if (idx != -1) {
          _queuedReports[idx] = updated;
        }
        notifyListeners();
      }
    } catch (e) {
      final updated = report.copyWith(syncError: e.toString());
      await _storage.updateQueuedReport(updated);
      final idx = _queuedReports.indexWhere((r) => r.idempotencyKey == report.idempotencyKey);
      if (idx != -1) {
        _queuedReports[idx] = updated;
      }
      notifyListeners();
    }
  }

  Future<void> syncAllPending() async {
    if (_isSyncing) return;
    _isSyncing = true;
    _syncStatusMessage = 'Syncing offline reports with EvacAccess backend...';
    notifyListeners();

    int successCount = 0;
    int failCount = 0;

    for (var report in List<FieldReportModel>.from(_queuedReports)) {
      if (!report.isSynced) {
        try {
          final res = await _api.submitFieldReport(report);
          if (res['success'] == true) {
            successCount++;
            final serverData = res['data'] as Map<String, dynamic>? ?? {};
            final updated = report.copyWith(
              id: serverData['id']?.toString() ?? report.id,
              status: serverData['status'] ?? 'PENDING_REVIEW',
              isSynced: true,
              syncError: null,
            );
            await _storage.updateQueuedReport(updated);
            final idx = _queuedReports.indexWhere((r) => r.idempotencyKey == report.idempotencyKey);
            if (idx != -1) {
              _queuedReports[idx] = updated;
            }
          } else {
            failCount++;
          }
        } catch (_) {
          failCount++;
        }
      }
    }

    _isSyncing = false;
    _syncStatusMessage = 'Sync completed: $successCount pushed, $failCount pending.';
    notifyListeners();
  }

  Future<void> clearSynced() async {
    await _storage.clearCompletedReports();
    await loadQueuedReports();
  }
}

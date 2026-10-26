import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/field_report.dart';

class OfflineStorageService {
  static const String _keyReportsQueue = 'evacaccess_offline_reports_queue';
  static const String _keyBaseUrl = 'evacaccess_custom_base_url';
  static const String _keyAuthToken = 'evacaccess_auth_token';
  static const String _keyUserData = 'evacaccess_user_data';

  Future<void> saveBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyBaseUrl, url);
  }

  Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    // Default to localhost for web/desktop, or 10.0.2.2 for android emulator
    return prefs.getString(_keyBaseUrl) ?? 'http://127.0.0.1:8000';
  }

  Future<void> saveAuthToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyAuthToken, token);
  }

  Future<String?> getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyAuthToken);
  }

  Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyAuthToken);
    await prefs.remove(_keyUserData);
  }

  Future<void> queueReport(FieldReportModel report) async {
    final prefs = await SharedPreferences.getInstance();
    final list = await getQueuedReports();
    list.removeWhere((r) => r.idempotencyKey == report.idempotencyKey);
    list.insert(0, report);
    final jsonList = list.map((r) => r.toJson()).toList();
    await prefs.setString(_keyReportsQueue, jsonEncode(jsonList));
  }

  Future<List<FieldReportModel>> getQueuedReports() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_keyReportsQueue);
    if (raw == null || raw.isEmpty) return [];
    try {
      final List<dynamic> decoded = jsonDecode(raw);
      return decoded.map((item) => FieldReportModel.fromJson(item)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> updateQueuedReport(FieldReportModel report) async {
    final list = await getQueuedReports();
    final idx = list.indexWhere((r) => r.idempotencyKey == report.idempotencyKey);
    if (idx != -1) {
      list[idx] = report;
      final prefs = await SharedPreferences.getInstance();
      final jsonList = list.map((r) => r.toJson()).toList();
      await prefs.setString(_keyReportsQueue, jsonEncode(jsonList));
    }
  }

  Future<void> clearCompletedReports() async {
    final list = await getQueuedReports();
    final remaining = list.where((r) => !r.isSynced).toList();
    final prefs = await SharedPreferences.getInstance();
    final jsonList = remaining.map((r) => r.toJson()).toList();
    await prefs.setString(_keyReportsQueue, jsonEncode(jsonList));
  }
}

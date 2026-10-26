import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/offline_storage_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  final OfflineStorageService _storage = OfflineStorageService();

  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;
  bool _isOfflineMode = false;
  String _serverUrl = 'http://127.0.0.1:8000';

  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isOfflineMode => _isOfflineMode;
  String get serverUrl => _serverUrl;

  AuthProvider() {
    _init();
  }

  Future<void> _init() async {
    _serverUrl = await _storage.getBaseUrl();
    notifyListeners();
  }

  void toggleOfflineMode() {
    _isOfflineMode = !_isOfflineMode;
    notifyListeners();
  }

  Future<void> setServerUrl(String url) async {
    _serverUrl = url;
    await _storage.saveBaseUrl(url);
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      if (_isOfflineMode) {
        // Fast local authentication for field conditions
        _currentUser = UserModel(
          id: 'offline-user-1',
          username: username.isEmpty ? 'responder1' : username,
          role: username.toLowerCase().contains('coord') ? 'COORDINATOR' : 'RESPONDER',
          organization: username.toLowerCase().contains('coord')
              ? 'ODRF Disaster Control Room (Offline)'
              : 'NDRF Battalion 03 (Puri)',
          badgeNumber: username.toLowerCase().contains('coord') ? 'ODRF-CMD-01' : 'NDRF-FLD-88',
          token: 'offline_token',
        );
        _isLoading = false;
        notifyListeners();
        return true;
      }

      try {
        final user = await _api.login(username, password);
        _currentUser = user;
        _isLoading = false;
        notifyListeners();
        return true;
      } catch (netErr) {
        final errStr = netErr.toString();
        // If server is unreachable (127.0.0.1 on physical device, connection refused, offline field)
        // automatically fallback to operational offline mode so the responder is never locked out
        if (errStr.contains('Connection refused') ||
            errStr.contains('SocketException') ||
            errStr.contains('ClientException') ||
            errStr.contains('Failed host lookup') ||
            errStr.contains('errno = 111')) {
          _isOfflineMode = true;
          _currentUser = UserModel(
            id: 'offline-auto-${DateTime.now().millisecondsSinceEpoch}',
            username: username.isEmpty ? 'responder1' : username,
            role: username.toLowerCase().contains('coord') ? 'COORDINATOR' : 'RESPONDER',
            organization: username.toLowerCase().contains('coord')
                ? 'ODRF Disaster Control Room (Offline Fallback)'
                : 'NDRF Battalion 03 (Puri)',
            badgeNumber: username.toLowerCase().contains('coord') ? 'ODRF-CMD-01' : 'NDRF-FLD-88',
            token: 'offline_auto_token',
          );
          _isLoading = false;
          _errorMessage = null;
          notifyListeners();
          return true;
        }
        rethrow;
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Login failed: ${e.toString().replaceAll('Exception: ', '')}';
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _currentUser = null;
    await _storage.clearAuth();
    notifyListeners();
  }
}

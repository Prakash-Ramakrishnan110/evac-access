import 'package:flutter/foundation.dart';
import '../models/shelter.dart';
import '../services/api_service.dart';

class ShelterProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  List<ShelterModel> _shelters = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<ShelterModel> get shelters => _shelters;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadShelters() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _shelters = await _api.getShelters();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<bool> submitInspection(
    String shelterId,
    List<Map<String, dynamic>> findings,
    String notes,
    int capacityOccupied,
  ) async {
    final success = await _api.submitShelterInspection(shelterId, findings, notes, capacityOccupied);
    if (success) {
      // Optimistically update local feature values
      final sIdx = _shelters.indexWhere((s) => s.id == shelterId);
      if (sIdx != -1) {
        final s = _shelters[sIdx];
        final updatedFeatures = s.features.map((f) {
          final found = findings.firstWhere(
            (item) => item['feature_key'] == f.featureKey,
            orElse: () => {},
          );
          if (found.isNotEmpty) {
            return ShelterFeatureItem(
              featureKey: f.featureKey,
              label: f.label,
              value: found['value'] ?? f.value,
              notes: found['notes'] ?? f.notes,
              verifiedBy: 'You (Field Inspector)',
            );
          }
          return f;
        }).toList();

        _shelters[sIdx] = ShelterModel(
          id: s.id,
          code: s.code,
          name: s.name,
          address: s.address,
          latitude: s.latitude,
          longitude: s.longitude,
          capacityTotal: s.capacityTotal,
          capacityOccupied: capacityOccupied,
          reviewStatus: 'VERIFIED',
          operatingStatus: s.operatingStatus,
          features: updatedFeatures,
        );
        notifyListeners();
      }
    }
    return success;
  }
}

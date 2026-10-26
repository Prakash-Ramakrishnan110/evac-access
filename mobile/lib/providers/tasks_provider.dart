import 'package:flutter/foundation.dart';
import '../models/assignment.dart';
import '../services/api_service.dart';

class TasksProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  List<AssignmentModel> _assignments = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<AssignmentModel> get assignments => _assignments;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  int get pendingCount => _assignments.where((a) => a.status == 'PENDING' || a.status == 'ACKNOWLEDGED').length;

  Future<void> loadAssignments() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _assignments = await _api.getAssignments();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<bool> updateStatus(String assignmentId, String newStatus, {String? notes}) async {
    final success = await _api.updateAssignmentStatus(assignmentId, newStatus, notes: notes);
    if (success) {
      final idx = _assignments.indexWhere((a) => a.id == assignmentId);
      if (idx != -1) {
        final old = _assignments[idx];
        _assignments[idx] = AssignmentModel(
          id: old.id,
          teamName: old.teamName,
          status: newStatus,
          assignedResponderName: old.assignedResponderName,
          assignedAt: old.assignedAt,
          notes: notes ?? old.notes,
          requestRef: old.requestRef,
          requesterName: old.requesterName,
          contactPhone: old.contactPhone,
          latitude: old.latitude,
          longitude: old.longitude,
          headCount: old.headCount,
          urgency: old.urgency,
          requirements: old.requirements,
          destinationShelter: old.destinationShelter,
        );
        notifyListeners();
      }
    }
    return success;
  }
}

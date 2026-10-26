class AssignmentModel {
  final String id;
  final String teamName;
  final String status;
  final String? assignedResponderName;
  final String assignedAt;
  final String? notes;
  final String requestRef;
  final String requesterName;
  final String contactPhone;
  final double latitude;
  final double longitude;
  final int headCount;
  final String urgency;
  final List<String> requirements;
  final String? destinationShelter;

  AssignmentModel({
    required this.id,
    required this.teamName,
    required this.status,
    this.assignedResponderName,
    required this.assignedAt,
    this.notes,
    required this.requestRef,
    required this.requesterName,
    required this.contactPhone,
    required this.latitude,
    required this.longitude,
    required this.headCount,
    required this.urgency,
    required this.requirements,
    this.destinationShelter,
  });

  factory AssignmentModel.fromJson(Map<String, dynamic> json) {
    final reqDetail = json['request_detail'] as Map<String, dynamic>? ?? {};
    final reqList = <String>[];
    if (reqDetail['requirements'] != null) {
      if (reqDetail['requirements'] is List) {
        reqList.addAll((reqDetail['requirements'] as List).map((e) => e.toString()));
      }
    }

    return AssignmentModel(
      id: json['id']?.toString() ?? '',
      teamName: json['team_name'] ?? 'NDRF Unit',
      status: json['status'] ?? 'PENDING',
      assignedResponderName: json['assigned_responder_name'],
      assignedAt: json['assigned_at'] ?? '',
      notes: json['notes'],
      requestRef: reqDetail['public_ref'] ?? 'EA-REQ',
      requesterName: reqDetail['requester_name'] ?? 'Citizen',
      contactPhone: reqDetail['contact_phone'] ?? '+91 9876543210',
      latitude: (reqDetail['latitude'] as num?)?.toDouble() ?? 19.8135,
      longitude: (reqDetail['longitude'] as num?)?.toDouble() ?? 85.8312,
      headCount: reqDetail['head_count'] ?? 1,
      urgency: reqDetail['urgency'] ?? 'HIGH',
      requirements: reqList,
      destinationShelter: json['destination_shelter'] ?? 'SH-PURI-03 (Badasankha)',
    );
  }
}

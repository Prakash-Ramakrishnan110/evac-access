class FieldReportModel {
  final String id;
  final String idempotencyKey;
  final String incidentId;
  final String reportType;
  final String title;
  final String note;
  final double latitude;
  final double longitude;
  final String status;
  final bool isSynced;
  final DateTime createdAt;
  final String? syncError;

  FieldReportModel({
    required this.id,
    required this.idempotencyKey,
    required this.incidentId,
    required this.reportType,
    required this.title,
    required this.note,
    required this.latitude,
    required this.longitude,
    required this.status,
    this.isSynced = false,
    required this.createdAt,
    this.syncError,
  });

  factory FieldReportModel.fromJson(Map<String, dynamic> json) {
    return FieldReportModel(
      id: json['id']?.toString() ?? '',
      idempotencyKey: json['idempotency_key'] ?? '',
      incidentId: json['incident']?.toString() ?? 'ODISHA-PURI-FLOOD-2026',
      reportType: json['report_type'] ?? 'OBSTACLE',
      title: json['title'] ?? 'Hazard Report',
      note: json['note'] ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'PENDING_REVIEW',
      isSynced: json['is_synced'] ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at']) ?? DateTime.now()
          : DateTime.now(),
      syncError: json['sync_error'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'idempotency_key': idempotencyKey,
      'incident': incidentId,
      'report_type': reportType,
      'title': title,
      'note': note,
      'latitude': latitude,
      'longitude': longitude,
      'status': status,
      'is_synced': isSynced,
      'created_at': createdAt.toIso8601String(),
      'sync_error': syncError,
    };
  }

  FieldReportModel copyWith({
    String? id,
    String? status,
    bool? isSynced,
    String? syncError,
  }) {
    return FieldReportModel(
      id: id ?? this.id,
      idempotencyKey: idempotencyKey,
      incidentId: incidentId,
      reportType: reportType,
      title: title,
      note: note,
      latitude: latitude,
      longitude: longitude,
      status: status ?? this.status,
      isSynced: isSynced ?? this.isSynced,
      createdAt: createdAt,
      syncError: syncError ?? this.syncError,
    );
  }
}

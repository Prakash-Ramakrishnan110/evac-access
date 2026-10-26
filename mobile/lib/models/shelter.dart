class ShelterFeatureItem {
  final String featureKey;
  final String label;
  final String value; // 'YES', 'NO', 'UNKNOWN'
  final String? verifiedBy;
  final String? notes;

  ShelterFeatureItem({
    required this.featureKey,
    required this.label,
    required this.value,
    this.verifiedBy,
    this.notes,
  });

  factory ShelterFeatureItem.fromJson(Map<String, dynamic> json) {
    return ShelterFeatureItem(
      featureKey: json['feature_key'] ?? '',
      label: json['label'] ?? json['feature_key'] ?? '',
      value: json['value'] ?? 'UNKNOWN',
      verifiedBy: json['verified_by_name'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'feature_key': featureKey,
      'value': value,
      'notes': notes ?? '',
    };
  }
}

class ShelterModel {
  final String id;
  final String code;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final int capacityTotal;
  final int capacityOccupied;
  final String reviewStatus;
  final String operatingStatus;
  final List<ShelterFeatureItem> features;

  ShelterModel({
    required this.id,
    required this.code,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.capacityTotal,
    required this.capacityOccupied,
    required this.reviewStatus,
    required this.operatingStatus,
    required this.features,
  });

  factory ShelterModel.fromJson(Map<String, dynamic> json) {
    final featuresList = <ShelterFeatureItem>[];
    if (json['features'] != null && json['features'] is List) {
      for (var f in json['features']) {
        featuresList.add(ShelterFeatureItem.fromJson(f));
      }
    }

    return ShelterModel(
      id: json['id']?.toString() ?? '',
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      capacityTotal: json['capacity_total'] ?? 0,
      capacityOccupied: json['capacity_occupied'] ?? 0,
      reviewStatus: json['review_status'] ?? 'UNVERIFIED',
      operatingStatus: json['operating_status'] ?? 'OPEN',
      features: featuresList,
    );
  }
}

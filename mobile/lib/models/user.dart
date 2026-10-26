class UserModel {
  final String id;
  final String username;
  final String role;
  final String organization;
  final String badgeNumber;
  final String? token;

  UserModel({
    required this.id,
    required this.username,
    required this.role,
    this.organization = '',
    this.badgeNumber = '',
    this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      username: json['username'] ?? '',
      role: json['role'] ?? 'RESPONDER',
      organization: json['organization'] ?? '',
      badgeNumber: json['badge_number'] ?? '',
      token: token,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'role': role,
      'organization': organization,
      'badge_number': badgeNumber,
      'token': token,
    };
  }
}

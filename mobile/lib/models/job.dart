class Job {
  final int id;
  final String title;
  final String description;
  final String city;
  final int employerId;
  final String employerName;
  final String employerEmail;
  final String employerPhone;

  Job({
    required this.id,
    required this.title,
    required this.description,
    required this.city,
    required this.employerId,
    required this.employerName,
    required this.employerEmail,
    required this.employerPhone,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      city: json['city'] ?? '',
      employerId: json['employerId'] ?? 0,
      employerName: json['employerName'] ?? '',
      employerEmail: json['employerEmail'] ?? '',
      employerPhone: json['employerPhone'] ?? '',
    );
  }
}

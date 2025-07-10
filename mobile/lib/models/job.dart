class Job {
  final int id;
  final String title;
  final String description;
  final String company;
  final String location;

  Job({
    required this.id,
    required this.title,
    required this.description,
    required this.company,
    required this.location,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      company: json['company'],
      location: json['location'],
    );
  }
}

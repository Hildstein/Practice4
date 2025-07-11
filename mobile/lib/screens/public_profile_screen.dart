import 'package:flutter/material.dart';
import '../services/api_service.dart';

class PublicProfileScreen extends StatefulWidget {
  const PublicProfileScreen({super.key});

  @override
  State<PublicProfileScreen> createState() => _PublicProfileScreenState();
}

class _PublicProfileScreenState extends State<PublicProfileScreen> {
  Map<String, dynamic>? profile;
  bool loading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final int userId = ModalRoute.of(context)!.settings.arguments as int;
    _loadProfile(userId);
  }

  Future<void> _loadProfile(int id) async {
    final data = await ApiService().fetchPublicProfile(id);
    setState(() {
      profile = data;
      loading = false;
    });
  }

  String _roleRu(dynamic role) {
    if (role == 0 || role == "Candidate") return "Кандидат";
    if (role == 1 || role == "Employer") return "Работодатель";
    return role?.toString() ?? "";
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (profile == null) {
      return const Scaffold(body: Center(child: Text('Профиль не найден')));
    }

    final isEmployer = profile!['role'] == 1 || profile!['role'] == 'Employer';

    return Scaffold(
      appBar: AppBar(title: const Text('Публичный профиль')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            Text(
              'Имя/Компания: ${profile!['name'] ?? ''}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text('Телефон: ${profile!['phone'] ?? ''}'),
            if (isEmployer) ...[
              const SizedBox(height: 8),
              Text('О компании: ${profile!['about'] ?? ''}'),
            ],
            if (!isEmployer) ...[
              const SizedBox(height: 8),
              Text('Резюме: ${profile!['resume'] ?? ''}'),
            ],
            const SizedBox(height: 8),
            Text('Роль: ${_roleRu(profile!['role'])}'),
          ],
        ),
      ),
    );
  }
}

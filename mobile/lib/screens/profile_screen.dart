import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? profile;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final data = await ApiService().getProfile();
    setState(() {
      profile = data;
      loading = false;
    });
  }

  void _logout() {
    ApiService().logout();
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    final api = ApiService();
    return Scaffold(
      appBar: AppBar(title: const Text('Профиль')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : profile == null
          ? const Center(child: Text('Ошибка загрузки профиля'))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Имя: ${profile!['name'] ?? ''}'),
                  Text('Email: ${profile!['email'] ?? ''}'),
                  Text('Телефон: ${profile!['phone'] ?? ''}'),
                  if (profile!['resume'] != null)
                    Text('Резюме: ${profile!['resume']}'),
                  if (profile!['about'] != null)
                    Text('О себе: ${profile!['about']}'),
                  Text('Роль: ${api.role ?? ""}'),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: _logout,
                    child: const Text('Выйти'),
                  ),
                  if (api.role == "Employer")
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(context, '/my_vacancies');
                      },
                      child: const Text('Мои вакансии'),
                    ),
                ],
              ),
            ),
    );
  }
}

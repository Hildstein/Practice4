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
  bool editMode = false;

  // поля формы
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _resumeController = TextEditingController();
  final _aboutController = TextEditingController();
  String error = '';

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final data = await ApiService().getProfile();
    if (mounted) {
      setState(() {
        profile = data;
        loading = false;
      });
      if (data != null) {
        _nameController.text = data['name'] ?? '';
        _phoneController.text = data['phone'] ?? '';
        _resumeController.text = data['resume'] ?? '';
        _aboutController.text = data['about'] ?? '';
      }
    }
  }

  Future<void> _saveProfile() async {
    setState(() {
      loading = true;
      error = '';
    });
    final api = ApiService();
    if (_nameController.text.trim().isEmpty) {
      setState(() {
        error = 'Имя обязательно';
        loading = false;
      });
      return;
    }
    if (_phoneController.text.trim().length < 6) {
      setState(() {
        error = 'Телефон минимум 6 символов';
        loading = false;
      });
      return;
    }
    if (api.role == "Candidate" && _resumeController.text.trim().length < 10) {
      setState(() {
        error = 'Резюме минимум 10 символов';
        loading = false;
      });
      return;
    }
    if (api.role == "Employer" && _aboutController.text.trim().length < 10) {
      setState(() {
        error = 'Описание компании минимум 10 символов';
        loading = false;
      });
      return;
    }
    final data = {
      'name': _nameController.text.trim(),
      'phone': _phoneController.text.trim(),
      if (api.role == "Candidate") 'resume': _resumeController.text.trim(),
      if (api.role == "Employer") 'about': _aboutController.text.trim(),
    };
    try {
      await api.updateProfile(data);
      await _loadProfile();
      setState(() {
        editMode = false;
        error = '';
      });
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Профиль обновлен")));
    } catch (e) {
      setState(() {
        error = 'Ошибка сохранения';
      });
    }
    setState(() {
      loading = false;
    });
  }

  void _logout() {
    ApiService().logout();
    Navigator.pushReplacementNamed(context, '/login');
  }

  String _roleRu(String? role) {
    if (role == "Candidate" || role == "0") return "Кандидат";
    if (role == "Employer" || role == "1") return "Работодатель";
    return role ?? "";
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
              child: editMode
                  ? ListView(
                      children: [
                        const Text(
                          'Редактировать профиль',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        TextField(
                          controller: _nameController,
                          decoration: const InputDecoration(labelText: 'Имя'),
                        ),
                        TextField(
                          controller: _phoneController,
                          decoration: const InputDecoration(
                            labelText: 'Телефон',
                          ),
                        ),
                        if (api.role == "Candidate")
                          TextField(
                            controller: _resumeController,
                            decoration: const InputDecoration(
                              labelText: 'Резюме',
                            ),
                            maxLines: 4,
                          ),
                        if (api.role == "Employer")
                          TextField(
                            controller: _aboutController,
                            decoration: const InputDecoration(
                              labelText: 'Описание компании',
                            ),
                            maxLines: 4,
                          ),
                        if (error.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text(
                              error,
                              style: TextStyle(color: Colors.red),
                            ),
                          ),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: loading ? null : _saveProfile,
                                child: loading
                                    ? const SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : const Text('Сохранить'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () =>
                                    setState(() => editMode = false),
                                child: const Text('Отмена'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    )
                  : ListView(
                      children: [
                        Text('Имя: ${profile!['name'] ?? ''}'),
                        Text('Email: ${profile!['email'] ?? ''}'),
                        Text('Телефон: ${profile!['phone'] ?? ''}'),
                        if (profile!['resume'] != null)
                          Text('Резюме: ${profile!['resume']}'),
                        if (profile!['about'] != null)
                          Text('О себе: ${profile!['about']}'),
                        Text('Роль: ${_roleRu(api.role)}'),
                        const SizedBox(height: 32),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            ElevatedButton(
                              onPressed: _logout,
                              style: ElevatedButton.styleFrom(
                                minimumSize: const Size(double.infinity, 48),
                              ),
                              child: const Text('Выйти'),
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.pushNamed(context, '/applications');
                              },
                              style: ElevatedButton.styleFrom(
                                minimumSize: const Size(double.infinity, 48),
                              ),
                              child: const Text('Отклики'),
                            ),
                            if (api.role == "Employer") ...[
                              const SizedBox(height: 12),
                              ElevatedButton(
                                onPressed: () {
                                  Navigator.pushNamed(context, '/my_vacancies');
                                },
                                style: ElevatedButton.styleFrom(
                                  minimumSize: const Size(double.infinity, 48),
                                ),
                                child: const Text('Мои вакансии'),
                              ),
                            ],
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: () => setState(() => editMode = true),
                              style: ElevatedButton.styleFrom(
                                minimumSize: const Size(double.infinity, 48),
                              ),
                              child: const Text('Редактировать'),
                            ),
                          ],
                        ),
                      ],
                    ),
            ),
    );
  }
}

import 'package:flutter/material.dart';
import '../services/api_service.dart';

enum UserRole { candidate, employer }

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  UserRole _role = UserRole.candidate;

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _resumeController = TextEditingController(); // только для кандидата
  final _aboutController = TextEditingController(); // только для работодателя

  String _error = '';
  bool _loading = false;

  Future<void> _register() async {
    setState(() {
      _error = '';
      _loading = true;
    });

    // Простая валидация
    if (!_emailController.text.contains('@') ||
        _emailController.text.length < 5) {
      setState(() {
        _error = 'Введите корректный email';
        _loading = false;
      });
      return;
    }
    if (_passwordController.text.length < 6) {
      setState(() {
        _error = 'Пароль минимум 6 символов';
        _loading = false;
      });
      return;
    }
    if (_nameController.text.trim().isEmpty) {
      setState(() {
        _error = 'Имя обязательно';
        _loading = false;
      });
      return;
    }
    if (_phoneController.text.trim().length < 6) {
      setState(() {
        _error = 'Телефон минимум 6 символов';
        _loading = false;
      });
      return;
    }
    if (_role == UserRole.candidate &&
        _resumeController.text.trim().length < 10) {
      setState(() {
        _error = 'Резюме минимум 10 символов';
        _loading = false;
      });
      return;
    }
    if (_role == UserRole.employer &&
        _aboutController.text.trim().length < 10) {
      setState(() {
        _error = 'Описание компании минимум 10 символов';
        _loading = false;
      });
      return;
    }

    bool success = false;
    final api = ApiService();

    if (_role == UserRole.candidate) {
      success = await api.registerCandidate(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        name: _nameController.text,
        phone: _phoneController.text,
        resume: _resumeController.text,
      );
    } else {
      success = await api.registerEmployer(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        name: _nameController.text,
        phone: _phoneController.text,
        about: _aboutController.text,
      );
    }

    setState(() => _loading = false);

    if (success) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Регистрация успешна!')));
      Navigator.pushReplacementNamed(context, '/login');
    } else {
      setState(() {
        _error = 'Ошибка регистрации. Проверьте данные.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Регистрация')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            Row(
              children: [
                Expanded(
                  child: RadioListTile<UserRole>(
                    title: const Text('Кандидат'),
                    value: UserRole.candidate,
                    groupValue: _role,
                    onChanged: (value) {
                      setState(() => _role = value!);
                    },
                  ),
                ),
                Expanded(
                  child: RadioListTile<UserRole>(
                    title: const Text('Работодатель'),
                    value: UserRole.employer,
                    groupValue: _role,
                    onChanged: (value) {
                      setState(() => _role = value!);
                    },
                  ),
                ),
              ],
            ),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Пароль'),
              obscureText: true,
            ),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Имя'),
            ),
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(labelText: 'Телефон'),
              keyboardType: TextInputType.phone,
            ),
            if (_role == UserRole.candidate)
              TextField(
                controller: _resumeController,
                decoration: const InputDecoration(labelText: 'Резюме'),
              ),
            if (_role == UserRole.employer)
              TextField(
                controller: _aboutController,
                decoration: const InputDecoration(
                  labelText: 'О себе / о компании',
                ),
              ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _register,
                child: _loading
                    ? const CircularProgressIndicator()
                    : const Text('Зарегистрироваться'),
              ),
            ),
            if (_error.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(_error, style: const TextStyle(color: Colors.red)),
              ),
          ],
        ),
      ),
    );
  }
}

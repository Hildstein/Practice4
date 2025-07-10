import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/job.dart';

/// Если используешь эмулятор Android, адрес должен быть 'http://10.0.2.2:5182/api'
/// Если запускаешь на реальном устройстве или web, используй IP-адрес ПК.
const String baseUrl = 'http://localhost:5182/api';

class ApiService {
  String? _token; // JWT токен пользователя

  // Сохранение токена для авторизации в других запросах
  void setToken(String token) {
    _token = token;
  }

  // Получить все вакансии (public)
  Future<List<Job>> fetchJobs() async {
    final response = await http.get(
      Uri.parse('$baseUrl/vacancies?page=1&pageSize=30'),
    );
    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.map((json) => Job.fromJson(json)).toList();
    } else {
      throw Exception('Ошибка загрузки вакансий');
    }
  }

  // Получить детали вакансии (public)
  Future<Job> fetchJobDetail(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/vacancies/$id'));
    if (response.statusCode == 200) {
      return Job.fromJson(json.decode(response.body));
    } else {
      throw Exception('Ошибка загрузки вакансии');
    }
  }

  // Авторизация пользователя
  Future<String?> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    print('Ответ сервера: ${response.statusCode} ${response.body}');
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      _token = data['token'];
      return _token;
    } else {
      return null;
    }
  }

  // Регистрация кандидата
  Future<bool> registerCandidate({
    required String email,
    required String password,
    required String name,
    required String phone,
    required String resume,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register/candidate'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'name': name,
        'phone': phone,
        'resume': resume,
      }),
    );
    return response.statusCode == 200;
  }

  // Регистрация работодателя
  Future<bool> registerEmployer({
    required String email,
    required String password,
    required String name,
    required String phone,
    required String about,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register/employer'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'name': name,
        'phone': phone,
        'about': about,
      }),
    );
    return response.statusCode == 200;
  }

  // Получить профиль пользователя (требует JWT token)
  Future<Map<String, dynamic>?> getProfile() async {
    if (_token == null) return null;
    final response = await http.get(
      Uri.parse('$baseUrl/user/profile'),
      headers: {'Authorization': 'Bearer $_token'},
    );
    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    } else {
      return null;
    }
  }

  // Откликнуться на вакансию (пример, замени на свой эндпоинт/тело)
  Future<bool> respondToJob(int jobId) async {
    if (_token == null) return false;
    final response = await http.post(
      Uri.parse('$baseUrl/vacancies/$jobId/respond'),
      headers: {
        'Authorization': 'Bearer $_token',
        'Content-Type': 'application/json',
      },
    );
    return response.statusCode == 200;
  }
}

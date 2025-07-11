import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/job.dart';

// <--- Укажи свой IP, если запускаешь с web!
const String baseUrl = 'http://localhost:5182/api';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;

  void setToken(String token) {
    _token = token;
  }

  Future<List<Job>> fetchJobs() async {
    final response = await http.get(
      Uri.parse('$baseUrl/vacancies?page=1&pageSize=30'),
    );
    if (response.statusCode == 200) {
      final decoded = json.decode(response.body);
      if (decoded is List) {
        return decoded.map((json) => Job.fromJson(json)).toList();
      }
      if (decoded is Map<String, dynamic> && decoded.containsKey('items')) {
        final jobsList = decoded['items'] as List;
        return jobsList.map((json) => Job.fromJson(json)).toList();
      }
      throw Exception('Неожиданный формат ответа: ${response.body}');
    } else {
      throw Exception('Ошибка загрузки вакансий');
    }
  }

  Future<Job> fetchJobDetail(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/vacancies/$id'));
    if (response.statusCode == 200) {
      return Job.fromJson(json.decode(response.body));
    } else {
      throw Exception('Ошибка загрузки вакансии');
    }
  }

  Future<String?> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      _token = data['token'];
      return _token;
    } else {
      _token = null;
      return null;
    }
  }

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

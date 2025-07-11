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
  String? _role;
  int? _userId;
  String? _userName;

  void setToken(String token) {
    _token = token;
    // парсим роль и id из JWT (payload)
    try {
      final parts = token.split('.');
      if (parts.length != 3) return;
      final payload = utf8.decode(
        base64Url.decode(base64Url.normalize(parts[1])),
      );
      final data = json.decode(payload);
      _role =
          data['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      _userId = int.tryParse(
        data['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
            .toString(),
      );
      _userName =
          data['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    } catch (_) {
      _role = null;
      _userId = null;
      _userName = null;
    }
  }

  String? get role => _role;
  int? get userId => _userId;
  String? get userName => _userName;

  void logout() {
    _token = null;
    _role = null;
    _userId = null;
    _userName = null;
  }

  Future<List<Job>> fetchJobs() async {
    final response = await http.get(
      Uri.parse('$baseUrl/vacancies?page=1&pageSize=30'),
      headers: _token != null ? {'Authorization': 'Bearer $_token'} : null,
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
    final response = await http.get(
      Uri.parse('$baseUrl/vacancies/$id'),
      headers: _token != null ? {'Authorization': 'Bearer $_token'} : null,
    );
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
      setToken(data['token']);
      return data['token'];
    } else {
      logout();
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

  // Новый отклик на вакансию (по аналогии с вебом)
  Future<bool> respondToJob(int jobId, String jobTitle) async {
    if (_token == null || _role != "Candidate") return false;
    final response = await http.post(
      Uri.parse('$baseUrl/applications'),
      headers: {
        'Authorization': 'Bearer $_token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'vacancyId': jobId,
        'vacancyTitle': jobTitle,
        'candidateName': _userName ?? "",
      }),
    );
    return response.statusCode == 200;
  }

  Future<List<Job>> fetchMyVacancies() async {
    if (_token == null || _role != "Employer") return [];
    final response = await http.get(
      Uri.parse('$baseUrl/vacancies/my'),
      headers: {'Authorization': 'Bearer $_token'},
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
      throw Exception('Ошибка загрузки вакансий работодателя');
    }
  }
}

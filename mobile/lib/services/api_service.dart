import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/job.dart';

const String baseUrl = 'http://localhost:5182/api';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;
  String? _role;
  int? _userId;
  String? _userName;
  String? _userRealName;

  void setToken(String token) {
    _token = token;
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
  String? get userRealName => _userRealName;

  void logout() {
    _token = null;
    _role = null;
    _userId = null;
    _userName = null;
    _userRealName = null;
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
      final data = json.decode(response.body) as Map<String, dynamic>;
      _userRealName = data['name'];
      return data;
    } else {
      return null;
    }
  }

  Future<bool> respondToJob(
    int jobId,
    String vacancyTitle,
    String candidateName,
  ) async {
    if (_token == null || _role != "Candidate") return false;
    final response = await http.post(
      Uri.parse('$baseUrl/applications'),
      headers: {
        'Authorization': 'Bearer $_token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'vacancyId': jobId,
        'vacancyTitle': vacancyTitle,
        'candidateName': candidateName,
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

  Future<List<dynamic>> fetchApplications() async {
    if (_token == null) return [];
    final response = await http.get(
      Uri.parse('$baseUrl/applications'),
      headers: {'Authorization': 'Bearer $_token'},
    );
    if (response.statusCode == 200) {
      return json.decode(response.body) as List<dynamic>;
    }
    throw Exception('Ошибка загрузки откликов');
  }

  Future<Map<String, dynamic>?> fetchApplication(int id) async {
    if (_token == null) return null;
    final response = await http.get(
      Uri.parse('$baseUrl/applications/$id'),
      headers: {'Authorization': 'Bearer $_token'},
    );
    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    }
    return null;
  }

  Future<Map<String, dynamic>?> fetchPublicProfile(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/user/public/$id'));
    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    }
    return null;
  }

  Future<List<dynamic>?> fetchMessages(int vacancyId, int candidateId) async {
    if (_token == null) return [];
    final response = await http.get(
      Uri.parse('$baseUrl/messages/vacancy/$vacancyId/candidate/$candidateId'),
      headers: {'Authorization': 'Bearer $_token'},
    );
    if (response.statusCode == 200) {
      return json.decode(response.body) as List<dynamic>;
    }
    return [];
  }

  Future<void> sendMessage(
    int vacancyId,
    int candidateId,
    String content,
  ) async {
    if (_token == null) return;
    await http.post(
      Uri.parse('$baseUrl/messages'),
      headers: {
        'Authorization': 'Bearer $_token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'vacancyId': vacancyId,
        'candidateId': candidateId,
        'content': content,
      }),
    );
  }

  Future<void> updateApplicationStatus(int id, int status) async {
    if (_token == null) return;
    await http.put(
      Uri.parse('$baseUrl/applications/$id/status?status=$status'),
      headers: {'Authorization': 'Bearer $_token'},
    );
  }

  Future<void> withdrawApplication(int id) async {
    if (_token == null) return;
    await http.put(
      Uri.parse('$baseUrl/applications/$id/withdraw'),
      headers: {'Authorization': 'Bearer $_token'},
    );
  }

  Future<void> updateProfile(Map<String, dynamic> userData) async {
    if (_token == null) return;
    await http.put(
      Uri.parse('$baseUrl/user/profile'),
      headers: {
        'Authorization': 'Bearer $_token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(userData),
    );
  }

  Future<void> createVacancy(Map<String, dynamic> data) async {
    if (_token == null) return;
    await http.post(
      Uri.parse('$baseUrl/vacancies'),
      headers: {
        'Authorization': 'Bearer $_token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(data),
    );
  }

  Future<void> updateVacancy(int id, Map<String, dynamic> data) async {
    if (_token == null) return;
    await http.put(
      Uri.parse('$baseUrl/vacancies/$id'),
      headers: {
        'Authorization': 'Bearer $_token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(data),
    );
  }

  Future<void> deleteVacancy(int id) async {
    if (_token == null) return;
    await http.delete(
      Uri.parse('$baseUrl/vacancies/$id'),
      headers: {'Authorization': 'Bearer $_token'},
    );
  }
}

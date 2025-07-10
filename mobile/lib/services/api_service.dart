import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/job.dart';

// Пример базового URL, замени на свой!
const String baseUrl =
    'http://localhost:5182/api'; // <--- замени на адрес своего backend

class ApiService {
  Future<List<Job>> fetchJobs() async {
    final response = await http.get(Uri.parse('$baseUrl/jobs'));
    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.map((json) => Job.fromJson(json)).toList();
    } else {
      throw Exception('Ошибка загрузки вакансий');
    }
  }

  Future<Job> fetchJobDetail(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/jobs/$id'));
    if (response.statusCode == 200) {
      return Job.fromJson(json.decode(response.body));
    } else {
      throw Exception('Ошибка загрузки вакансии');
    }
  }

  Future<bool> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      body: {'email': email, 'password': password},
    );
    return response.statusCode == 200;
  }

  // Добавь методы регистрации, отклика и получения профиля по аналогии
}

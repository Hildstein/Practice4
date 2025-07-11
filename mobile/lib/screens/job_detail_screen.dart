import 'package:flutter/material.dart';
import '../models/job.dart';
import '../services/api_service.dart';

class JobDetailScreen extends StatefulWidget {
  const JobDetailScreen({super.key});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  bool _responding = false;
  String _responseMsg = '';

  List<Map<String, dynamic>> _findApplications(List<dynamic> apps, int jobId) {
    return apps
        .where((a) => a['vacancyId'] == jobId)
        .map((a) => a as Map<String, dynamic>)
        .toList();
  }

  // Получить последний актуальный отклик
  Map<String, dynamic>? _latestApplication(List<Map<String, dynamic>> apps) {
    if (apps.isEmpty) return null;
    apps.sort((a, b) {
      final aDate = DateTime.tryParse(a['appliedAt'] ?? '');
      final bDate = DateTime.tryParse(b['appliedAt'] ?? '');
      if (aDate == null || bDate == null) return 0;
      return bDate.compareTo(aDate);
    });
    final active = apps.firstWhere(
      (a) => a['status'] == 0 || a['status'] == 2,
      orElse: () => <String, dynamic>{},
    );
    return active.isNotEmpty ? active : apps.first;
  }

  bool _hasActive(List<Map<String, dynamic>> apps) {
    return apps.any((a) => a['status'] == 0 || a['status'] == 2);
  }

  bool _canReapply(List<Map<String, dynamic>> apps) {
    return !_hasActive(apps) &&
        apps.any((a) => a['status'] == 1 || a['status'] == 3);
  }

  bool _canApply(List<Map<String, dynamic>> apps) {
    return !_hasActive(apps) && !_canReapply(apps) && apps.isEmpty;
  }

  Future<void> _respond(Job job) async {
    setState(() {
      _responding = true;
      _responseMsg = '';
    });
    await ApiService().getProfile();
    bool result = await ApiService().respondToJob(
      job.id,
      job.title,
      ApiService().userRealName ?? '',
    );
    setState(() {
      _responding = false;
      if (result) {
        _responseMsg = 'Отклик отправлен!';
      } else {
        _responseMsg = 'Ошибка отклика или вы не авторизованы!';
      }
    });
    if (!mounted) return;
  }

  @override
  Widget build(BuildContext context) {
    final int jobId = ModalRoute.of(context)!.settings.arguments as int;

    return Scaffold(
      appBar: AppBar(title: const Text('Детали вакансии')),
      body: FutureBuilder<Job>(
        future: ApiService().fetchJobDetail(jobId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Ошибка: ${snapshot.error}'));
          }
          final job = snapshot.data;
          if (job == null) return const SizedBox.shrink();

          final api = ApiService();
          final isCandidate = api.role == "Candidate";
          final isOwnVacancy = api.userId == job.employerId;

          return FutureBuilder<List<dynamic>>(
            future: ApiService().fetchApplications(),
            builder: (context, appsSnapshot) {
              final apps = appsSnapshot.data ?? [];
              final myApps = _findApplications(apps, job.id);
              final latestApp = _latestApplication(myApps);
              final canReapply = _canReapply(myApps);
              final canApply = _canApply(myApps);
              final hasActive = _hasActive(myApps);

              return Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      job.title,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '${job.employerName}, ${job.city}',
                      style: const TextStyle(fontSize: 16),
                    ),
                    Text(
                      'Email: ${job.employerEmail}',
                      style: const TextStyle(fontSize: 15),
                    ),
                    Text(
                      'Телефон: ${job.employerPhone}',
                      style: const TextStyle(fontSize: 15),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(
                          context,
                          '/public_profile',
                          arguments: job.employerId,
                        );
                      },
                      child: const Text('Профиль работодателя'),
                    ),
                    const SizedBox(height: 16),
                    Text(job.description),
                    const Spacer(),
                    if (isCandidate && !isOwnVacancy) ...[
                      if (canReapply)
                        ElevatedButton.icon(
                          icon: const Icon(Icons.refresh),
                          label: _responding
                              ? const CircularProgressIndicator()
                              : const Text('Откликнуться повторно'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                          ),
                          onPressed: _responding ? null : () => _respond(job),
                        ),
                      if (canApply)
                        ElevatedButton(
                          onPressed: _responding ? null : () => _respond(job),
                          child: _responding
                              ? const CircularProgressIndicator()
                              : const Text('Откликнуться'),
                        ),
                      if (hasActive && latestApp != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: Text(
                            _statusLabel(latestApp['status']),
                            style: const TextStyle(
                              color: Colors.green,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      if (_responseMsg.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: Text(
                            _responseMsg,
                            style: TextStyle(
                              color: _responseMsg.contains('Ошибка')
                                  ? Colors.red
                                  : Colors.green,
                            ),
                          ),
                        ),
                    ],
                    if (!isCandidate && isOwnVacancy)
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Text(
                          'Это ваша вакансия',
                          style: const TextStyle(
                            color: Colors.grey,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  String _statusLabel(int status) {
    switch (status) {
      case 0:
        return "Отклик отправлен";
      case 1:
        return "Отклик отозван";
      case 2:
        return "Отклик принят";
      case 3:
        return "Отклик отклонён";
      default:
        return "";
    }
  }
}

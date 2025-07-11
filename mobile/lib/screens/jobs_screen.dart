import 'package:flutter/material.dart';
import '../models/job.dart';
import '../services/api_service.dart';

class JobsScreen extends StatefulWidget {
  const JobsScreen({super.key});

  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> {
  late Future<List<Job>> _jobs;
  List<dynamic> myApplications = [];
  bool loading = false;

  @override
  void initState() {
    super.initState();
    _jobs = ApiService().fetchJobs();
    _loadApplications();
  }

  Future<void> _loadApplications() async {
    myApplications = await ApiService().fetchApplications();
    setState(() {});
  }

  // Получить все отклики на конкретную вакансию
  List<Map<String, dynamic>> _findApplications(int jobId) {
    return myApplications
        .where((a) => a['vacancyId'] == jobId)
        .map((a) => a as Map<String, dynamic>)
        .toList();
  }

  // Получить последний актуальный отклик (по дате, с активным статусом)
  Map<String, dynamic>? _latestApplication(int jobId) {
    final apps = _findApplications(jobId);
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

  // Есть ли активный отклик
  bool _hasActive(int jobId) {
    return _findApplications(
      jobId,
    ).any((a) => a['status'] == 0 || a['status'] == 2);
  }

  bool _canReapply(int jobId) {
    final apps = _findApplications(jobId);
    return !_hasActive(jobId) &&
        apps.any((a) => a['status'] == 1 || a['status'] == 3);
  }

  bool _canApply(int jobId) {
    final apps = _findApplications(jobId);
    return !_hasActive(jobId) && !_canReapply(jobId) && apps.isEmpty;
  }

  String _statusText(int? status) {
    switch (status) {
      case 0:
        return "Отклик отправлен";
      case 1:
        return "Отозван";
      case 2:
        return "Принят";
      case 3:
        return "Отклонен";
      default:
        return "";
    }
  }

  Color _statusColor(int? status) {
    switch (status) {
      case 0:
        return Colors.blue;
      case 1:
        return Colors.orange;
      case 2:
        return Colors.green;
      case 3:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _statusIcon(int? status) {
    switch (status) {
      case 0:
        return Icons.hourglass_empty;
      case 1:
        return Icons.reply;
      case 2:
        return Icons.check_circle_outline;
      case 3:
        return Icons.cancel_outlined;
      default:
        return Icons.help_outline;
    }
  }

  Future<void> _respond(Job job) async {
    setState(() => loading = true);
    await ApiService().getProfile();
    bool result = await ApiService().respondToJob(
      job.id,
      job.title,
      ApiService().userRealName ?? '',
    );
    await _loadApplications();
    setState(() => loading = false);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(result ? 'Отклик отправлен!' : 'Ошибка отклика!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final api = ApiService();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Вакансии'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            tooltip: 'Профиль',
            onPressed: () => Navigator.pushNamed(context, '/profile'),
          ),
          IconButton(
            icon: const Icon(Icons.list_alt),
            tooltip: 'Отклики',
            onPressed: () => Navigator.pushNamed(context, '/applications'),
          ),
        ],
      ),
      body: FutureBuilder<List<Job>>(
        future: _jobs,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Ошибка: ${snapshot.error}'));
          }
          final jobs = snapshot.data ?? [];
          return ListView.builder(
            itemCount: jobs.length,
            itemBuilder: (context, index) {
              final job = jobs[index];
              final latestApp = _latestApplication(job.id);
              final status = latestApp != null ? latestApp['status'] : null;
              final canReapply = _canReapply(job.id);
              final canApply = _canApply(job.id);
              final isCandidate = api.role == "Candidate";
              final isOwnVacancy = api.userId == job.employerId;

              return Card(
                child: ListTile(
                  title: Text(job.title),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${job.employerName}, ${job.city}'),
                      if (canReapply && isCandidate && !isOwnVacancy)
                        Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: ElevatedButton.icon(
                            icon: const Icon(Icons.refresh),
                            label: loading
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Text('Откликнуться повторно'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue,
                              foregroundColor: Colors.white,
                            ),
                            onPressed: loading ? null : () => _respond(job),
                          ),
                        ),
                      if (canApply && isCandidate && !isOwnVacancy)
                        Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: ElevatedButton(
                            child: loading
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Text('Откликнуться'),
                            onPressed: loading ? null : () => _respond(job),
                          ),
                        ),
                    ],
                  ),
                  trailing: latestApp != null
                      ? Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              _statusIcon(status),
                              color: _statusColor(status),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _statusText(status),
                              style: TextStyle(
                                color: _statusColor(status),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        )
                      : null,
                  leading: IconButton(
                    icon: const Icon(Icons.info_outline),
                    tooltip: 'Профиль работодателя',
                    onPressed: () {
                      Navigator.pushNamed(
                        context,
                        '/public_profile',
                        arguments: job.employerId,
                      );
                    },
                  ),
                  onTap: () async {
                    await Navigator.pushNamed(
                      context,
                      '/job_detail',
                      arguments: job.id,
                    );
                    await _loadApplications();
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}

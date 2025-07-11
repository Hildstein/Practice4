import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'chat_screen.dart';

class ApplicationDetailScreen extends StatefulWidget {
  const ApplicationDetailScreen({super.key});

  @override
  State<ApplicationDetailScreen> createState() =>
      _ApplicationDetailScreenState();
}

class _ApplicationDetailScreenState extends State<ApplicationDetailScreen> {
  Map<String, dynamic>? application;
  bool loading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final int appId = ModalRoute.of(context)!.settings.arguments as int;
    _loadApplication(appId);
  }

  Future<void> _loadApplication(int id) async {
    final api = ApiService();
    final data = await api.fetchApplication(id);
    setState(() {
      application = data;
      loading = false;
    });
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

  String _statusText(int? status) {
    const map = {0: "Новый", 1: "Отозван", 2: "Принят", 3: "Отклонен"};
    return map[status] ?? "Неизвестно";
  }

  bool _canEmployerChangeStatus(int status) {
    // Only NEW (0) and REJECTED (3) can be changed
    return status == 0 || status == 3;
  }

  @override
  Widget build(BuildContext context) {
    final api = ApiService();
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (application == null) {
      return const Scaffold(body: Center(child: Text('Отклик не найден')));
    }
    return Scaffold(
      appBar: AppBar(title: const Text('Отклик на вакансию')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            Text(
              "Вакансия: ${application!['vacancyTitle'] ?? ''}",
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            Row(
              children: [
                Icon(
                  _statusIcon(application!['status']),
                  color: _statusColor(application!['status']),
                ),
                const SizedBox(width: 8),
                Text(
                  _statusText(application!['status']),
                  style: TextStyle(
                    color: _statusColor(application!['status']),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            Text("Кандидат: ${application!['candidateName'] ?? ''}"),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(
                  context,
                  '/public_profile',
                  arguments: application!['candidateId'],
                );
              },
              child: const Text('Профиль кандидата'),
            ),
            if (application!['candidateResume'] != null)
              Text("Резюме кандидата: ${application!['candidateResume']}"),
            Text("Дата отклика: ${application!['appliedAt'] ?? ''}"),
            const SizedBox(height: 20),
            if (application!['vacancyId'] != null &&
                application!['candidateId'] != null)
              SizedBox(
                height: 300,
                child: ChatScreen(
                  vacancyId: application!['vacancyId'],
                  candidateId: application!['candidateId'],
                  currentUserId: api.userId ?? 0,
                ),
              ),
            const SizedBox(height: 20),
            if (api.role == "Employer" &&
                _canEmployerChangeStatus(application!['status'])) ...[
              ElevatedButton.icon(
                icon: const Icon(Icons.check),
                onPressed: () async {
                  await api.updateApplicationStatus(application!['id'], 2);
                  await _loadApplication(application!['id']);
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Кандидат принят')),
                  );
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                label: const Text("Принять"),
              ),
              ElevatedButton.icon(
                icon: const Icon(Icons.cancel),
                onPressed: () async {
                  await api.updateApplicationStatus(application!['id'], 3);
                  await _loadApplication(application!['id']);
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Отклик отклонён')),
                  );
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                label: const Text("Отклонить"),
              ),
            ],
            if (api.role == "Candidate" && application!['status'] == 0)
              ElevatedButton.icon(
                icon: const Icon(Icons.reply),
                onPressed: () async {
                  await api.withdrawApplication(application!['id']);
                  await _loadApplication(application!['id']);
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Отклик отозван')),
                  );
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                label: const Text("Отозвать отклик"),
              ),
          ],
        ),
      ),
    );
  }
}

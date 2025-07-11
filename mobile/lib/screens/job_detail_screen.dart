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

  Future<void> _respond(Job job) async {
    setState(() {
      _responding = true;
      _responseMsg = '';
    });
    bool result = await ApiService().respondToJob(job.id, job.title);
    setState(() {
      _responding = false;
      if (result) {
        _responseMsg = 'Отклик отправлен!';
      } else {
        _responseMsg = 'Ошибка отклика или вы не авторизованы!';
      }
    });
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
                const SizedBox(height: 16),
                Text(job.description),
                const Spacer(),
                if (isCandidate && !isOwnVacancy) ...[
                  ElevatedButton(
                    onPressed: _responding ? null : () => _respond(job),
                    child: _responding
                        ? const CircularProgressIndicator()
                        : const Text('Откликнуться'),
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
      ),
    );
  }
}

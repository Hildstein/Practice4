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

  Future<void> _respond(int jobId) async {
    setState(() {
      _responding = true;
      _responseMsg = '';
    });
    bool result = await ApiService().respondToJob(jobId);
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
                ElevatedButton(
                  onPressed: _responding ? null : () => _respond(job.id),
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
            ),
          );
        },
      ),
    );
  }
}

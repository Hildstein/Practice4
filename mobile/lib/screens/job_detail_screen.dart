import 'package:flutter/material.dart';
import '../models/job.dart';
import '../services/api_service.dart';

class JobDetailScreen extends StatelessWidget {
  const JobDetailScreen({super.key});

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
                  '${job.company}, ${job.location}',
                  style: const TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 16),
                Text(job.description),
                const Spacer(),
                ElevatedButton(
                  onPressed: () {
                    // Отклик на вакансию
                  },
                  child: const Text('Откликнуться'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

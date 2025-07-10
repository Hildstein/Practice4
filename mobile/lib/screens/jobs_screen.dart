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

  @override
  void initState() {
    super.initState();
    _jobs = ApiService().fetchJobs();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Вакансии')),
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
              return ListTile(
                title: Text(job.title),
                subtitle: Text('${job.company}, ${job.location}'),
                onTap: () {
                  Navigator.pushNamed(
                    context,
                    '/job_detail',
                    arguments: job.id,
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}

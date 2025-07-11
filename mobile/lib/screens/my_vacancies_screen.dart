import 'package:flutter/material.dart';
import '../models/job.dart';
import '../services/api_service.dart';

class MyVacanciesScreen extends StatefulWidget {
  const MyVacanciesScreen({super.key});

  @override
  State<MyVacanciesScreen> createState() => _MyVacanciesScreenState();
}

class _MyVacanciesScreenState extends State<MyVacanciesScreen> {
  late Future<List<Job>> _jobs;

  @override
  void initState() {
    super.initState();
    _jobs = ApiService().fetchMyVacancies();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Мои вакансии')),
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
          if (jobs.isEmpty) {
            return const Center(child: Text('Нет ваших вакансий.'));
          }
          return ListView.builder(
            itemCount: jobs.length,
            itemBuilder: (context, index) {
              final job = jobs[index];
              return ListTile(
                title: Text(job.title),
                subtitle: Text('${job.city}'),
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

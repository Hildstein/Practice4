import 'package:flutter/material.dart';
import '../models/job.dart';
import '../services/api_service.dart';
import 'vacancy_form_screen.dart';

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

  void _refresh() => setState(() => _jobs = ApiService().fetchMyVacancies());

  void _edit(Job job) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => VacancyFormScreen(vacancy: job, onChanged: _refresh),
      ),
    );
  }

  void _create() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => VacancyFormScreen(onChanged: _refresh)),
    );
  }

  Future<void> _delete(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Удалить вакансию?'),
        content: const Text('Вы уверены, что хотите удалить вакансию?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Удалить'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ApiService().deleteVacancy(id);
      _refresh();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Вакансия удалена')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Мои вакансии'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: "Создать вакансию",
            onPressed: _create,
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
          if (jobs.isEmpty) {
            return const Center(child: Text('Нет ваших вакансий.'));
          }
          return ListView.builder(
            itemCount: jobs.length,
            itemBuilder: (context, index) {
              final job = jobs[index];
              return ListTile(
                title: Text(job.title),
                subtitle: Text(job.city),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () => _edit(job),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete),
                      onPressed: () => _delete(job.id),
                    ),
                  ],
                ),
                onTap: () async {
                  await Navigator.pushNamed(
                    context,
                    '/job_detail',
                    arguments: job.id,
                  );
                  _refresh();
                },
              );
            },
          );
        },
      ),
    );
  }
}

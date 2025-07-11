import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ApplicationsScreen extends StatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  State<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends State<ApplicationsScreen> {
  late Future<List<dynamic>> _apps;

  @override
  void initState() {
    super.initState();
    _apps = ApiService().fetchApplications();
  }

  Future<void> _refresh() async {
    setState(() {
      _apps = ApiService().fetchApplications();
    });
  }

  Color _statusColor(int status) {
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

  String _statusText(int status) {
    switch (status) {
      case 0:
        return "Новый";
      case 1:
        return "Отозван";
      case 2:
        return "Принят";
      case 3:
        return "Отклонен";
      default:
        return "Неизвестно";
    }
  }

  IconData _statusIcon(int status) {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Отклики'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Обновить',
            onPressed: _refresh,
          ),
        ],
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _apps,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Ошибка: ${snapshot.error}'));
          }
          final apps = snapshot.data ?? [];
          if (apps.isEmpty) {
            return const Center(child: Text('Нет откликов.'));
          }
          return ListView.builder(
            itemCount: apps.length,
            itemBuilder: (context, index) {
              final app = apps[index];
              return Card(
                child: ListTile(
                  title: Text(app['vacancyTitle'] ?? ''),
                  subtitle: Text(app['candidateName'] ?? ''),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _statusIcon(app['status']),
                        color: _statusColor(app['status']),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _statusText(app['status']),
                        style: TextStyle(
                          color: _statusColor(app['status']),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  onTap: () async {
                    await Navigator.pushNamed(
                      context,
                      '/application_detail',
                      arguments: app['id'],
                    );
                    await _refresh();
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

import 'package:flutter/material.dart';
import '../models/job.dart';
import '../services/api_service.dart';

class VacancyFormScreen extends StatefulWidget {
  final Job? vacancy;
  final VoidCallback? onChanged;
  const VacancyFormScreen({super.key, this.vacancy, this.onChanged});

  @override
  State<VacancyFormScreen> createState() => _VacancyFormScreenState();
}

class _VacancyFormScreenState extends State<VacancyFormScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _cityController = TextEditingController();
  bool loading = false;
  String error = '';

  @override
  void initState() {
    super.initState();
    if (widget.vacancy != null) {
      _titleController.text = widget.vacancy!.title;
      _descController.text = widget.vacancy!.description;
      _cityController.text = widget.vacancy!.city;
    }
  }

  Future<void> _save() async {
    setState(() => loading = true);
    if (_titleController.text.trim().length < 5) {
      setState(() {
        error = 'Название минимум 5 символов';
        loading = false;
      });
      return;
    }
    if (_descController.text.trim().length < 20) {
      setState(() {
        error = 'Описание минимум 20 символов';
        loading = false;
      });
      return;
    }
    if (_cityController.text.trim().length < 2) {
      setState(() {
        error = 'Город минимум 2 символа';
        loading = false;
      });
      return;
    }
    final data = {
      'title': _titleController.text.trim(),
      'description': _descController.text.trim(),
      'city': _cityController.text.trim(),
    };
    try {
      if (widget.vacancy != null) {
        await ApiService().updateVacancy(widget.vacancy!.id, data);
      } else {
        await ApiService().createVacancy(data);
      }
      widget.onChanged?.call();
      Navigator.pop(context);
    } catch (e) {
      setState(() {
        error = 'Ошибка сохранения';
      });
    }
    setState(() => loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.vacancy == null
              ? "Создать вакансию"
              : "Редактировать вакансию",
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: "Название вакансии"),
            ),
            TextField(
              controller: _descController,
              decoration: const InputDecoration(labelText: "Описание"),
              maxLines: 4,
            ),
            TextField(
              controller: _cityController,
              decoration: const InputDecoration(labelText: "Город"),
            ),
            if (error.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(error, style: const TextStyle(color: Colors.red)),
              ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: loading ? null : _save,
                child: Text(loading ? "Сохраняем..." : "Сохранить"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

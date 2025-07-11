import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/jobs_screen.dart';
import 'screens/job_detail_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/register_screen.dart';
import 'screens/my_vacancies_screen.dart';
import 'screens/applications_screen.dart';
import 'screens/application_detail_screen.dart';
import 'screens/public_profile_screen.dart';
import 'screens/vacancy_form_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Job Platform Mobile',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginScreen(),
        '/jobs': (context) => const JobsScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/job_detail': (context) => const JobDetailScreen(),
        '/register': (context) => const RegisterScreen(),
        '/my_vacancies': (context) => const MyVacanciesScreen(),
        '/applications': (context) => const ApplicationsScreen(),
        '/application_detail': (context) => const ApplicationDetailScreen(),
        '/public_profile': (context) => const PublicProfileScreen(),
        '/vacancy_form': (context) => VacancyFormScreen(),
      },
      onUnknownRoute: (settings) => MaterialPageRoute(
        builder: (context) =>
            const Scaffold(body: Center(child: Text('Страница не найдена'))),
      ),
    );
  }
}

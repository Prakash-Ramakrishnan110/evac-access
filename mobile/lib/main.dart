import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/tasks_provider.dart';
import 'providers/shelter_provider.dart';
import 'providers/reports_provider.dart';
import 'screens/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EvacAccessMobileApp());
}

class EvacAccessMobileApp extends StatelessWidget {
  const EvacAccessMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => TasksProvider()),
        ChangeNotifierProvider(create: (_) => ShelterProvider()),
        ChangeNotifierProvider(create: (_) => ReportsProvider()),
      ],
      child: MaterialApp(
        title: 'EvacAccess Responder Pro',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF00B4D8),
            secondary: Color(0xFF10B981),
            surface: Color(0xFF1C2541),
            error: Color(0xFFEF4444),
          ),
          scaffoldBackgroundColor: const Color(0xFF0B132B),
          cardTheme: const CardThemeData(
            color: Color(0xFF1C2541),
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(14)),
              side: BorderSide(color: Color(0xFF2E3E64)),
            ),
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF1C2541),
            foregroundColor: Colors.white,
            elevation: 0,
            centerTitle: false,
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              elevation: 3,
              shadowColor: const Color(0xFF00B4D8).withValues(alpha: 0.3),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: const Color(0xFF161F36),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF2E3E64)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF2E3E64)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF00B4D8), width: 1.5),
            ),
          ),
        ),
        home: const LoginScreen(),
      ),
    );
  }
}

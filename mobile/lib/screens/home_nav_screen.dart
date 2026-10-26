import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/reports_provider.dart';
import 'tasks_list_screen.dart';
import 'mesh_beacon_screen.dart';
import 'ai_obstacle_scanner_screen.dart';
import 'shelter_inspection_screen.dart';
import 'obstacle_report_screen.dart';
import 'offline_queue_screen.dart';
import 'login_screen.dart';

class HomeNavScreen extends StatefulWidget {
  const HomeNavScreen({super.key});

  @override
  State<HomeNavScreen> createState() => _HomeNavScreenState();
}

class _HomeNavScreenState extends State<HomeNavScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    TasksListScreen(),
    MeshBeaconScreen(),
    AiObstacleScannerScreen(),
    ShelterInspectionScreen(),
    ObstacleReportScreen(),
    OfflineQueueScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final reports = Provider.of<ReportsProvider>(context);
    final user = auth.currentUser;

    return Scaffold(
      backgroundColor: const Color(0xFF0B132B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1C2541),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: const Color(0xFF00B4D8).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF00B4D8).withValues(alpha: 0.3)),
              ),
              child: const Icon(Icons.shield, color: Color(0xFF00B4D8), size: 20),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        user?.username ?? 'Tactical Unit',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'NDRF ALPHA',
                          style: TextStyle(
                            color: Color(0xFF10B981),
                            fontSize: 8.5,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Text(
                    '19.8142° N, 85.8281° E • Puri Coastal',
                    style: TextStyle(
                      color: Color(0xFF00B4D8),
                      fontSize: 10.5,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          // Network / Offline Indicator Pill
          GestureDetector(
            onTap: () {
              auth.toggleOfflineMode();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    auth.isOfflineMode
                        ? 'Simulating Full Network Blackout (Local Storage Active)'
                        : 'Simulating Online Connectivity (Satellite Sync Active)',
                  ),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 11),
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
              decoration: BoxDecoration(
                color: auth.isOfflineMode
                    ? const Color(0xFFEF4444).withValues(alpha: 0.2)
                    : const Color(0xFF10B981).withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: auth.isOfflineMode ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                  width: 1.2,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    auth.isOfflineMode ? Icons.wifi_off : Icons.cell_tower,
                    size: 13,
                    color: auth.isOfflineMode ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    auth.isOfflineMode ? 'OFFLINE' : 'SAT-SYNC',
                    style: TextStyle(
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: auth.isOfflineMode ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 4),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70, size: 20),
            tooltip: 'Sign Out',
            onPressed: () async {
              await auth.logout();
              if (context.mounted) {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              }
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1C2541),
          border: Border(top: BorderSide(color: Color(0xFF2E3E64), width: 1)),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (index) => setState(() => _currentIndex = index),
          backgroundColor: const Color(0xFF1C2541),
          elevation: 0,
          indicatorColor: const Color(0xFF00B4D8).withValues(alpha: 0.25),
          destinations: [
            const NavigationDestination(
              icon: Icon(Icons.assignment_outlined, color: Colors.white60),
              selectedIcon: Icon(Icons.assignment, color: Color(0xFF00B4D8)),
              label: 'Missions',
            ),
            const NavigationDestination(
              icon: Icon(Icons.radar_outlined, color: Colors.white60),
              selectedIcon: Icon(Icons.radar, color: Color(0xFF00B4D8)),
              label: 'Mesh Radar',
            ),
            const NavigationDestination(
              icon: Icon(Icons.camera_alt_outlined, color: Colors.white60),
              selectedIcon: Icon(Icons.camera_alt, color: Color(0xFF00B4D8)),
              label: 'AI Vision',
            ),
            const NavigationDestination(
              icon: Icon(Icons.domain_verification_outlined, color: Colors.white60),
              selectedIcon: Icon(Icons.domain_verification, color: Color(0xFF00B4D8)),
              label: 'Shelter',
            ),
            const NavigationDestination(
              icon: Icon(Icons.warning_amber_outlined, color: Colors.white60),
              selectedIcon: Icon(Icons.warning_amber_rounded, color: Color(0xFF00B4D8)),
              label: 'Roadblock',
            ),
            NavigationDestination(
              icon: Badge(
                isLabelVisible: reports.pendingCount > 0,
                label: Text('${reports.pendingCount}'),
                child: const Icon(Icons.cloud_sync_outlined, color: Colors.white60),
              ),
              selectedIcon: Badge(
                isLabelVisible: reports.pendingCount > 0,
                label: Text('${reports.pendingCount}'),
                child: const Icon(Icons.cloud_sync, color: Color(0xFF00B4D8)),
              ),
              label: 'Queue',
            ),
          ],
        ),
      ),
    );
  }
}

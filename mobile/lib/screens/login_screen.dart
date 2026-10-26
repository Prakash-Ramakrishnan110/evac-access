import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'home_nav_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController(text: 'responder1');
  final _passwordController = TextEditingController(text: 'responder123');
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _fillCredentials(String user, String pass) {
    setState(() {
      _usernameController.text = user;
      _passwordController.text = pass;
    });
  }

  void _showHostConfigDialog() {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final controller = TextEditingController(text: auth.serverUrl);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1C2541),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: Color(0xFF2E3E64)),
        ),
        title: const Text('Backend Endpoint Config', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select backend host endpoint for live telemetry & sync:',
              style: TextStyle(fontSize: 12, color: Colors.white70),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Host URL',
                prefixIcon: Icon(Icons.dns_outlined, color: Color(0xFF00B4D8)),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: [
                ActionChip(
                  backgroundColor: const Color(0xFF0B132B),
                  label: const Text('127.0.0.1:8000 (Desktop)', style: TextStyle(fontSize: 11, color: Colors.white70)),
                  onPressed: () => controller.text = 'http://127.0.0.1:8000',
                ),
                ActionChip(
                  backgroundColor: const Color(0xFF0B132B),
                  label: const Text('10.0.2.2:8000 (Android)', style: TextStyle(fontSize: 11, color: Colors.white70)),
                  onPressed: () => controller.text = 'http://10.0.2.2:8000',
                ),
              ],
            )
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00B4D8)),
            onPressed: () {
              auth.setServerUrl(controller.text.trim());
              Navigator.pop(ctx);
            },
            child: const Text('Save Host', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

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
            const Text(
              'EvacAccess India',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Colors.white70),
            tooltip: 'Configure Backend URL',
            onPressed: _showHostConfigDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Emergency Banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 22),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'FIELD RESPONDER UTILITY • ODISHA COASTAL FLOOD',
                      style: TextStyle(
                        color: Color(0xFFEF4444),
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Hackathon Evaluator 1-Tap Entry Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0077B6), Color(0xFF00B4D8), Color(0xFF10B981)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00B4D8).withValues(alpha: 0.35),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.25),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'HSC 2027 PROTOTYPE REVIEW',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 9.5,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                      const Spacer(),
                      const Icon(Icons.bolt, color: Colors.amberAccent, size: 20),
                    ],
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'Explore All 6 Mobile Modules Instantly',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    '100% Standalone: Pre-loaded with NDRF missions, offline mesh radar, AI vision scanner, shelter inspection, and roadblock reporting.',
                    style: TextStyle(color: Colors.white, fontSize: 11.5, height: 1.3),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF0077B6),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.play_circle_fill, size: 20, color: Color(0xFF0077B6)),
                    label: const Text(
                      'Launch Complete Mobile Showcase',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    onPressed: () async {
                      auth.toggleOfflineMode();
                      final ok = await auth.login('NDRF Tactical Unit (Puri)', 'demo123');
                      if (ok && context.mounted) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (_) => const HomeNavScreen()),
                        );
                      }
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Card Container
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: const Color(0xFF1C2541),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF2E3E64)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.25),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Responder Sign-In',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Authenticate with tactical badge credentials or engage offline mesh standby mode.',
                    style: TextStyle(fontSize: 12, color: Colors.white60),
                  ),
                  const SizedBox(height: 18),

                  // Offline Mode Switch
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: auth.isOfflineMode
                          ? const Color(0xFFEF4444).withValues(alpha: 0.15)
                          : const Color(0xFF0B132B),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: auth.isOfflineMode ? const Color(0xFFEF4444) : const Color(0xFF2E3E64),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          auth.isOfflineMode ? Icons.wifi_off : Icons.cell_tower,
                          color: auth.isOfflineMode ? const Color(0xFFEF4444) : const Color(0xFF00B4D8),
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            auth.isOfflineMode ? 'Offline Standby Active' : 'Live Satellite Network Active',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                              color: auth.isOfflineMode ? const Color(0xFFEF4444) : Colors.white,
                            ),
                          ),
                        ),
                        Switch(
                          value: auth.isOfflineMode,
                          activeColor: const Color(0xFFEF4444),
                          onChanged: (_) => auth.toggleOfflineMode(),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  if (auth.errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.info_outline, color: Color(0xFFEF4444), size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  auth.errorMessage!.contains('refused') || auth.errorMessage!.contains('Socket')
                                      ? 'Live backend server is unreachable. You can continue seamlessly in Offline Standby Mode.'
                                      : auth.errorMessage!,
                                  style: const TextStyle(color: Color(0xFFEF4444), fontSize: 11.5, fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFEF4444),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.wifi_off, size: 16),
                            label: const Text('Continue in Offline Standby', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            onPressed: () async {
                              auth.toggleOfflineMode();
                              final ok = await auth.login(_usernameController.text, _passwordController.text);
                              if (ok && context.mounted) {
                                Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(builder: (_) => const HomeNavScreen()),
                                );
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Username field
                  TextField(
                    controller: _usernameController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: const InputDecoration(
                      labelText: 'Badge Ref / Username',
                      prefixIcon: Icon(Icons.badge_outlined, color: Color(0xFF00B4D8)),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Password field
                  TextField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Tactical Passcode',
                      prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF00B4D8)),
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: Colors.white54),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Submit button
                  SizedBox(
                    height: 46,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00B4D8),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: auth.isLoading
                          ? null
                          : () async {
                              final success = await auth.login(
                                _usernameController.text.trim(),
                                _passwordController.text.trim(),
                              );
                              if (success && context.mounted) {
                                Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(builder: (_) => const HomeNavScreen()),
                                );
                              }
                            },
                      child: auth.isLoading
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                            )
                          : const Text(
                              'Access Dispatch Board',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.5),
                            ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Fast credential pills
                  const Text(
                    'QUICK DEMO CREDENTIAL PRE-FILLS:',
                    style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, letterSpacing: 0.5, color: Colors.white60),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _fillCredentials('responder1', 'responder123'),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFF2E3E64)),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                          ),
                          child: const Text('Responder 1', style: TextStyle(fontSize: 11, color: Color(0xFF00B4D8))),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _fillCredentials('coordinator', 'coordinator123'),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFF2E3E64)),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                          ),
                          child: const Text('Coordinator', style: TextStyle(fontSize: 11, color: Colors.white70)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _fillCredentials('volunteer1', 'volunteer123'),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFF2E3E64)),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                          ),
                          child: const Text('Volunteer', style: TextStyle(fontSize: 11, color: Colors.white70)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

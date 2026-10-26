import 'dart:async';
import 'package:flutter/material.dart';

class AiObstacleScannerScreen extends StatefulWidget {
  const AiObstacleScannerScreen({super.key});

  @override
  State<AiObstacleScannerScreen> createState() => _AiObstacleScannerScreenState();
}

class _AiObstacleScannerScreenState extends State<AiObstacleScannerScreen> with SingleTickerProviderStateMixin {
  late AnimationController _crosshairController;
  bool _isAnalyzing = false;
  bool _isSirenActive = false;
  int _selectedTargetIndex = 0;

  final List<Map<String, dynamic>> _scannerPresets = [
    {
      'title': 'Segment CR-02 (Coastal Road)',
      'obstacleClass': 'FLOODWATER INUNDATION',
      'estimatedDepth': '35 cm (±2cm)',
      'wheelchairStatus': 'HARD BARRIER (>10cm)',
      'confidence': '96.4%',
      'recommendation': 'Reroute all wheelchair and non-amphibious units via Station Road Overpass.',
      'color': Color(0xFFEF4444),
    },
    {
      'title': 'Puri High School Entrance',
      'obstacleClass': 'ENTRANCE STEP BARRIER',
      'estimatedDepth': '0 cm',
      'wheelchairStatus': '14 STEPS • NO RAMP',
      'confidence': '98.8%',
      'recommendation': 'Shelter entrance lacks step-free access. Unsuitable for EA-1001 without stretcher team.',
      'color': Color(0xFFEF4444),
    },
    {
      'title': 'Community Hall Sector 4 Ramp',
      'obstacleClass': 'CONCRETE ACCESS RAMP',
      'estimatedDepth': '12 cm runoff',
      'wheelchairStatus': 'SLOPE 1:11 (PASS)',
      'confidence': '94.2%',
      'recommendation': 'Ramp slope meets RPwD standards. Handrails verified on both sides.',
      'color': Color(0xFF10B981),
    },
  ];

  @override
  void initState() {
    super.initState();
    _crosshairController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _crosshairController.dispose();
    super.dispose();
  }

  void _triggerScan() {
    setState(() => _isAnalyzing = true);
    Timer(const Duration(milliseconds: 1200), () {
      if (mounted) {
        setState(() {
          _isAnalyzing = false;
          _selectedTargetIndex = (_selectedTargetIndex + 1) % _scannerPresets.length;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('On-device Vision Model analysis complete. Hard barriers identified.'),
            backgroundColor: Color(0xFF00B4D8),
            duration: Duration(seconds: 2),
          ),
        );
      }
    });
  }

  void _toggleEmergencySiren() {
    setState(() => _isSirenActive = !_isSirenActive);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_isSirenActive ? 'High-Decibel Audio Locator Beacon ACTIVE' : 'Audio Locator Deactivated'),
        backgroundColor: _isSirenActive ? const Color(0xFFEF4444) : const Color(0xFF64748B),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final activeData = _scannerPresets[_selectedTargetIndex];

    return Scaffold(
      backgroundColor: const Color(0xFF0B132B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1C2541),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.camera_alt_outlined, color: Color(0xFF00B4D8), size: 22),
            SizedBox(width: 8),
            Text(
              'AI Barrier Computer Vision',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(
              _isSirenActive ? Icons.volume_up : Icons.volume_off,
              color: _isSirenActive ? const Color(0xFFEF4444) : Colors.white70,
            ),
            onPressed: _toggleEmergencySiren,
            tooltip: 'Tactical Siren / Locator Beacon',
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // AR Viewfinder Container
              Container(
                height: 280,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF00B4D8), width: 1.5),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Simulated Camera Feed (Gradient & Grid)
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            const Color(0xFF1C2541).withValues(alpha: 0.8),
                            const Color(0xFF0B132B),
                          ],
                        ),
                      ),
                    ),

                    // Grid Pattern Overlay
                    CustomPaint(
                      size: const Size(double.infinity, 280),
                      painter: _GridPainter(),
                    ),

                    // Animated Crosshair Bounding Box
                    AnimatedBuilder(
                      animation: _crosshairController,
                      builder: (context, child) {
                        final scale = 1.0 + (_crosshairController.value * 0.08);
                        return Transform.scale(
                          scale: scale,
                          child: Container(
                            width: 170,
                            height: 140,
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: _isAnalyzing
                                    ? const Color(0xFFF59E0B)
                                    : (activeData['color'] as Color),
                                width: 2,
                              ),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Stack(
                              children: [
                                // Corner Accent Marks
                                Positioned(
                                  top: 4,
                                  left: 6,
                                  child: Text(
                                    'AI DETECT: ${activeData['confidence']}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 8.5,
                                      fontFamily: 'monospace',
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Positioned(
                                  bottom: 4,
                                  right: 6,
                                  child: Text(
                                    activeData['estimatedDepth'],
                                    style: TextStyle(
                                      color: activeData['color'] as Color,
                                      fontSize: 10,
                                      fontFamily: 'monospace',
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),

                    // Top Left HUD Details
                    Positioned(
                      top: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: const Text(
                          'OPTICAL AR VIEW: 60 FPS • EDGE TFLITE',
                          style: TextStyle(
                            color: Color(0xFF00B4D8),
                            fontSize: 9,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),

                    // Scanning Laser Line
                    if (_isAnalyzing)
                      Positioned(
                        top: 140,
                        left: 20,
                        right: 20,
                        child: Container(
                          height: 2,
                          decoration: const BoxDecoration(
                            color: Color(0xFF00B4D8),
                            boxShadow: [
                              BoxShadow(color: Color(0xFF00B4D8), blurRadius: 8, spreadRadius: 2),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Scan Action Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00B4D8),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: _isAnalyzing ? null : _triggerScan,
                  icon: _isAnalyzing
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.blur_on, size: 20),
                  label: Text(
                    _isAnalyzing ? 'RUNNING COMPUTER VISION MODEL...' : 'ANALYZE OBSTACLE / MEASURE WATER DEPTH',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ),

              const SizedBox(height: 18),

              // AI Inference Results Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1C2541),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: activeData['color'] as Color),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          activeData['title'],
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: (activeData['color'] as Color).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            activeData['obstacleClass'],
                            style: TextStyle(
                              color: activeData['color'] as Color,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildMetricTile(
                            'ESTIMATED WATER DEPTH',
                            activeData['estimatedDepth'],
                            activeData['color'] as Color,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildMetricTile(
                            'WHEELCHAIR FEASIBILITY',
                            activeData['wheelchairStatus'],
                            activeData['color'] as Color,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'AI RECOMMENDATION FOR INCIDENT COMMAND:',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      activeData['recommendation'],
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricTile(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF0B132B),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.white54, fontSize: 8.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
          ),
        ],
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF00B4D8).withValues(alpha: 0.1)
      ..strokeWidth = 1.0;

    for (double x = 0; x < size.width; x += 40) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += 40) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

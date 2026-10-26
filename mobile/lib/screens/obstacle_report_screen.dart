import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/reports_provider.dart';
import '../providers/auth_provider.dart';

class ObstacleReportScreen extends StatefulWidget {
  const ObstacleReportScreen({super.key});

  @override
  State<ObstacleReportScreen> createState() => _ObstacleReportScreenState();
}

class _ObstacleReportScreenState extends State<ObstacleReportScreen> {
  String _reportType = 'HAZARD_INUNDATION';
  final _titleController = TextEditingController(text: 'Waterlogging at Grand Road Balagandi Junction');
  final _noteController = TextEditingController(
    text: 'Standing storm surge water across roadway. Current measured depth is 35cm. Wheelchair and non-4x4 transit impossible.',
  );
  double _latitude = 19.8130;
  double _longitude = 85.8310;
  int _waterDepthCm = 35;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  void _submitReport() async {
    final title = _titleController.text.trim();
    final note = _noteController.text.trim();

    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an observation title')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final reportsProv = Provider.of<ReportsProvider>(context, listen: false);

    final enrichedNote = _reportType == 'HAZARD_INUNDATION'
        ? '[Water Depth: ${_waterDepthCm}cm] $note'
        : note;

    final report = await reportsProv.createReport(
      reportType: _reportType,
      title: title,
      note: enrichedNote,
      latitude: _latitude,
      longitude: _longitude,
      forceOffline: auth.isOfflineMode,
    );

    setState(() => _isSubmitting = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            report.isSynced
                ? '✓ Roadblock published to live tactical map & audit trail!'
                : '✓ Encrypted to Local Offline Queue (Token: ${report.idempotencyKey.substring(0, 16)}...)',
          ),
          backgroundColor: report.isSynced ? const Color(0xFF10B981) : const Color(0xFF00B4D8),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0B132B),
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Color(0xFF00B4D8), size: 20),
            SizedBox(width: 8),
            Text(
              'Report Roadblock & Hazard',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1C2541),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Offline indicator banner if active
          if (auth.isOfflineMode)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.cloud_off, color: Color(0xFFEF4444), size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Offline Mode Active: Submissions will be assigned unique cryptographic tokens and queued locally.',
                      style: TextStyle(color: Color(0xFFEF4444), fontSize: 11.5, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),

          // Observation Type Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1C2541),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF2E3E64)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'OBSERVATION CLASSIFICATION:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1, color: Colors.white70),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _reportType,
                  isExpanded: true,
                  dropdownColor: const Color(0xFF1C2541),
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  ),
                  selectedItemBuilder: (context) {
                    return const [
                      Text('🌊 Waterlogging / Rising Flood', overflow: TextOverflow.ellipsis, maxLines: 1),
                      Text('🚧 Road Obstacle / Fallen Tree', overflow: TextOverflow.ellipsis, maxLines: 1),
                      Text('🏠 Shelter Structural Status', overflow: TextOverflow.ellipsis, maxLines: 1),
                      Text('👁 General Field Telemetry', overflow: TextOverflow.ellipsis, maxLines: 1),
                    ];
                  },
                  items: const [
                    DropdownMenuItem(
                      value: 'HAZARD_INUNDATION',
                      child: Text('🌊 Waterlogging / Rising Flood', overflow: TextOverflow.ellipsis),
                    ),
                    DropdownMenuItem(
                      value: 'OBSTACLE',
                      child: Text('🚧 Road Obstacle / Fallen Tree / Downed Wire', overflow: TextOverflow.ellipsis),
                    ),
                    DropdownMenuItem(
                      value: 'SHELTER_UPDATE',
                      child: Text('🏠 Shelter Structural Status', overflow: TextOverflow.ellipsis),
                    ),
                    DropdownMenuItem(
                      value: 'GENERAL_OBSERVATION',
                      child: Text('👁 General Field Telemetry', overflow: TextOverflow.ellipsis),
                    ),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _reportType = val);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Water Depth Slider if Inundation
          if (_reportType == 'HAZARD_INUNDATION') ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1C2541),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: _waterDepthCm >= 30
                      ? const Color(0xFFEF4444).withValues(alpha: 0.5)
                      : const Color(0xFF2E3E64),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Measured Water Depth:',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                      ),
                      Text(
                        '$_waterDepthCm cm',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          fontFamily: 'monospace',
                          color: _waterDepthCm >= 30 ? const Color(0xFFEF4444) : const Color(0xFF00B4D8),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _waterDepthCm >= 30
                        ? '⚠ CRITICAL BARRIER: Impassable for electric wheelchairs & low-clearance vehicles.'
                        : 'Caution: Shallow waterlogging; accessible transit requires specialized unit.',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: _waterDepthCm >= 30 ? const Color(0xFFEF4444) : const Color(0xFFF59E0B),
                    ),
                  ),
                  Slider(
                    value: _waterDepthCm.toDouble(),
                    min: 0,
                    max: 100,
                    divisions: 20,
                    activeColor: _waterDepthCm >= 30 ? const Color(0xFFEF4444) : const Color(0xFF00B4D8),
                    onChanged: (val) => setState(() => _waterDepthCm = val.round()),
                  ),
                  Wrap(
                    spacing: 8,
                    children: [10, 25, 35, 50].map((d) {
                      return ChoiceChip(
                        label: Text('$d cm'),
                        selected: _waterDepthCm == d,
                        selectedColor: const Color(0xFF00B4D8),
                        onSelected: (_) => setState(() => _waterDepthCm = d),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Coordinates & Preset Picker
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1C2541),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF2E3E64)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'FIELD GPS TELEMETRY (WGS84):',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1, color: Colors.white70),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Lat: ${_latitude.toStringAsFixed(4)} • Lon: ${_longitude.toStringAsFixed(4)}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF00B4D8), fontFamily: 'monospace'),
                      ),
                    ),
                    const Icon(Icons.my_location, color: Color(0xFF10B981), size: 18),
                  ],
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  children: [
                    ActionChip(
                      backgroundColor: const Color(0xFF0B132B),
                      label: const Text('Grand Road (19.8130, 85.8310)', style: TextStyle(fontSize: 10.5, color: Colors.white70)),
                      onPressed: () => setState(() {
                        _latitude = 19.8130;
                        _longitude = 85.8310;
                      }),
                    ),
                    ActionChip(
                      backgroundColor: const Color(0xFF0B132B),
                      label: const Text('Badasankha (19.8210, 85.8380)', style: TextStyle(fontSize: 10.5, color: Colors.white70)),
                      onPressed: () => setState(() {
                        _latitude = 19.8210;
                        _longitude = 85.8380;
                      }),
                    ),
                  ],
                )
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Title & Notes
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1C2541),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF2E3E64)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'REPORT HEADLINE:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1, color: Colors.white70),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _titleController,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Short descriptive title',
                    hintStyle: TextStyle(color: Colors.white38),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'DETAILED OBSTACLE SPECIFICATIONS:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1, color: Colors.white70),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _noteController,
                  maxLines: 3,
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Describe physical conditions, barrier height, width, detour recommendations...',
                    hintStyle: TextStyle(color: Colors.white38),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Submit Button
          SizedBox(
            height: 48,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00B4D8),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: const Icon(Icons.send, size: 16),
              label: _isSubmitting
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('TRANSMIT ROADBLOCK TELEMETRY', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, letterSpacing: 0.5)),
              onPressed: _isSubmitting ? null : _submitReport,
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

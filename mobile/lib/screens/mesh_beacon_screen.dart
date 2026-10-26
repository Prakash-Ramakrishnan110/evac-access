import 'package:flutter/material.dart';

class MeshBeaconScreen extends StatefulWidget {
  const MeshBeaconScreen({super.key});

  @override
  State<MeshBeaconScreen> createState() => _MeshBeaconScreenState();
}

class _MeshBeaconScreenState extends State<MeshBeaconScreen> with SingleTickerProviderStateMixin {
  late AnimationController _radarController;
  bool _isRelayActive = true;
  bool _isScanning = true;

  final List<Map<String, dynamic>> _detectedPackets = [
    {
      'id': 'EA-1001',
      'vulnerability': 'Electric Wheelchair',
      'urgency': 'CRITICAL',
      'rssi': -58,
      'distance': '45m',
      'battery': '34%',
      'timestamp': 'Just now',
      'hops': 1,
      'payload': 'SOS: MOBILITY_POWER_FAIL | Ward 5, Marine Drive',
      'isRelayed': true,
    },
    {
      'id': 'EA-1002',
      'vulnerability': 'Senior Citizen (Walker)',
      'urgency': 'HIGH',
      'rssi': -74,
      'distance': '120m',
      'battery': '68%',
      'timestamp': '2m ago',
      'hops': 2,
      'payload': 'SOS: TRAPPED_GROUND_FLOOR | Water 25cm',
      'isRelayed': true,
    },
    {
      'id': 'EA-1004',
      'vulnerability': 'Dialysis Scheduled',
      'urgency': 'CRITICAL',
      'rssi': -82,
      'distance': '210m',
      'battery': '19%',
      'timestamp': '4m ago',
      'hops': 3,
      'payload': 'SOS: MEDICAL_DEVICE_SHUTDOWN | Power Cut',
      'isRelayed': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    _radarController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();
  }

  @override
  void dispose() {
    _radarController.dispose();
    super.dispose();
  }

  void _manualBroadcastSOS() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Transmitting High-Priority NDRF Rescue Beacon over BLE & LoRa...'),
        backgroundColor: Color(0xFF10B981),
        duration: Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B132B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1C2541),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.radar, color: Color(0xFF00B4D8), size: 22),
            SizedBox(width: 8),
            Text(
              'BLE Mesh Beacon Radar',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ],
        ),
        actions: [
          Row(
            children: [
              const Text(
                'Relay Mode',
                style: TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.bold),
              ),
              Switch(
                value: _isRelayActive,
                activeColor: const Color(0xFF10B981),
                onChanged: (val) {
                  setState(() => _isRelayActive = val);
                },
              ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Tactical Radar Box
              Container(
                height: 220,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFF1C2541).withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF00B4D8).withValues(alpha: 0.3)),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Concentric Radar Rings
                    Container(
                      width: 190,
                      height: 190,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF00B4D8).withValues(alpha: 0.15), width: 1.5),
                      ),
                    ),
                    Container(
                      width: 130,
                      height: 130,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF00B4D8).withValues(alpha: 0.25), width: 1.5),
                      ),
                    ),
                    Container(
                      width: 70,
                      height: 70,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF00B4D8).withValues(alpha: 0.4), width: 1.5),
                      ),
                    ),

                    // Rotating Radar Sweep
                    RotationTransition(
                      turns: _radarController,
                      child: Container(
                        width: 190,
                        height: 190,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: SweepGradient(
                            center: Alignment.center,
                            colors: [
                              Colors.transparent,
                              const Color(0xFF00B4D8).withValues(alpha: 0.4),
                              Colors.transparent,
                            ],
                            stops: const [0.0, 0.25, 0.5],
                          ),
                        ),
                      ),
                    ),

                    // Center Responder Icon
                    Container(
                      width: 28,
                      height: 28,
                      decoration: const BoxDecoration(
                        color: Color(0xFF00B4D8),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: Color(0xFF00B4D8), blurRadius: 10, spreadRadius: 2),
                        ],
                      ),
                      child: const Icon(Icons.navigation, color: Colors.white, size: 16),
                    ),

                    // Detected Nodes Blips
                    Positioned(
                      top: 45,
                      left: 70,
                      child: _buildBlip('EA-1001', const Color(0xFFEF4444)),
                    ),
                    Positioned(
                      bottom: 50,
                      right: 65,
                      child: _buildBlip('EA-1002', const Color(0xFFF59E0B)),
                    ),
                    Positioned(
                      top: 60,
                      right: 80,
                      child: _buildBlip('EA-1004', const Color(0xFFEF4444)),
                    ),

                    // Top Left Status Badge
                    Positioned(
                      top: 10,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0B132B).withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF00B4D8).withValues(alpha: 0.4)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Color(0xFF10B981),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 5),
                            const Text(
                              'P2P MESH: 3 PEERS IN RANGE',
                              style: TextStyle(
                                fontSize: 9,
                                color: Color(0xFF00B4D8),
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Action Toolbar
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00B4D8),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: _manualBroadcastSOS,
                      icon: const Icon(Icons.cell_tower, size: 18),
                      label: const Text(
                        'PULSE MESH BEACON',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF1C2541),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: IconButton(
                      icon: Icon(
                        _isScanning ? Icons.pause_circle_outline : Icons.play_circle_outline,
                        color: Colors.white,
                      ),
                      onPressed: () {
                        setState(() {
                          _isScanning = !_isScanning;
                          if (_isScanning) {
                            _radarController.repeat();
                          } else {
                            _radarController.stop();
                          }
                        });
                      },
                      tooltip: 'Toggle Scan',
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Detected Offline SOS Distress Packets
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'SNIFFED DISTRESS PACKETS',
                    style: TextStyle(
                      color: Colors.white70,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      letterSpacing: 1,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'ECC VERIFIED',
                      style: TextStyle(
                        color: Color(0xFF10B981),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              // List of Packets
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _detectedPackets.length,
                itemBuilder: (context, index) {
                  final pkt = _detectedPackets[index];
                  final isCritical = pkt['urgency'] == 'CRITICAL';

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1C2541),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isCritical
                            ? const Color(0xFFEF4444).withValues(alpha: 0.4)
                            : const Color(0xFFF59E0B).withValues(alpha: 0.4),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Text(
                                  pkt['id'],
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isCritical
                                        ? const Color(0xFFEF4444).withValues(alpha: 0.2)
                                        : const Color(0xFFF59E0B).withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    pkt['urgency'],
                                    style: TextStyle(
                                      color: isCritical ? const Color(0xFFEF4444) : const Color(0xFFF59E0B),
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              '${pkt['rssi']} dBm • ${pkt['distance']}',
                              style: const TextStyle(
                                color: Color(0xFF00B4D8),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Vulnerability: ${pkt['vulnerability']}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          pkt['payload'],
                          style: const TextStyle(color: Colors.white60, fontSize: 11),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.battery_charging_full, size: 14, color: Colors.white54),
                                const SizedBox(width: 4),
                                Text(
                                  'Bat: ${pkt['battery']}',
                                  style: const TextStyle(color: Colors.white54, fontSize: 10),
                                ),
                                const SizedBox(width: 12),
                                const Icon(Icons.timeline, size: 14, color: Colors.white54),
                                const SizedBox(width: 4),
                                Text(
                                  '${pkt['hops']} Hop(s)',
                                  style: const TextStyle(color: Colors.white54, fontSize: 10),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: pkt['isRelayed']
                                    ? const Color(0xFF10B981).withValues(alpha: 0.2)
                                    : const Color(0xFFEF4444).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                pkt['isRelayed'] ? 'RELAYED TO SATELLITE' : 'LOCAL BUFFER',
                                style: TextStyle(
                                  color: pkt['isRelayed'] ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBlip(String label, Color color) {
    return Column(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(color: color, blurRadius: 6, spreadRadius: 2),
            ],
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 9,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }
}

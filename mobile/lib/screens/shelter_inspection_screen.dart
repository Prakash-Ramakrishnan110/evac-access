import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/shelter_provider.dart';
import '../models/shelter.dart';

class ShelterInspectionScreen extends StatefulWidget {
  const ShelterInspectionScreen({super.key});

  @override
  State<ShelterInspectionScreen> createState() => _ShelterInspectionScreenState();
}

class _ShelterInspectionScreenState extends State<ShelterInspectionScreen> {
  String? _selectedShelterId;
  final Map<String, String> _evaluations = {};
  final Map<String, TextEditingController> _notesControllers = {};
  final _generalNotesController = TextEditingController();
  int _capacityOccupied = 150;
  bool _isSubmitting = false;

  final List<Map<String, String>> _standardFeatures = [
    {
      'key': 'wheelchair_ramp',
      'label': 'Step-Free Wheelchair Ramp',
      'desc': 'Continuous non-slip ramp with 1:12 maximum slope and bilateral handrails.',
    },
    {
      'key': 'backup_generator_oxygen',
      'label': 'Continuous Generator (Oxygen Power)',
      'desc': 'Dedicated 24/7 diesel generator circuit for oxygen concentrators and ventilators.',
    },
    {
      'key': 'accessible_toilet',
      'label': 'Wheelchair Accessible Toilet',
      'desc': 'Roll-in stall (>1.5m turning radius), grab bars, and raised toilet seat.',
    },
    {
      'key': 'wide_doors',
      'label': 'Wide Corridors & Doors (>90cm)',
      'desc': 'Unobstructed clearance for bariatric wheelchairs, stretchers, and gurneys.',
    },
  ];

  @override
  void initState() {
    super.initState();
    for (var f in _standardFeatures) {
      _evaluations[f['key']!] = 'UNKNOWN';
      _notesControllers[f['key']!] = TextEditingController();
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final prov = Provider.of<ShelterProvider>(context, listen: false);
      prov.loadShelters().then((_) {
        if (prov.shelters.isNotEmpty && _selectedShelterId == null) {
          setState(() {
            _selectedShelterId = prov.shelters.first.id;
            _syncExistingFeatures(prov.shelters.first);
          });
        }
      });
    });
  }

  @override
  void dispose() {
    for (var c in _notesControllers.values) {
      c.dispose();
    }
    _generalNotesController.dispose();
    super.dispose();
  }

  void _syncExistingFeatures(ShelterModel s) {
    for (var feat in s.features) {
      if (_evaluations.containsKey(feat.featureKey)) {
        _evaluations[feat.featureKey] = feat.value;
        _notesControllers[feat.featureKey]?.text = feat.notes ?? '';
      }
    }
    setState(() {
      _capacityOccupied = s.capacityOccupied;
    });
  }

  void _submitInspection() async {
    if (_selectedShelterId == null) return;
    setState(() => _isSubmitting = true);

    final provider = Provider.of<ShelterProvider>(context, listen: false);
    final featuresList = _standardFeatures.map((f) {
      final key = f['key']!;
      return {
        'feature_key': key,
        'value': _evaluations[key] ?? 'UNKNOWN',
        'notes': _notesControllers[key]?.text.trim() ?? '',
      };
    }).toList();

    try {
      final ok = await provider.submitInspection(
        _selectedShelterId!,
        featuresList,
        _generalNotesController.text.trim(),
        _capacityOccupied,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(ok
                ? 'Shelter inspection recorded & queued for audit verification.'
                : 'Offline: Inspection saved locally to tamper-evident queue.'),
            backgroundColor: ok ? const Color(0xFF10B981) : const Color(0xFF00B4D8),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final shelterProv = Provider.of<ShelterProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0B132B),
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.domain_verification, color: Color(0xFF00B4D8), size: 20),
            SizedBox(width: 8),
            Text(
              'Shelter Feature Audit',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1C2541),
        elevation: 0,
      ),
      body: shelterProv.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00B4D8)))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Info Banner
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.verified_user_outlined, color: Color(0xFF10B981), size: 20),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Select YES only if directly observed on-site. If uninspected, select UNKNOWN to protect Divyangjan evacuees.',
                          style: TextStyle(color: Color(0xFF10B981), fontSize: 11.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Shelter Picker
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
                        'Select Relief Shelter to Audit:',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white70),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: _selectedShelterId,
                        isExpanded: true,
                        dropdownColor: const Color(0xFF1C2541),
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                        items: shelterProv.shelters.map((s) {
                          return DropdownMenuItem(
                            value: s.id,
                            child: Text(
                              '${s.code} • ${s.name}',
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13, color: Colors.white),
                            ),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setState(() {
                              _selectedShelterId = val;
                              final s = shelterProv.shelters.firstWhere((item) => item.id == val);
                              _syncExistingFeatures(s);
                            });
                          }
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Feature Evaluation Checklist
                const Text(
                  'ACCESSIBILITY VERIFICATION CHECKLIST',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    letterSpacing: 1,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 10),

                ..._standardFeatures.map((sf) {
                  final key = sf['key']!;
                  final currentVal = _evaluations[key] ?? 'UNKNOWN';

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1C2541),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF2E3E64)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          sf['label']!,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          sf['desc']!,
                          style: const TextStyle(fontSize: 11, color: Colors.white60),
                        ),
                        const SizedBox(height: 12),

                        // Tri-State Selector
                        Row(
                          children: [
                            // YES
                            Expanded(
                              child: InkWell(
                                onTap: () => setState(() => _evaluations[key] = 'YES'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 9),
                                  decoration: BoxDecoration(
                                    color: currentVal == 'YES'
                                        ? const Color(0xFF10B981)
                                        : const Color(0xFF0B132B),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: currentVal == 'YES'
                                          ? const Color(0xFF10B981)
                                          : Colors.white24,
                                    ),
                                  ),
                                  alignment: Alignment.center,
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.check_circle,
                                        size: 15,
                                        color: currentVal == 'YES' ? Colors.white : Colors.white54,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        'YES',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                          color: currentVal == 'YES' ? Colors.white : Colors.white70,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),

                            // NO
                            Expanded(
                              child: InkWell(
                                onTap: () => setState(() => _evaluations[key] = 'NO'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 9),
                                  decoration: BoxDecoration(
                                    color: currentVal == 'NO'
                                        ? const Color(0xFFEF4444)
                                        : const Color(0xFF0B132B),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: currentVal == 'NO'
                                          ? const Color(0xFFEF4444)
                                          : Colors.white24,
                                    ),
                                  ),
                                  alignment: Alignment.center,
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.cancel,
                                        size: 15,
                                        color: currentVal == 'NO' ? Colors.white : Colors.white54,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        'NO',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                          color: currentVal == 'NO' ? Colors.white : Colors.white70,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),

                            // UNKNOWN
                            Expanded(
                              child: InkWell(
                                onTap: () => setState(() => _evaluations[key] = 'UNKNOWN'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 9),
                                  decoration: BoxDecoration(
                                    color: currentVal == 'UNKNOWN'
                                        ? const Color(0xFFF59E0B)
                                        : const Color(0xFF0B132B),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: currentVal == 'UNKNOWN'
                                          ? const Color(0xFFF59E0B)
                                          : Colors.white24,
                                    ),
                                  ),
                                  alignment: Alignment.center,
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.help_outline,
                                        size: 15,
                                        color: currentVal == 'UNKNOWN' ? Colors.white : Colors.white54,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        'UNKNOWN',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 11,
                                          color: currentVal == 'UNKNOWN' ? Colors.white : Colors.white70,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        TextField(
                          controller: _notesControllers[key],
                          decoration: const InputDecoration(
                            hintText: 'Observation notes (e.g. ramp width 1.2m, bilateral rails)',
                            hintStyle: TextStyle(fontSize: 11, color: Colors.white38),
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          ),
                          style: const TextStyle(fontSize: 12, color: Colors.white),
                        ),
                      ],
                    ),
                  );
                }),

                // Occupancy and Remarks
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
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Current Occupancy Count:',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                          ),
                          Text(
                            '$_capacityOccupied People',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00B4D8), fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                      Slider(
                        value: _capacityOccupied.toDouble(),
                        min: 0,
                        max: 600,
                        divisions: 60,
                        activeColor: const Color(0xFF00B4D8),
                        onChanged: (val) => setState(() => _capacityOccupied = val.round()),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Overall Inspector Remarks:',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white70),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _generalNotesController,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          hintText: 'e.g., Generator fuel verified for 48 hours; medical triage tent established.',
                          hintStyle: TextStyle(fontSize: 11, color: Colors.white38),
                          border: OutlineInputBorder(),
                        ),
                        style: const TextStyle(fontSize: 12, color: Colors.white),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Submit Button
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00B4D8),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: _isSubmitting ? null : _submitInspection,
                    child: _isSubmitting
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'TRANSMIT AUDIT FINDINGS',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.5),
                          ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
    );
  }
}

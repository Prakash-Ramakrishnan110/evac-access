import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/tasks_provider.dart';
import '../models/assignment.dart';

class TasksListScreen extends StatefulWidget {
  const TasksListScreen({super.key});

  @override
  State<TasksListScreen> createState() => _TasksListScreenState();
}

class _TasksListScreenState extends State<TasksListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TasksProvider>(context, listen: false).loadAssignments();
    });
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING':
        return const Color(0xFFF59E0B);
      case 'ACKNOWLEDGED':
        return const Color(0xFF00B4D8);
      case 'EN_ROUTE':
        return const Color(0xFF8B5CF6);
      case 'ON_SCENE':
        return const Color(0xFF10B981);
      case 'COMPLETED':
        return const Color(0xFF059669);
      default:
        return const Color(0xFF64748B);
    }
  }

  String _getNextAction(String status) {
    switch (status) {
      case 'PENDING':
        return 'ACKNOWLEDGE';
      case 'ACKNOWLEDGED':
        return 'EN_ROUTE';
      case 'EN_ROUTE':
        return 'ON_SCENE';
      case 'ON_SCENE':
        return 'COMPLETED';
      default:
        return 'COMPLETED';
    }
  }

  void _advanceTask(AssignmentModel assignment) async {
    final nextStatus = _getNextAction(assignment.status);
    if (nextStatus == assignment.status) return;

    final provider = Provider.of<TasksProvider>(context, listen: false);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1C2541),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: Color(0xFF2E3E64)),
        ),
        title: Text(
          'Transition to $nextStatus?',
          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16),
        ),
        content: Text(
          'Confirm tactical status transition for mission ${assignment.requestRef} (${assignment.requesterName}). Command center will be updated via audit log.',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00B4D8),
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Confirm Transition', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await provider.updateStatus(assignment.id, nextStatus);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tasksProvider = Provider.of<TasksProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0B132B),
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.assignment, color: Color(0xFF00B4D8), size: 20),
            SizedBox(width: 8),
            Text(
              'Active Evacuation Missions',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1C2541),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF00B4D8)),
            onPressed: () => tasksProvider.loadAssignments(),
            tooltip: 'Refresh missions',
          ),
        ],
      ),
      body: tasksProvider.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00B4D8)))
          : RefreshIndicator(
              color: const Color(0xFF00B4D8),
              onRefresh: () => tasksProvider.loadAssignments(),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Mission Control Telemetry Card
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1C2541),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF2E3E64)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Tactical Field Queue',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${tasksProvider.assignments.length} Total Units • ${tasksProvider.pendingCount} Action Required',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF00B4D8), fontFamily: 'monospace'),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.check_circle, size: 12, color: Color(0xFF10B981)),
                              SizedBox(width: 4),
                              Text(
                                'RPwD AUDITED',
                                style: TextStyle(
                                  color: Color(0xFF10B981),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  if (tasksProvider.assignments.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(32),
                      alignment: Alignment.center,
                      child: const Column(
                        children: [
                          Icon(Icons.check_circle_outline, size: 48, color: Color(0xFF10B981)),
                          SizedBox(height: 12),
                          Text('No pending assignments', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                          SizedBox(height: 4),
                          Text('All field extractions completed or awaiting coordinator dispatch.', style: TextStyle(color: Colors.white60, fontSize: 12)),
                        ],
                      ),
                    ),

                  ...tasksProvider.assignments.map((assignment) {
                    final statusColor = _getStatusColor(assignment.status);
                    final nextStatus = _getNextAction(assignment.status);
                    final isCritical = assignment.urgency == 'CRITICAL';

                    return Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1C2541),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isCritical
                              ? const Color(0xFFEF4444).withValues(alpha: 0.4)
                              : const Color(0xFF2E3E64),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.2),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header: Ref & Status Chips
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0B132B),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: Colors.white12),
                                      ),
                                      child: Text(
                                        assignment.requestRef,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                          fontFamily: 'monospace',
                                          color: Color(0xFF00B4D8),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: statusColor.withValues(alpha: 0.2),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        assignment.status.replaceAll('_', ' '),
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 10,
                                          color: statusColor,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: isCritical
                                        ? const Color(0xFFEF4444).withValues(alpha: 0.2)
                                        : const Color(0xFFF59E0B).withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: isCritical
                                          ? const Color(0xFFEF4444).withValues(alpha: 0.4)
                                          : const Color(0xFFF59E0B).withValues(alpha: 0.4),
                                    ),
                                  ),
                                  child: Text(
                                    assignment.urgency,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 10,
                                      color: isCritical ? const Color(0xFFEF4444) : const Color(0xFFF59E0B),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // Citizen & Contact
                            Text(
                              assignment.requesterName,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.phone_outlined, size: 14, color: Color(0xFF00B4D8)),
                                const SizedBox(width: 4),
                                Text(
                                  assignment.contactPhone,
                                  style: const TextStyle(fontSize: 12, color: Colors.white70, fontFamily: 'monospace'),
                                ),
                                const SizedBox(width: 14),
                                const Icon(Icons.people_outline, size: 14, color: Colors.white54),
                                const SizedBox(width: 4),
                                Text(
                                  '${assignment.headCount} Evacuee(s)',
                                  style: const TextStyle(fontSize: 12, color: Colors.white70),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),

                            // Accessibility Requirements
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: assignment.requirements.map((req) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF00B4D8).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFF00B4D8).withValues(alpha: 0.3)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.accessible_forward, size: 13, color: Color(0xFF00B4D8)),
                                      const SizedBox(width: 4),
                                      Text(
                                        req.replaceAll('_', ' ').toUpperCase(),
                                        style: const TextStyle(
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF00B4D8),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 12),

                            // Target Shelter
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0B132B),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.white12),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.location_on, color: Color(0xFF10B981), size: 18),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'Verified Target Shelter:',
                                          style: TextStyle(fontSize: 10, color: Colors.white54),
                                        ),
                                        Text(
                                          assignment.destinationShelter ?? 'Designated Safe Zone',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),

                            // Stage Action Button
                            if (assignment.status != 'COMPLETED')
                              SizedBox(
                                width: double.infinity,
                                height: 42,
                                child: ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: statusColor,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  icon: const Icon(Icons.arrow_forward, size: 16),
                                  label: Text(
                                    'UPDATE STAGE: $nextStatus',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.5),
                                  ),
                                  onPressed: () => _advanceTask(assignment),
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }
}

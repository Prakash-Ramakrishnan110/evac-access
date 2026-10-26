import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/reports_provider.dart';

class OfflineQueueScreen extends StatelessWidget {
  const OfflineQueueScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final reportsProv = Provider.of<ReportsProvider>(context);
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm');

    return Scaffold(
      backgroundColor: const Color(0xFF0B132B),
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.cloud_sync, color: Color(0xFF00B4D8), size: 20),
            SizedBox(width: 8),
            Text(
              'Offline Idempotency Queue',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1C2541),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_sweep_outlined, color: Colors.white70),
            tooltip: 'Clear Synced Items',
            onPressed: () => reportsProv.clearSynced(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Queue Overview Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1C2541),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF2E3E64)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Local Cryptographic Storage',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${reportsProv.queuedReports.length} Total Records • ${reportsProv.pendingCount} Pending Sync',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF00B4D8), fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: reportsProv.pendingCount > 0
                            ? const Color(0xFFF59E0B).withValues(alpha: 0.2)
                            : const Color(0xFF10B981).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: reportsProv.pendingCount > 0
                              ? const Color(0xFFF59E0B).withValues(alpha: 0.4)
                              : const Color(0xFF10B981).withValues(alpha: 0.4),
                        ),
                      ),
                      child: Text(
                        reportsProv.pendingCount > 0 ? 'PENDING SYNC' : 'ALL SYNCED',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                          color: reportsProv.pendingCount > 0 ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'All items contain SHA-256 client-side idempotency keys. Network retransmissions will never duplicate disaster telemetry records.',
                  style: TextStyle(fontSize: 11.5, color: Colors.white60),
                ),
                const SizedBox(height: 14),

                if (reportsProv.syncStatusMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0B132B),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Text(
                      reportsProv.syncStatusMessage!,
                      style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF00B4D8)),
                    ),
                  ),
                  const SizedBox(height: 14),
                ],

                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00B4D8),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: reportsProv.isSyncing
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.sync, size: 18),
                    label: Text(
                      reportsProv.isSyncing ? 'SYNCHRONIZING WITH BACKEND...' : 'SYNCHRONIZE ALL PENDING REPORTS',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.5),
                    ),
                    onPressed: reportsProv.isSyncing ? null : () => reportsProv.syncAllPending(),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          const Text(
            'QUEUE AUDIT ENTRIES',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 11,
              letterSpacing: 1,
              color: Colors.white70,
            ),
          ),
          const SizedBox(height: 8),

          if (reportsProv.queuedReports.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              alignment: Alignment.center,
              child: const Column(
                children: [
                  Icon(Icons.inbox_outlined, size: 44, color: Colors.white38),
                  SizedBox(height: 10),
                  Text('Local queue is clean', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white)),
                  SizedBox(height: 4),
                  Text('New roadblock and shelter inspection reports will be cached here.', style: TextStyle(fontSize: 12, color: Colors.white54)),
                ],
              ),
            ),

          ...reportsProv.queuedReports.map((report) {
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1C2541),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: report.isSynced ? const Color(0xFF2E3E64) : const Color(0xFFF59E0B).withValues(alpha: 0.4),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: report.isSynced
                              ? const Color(0xFF10B981).withValues(alpha: 0.2)
                              : const Color(0xFFF59E0B).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              report.isSynced ? Icons.cloud_done : Icons.cloud_upload_outlined,
                              size: 13,
                              color: report.isSynced ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              report.isSynced ? 'SYNCED TO COMMAND' : 'STORED LOCALLY',
                              style: TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                                color: report.isSynced ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        dateFormat.format(report.createdAt),
                        style: const TextStyle(fontSize: 10.5, color: Colors.white54, fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  Text(
                    report.title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    report.note,
                    style: const TextStyle(fontSize: 12, color: Colors.white70),
                  ),
                  const SizedBox(height: 10),

                  // Metadata row
                  Container(
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
                          'Idempotency Key: ${report.idempotencyKey}',
                          style: const TextStyle(fontFamily: 'monospace', fontSize: 9.5, color: Color(0xFF00B4D8)),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Coordinates: ${report.latitude.toStringAsFixed(4)}, ${report.longitude.toStringAsFixed(4)} • Type: ${report.reportType}',
                          style: const TextStyle(fontSize: 10.5, color: Colors.white60),
                        ),
                        if (report.syncError != null)
                          Text(
                            'Sync Error: ${report.syncError}',
                            style: const TextStyle(fontSize: 10.5, color: Color(0xFFEF4444), fontWeight: FontWeight.bold),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:evacaccess_mobile/main.dart';

void main() {
  testWidgets('EvacAccess Mobile App initial render test', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 1920);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(const EvacAccessMobileApp());
    await tester.pumpAndSettle();

    // Verify title and emergency banner
    expect(find.text('EvacAccess India'), findsOneWidget);
    expect(find.text('FIELD RESPONDER UTILITY • ODISHA COASTAL FLOOD'), findsOneWidget);
    expect(find.text('Responder Sign-In'), findsOneWidget);
    expect(find.text('Access Dispatch Board'), findsOneWidget);
    expect(find.text('Responder 1'), findsOneWidget);
    expect(find.text('Coordinator'), findsOneWidget);
  });

  testWidgets('Quick test credentials autofill test', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 1920);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(const EvacAccessMobileApp());
    await tester.pumpAndSettle();

    final coordinatorBtn = find.text('Coordinator');
    await tester.ensureVisible(coordinatorBtn);
    await tester.tap(coordinatorBtn);
    await tester.pumpAndSettle();

    // Verify username text field has 'coordinator'
    final textField = tester.widget<TextField>(find.byType(TextField).first);
    expect(textField.controller?.text, equals('coordinator'));
  });
}

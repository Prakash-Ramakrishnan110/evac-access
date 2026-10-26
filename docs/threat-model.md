# EvacAccess India — Threat Model & Security Controls

## 1. Sensitive Assets
- Location coordinates of vulnerable citizens requesting evacuation.
- Medical dependency annotations (e.g., oxygen concentration, dialysis requirement).
- Operational deployment paths and responder team assignments.
- Integrity of shelter accessibility records (preventing false "safe" markings).

## 2. Threat Scenarios & Mitigations

### T1: Client-Side Role Escalation
- **Threat**: An attacker modifies client state to bypass role restrictions and verify uninspected shelters.
- **Mitigation**: All permissions strictly checked server-side using Django REST Framework permission classes. Frontend role indicators are purely decorative.

### T2: Stale Hazard Leading to Harm
- **Threat**: Coordinator relies on an outdated flood polygon to route a wheelchair user through an active flash flood.
- **Mitigation**: Evaluator enforces `HAZARD_FRESHNESS_THRESHOLD_MINUTES=60`. Any route with observation timestamps older than 60 minutes is automatically marked `UNVERIFIED` and requires field confirmation.

### T3: PII Leakage in Crisis Operations
- **Threat**: Public lists or logs display full names, phone numbers, or residential addresses of evacuated individuals.
- **Mitigation**: Anonymized public reference IDs (`EA-1001`) are used across lists, maps, and audit logs. Contact numbers are restricted to assigned responders under strict object-level permissions.

### T4: Audit Log Tampering
- **Threat**: Rogue actor clears audit trail after an unauthorized dispatch.
- **Mitigation**: `AuditEvent` model has no `update` or `delete` views. Application-level immutability enforced.

### T5: Offline Report Replay / Overwrite Attacks
- **Threat**: Delayed offline mobile sync overwrites recently verified shelter records with stale field data.
- **Mitigation**: Field reports enter a `PENDING_REVIEW` queue rather than auto-mutating verified features. Submissions require idempotency keys to prevent duplicate creation.

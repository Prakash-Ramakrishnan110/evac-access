# EvacAccess India — API Contracts (v1)

## Base URL
`/api/v1`

## Standard Error Format
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Specific explanation of the error",
  "field_errors": {
    "field_name": ["Detail message"]
  }
}
```

## Endpoints

### 1. Authentication
- `POST /auth/login/`
  - Request: `{"username": "coordinator@odisha.gov.in", "password": "..."}`
  - Response: `{"access": "token", "refresh": "token", "user": {"id": "...", "username": "...", "role": "COORDINATOR", "organization": "ODRF"}}`
- `GET /auth/me/`
  - Response: Current user profile with role permissions.

### 2. Incidents
- `GET /incidents/`
  - Returns list of incidents scoped to user's permissions.
- `GET /incidents/{id}/`
  - Returns incident details with boundary polygon and hazard freshness.
- `GET /incidents/{id}/map/`
  - Returns combined GeoJSON feature collections: shelters, active requests, hazard zones, obstacles.

### 3. Shelters & Inspections
- `GET /shelters/?incident_id={id}&accessibility={step_free_access}`
  - Returns shelter list with capacity and feature status.
- `GET /shelters/{id}/`
  - Returns comprehensive feature checklist with verification timestamps and evidence references.
- `POST /shelters/{id}/inspections/`
  - Submits field inspection findings.
  - Body:
    ```json
    {
      "features": [
        {"feature_key": "step_free_access", "value": "YES", "evidence_note": "Ramp installed at main entrance"},
        {"feature_key": "accessible_restroom", "value": "NO", "evidence_note": "Stairs leading to bathroom"}
      ],
      "capacity_occupied": 120,
      "notes": "Generator operational"
    }
    ```

### 4. Assistance Requests
- `GET /assistance-requests/?incident_id={id}&status={NEW}`
  - Returns triageable requests with requirement summaries.
- `POST /assistance-requests/`
  - Submits new assistance request with consent logging.

### 5. Route Feasibility Evaluator
- `POST /routes/evaluate/`
  - Evaluates candidate routes for a given assistance request.
  - Request: `{"request_id": "UUID", "route_id": "UUID"}`
  - Response:
    ```json
    {
      "route_id": "ROUTE-DEMO-02",
      "status": "UNSUITABLE",
      "checks": [
        {"requirement": "step_free_access", "result": "PASS", "source": "inspection-101"},
        {"requirement": "segment_2_flood_status", "result": "FAIL", "source": "field-report-44"}
      ],
      "reasons": ["Candidate route contains flooded segment incompatible with wheelchair transit."],
      "rule_version": "mvp-1.0",
      "human_review_required": true
    }
    ```

### 6. Assignments & Dispatch
- `POST /assignments/`
  - Assigns responder team to an assistance request.
- `PATCH /assignments/{id}/status/`
  - Validates and performs state transition (`ASSIGNED` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `EN_ROUTE` $\rightarrow$ `COMPLETED`).

### 7. Alerts & Field Reports
- `POST /alerts/preview/`
  - Generates preview of multilingual accessible alert (large text, audio format).
- `POST /field-reports/`
  - Field observations ingest with idempotency key for offline sync.

### 8. Audit Trail
- `GET /audit-events/?incident_id={id}`
  - Paginated append-only audit trail for supervisors.

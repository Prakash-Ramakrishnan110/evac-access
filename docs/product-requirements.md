# EvacAccess India — Product Requirements Document (PRD)

## 1. System Overview
EvacAccess India is a decision-support system for emergency responders and disaster coordinators that evaluates shelter accessibility, candidate evacuation routes, and assistance requirements during natural disasters (floods, cyclones) in India.

## 2. Core Operational Principles
- **No Blanket "Safe" Labels**: The system never declares a route or shelter unconditionally "safe". It returns:
  - `FEASIBLE_WITH_AVAILABLE_DATA`: Verified against known requirements without detected barriers.
  - `UNSUITABLE`: Contains a known hard barrier (flooding, steps for wheelchair users, missing oxygen power).
  - `UNVERIFIED`: Essential data is unknown, contradictory, or stale (> 60 minutes).
- **Human-in-the-Loop Decision Support**: All system outputs serve as evidence-backed recommendations requiring human reviewer sign-off.
- **Privacy by Design**: Data minimization for personal contact details; anonymous request references (`EA-1001`) used in general views.
- **Auditable & Tamper-Evident**: All state transitions and verification actions are logged to an append-only audit log.

## 3. Product Roles & RBAC Matrix
| Role | Capabilities | Prohibitions |
| :--- | :--- | :--- |
| **Administrator** | Manage accounts, configuration, demo scenarios, system audit | Cannot alter audit history |
| **Incident Coordinator** | Triage requests, assign responders, evaluate routes, trigger alerts | Cannot modify core system roles |
| **Reviewer / Supervisor** | Review disputed data, verify shelter features, sign off route approvals | Cannot bypass hard-barrier rules |
| **Field Responder** | View assigned tasks, submit shelter inspections and obstacle reports | Cannot approve own critical findings |
| **Demo Viewer** | Read-only access to sanitized simulation data | Cannot create or alter operational records |

## 4. MVP Functional Scope
- **W01 Login**: Role-based authentication with demo credentials pre-fill.
- **W02 Command Center**: Crisis situational overview, data freshness indicator, urgent requests.
- **W03 Incidents**: Multi-incident selection, affected boundary geometry, freshness status.
- **W04 GIS Tactical Map**: Shelters, assistance requests, hazard polygons, route segments.
- **W05/W06 Shelter Directory & Inspections**: Feature-level accessibility checklist (`YES`, `NO`, `UNKNOWN`), verification history.
- **W07 Assistance Requests**: Request intake, accessibility requirements matrix, coordinator triage.
- **W08 Route Feasibility Review**: Granular check evaluation with explicit failure reasons.
- **W09 Assignments**: Dispatch tracking, SLA countdown, status transitions (`ASSIGNED` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `EN_ROUTE` $\rightarrow$ `COMPLETED`).
- **W10 Accessible Alert Preview**: Bilingual (English, Hindi) alerts with large-text display and speech preview.
- **W11 Field Reports Queue**: Obstacle and hazard reports with verification status.
- **W12 Audit History**: Immutable chronological event log.

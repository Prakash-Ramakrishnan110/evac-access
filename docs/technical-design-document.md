# EvacAccess India — Technical Design Document (TDD)

## 1. System Architecture Overview

EvacAccess India is an emergency decision-support and tactical GIS orchestration system built for mass gatherings such as the Kumbh Mela. It consists of three primary tiers:

```mermaid
graph TD
    subgraph Clients ["Client Layer"]
        W[Web Command Center<br/>React 18 + Vite + Leaflet GIS]
        M[Mobile Responder Pro<br/>Flutter 3.x + SQLite Cache]
    end

    subgraph Gateway ["Application Gateway & API"]
        GW[Django REST Framework<br/>Token / JWT RBAC Auth]
        AuditEngine[Tamper-Evident Audit Ledger<br/>SHA-256 Event Chain]
    end

    subgraph Services ["Core Engines"]
        SpatialEngine[Spatial GIS Routing Engine<br/>PostGIS ST_DWithin / ST_Intersects]
        TriageEngine[Rapid Health Screening & Triage<br/>START / ESI Algorithmic Priority]
        AlertStudio[Accessible Alert Studio<br/>Bilingual Audio-Visual Generator]
    end

    subgraph DataStore ["Data & Cache Layer"]
        PG[(PostgreSQL 16 + PostGIS 3.4<br/>Spatial Geometries & Relational Data)]
        RD[(Redis 7 Cache<br/>Real-Time Fleet & Telemetry)]
    end

    W -->|REST / HTTPS| GW
    M -->|REST / Offline Queue Sync| GW
    GW --> AuditEngine
    GW --> SpatialEngine
    GW --> TriageEngine
    GW --> AlertStudio
    SpatialEngine --> PG
    TriageEngine --> PG
    AuditEngine --> PG
    GW --> RD
```

---

## 2. Core Functional Components

### 2.1 3-State Truth Deterministic Routing Engine
Unlike conventional navigation systems that assign blanket "safe" ratings to unmonitored roads, EvacAccess enforces an evidence-backed 3-State classification:
- **`FEASIBLE_WITH_AVAILABLE_DATA`**: Traversed polygon/segment has been inspected within the freshness window and verified clear of physical bottlenecks or high crowd density.
- **`UNSUITABLE`**: Segment intersects verified hazards (stampede choke points, submerged pontoon bridges, steep staircases impassable by stretchers/wheelchairs).
- **`UNVERIFIED`**: Stale data (> 60 minutes) or uninspected corridors. Requires field reconnaissance before mass dispatch.

### 2.2 Offline-First Edge Synchronization (Mobile Responder Pro)
During mass gatherings, cellular connectivity degrades drastically. The mobile application operates with an SQLite persistence buffer:
```mermaid
sequenceDiagram
    participant R as Field Responder
    participant App as Mobile Pro (Flutter)
    participant DB as Local SQLite
    participant API as Backend (PostGIS)

    R->>App: Log Hazard / Health Triage
    App->>DB: Write Record with UUID & Timestamp
    alt Network Available
        App->>API: POST /api/v1/field-reports/
        API-->>App: 201 Created (Server Acknowledged)
        App->>DB: Mark Synced
    else Network Blackout
        App-->>R: Instant UI confirmation (Offline Stored)
        Note over App,DB: Background Sync Worker retries with exponential backoff
    end
```

### 2.3 Health Screening & Syndromic Surveillance
- **Triage Matrix**: Color-coded categorization (`RED: Immediate`, `YELLOW: Urgent`, `GREEN: Minimal`, `BLACK: Expectant`).
- **Syndromic Outbreak Cluster Detection**: Flags sudden surges in Acute Gastroenteritis (AGE) or Acute Respiratory Infection (ARI) across Mela sectors to alert the Chief Medical Officer.

---

## 3. Data Flow Diagram

```mermaid
flowchart LR
    A[Field Triage & Drone/CCTV Inputs] --> B[Incident Coordinator Triage]
    B --> C{Spatial Barrier Analysis}
    C -->|Clear & Accessible| D[Feasible Route Computed]
    C -->|Barrier Detected| E[Alternate Bypass Corridor]
    D --> F[Field Ambulance Dispatch]
    E --> F
    F --> G[Bilingual Public Alerts Broadcast]
```

---

## 4. Security, Privacy & Audit Trail
- **Role-Based Access Control (RBAC)**: Enforced across 5 roles: `Administrator`, `Incident Coordinator`, `Supervisor`, `Field Responder`, and `Demo Viewer`.
- **Anonymized Patient References**: Triage entries use generated tokens (e.g., `EA-KM-1042`) without exposing personal Aadhaar/phone records on open map layers.
- **Cryptographic Audit Ledger**: Every assignment, shelter status change, and hazard override is written to an append-only audit table with actor ID, timestamp, and SHA-256 payload digest.

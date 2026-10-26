# EvacAccess India 🇮🇳

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-brightgreen.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0+-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B.svg)](https://flutter.dev/)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.4-336791.svg)](https://postgis.net/)

> **Disaster Mitigation, Kumbh Mela & Health Service Delivery**  
> An open-source, GIS-based tactical decision-support and emergency medical orchestration platform designed for hyper-dense mass gatherings (Kumbh Mela). EvacAccess integrates real-time hazard mapping, rapid health screening & triage, accessible evacuation routing for Divyangjan/elderly, and resilient offline-first field dispatch.

---

## 📑 Submission Checklist & Verification

- [x] **README with setup steps & environment variables** *(See below)*
- [x] **Technical Design Document & Architecture Diagrams** *(See [docs/technical-design-document.md](./docs/technical-design-document.md))*
- [x] **Sample Data & Automated Test Cases** *(See [Testing & Sample Data](#-sample-data--test-cases))*
- [x] **Open-Source License File** *(See [LICENSE](./LICENSE))*

---

## 🏛️ System Architecture

```
                                  ┌────────────────────────────────────────┐
                                  │   Tactical GIS Command Center (Web)    │
                                  │       React 18 • Leaflet • Tailwind    │
                                  └──────────────────┬─────────────────────┘
                                                     │ HTTPS / REST
                                                     ▼
┌─────────────────────────────────┐       ┌────────────────────────────────┐
│  Mobile Responder Pro (Flutter) │◄─────►│    Core Backend API (Django)   │
│  Offline SQLite • Sync Queue    │       │   PostGIS Spatial Rule Engine  │
└─────────────────────────────────┘       └──────────┬─────────────────────┘
                                                     │
                                                     ▼
                                          ┌────────────────────────────────┐
                                          │ PostgreSQL 16 + PostGIS 3.4    │
                                          │ Redis 7 • Cryptographic Audit  │
                                          └────────────────────────────────┘
```
For detailed architecture, data flows, and state machines, read the [Technical Design Document](./docs/technical-design-document.md).

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SECRET_KEY` | `django-insecure-evacaccess-...` | Django cryptographic signing secret |
| `DEBUG` | `True` | Debug flag (`False` in production) |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,0.0.0.0` | Permitted server hostnames |
| `DB_ENGINE` | `django.db.backends.postgresql` | Database driver |
| `DB_NAME` | `evacaccess_india` | Database name |
| `DB_USER` | `evacadmin` | Database username |
| `DB_PASSWORD` | `evacsecurepassword123` | Database password |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5432` | Database port |
| `CORS_ALLOWED_ORIGINS`| `http://localhost:3000,http://localhost:8080` | Allowed origins for React web app |
| `OPERATION_MODE` | `SIMULATED_DEMO` | Operational flag |
| `HAZARD_FRESHNESS_THRESHOLD_MINUTES` | `60` | Auto-downgrades stale route data to `UNVERIFIED` |

---

## 🚀 Quickstart & Setup Guide

### Option 1: Docker (Recommended)
Start the PostGIS database and Redis cache:
```bash
docker-compose up -d
```

### Option 2: Backend Setup (Django + PostGIS)
```bash
# 1. Activate virtual environment
cd backend
python -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply database migrations
python manage.py migrate

# 4. Load Kumbh Mela sample dataset
python manage.py seed_demo_data

# 5. Run backend development server
python manage.py runserver 0.0.0.0:8000
```
Backend API will be live at `http://localhost:8000/api/v1/`.

### Option 3: Web Dashboard Setup (React + Vite)
```bash
cd web
npm install
npm run dev
```
Tactical Command Center will be accessible at `http://localhost:3000/`.

### Option 4: Mobile Responder Pro (Flutter)
```bash
cd mobile
flutter pub get
flutter run
```
*(Pre-compiled Android APK ready in root: `EvacAccess_Responder_Pro_Latest.apk`)*

---

## 🧪 Sample Data & Test Cases

### 1. Loading Sample Data
The project includes a comprehensive sample dataset simulating the **Prayagraj Kumbh Mela** (Sangam sectors, pontoon bridge checkpoints, temporary medical centers, crowd hazards, and Divyangjan assistance requests):
```bash
python backend/manage.py seed_demo_data
```

### 2. Running Automated Tests

#### Backend Test Suite (Pytest)
Executes route feasibility calculations, RBAC security assertions, and spatial geometry checks:
```bash
cd backend
pytest -v
```

#### Mobile Provider Test Suite
Validates offline caching, triage payload creation, and token persistence:
```bash
cd mobile
flutter test
```

---

## 👥 Pre-Configured Demo Accounts

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `Admin@Evac2026` | Full administrative control & audit logs |
| **Incident Coordinator** | `coordinator` | `Coord@Evac2026` | Real-time triage, barrier review, alert broadcast |
| **Field Responder** | `responder1` | `Resp@Evac2026` | Field triage input, obstacle logging |
| **Supervisor** | `supervisor` | `Super@Evac2026` | Route approvals & verified shelter audits |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab, ROLE_DEFAULT_TAB } from './components/Sidebar';
import { Header } from './components/Header';
import { DemoLoginPage, type PersonaProfile } from './components/DemoLoginPage';
import { CommandCenter } from './components/CommandCenter';
import { TacticalMap } from './components/TacticalMap';
import { AssistanceTriage } from './components/AssistanceTriage';
import { RouteEvaluatorModal } from './components/RouteEvaluatorModal';
import { ShelterDirectory } from './components/ShelterDirectory';
import { DispatchBoard } from './components/DispatchBoard';
import { AlertPreviewer } from './components/AlertPreviewer';
import { AuditLogViewer } from './components/AuditLogViewer';
import { EvacAICoPilot } from './components/EvacAICoPilot';
import { PredictiveInundation } from './components/PredictiveInundation';
import { MeshRelaySimulator } from './components/MeshRelaySimulator';
import { CitizenSOSPortal } from './components/CitizenSOSPortal';
import { SocialImpactScorecard } from './components/SocialImpactScorecard';

import {
  Incident, Shelter, AssistanceRequest, RouteCandidate,
  Assignment, Alert, AuditEvent, UserRole, RequestStatus
} from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('command');
  const [currentRole, setCurrentRole] = useState<UserRole>('COORDINATOR');
  const [isLoading, setIsLoading] = useState(false);

  // Core Data States
  const [incident, setIncident] = useState<Incident | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [routes, setRoutes] = useState<RouteCandidate[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  // Modal & Toast States
  const [evaluatorModalRequest, setEvaluatorModalRequest] = useState<AssistanceRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const incList = await api.getIncidents();
      const currentInc = incList[0] || null;
      if (currentInc) {
        setIncident(currentInc);
        const mapData = await api.getIncidentMap(currentInc.id);
        setShelters(mapData.shelters || []);
        setRequests(mapData.assistance_requests || []);
        setRoutes(mapData.route_candidates || []);
      }

      const [assignList, alertList, auditList] = await Promise.all([
        api.getAssignments().catch(() => []),
        api.getAlerts().catch(() => []),
        api.getAuditEvents().catch(() => [])
      ]);

      setAssignments(assignList);
      setAlerts(alertList);
      setAuditEvents(auditList);
    } catch (err) {
      console.warn("Could not connect to live Django API, initializing simulation dataset:", err);
      initializeFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeFallbackData = () => {
    setShelters([
      {
        id: 'sh-1',
        code: 'SH-PURI-01',
        name: 'Puri High School Cyclone Center',
        address: 'Station Road, Ward 5, Puri',
        latitude: 19.8180,
        longitude: 85.8320,
        capacity_total: 300,
        capacity_occupied: 140,
        available_capacity: 160,
        is_full: false,
        operating_status: 'OPEN',
        review_status: 'VERIFIED',
        features: [
          { id: 'f1', feature_key: 'step_free_access', value: 'NO', evidence_note: '14 stairs at main entrance, no ramp' },
          { id: 'f2', feature_key: 'wheelchair_ramp', value: 'NO', evidence_note: 'No ramp installed' },
          { id: 'f3', feature_key: 'accessible_restroom', value: 'NO', evidence_note: 'Bathroom door 60cm wide' },
          { id: 'f4', feature_key: 'backup_power_for_oxygen', value: 'YES', evidence_note: 'Generator operational' }
        ]
      },
      {
        id: 'sh-2',
        code: 'SH-PURI-02',
        name: 'Community Hall Sector 4',
        address: 'Marine Drive Approach, Puri',
        latitude: 19.8010,
        longitude: 85.8190,
        capacity_total: 180,
        capacity_occupied: 45,
        available_capacity: 135,
        is_full: false,
        operating_status: 'OPEN',
        review_status: 'VERIFIED',
        features: [
          { id: 'f5', feature_key: 'step_free_access', value: 'YES', evidence_note: 'Grade 1:12 ramp with handrails' },
          { id: 'f6', feature_key: 'wheelchair_ramp', value: 'YES', evidence_note: 'Ramp present' },
          { id: 'f7', feature_key: 'accessible_restroom', value: 'YES', evidence_note: 'Grab bars and wide door' },
          { id: 'f8', feature_key: 'backup_power_for_oxygen', value: 'YES', evidence_note: 'Generator present' }
        ]
      },
      {
        id: 'sh-3',
        code: 'SH-PURI-03',
        name: 'Jagannath Multipurpose Cyclone Shelter',
        address: 'Grand Road Elevated Sector, Puri',
        latitude: 19.8140,
        longitude: 85.8240,
        capacity_total: 500,
        capacity_occupied: 210,
        available_capacity: 290,
        is_full: false,
        operating_status: 'OPEN',
        review_status: 'VERIFIED',
        features: [
          { id: 'f9', feature_key: 'step_free_access', value: 'YES', evidence_note: 'Step-free ground floor entrance' },
          { id: 'f10', feature_key: 'wheelchair_ramp', value: 'YES', evidence_note: 'Certified accessible ramp' },
          { id: 'f11', feature_key: 'accessible_restroom', value: 'YES', evidence_note: 'Fully accessible disabled toilets' },
          { id: 'f12', feature_key: 'backup_power_for_oxygen', value: 'YES', evidence_note: '24/7 dedicated generator' },
          { id: 'f13', feature_key: 'tactile_paving', value: 'YES', evidence_note: 'Tactile paving from gate to hall' }
        ]
      }
    ]);

    setRequests([
      {
        id: 'req-1',
        public_ref: 'EA-1001',
        urgency: 'HIGH',
        status: 'NEW',
        requirements: ['wheelchair', 'step_free_access', 'oxygen_electricity'],
        number_of_people: 2,
        approximate_address: 'Baliapanda Ward 12, Near Sea Beach Post',
        latitude: 19.7995,
        longitude: 85.8145,
        contact_phone_masked: 'XXXXXX-4521',
        operational_notes: 'Elderly citizen using electric wheelchair; requires oxygen concentrator electricity.',
        created_at: new Date().toISOString()
      },
      {
        id: 'req-2',
        public_ref: 'EA-1002',
        urgency: 'CRITICAL',
        status: 'NEW',
        requirements: ['stretcher', 'oxygen_electricity'],
        number_of_people: 1,
        approximate_address: 'Swargadwar Road, Ward 8',
        latitude: 19.8040,
        longitude: 85.8200,
        contact_phone_masked: 'XXXXXX-8910',
        operational_notes: 'Bedridden stroke recovery patient; requires medical stretcher transport.',
        created_at: new Date().toISOString()
      },
      {
        id: 'req-3',
        public_ref: 'EA-1003',
        urgency: 'STANDARD',
        status: 'NEW',
        requirements: ['visual_assistance'],
        number_of_people: 3,
        approximate_address: 'Chakratirtha Road, Ward 3',
        latitude: 19.8100,
        longitude: 85.8350,
        contact_phone_masked: 'XXXXXX-3141',
        operational_notes: 'Visually impaired family head with two dependents.',
        created_at: new Date().toISOString()
      }
    ]);

    setRoutes([
      {
        id: 'rt-1',
        candidate_code: 'ROUTE-DEMO-01',
        title: 'Station Link via Hospital Road',
        origin_name: 'Baliapanda Ward 12',
        origin_latitude: 19.7995,
        origin_longitude: 85.8145,
        destination_shelter: 'sh-1',
        destination_shelter_detail: {
          id: 'sh-1',
          code: 'SH-PURI-01',
          name: 'Puri High School Cyclone Center',
          address: 'Station Road, Ward 5, Puri',
          latitude: 19.8180,
          longitude: 85.8320,
          capacity_total: 300,
          capacity_occupied: 140,
          available_capacity: 160,
          is_full: false,
          operating_status: 'OPEN',
          review_status: 'VERIFIED',
          features: []
        },
        distance_km: 3.2,
        estimated_time_minutes: 18,
        geometry_geojson: {
          type: 'LineString',
          coordinates: [[85.8145, 19.7995], [85.8220, 19.8080], [85.8320, 19.8180]]
        },
        source: 'ODRF Rapid Navigation GIS',
        observed_at: new Date().toISOString(),
        is_stale: false,
        segments: []
      },
      {
        id: 'rt-2',
        candidate_code: 'ROUTE-DEMO-02',
        title: 'Coastal Route via Marine Drive',
        origin_name: 'Baliapanda Ward 12',
        origin_latitude: 19.7995,
        origin_longitude: 85.8145,
        destination_shelter: 'sh-2',
        destination_shelter_detail: {
          id: 'sh-2',
          code: 'SH-PURI-02',
          name: 'Community Hall Sector 4',
          address: 'Marine Drive Approach, Puri',
          latitude: 19.8010,
          longitude: 85.8190,
          capacity_total: 180,
          capacity_occupied: 45,
          available_capacity: 135,
          is_full: false,
          operating_status: 'OPEN',
          review_status: 'VERIFIED',
          features: []
        },
        distance_km: 1.4,
        estimated_time_minutes: 8,
        geometry_geojson: {
          type: 'LineString',
          coordinates: [[85.8145, 19.7995], [85.8160, 19.8000], [85.8190, 19.8010]]
        },
        source: 'ODRF Rapid Navigation GIS',
        observed_at: new Date().toISOString(),
        is_stale: false,
        segments: []
      },
      {
        id: 'rt-3',
        candidate_code: 'ROUTE-DEMO-03',
        title: 'Grand Road Elevated Emergency Corridor',
        origin_name: 'Baliapanda Ward 12',
        origin_latitude: 19.7995,
        origin_longitude: 85.8145,
        destination_shelter: 'sh-3',
        destination_shelter_detail: {
          id: 'sh-3',
          code: 'SH-PURI-03',
          name: 'Jagannath Multipurpose Cyclone Shelter',
          address: 'Grand Road Elevated Sector, Puri',
          latitude: 19.8140,
          longitude: 85.8240,
          capacity_total: 500,
          capacity_occupied: 210,
          available_capacity: 290,
          is_full: false,
          operating_status: 'OPEN',
          review_status: 'VERIFIED',
          features: []
        },
        distance_km: 2.1,
        estimated_time_minutes: 12,
        geometry_geojson: {
          type: 'LineString',
          coordinates: [[85.8145, 19.7995], [85.8180, 19.8050], [85.8240, 19.8140]]
        },
        source: 'ODRF Rapid Navigation GIS',
        observed_at: new Date().toISOString(),
        is_stale: false,
        segments: []
      }
    ]);

    setAuditEvents([
      {
        id: 'aud-1',
        actor_name: 'priya_coordinator',
        action: 'INITIALIZE_SIMULATION_SCENARIO',
        entity_type: 'Incident',
        entity_id: 'ODISHA-PURI-FLOOD-2026',
        reason: 'Scenario EA-1001 coastal flood simulation loaded into emergency decision matrix.',
        change_summary: {},
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'aud-2',
        actor_name: 'sunita_reviewer',
        action: 'VERIFY_SHELTER',
        entity_type: 'Shelter',
        entity_id: 'SH-PURI-03',
        reason: 'On-site engineering inspection confirmed step-free ramp and generator backup.',
        change_summary: {},
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ]);
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const handleDispatchSuccess = (teamName: string) => {
    showToast(`✓ Mission Dispatched: ${teamName} assigned to ${evaluatorModalRequest?.public_ref}`);
    loadData();
  };

  const handleUpdateStatus = (reqId: string, status: RequestStatus) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
    showToast(`Case status updated to ${status}`);
  };

  const handleApproveAlert = (alertId: string) => {
    showToast("✓ Alert authorized for emergency broadcast gateway.");
  };

  if (!isLoggedIn) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-6 right-6 z-[3000] px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-xl font-medium text-xs flex items-center space-x-2 animate-fade-in">
            <span>{toastMessage}</span>
          </div>
        )}
        <DemoLoginPage
          onSelectRole={(role, profile) => {
            setCurrentRole(role);
            setIsLoggedIn(true);
            setActiveTab(ROLE_DEFAULT_TAB[role] || 'command');
            showToast(`✓ Signed in as ${profile.name} (${profile.title})`);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-[3000] px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-xl font-medium text-xs flex items-center space-x-2 animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Persistent Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onSwitchRole={() => setIsLoggedIn(false)}
        urgentCount={requests.filter(r => r.urgency === 'HIGH' || r.urgency === 'CRITICAL').length}
        openSheltersCount={shelters.length}
      />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <Header
          freshnessMinutes={14}
          onRefreshData={loadData}
          isLoading={isLoading}
          currentRole={currentRole}
          onSwitchRole={() => setIsLoggedIn(false)}
        />

        {/* Main View Area (Fluid full-width layout for desktop monitors & laptops) */}
        <main className="flex-1 p-6 lg:p-8 w-full">
          {activeTab === 'command' && (
            <CommandCenter
              requests={requests}
              shelters={shelters}
              routes={routes}
              assignments={assignments}
              currentRole={currentRole}
              onOpenEvaluator={(req) => setEvaluatorModalRequest(req)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Tactical GIS Map &amp; Spatial Hazard Layers
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    OpenStreetMap standard &amp; satellite visualization of flood zones, shelters, victim coordinates, and candidate evacuation paths
                  </p>
                </div>
                <button
                  onClick={() => setEvaluatorModalRequest(requests[0])}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                >
                  Evaluate EA-1001
                </button>
              </div>

              <TacticalMap
                shelters={shelters}
                requests={requests}
                routes={routes}
                hazardZones={incident?.hazard_zones || [
                  {
                    id: 'hz-1',
                    zone_name: 'Baliapanda Inundation Lowlands',
                    severity: 'HIGH',
                    water_depth_cm: 35,
                    geometry_geojson: {
                      type: 'Polygon',
                      coordinates: [[[85.810, 19.798], [85.825, 19.798], [85.825, 19.810], [85.810, 19.810], [85.810, 19.798]]]
                    },
                    notes: 'Tide surge overflow'
                  }
                ]}
                onSelectRequest={(req) => setEvaluatorModalRequest(req)}
                onSelectShelter={() => {}}
              />
            </div>
          )}

          {activeTab === 'copilot' && (
            <EvacAICoPilot
              requests={requests}
              shelters={shelters}
              routes={routes}
              onOpenEvaluator={(req) => setEvaluatorModalRequest(req)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'predictive' && (
            <PredictiveInundation
              shelters={shelters}
              requests={requests}
              onOpenEvaluator={(req) => setEvaluatorModalRequest(req)}
            />
          )}

          {activeTab === 'requests' && (
            <AssistanceTriage
              requests={requests}
              onOpenEvaluator={(req) => setEvaluatorModalRequest(req)}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'evaluator' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  Deterministic Route Feasibility Evaluator
                </h3>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed font-medium">
                  EvacAccess India evaluates candidate evacuation corridors against victim accessibility requirements and real-time hazard data. Rather than generic safe paths, the engine returns <strong className="text-emerald-700">FEASIBLE_WITH_AVAILABLE_DATA</strong>, <strong className="text-red-700">UNSUITABLE</strong>, or <strong className="text-amber-700">UNVERIFIED</strong> with explicit failure reasons.
                </p>
              </div>

              {requests[0] && (
                <RouteEvaluatorModal
                  request={requests[0]}
                  routes={routes}
                  onClose={() => setActiveTab('command')}
                  onDispatchSuccess={handleDispatchSuccess}
                />
              )}
            </div>
          )}

          {activeTab === 'shelters' && (
            <ShelterDirectory
              shelters={shelters}
              currentRole={currentRole}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'dispatch' && (
            <DispatchBoard
              assignments={assignments}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'mesh' && (
            <MeshRelaySimulator />
          )}

          {activeTab === 'citizensos' && (
            <CitizenSOSPortal />
          )}

          {activeTab === 'alerts' && (
            <AlertPreviewer
              alerts={alerts}
              onApproveAlert={handleApproveAlert}
            />
          )}

          {activeTab === 'scorecard' && (
            <SocialImpactScorecard />
          )}

          {activeTab === 'audit' && (
            <AuditLogViewer
              auditEvents={auditEvents}
            />
          )}
        </main>

        {/* Government Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              EvacAccess India — Decision-Support Protocol for Emergency Disaster Response
            </span>
            <span className="font-mono text-[11px] text-slate-600 font-bold">
              Odisha State Disaster Management Simulation • WCAG 2.1 AAA Ready
            </span>
          </div>
        </footer>
      </div>

      {/* Floating Route Evaluator Modal */}
      {evaluatorModalRequest && (
        <RouteEvaluatorModal
          request={evaluatorModalRequest}
          routes={routes}
          onClose={() => setEvaluatorModalRequest(null)}
          onDispatchSuccess={handleDispatchSuccess}
        />
      )}
    </div>
  );
};

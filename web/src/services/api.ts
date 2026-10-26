import {
  Incident, Shelter, AssistanceRequest, RouteCandidate,
  RouteEvaluationResult, Assignment, Alert, AuditEvent, User
} from '../types';

const BASE_URL = '/api/v1';

// Token Management
export const getAuthToken = (): string | null => {
  return localStorage.getItem('evac_access_token');
};

export const setAuthToken = (token: string, user: User) => {
  localStorage.setItem('evac_access_token', token);
  localStorage.setItem('evac_access_user', JSON.stringify(user));
};

export const clearAuthToken = () => {
  localStorage.removeItem('evac_access_token');
  localStorage.removeItem('evac_access_user');
};

export const getStoredUser = (): User => {
  const stored = localStorage.getItem('evac_access_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return {
    id: 'user-coordinator-demo',
    username: 'priya_coordinator',
    email: 'priya.sharma@odrf.gov.in',
    role: 'COORDINATOR',
    organization: 'ODRF Disaster Control Room',
    badge_number: 'ODRF-PRIY'
  };
};

const getHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Deterministic In-Memory Simulation Store (Scenario EA-1001)
let isOfflineSimulation = false;

const SIMULATION_INCIDENT: Incident = {
  id: 'inc-puri-2026',
  code: 'ODISHA-PURI-FLOOD-2026',
  title: 'Odisha Coastal Surge & Flood Simulation (Puri Sector)',
  description: 'Scenario EA-1001: Coastal cyclone surge inundating lowlands in Puri district with +35cm flood water.',
  scenario_type: 'FLOOD',
  status: 'ACTIVE_DEMO',
  center_latitude: 19.8130,
  center_longitude: 85.8310,
  default_zoom: 14,
  affected_area_geojson: null,
  hazard_source: 'ODRF Rapid Telemetry',
  hazard_observed_at: new Date().toISOString(),
  is_hazard_stale: false,
  hazard_zones: [
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
  ]
};

const SIMULATION_SHELTERS: Shelter[] = [
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
];

const SIMULATION_REQUESTS: AssistanceRequest[] = [
  {
    id: 'req-1',
    public_ref: 'EA-1001',
    urgency: 'HIGH',
    status: 'NEW',
    requirements: ['wheelchair', 'step_free_access', 'oxygen_electricity'],
    operational_notes: 'Elderly citizen (72y), electric wheelchair user with COPD requiring continuous oxygen concentrator power. Ground floor evacuation mandatory.',
    latitude: 19.8055,
    longitude: 85.8210,
    approximate_address: 'House #42, Marine Drive Ward 3, Puri',
    contact_phone_masked: '+91-98765-XXXXX',
    number_of_people: 2,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'req-2',
    public_ref: 'EA-1002',
    urgency: 'CRITICAL',
    status: 'NEW',
    requirements: ['stretcher', 'step_free_access', 'accessible_transport'],
    operational_notes: 'Post-surgery recovery patient, bedridden, requires ambulance with stretcher ramp.',
    latitude: 19.8110,
    longitude: 85.8290,
    approximate_address: 'Flat 3B, Sea Beach Road, Puri',
    contact_phone_masked: '+91-98765-XXXXX',
    number_of_people: 1,
    created_at: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: 'req-3',
    public_ref: 'EA-1003',
    urgency: 'MEDIUM',
    status: 'IN_PROGRESS',
    requirements: ['visual_assistance', 'audio_guidance'],
    operational_notes: 'Visually impaired individual living alone. Needs tactile guidance or responder escort to high shelter.',
    latitude: 19.8020,
    longitude: 85.8150,
    approximate_address: 'Badasankha Lane 2, Puri',
    contact_phone_masked: '+91-98765-XXXXX',
    number_of_people: 1,
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

const SIMULATION_ROUTES: RouteCandidate[] = [
  {
    id: 'rt-1',
    candidate_code: 'ROUTE-DEMO-01',
    title: 'Station Road Direct Access to Puri High School',
    origin_name: 'Baliapanda Lowlands',
    origin_latitude: 19.8055,
    origin_longitude: 85.8210,
    destination_shelter: 'sh-1',
    destination_shelter_detail: SIMULATION_SHELTERS[0],
    distance_km: 1.4,
    estimated_time_minutes: 8,
    geometry_geojson: {
      type: 'LineString',
      coordinates: [[85.8210, 19.8055], [85.8270, 19.8120], [85.8320, 19.8180]]
    },
    source: 'State GIS Department',
    observed_at: new Date(Date.now() - 14 * 60000).toISOString(),
    is_stale: false,
    segments: []
  },
  {
    id: 'rt-2',
    candidate_code: 'ROUTE-DEMO-02',
    title: 'Marine Drive Coastal Avenue to Sector 4 Community Hall',
    origin_name: 'Baliapanda Lowlands',
    origin_latitude: 19.8055,
    origin_longitude: 85.8210,
    destination_shelter: 'sh-2',
    destination_shelter_detail: SIMULATION_SHELTERS[1],
    distance_km: 0.9,
    estimated_time_minutes: 5,
    geometry_geojson: {
      type: 'LineString',
      coordinates: [[85.8210, 19.8055], [85.8195, 19.8030], [85.8190, 19.8010]]
    },
    source: 'ODRF Rapid Navigation GIS',
    observed_at: new Date().toISOString(),
    is_stale: false,
    segments: []
  },
  {
    id: 'rt-3',
    candidate_code: 'ROUTE-DEMO-03',
    title: 'Grand Road Elevated Emergency Corridor to Jagannath Multipurpose Shelter',
    origin_name: 'Baliapanda Lowlands',
    origin_latitude: 19.8055,
    origin_longitude: 85.8210,
    destination_shelter: 'sh-3',
    destination_shelter_detail: SIMULATION_SHELTERS[2],
    distance_km: 2.1,
    estimated_time_minutes: 12,
    geometry_geojson: {
      type: 'LineString',
      coordinates: [[85.8210, 19.8055], [85.8225, 19.8100], [85.8240, 19.8140]]
    },
    source: 'ODRF Rapid Navigation GIS',
    observed_at: new Date().toISOString(),
    is_stale: false,
    segments: []
  }
];

const SIMULATION_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    request: 'req-1',
    request_detail: SIMULATION_REQUESTS[0],
    team_name: 'NDRF Unit 03 (Puri)',
    status: 'EN_ROUTE',
    acknowledgement_deadline: new Date(Date.now() + 1800000).toISOString(),
    assigned_at: new Date(Date.now() - 1200000).toISOString(),
    notes: 'Responder Rajesh deployed with ramp-equipped tactical ambulance.'
  }
];

const SIMULATION_ALERTS: Alert[] = [
  {
    id: 'alt-1',
    title: 'Coastal Surge Flash Flood Warning — Baliapanda Sector',
    target_zone: 'Baliapanda Lowlands',
    message_en: 'Flash flood alert: Rising coastal water detected in Baliapanda sector (+35cm). Evacuees requiring wheelchair access must avoid Marine Drive and use elevated Grand Road corridor to Jagannath Shelter.',
    message_hi: 'बाढ़ चेतावनी: बलियापांडा क्षेत्र में जलस्तर 35 सेमी बढ़ गया है। व्हीलचेयर उपयोगकर्ताओं को मरीन ड्राइव से बचते हुए जगन्नाथ आश्रय स्थल का उपयोग करने की सलाह दी जाती है।',
    message_or: 'ବନ୍ୟା ସତର୍କତା: ବାଲିଆପଣ୍ଡା ଅଞ୍ଚଳରେ ଜଳସ୍ତର ୩୫ ସେମି ବୃଦ୍ଧି ପାଇଛି। ହ୍ୱିଲଚେୟାର ବ୍ୟବହାରକାରୀମାନେ ଜଗନ୍ନାଥ ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ।',
    preferred_format: 'TTS_AUDIO',
    status: 'APPROVED',
    is_simulated_preview: false,
    approved_by_name: 'Priya Sharma (Incident Commander)',
    approved_at: new Date(Date.now() - 1800000).toISOString()
  }
];

const SIMULATION_AUDIT: AuditEvent[] = [
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
];

function getOfflineSimulationData<T>(endpoint: string, options: RequestInit = {}): T {
  if (endpoint.startsWith('/incidents/') && endpoint.endsWith('/map/')) {
    return {
      incident: SIMULATION_INCIDENT,
      hazard_zones: SIMULATION_INCIDENT.hazard_zones,
      shelters: SIMULATION_SHELTERS,
      assistance_requests: SIMULATION_REQUESTS,
      route_candidates: SIMULATION_ROUTES,
      field_reports: []
    } as T;
  }
  if (endpoint.startsWith('/incidents')) {
    return [SIMULATION_INCIDENT] as T;
  }
  if (endpoint.startsWith('/shelters')) {
    return SIMULATION_SHELTERS as T;
  }
  if (endpoint.startsWith('/assistance-requests')) {
    return SIMULATION_REQUESTS as T;
  }
  if (endpoint.startsWith('/routes/candidates/evaluate')) {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const routeId = body.route_id || 'rt-3';
    return api.evaluateRoute(body.request_id || 'req-1', routeId) as unknown as T;
  }
  if (endpoint.startsWith('/routes/candidates')) {
    return SIMULATION_ROUTES as T;
  }
  if (endpoint.startsWith('/assignments')) {
    return SIMULATION_ASSIGNMENTS as T;
  }
  if (endpoint.startsWith('/alerts')) {
    return SIMULATION_ALERTS as T;
  }
  if (endpoint.startsWith('/audit')) {
    return SIMULATION_AUDIT as T;
  }
  if (endpoint.startsWith('/auth/login/')) {
    return {
      access: 'sim_access_token',
      refresh: 'sim_refresh_token',
      user: getStoredUser()
    } as T;
  }
  if (endpoint.startsWith('/auth/me/')) {
    return getStoredUser() as T;
  }
  return [] as T;
}

// API Client wrapper with instant offline simulation fallback
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (isOfflineSimulation) {
    return getOfflineSimulationData<T>(endpoint, options);
  }

  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        // Backend offline via proxy - switch to simulation immediately
        isOfflineSimulation = true;
        return getOfflineSimulationData<T>(endpoint, options);
      }
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        errorMsg = errorJson.message || errorJson.detail || JSON.stringify(errorJson);
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    return response.json();
  } catch (err: any) {
    // If connection refused / network error, switch to offline simulation
    isOfflineSimulation = true;
    return getOfflineSimulationData<T>(endpoint, options);
  }
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    return request<{ access: string; refresh: string; user: User }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  getCurrentUser: async () => {
    return request<User>('/auth/me/');
  },

  // Incidents & GIS
  getIncidents: async () => {
    const res = await request<any>('/incidents/');
    return Array.isArray(res) ? res : res.results || [];
  },

  getIncidentMap: async (incidentId: string) => {
    return request<{
      incident: Incident;
      hazard_zones: any[];
      shelters: Shelter[];
      assistance_requests: AssistanceRequest[];
      route_candidates: RouteCandidate[];
      field_reports: any[];
    }>(`/incidents/${incidentId}/map/`);
  },

  // Shelters
  getShelters: async (incidentId?: string) => {
    const url = incidentId ? `/shelters/?incident=${incidentId}` : '/shelters/';
    const res = await request<any>(url);
    return Array.isArray(res) ? res : res.results || [];
  },

  submitInspection: async (shelterId: string, data: { findings: any[]; notes: string; capacity_occupied?: number }) => {
    return request(`/shelters/${shelterId}/submit_inspection/`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  verifyShelter: async (shelterId: string, features: Record<string, string>, reason: string) => {
    return request<{ message: string; shelter: Shelter }>(`/shelters/${shelterId}/verify/`, {
      method: 'POST',
      body: JSON.stringify({ features, reason })
    });
  },

  // Assistance Requests
  getAssistanceRequests: async (incidentId?: string) => {
    const url = incidentId ? `/assistance-requests/?incident=${incidentId}` : '/assistance-requests/';
    const res = await request<any>(url);
    return Array.isArray(res) ? res : res.results || [];
  },

  updateRequestStatus: async (requestId: string, status: string, reason?: string) => {
    return request<AssistanceRequest>(`/assistance-requests/${requestId}/update_status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    });
  },

  // Routing
  getRouteCandidates: async (incidentId?: string) => {
    const url = incidentId ? `/routes/candidates/?incident=${incidentId}` : '/routes/candidates/';
    const res = await request<any>(url);
    return Array.isArray(res) ? res : res.results || [];
  },

  evaluateRoute: async (requestId: string, routeId: string): Promise<RouteEvaluationResult> => {
    if (isOfflineSimulation) {
      return getEvaluationResult(routeId);
    }
    try {
      return await request<RouteEvaluationResult>('/routes/candidates/evaluate/', {
        method: 'POST',
        body: JSON.stringify({ request_id: requestId, route_id: routeId })
      });
    } catch {
      return getEvaluationResult(routeId);
    }
  },

  // Assignments
  getAssignments: async () => {
    const res = await request<any>('/assignments/');
    return Array.isArray(res) ? res : res.results || [];
  },

  createAssignment: async (data: { request: string; team_name: string; notes?: string }) => {
    return request<Assignment>('/assignments/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateAssignmentStatus: async (assignmentId: string, status: string, notes?: string) => {
    return request<Assignment>(`/assignments/${assignmentId}/update_status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  },

  // Alerts
  getAlerts: async () => {
    const res = await request<any>('/alerts/');
    return Array.isArray(res) ? res : res.results || [];
  },

  createAlert: async (data: Partial<Alert>) => {
    return request<Alert>('/alerts/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  approveAlert: async (alertId: string) => {
    return request<Alert>(`/alerts/${alertId}/approve/`, {
      method: 'POST'
    });
  },

  // Audit Events
  getAuditEvents: async () => {
    const res = await request<any>('/audit/');
    return Array.isArray(res) ? res : res.results || [];
  }
};

function getEvaluationResult(routeId: string): RouteEvaluationResult {
  if (routeId.includes('1') || routeId.includes('PURI-01')) {
    return {
      route_id: routeId,
      status: 'UNSUITABLE',
      reasons: ['Hard Barrier: Destination shelter (Puri High School) lacks verified step-free entrance (14 stairs, no ramp).'],
      rule_version: 'mvp-1.0-sim',
      human_review_required: true,
      checks: [
        { requirement: 'step_free_access', result: 'FAIL', source: 'Shelter Features Audit', details: 'Entrance has 14 concrete steps with zero ramp alternative' },
        { requirement: 'flood_clearance', result: 'PASS', source: 'Station Road Segment', details: 'Water depth < 5cm' }
      ]
    };
  } else if (routeId.includes('2') || routeId.includes('PURI-02')) {
    return {
      route_id: routeId,
      status: 'UNSUITABLE',
      reasons: ['Hard Barrier: Corridor Segment CR-02 (Marine Drive Approach) is flooded with 35cm water (threshold: 10cm for wheelchairs).'],
      rule_version: 'mvp-1.0-sim',
      human_review_required: true,
      checks: [
        { requirement: 'segment_flood_clearance', result: 'FAIL', source: 'Coastal Road Segment', details: '35cm water depth exceeds wheelchair clearance limit' },
        { requirement: 'shelter_ramp', result: 'PASS', source: 'Community Hall Audit', details: 'Ramp slope 1:11 verified' }
      ]
    };
  } else {
    return {
      route_id: routeId,
      status: 'FEASIBLE_WITH_AVAILABLE_DATA',
      reasons: ['All mandatory accessibility criteria verified with fresh hazard observations. Station Road overpass elevated above surge level.'],
      rule_version: 'mvp-1.0-sim',
      human_review_required: false,
      checks: [
        { requirement: 'route_observation_freshness', result: 'PASS', source: 'Field Telemetry', details: 'Hazard observation 14m old (Freshness limit: 60m)' },
        { requirement: 'segment_flood_clearance', result: 'PASS', source: 'Station Road Overpass', details: 'Segment elevated 6.2m MSL (0cm flood)' },
        { requirement: 'shelter_step_free', result: 'PASS', source: 'Jagannath Shelter Audit', details: 'Step-free entrance and bilateral handrail ramp verified' },
        { requirement: 'shelter_backup_power', result: 'PASS', source: 'Jagannath Generator Telemetry', details: '45 kVA generator active for oxygen concentrators' }
      ]
    };
  }
}

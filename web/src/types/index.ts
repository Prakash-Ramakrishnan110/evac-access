export type UserRole = 'ADMIN' | 'COORDINATOR' | 'REVIEWER' | 'RESPONDER' | 'DEMO_VIEWER';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  organization: string;
  badge_number: string;
}

export interface HazardZone {
  id: string;
  zone_name: string;
  severity: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
  water_depth_cm: number;
  geometry_geojson: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  notes: string;
}

export interface Incident {
  id: string;
  code: string;
  title: string;
  description: string;
  scenario_type: string;
  status: 'DRAFT' | 'ACTIVE_DEMO' | 'ACTIVE_LIVE' | 'PAUSED' | 'CLOSED';
  center_latitude: number;
  center_longitude: number;
  default_zoom: number;
  affected_area_geojson: any;
  hazard_source: string;
  hazard_observed_at: string;
  is_hazard_stale: boolean;
  hazard_zones: HazardZone[];
}

export type FeatureValue = 'YES' | 'NO' | 'UNKNOWN';

export interface ShelterFeature {
  id: string;
  feature_key: string;
  value: FeatureValue;
  evidence_note: string;
  verified_at?: string;
}

export interface Shelter {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity_total: number;
  capacity_occupied: number;
  available_capacity: number;
  is_full: boolean;
  operating_status: 'OPEN' | 'FULL' | 'STANDBY' | 'CLOSED';
  review_status: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'STALE' | 'REJECTED';
  last_verified_at?: string;
  contact_person?: string;
  contact_phone?: string;
  notes?: string;
  features: ShelterFeature[];
}

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';
export type RequestStatus = 'NEW' | 'TRIAGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'EVACUATED' | 'UNABLE_TO_CONTACT' | 'CANCELLED';

export interface AssistanceRequest {
  id: string;
  public_ref: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  requirements: string[];
  number_of_people: number;
  approximate_address: string;
  latitude: number;
  longitude: number;
  contact_phone_masked: string;
  operational_notes: string;
  created_at: string;
}

export interface RouteSegment {
  id: string;
  segment_code: string;
  name: string;
  condition: string;
  is_flooded: boolean;
  water_depth_cm: number;
  has_stairs_or_curbs: boolean;
}

export interface RouteCandidate {
  id: string;
  candidate_code: string;
  title: string;
  origin_name: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_shelter: string;
  destination_shelter_detail?: Shelter;
  distance_km: number;
  estimated_time_minutes: number;
  geometry_geojson: {
    type: string;
    coordinates: number[][];
  };
  source: string;
  observed_at: string;
  is_stale: boolean;
  segments: RouteSegment[];
}

export interface RouteCheck {
  requirement: string;
  result: 'PASS' | 'FAIL' | 'UNKNOWN';
  source?: string;
  details?: string;
}

export interface RouteEvaluationResult {
  evaluation_id?: string;
  route_id: string;
  status: 'FEASIBLE_WITH_AVAILABLE_DATA' | 'UNSUITABLE' | 'UNVERIFIED';
  checks: RouteCheck[];
  reasons: string[];
  rule_version: string;
  human_review_required: boolean;
}

export type AssignmentStatus = 'UNASSIGNED' | 'ASSIGNED' | 'ACKNOWLEDGED' | 'EN_ROUTE' | 'COMPLETED' | 'ESCALATED' | 'CANCELLED';

export interface Assignment {
  id: string;
  request: string;
  request_detail?: AssistanceRequest;
  team_name: string;
  assigned_responder?: string;
  assigned_responder_name?: string;
  status: AssignmentStatus;
  acknowledgement_deadline: string;
  assigned_at: string;
  acknowledged_at?: string;
  completed_at?: string;
  notes: string;
}

export interface Alert {
  id: string;
  title: string;
  target_zone: string;
  message_en: string;
  message_hi: string;
  message_or: string;
  preferred_format: string;
  status: 'DRAFT' | 'PREVIEWED' | 'APPROVED' | 'DELIVERED';
  is_simulated_preview: boolean;
  approved_by_name?: string;
  approved_at?: string;
}

export interface AuditEvent {
  id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  change_summary: Record<string, any>;
  timestamp: string;
}

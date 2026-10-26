import React from 'react';
import {
  Users, Home, Route, AlertCircle, ArrowRight,
  ShieldCheck, AlertTriangle, Zap, CheckCircle2, XCircle, Clock,
  Send, UserCheck, ShieldAlert, Cpu, Sparkles, Navigation, Phone, CheckSquare,
  Bot, Waves, Award, Radio, Smartphone, Map as MapIcon
} from 'lucide-react';
import { TacticalMap } from './TacticalMap';
import { AssistanceRequest, Shelter, RouteCandidate, Assignment, UserRole } from '../types';

interface CommandCenterProps {
  requests: AssistanceRequest[];
  shelters: Shelter[];
  routes: RouteCandidate[];
  assignments: Assignment[];
  currentRole: UserRole;
  onOpenEvaluator: (request: AssistanceRequest) => void;
  onNavigateTab: (tab: any) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  requests,
  shelters,
  routes,
  assignments,
  currentRole,
  onOpenEvaluator,
  onNavigateTab
}) => {
  // Compute metrics
  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.capacity_total, 0);
  const totalShelterOccupied = shelters.reduce((acc, s) => acc + s.capacity_occupied, 0);
  const occupancyPercent = totalShelterCapacity > 0 ? Math.round((totalShelterOccupied / totalShelterCapacity) * 100) : 0;

  const wheelchairRequests = requests.filter(r => r.requirements.includes('wheelchair') || r.requirements.includes('step_free_access')).length;
  const oxygenRequests = requests.filter(r => r.requirements.includes('oxygen_electricity')).length;
  const stretcherRequests = requests.filter(r => r.requirements.includes('stretcher')).length;

  const verifiedShelters = shelters.filter(s => s.review_status === 'VERIFIED').length;
  const criticalRequests = requests.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH');

  const ea1001 = requests.find(r => r.public_ref === 'EA-1001') || requests[0];

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* 1. Dynamic Role-Tailored Operational Console Banner */}
      <div className={`rounded-xl p-5 border shadow-sm transition-all ${
        currentRole === 'COORDINATOR'
          ? 'bg-blue-50/50 border-blue-200 border-l-4 border-l-blue-600'
          : currentRole === 'RESPONDER'
          ? 'bg-emerald-50/50 border-emerald-200 border-l-4 border-l-emerald-600'
          : currentRole === 'REVIEWER'
          ? 'bg-amber-50/50 border-amber-200 border-l-4 border-l-amber-600'
          : currentRole === 'ADMIN'
          ? 'bg-purple-50/50 border-purple-200 border-l-4 border-l-purple-600'
          : 'bg-indigo-50/50 border-indigo-200 border-l-4 border-l-indigo-600'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-ping ${
                currentRole === 'COORDINATOR' ? 'bg-blue-600' :
                currentRole === 'RESPONDER' ? 'bg-emerald-600' :
                currentRole === 'REVIEWER' ? 'bg-amber-600' :
                currentRole === 'ADMIN' ? 'bg-purple-600' : 'bg-indigo-600'
              }`} />
              <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded uppercase bg-white border border-slate-200 text-slate-800">
                {currentRole === 'COORDINATOR' && 'INCIDENT COMMANDER • STRATEGIC DISPATCH CONSOLE'}
                {currentRole === 'RESPONDER' && 'FIELD TACTICAL UNIT • RAPID EXTRACTION CONSOLE'}
                {currentRole === 'REVIEWER' && 'SAFETY & ACCESSIBILITY AUDITOR • SIGN-OFF CONSOLE'}
                {currentRole === 'ADMIN' && 'SYSTEM GOVERNANCE • ROOT AUDIT & COMPLIANCE CONSOLE'}
                {currentRole === 'DEMO_VIEWER' && 'SIMULATION OBSERVER • GUIDED SCENARIO WALKTHROUGH'}
              </span>
              <span className="text-xs text-slate-400 font-mono">ODISHA-PURI-FLOOD</span>
            </div>

            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {currentRole === 'COORDINATOR' && 'Puri Coastal Surge Crisis — Full Tactical Command Authority'}
              {currentRole === 'RESPONDER' && 'Tactical Field Unit Alpha — Active Rescue Mission Dispatch'}
              {currentRole === 'REVIEWER' && 'Quality Verification Queue — Shelter Features & Hazard Freshness'}
              {currentRole === 'ADMIN' && 'System Health & Tamper-Evident SHA-256 Audit Ledger'}
              {currentRole === 'DEMO_VIEWER' && 'Guided Scenario EA-1001: Accessibility-Aware Evacuation'}
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {currentRole === 'COORDINATOR' && 'You have primary authorization for deterministic route evaluation, dispatching NDRF rescue squads, and publishing multilingual emergency broadcasts.'}
              {currentRole === 'RESPONDER' && 'You are currently assigned to mission EA-1001 (Electric Wheelchair + Oxygen). Access victim coordinates, update status to En Route, and report real-time road inundation.'}
              {currentRole === 'REVIEWER' && 'Independent safety checks required: Shelter SH-PURI-03 has unverified accessible restrooms. Candidate paths will remain UNVERIFIED until on-site verification is signed off.'}
              {currentRole === 'ADMIN' && 'All system services operating nominally. PostGIS spatial evaluator online. Cryptographic append-only hash chains verified without discrepancies.'}
              {currentRole === 'DEMO_VIEWER' && 'Explore how EvacAccess India protects citizens with disabilities by rejecting flooded or inaccessible routes and calculating viable step-free safe paths.'}
            </p>
          </div>

          {/* Quick Role Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {currentRole === 'COORDINATOR' && (
              <>
                <button
                  onClick={() => onNavigateTab('requests')}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Triage Cases ({requests.length})</span>
                </button>
                <button
                  onClick={() => onNavigateTab('alerts')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
                >
                  <span>Broadcast Alerts</span>
                </button>
              </>
            )}

            {currentRole === 'RESPONDER' && (
              <>
                <button
                  onClick={() => onNavigateTab('dispatch')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>View My Mission</span>
                </button>
                <button
                  onClick={() => onNavigateTab('map')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
                >
                  <span>Report Road Barrier</span>
                </button>
              </>
            )}

            {currentRole === 'REVIEWER' && (
              <>
                <button
                  onClick={() => onNavigateTab('shelters')}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Shelter Features</span>
                </button>
                <button
                  onClick={() => onNavigateTab('audit')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
                >
                  <span>Audit Freshness</span>
                </button>
              </>
            )}

            {currentRole === 'ADMIN' && (
              <>
                <button
                  onClick={() => onNavigateTab('audit')}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Inspect Audit Hash Chains</span>
                </button>
              </>
            )}

            {currentRole === 'DEMO_VIEWER' && (
              <>
                <button
                  onClick={() => onOpenEvaluator(ea1001)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Route Evaluator Demo</span>
                </button>
              </>
            )}

            <button
              onClick={() => onNavigateTab('map')}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
            >
              <span>Tactical GIS Map</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* HSC 2027 Flagship Innovation Bar */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A1227] border border-blue-500/30 rounded-xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-400/30 text-blue-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white tracking-wide">Hack for Social Cause (HSC) 2027 Innovations</span>
              <span className="bg-amber-400 text-slate-950 font-mono text-[9.5px] font-extrabold px-1.5 py-0.2 rounded">
                SPECIAL FEATURES
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Explore AI Assistive Co-Pilot, Hydro-Topographical Forecaster, Offline P2P Mesh, Citizen SOS, &amp; RPwD Scorecard
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('copilot')}
            className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/40 rounded-lg font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>EvacAI Co-Pilot</span>
          </button>
          <button
            onClick={() => onNavigateTab('predictive')}
            className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/40 rounded-lg font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Predictive Risk (+6h)</span>
          </button>
          <button
            onClick={() => onNavigateTab('mesh')}
            className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-400/40 rounded-lg font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Offline Mesh</span>
          </button>
          <button
            onClick={() => onNavigateTab('citizensos')}
            className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-400/40 rounded-lg font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-400" />
            <span>Citizen SOS</span>
          </button>
          <button
            onClick={() => onNavigateTab('scorecard')}
            className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-400/40 rounded-lg font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>HSC Scorecard</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Operational Cards (Responsive Fluid Grid for Laptops and Wide Monitors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-5">
        {/* Metric 1: Assistance Requests */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Assistance Requests</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{requests.length}</span>
            <span className="text-xs text-red-600 font-bold">{criticalRequests.length} High Urgency</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>♿ Wheelchair: {wheelchairRequests}</span>
            <span>⚡ Oxygen: {oxygenRequests}</span>
            <span>🛏️ Stretcher: {stretcherRequests}</span>
          </div>
        </div>

        {/* Metric 2: Shelter Capacity */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Shelter Capacity</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{totalShelterOccupied}</span>
            <span className="text-xs text-slate-500">/ {totalShelterCapacity} Spaces</span>
            <span className="text-xs font-bold text-emerald-600 ml-auto">{occupancyPercent}% Occupied</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${occupancyPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Verified Accessibility */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Verified Shelters</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{verifiedShelters}</span>
            <span className="text-xs text-slate-500">/ {shelters.length} Facilities</span>
            <span className="text-xs text-amber-700 font-bold ml-auto">{shelters.length - verifiedShelters} Unverified</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span className="text-emerald-700 font-semibold">✓ 2 Certified Step-Free</span>
            <span className="text-amber-700 font-semibold">⚠ 1 Under Review</span>
          </div>
        </div>

        {/* Metric 4: Evaluated Corridors */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Evacuation Paths</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Route className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{routes.length}</span>
            <span className="text-xs text-emerald-600 font-bold">1 Feasible</span>
            <span className="text-xs text-red-600 font-bold ml-auto">2 Blocked</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span className="text-emerald-700 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Grand Rd: Clear</span>
            </span>
            <span className="text-red-700 flex items-center space-x-1">
              <XCircle className="w-3 h-3 text-red-600" />
              <span>Marine Dr: 35cm flood</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Role-Specific Dedicated Working Cards */}

      {/* Role: FIELD RESPONDER Quick Dispatch Duty Module */}
      {currentRole === 'RESPONDER' && (
        <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm border-l-4 border-l-emerald-500 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                My Active Field Task: Extraction for EA-1001
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              STATUS: EN ROUTE (ETA: 8 MIN)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Citizen in Need:</span>
              <strong className="text-slate-900 text-sm block">Ramesh Mohapatra</strong>
              <span className="text-slate-600">Wheelchair User + Oxygen</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Location Coordinates:</span>
              <strong className="text-slate-900 text-sm block">19.8135 N, 85.8312 E</strong>
              <span className="text-slate-600">Baliapanda Lowlands, Puri</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Target Destination:</span>
              <strong className="text-emerald-700 text-sm block">SH-PURI-03 (Badasankha Town Hall)</strong>
              <span className="text-slate-600">Ramp Verified • Generator Active</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onNavigateTab('dispatch')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-2"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Update Mission Status (Mark On Scene)</span>
            </button>
            <button
              onClick={() => onNavigateTab('map')}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center space-x-2"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Open Tactical Navigation Path</span>
            </button>
          </div>
        </div>
      )}

      {/* Role: REVIEWER Dedicated Inspection Queue Module */}
      {currentRole === 'REVIEWER' && (
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm border-l-4 border-l-amber-500 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Auditor Desk: Pending Verification Review Items
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              1 UNVERIFIED SHELTER ATTRIBUTE
            </span>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-amber-900 text-sm">SH-PURI-03 • Badasankha Town Hall Disaster Hub</strong>
              <span className="font-mono text-amber-800 font-bold">Attribute: accessible_restroom = UNKNOWN</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Field inspection submitted by Responder Rajesh indicated ramp is verified, but restroom door width was pending tape-measure confirmation. Reviewer sign-off is needed to upgrade status to <strong>VERIFIED</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateTab('shelters')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-2"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Review &amp; Certify Restroom Accessibility</span>
            </button>
          </div>
        </div>
      )}

      {/* Role: ADMIN Dedicated System Security & Audit Module */}
      {currentRole === 'ADMIN' && (
        <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm border-l-4 border-l-purple-500 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                System Governance &amp; Cryptographic Audit Ledger
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              ✓ SHA-256 HASH CHAIN INTEGRITY: 100% VALID
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-1">PostgreSQL &amp; PostGIS Cluster</span>
              <span className="text-emerald-700 font-bold text-sm block">127.0.0.1:5432 (Healthy)</span>
              <span className="text-slate-500 text-[11px]">Spatial queries latency: 4ms</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-1">Tamper-Evident Events</span>
              <span className="text-purple-700 font-bold text-sm block">14 Cryptographically Sealed Logs</span>
              <span className="text-slate-500 text-[11px]">Zero deletions allowed by database triggers</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-1">Idempotency Sync Store</span>
              <span className="text-blue-700 font-bold text-sm block">Client Keys Active</span>
              <span className="text-slate-500 text-[11px]">Prevents duplicate field observation sync</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateTab('audit')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-2"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Open Audit Trail Ledger</span>
            </button>
          </div>
        </div>
      )}

      {/* Role: DEMO VIEWER Guided Scenario Roadmap */}
      {currentRole === 'DEMO_VIEWER' && (
        <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm border-l-4 border-l-indigo-500 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Guided Demonstration Roadmap: Scenario EA-1001
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
              3-STEP SIMULATION WALKTHROUGH
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-200 space-y-1.5">
              <div className="font-bold text-indigo-900 flex items-center space-x-1">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Examine Citizen Profile</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Citizen Ramesh requires an electric wheelchair and electricity for oxygen. Normal stairs or floodwaters &gt;10cm are impassable.
              </p>
            </div>

            <div className="p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-200 space-y-1.5">
              <div className="font-bold text-indigo-900 flex items-center space-x-1">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Compare Candidate Paths</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Route 1 is blocked by stairs; Route 2 is submerged in 35cm floodwater. Route 3 (Grand Road flyover) is approved as FEASIBLE.
              </p>
            </div>

            <div className="p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-200 space-y-1.5">
              <div className="font-bold text-indigo-900 flex items-center space-x-1">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Broadcast &amp; Dispatch</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Dispatch team assigned, accessible evacuation alert rendered in English, Hindi, and Odia with speech synthesizer.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenEvaluator(ea1001)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-2"
            >
              <Route className="w-3.5 h-3.5" />
              <span>Start Interactive Evaluation (Test Routes 1, 2, 3)</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Featured Emergency Case Banner: EA-1001 */}
      {ea1001 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 border-l-4 border-l-red-500 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-600 text-white animate-pulse">
                  PRIORITY INTRA-ZONE CASE: {ea1001.public_ref}
                </span>
                <span className="text-xs text-slate-300">|</span>
                <span className="text-xs font-semibold text-slate-700">
                  {ea1001.approximate_address}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                <strong className="text-slate-900">Assistance Profile:</strong> Citizen uses electric wheelchair; requires oxygen concentrator electricity. Evacuation route must have zero steps, no flooded roads &gt; 10cm, and a ramp-equipped destination shelter.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ea1001.requirements.map(req => (
                  <span key={req} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>{req.toUpperCase()}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <button
                onClick={() => onOpenEvaluator(ea1001)}
                className="w-full lg:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center space-x-2"
              >
                <Route className="w-4 h-4" />
                <span>Evaluate Route Feasibility</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Live Tactical Leaflet Map Overview (Daylight Cartography) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <MapIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Tactical Operations GIS Map (Puri Coastal Sector)
                </h3>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">
                  LEAFLET LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Daylight CartoDB Positron spatial GIS with active flood hazard zones, certified shelters, and evacuee extraction points
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('map')}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg transition flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Expanded Map View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-96 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
          <TacticalMap
            shelters={shelters}
            requests={requests}
            routes={routes}
            hazardZones={[
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
            onSelectRequest={onOpenEvaluator}
            onSelectShelter={() => onNavigateTab('shelters')}
          />
        </div>
      </div>

      {/* 6. Fluid Grid: Shelter Status & Active Requests Triage Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-6">
        {/* Shelter Directory Snapshot */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Designated Shelters (Puri Sector)</span>
            </h3>
            <button
              onClick={() => onNavigateTab('shelters')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {shelters.map(shelter => {
              const hasRamp = shelter.features.find(f => f.feature_key === 'step_free_access')?.value === 'YES';
              const hasPower = shelter.features.find(f => f.feature_key === 'backup_power_for_oxygen')?.value === 'YES';
              const occPct = Math.round((shelter.capacity_occupied / shelter.capacity_total) * 100);

              return (
                <div key={shelter.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200/80 transition flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{shelter.code}</span>
                      <span className="font-semibold text-slate-700">{shelter.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500">
                      <span>{shelter.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hasRamp ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {hasRamp ? '✓ Ramp' : '✗ No Ramp'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hasPower ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {hasPower ? '⚡ Oxygen DG' : 'No DG'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600 font-bold">
                      {occPct}% Full
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Assistance Requests Triage Snapshot */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4 text-red-600" />
              <span>Emergency Evacuation Triage Queue</span>
            </h3>
            <button
              onClick={() => onNavigateTab('requests')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
            >
              <span>View All ({requests.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {requests.slice(0, 3).map(req => {
              return (
                <div key={req.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200/80 transition flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{req.public_ref}</span>
                      <span className="font-semibold text-slate-600">{req.contact_phone_masked}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                        req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.urgency}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {req.approximate_address} • Evacuees: {req.number_of_people}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOpenEvaluator(req)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Route className="w-3 h-3" />
                      <span>Evaluate</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

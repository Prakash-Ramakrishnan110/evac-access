import React, { useState } from 'react';
import { LifeBuoy, AlertCircle, Route, Zap, Filter, Search, CheckCircle } from 'lucide-react';
import { AssistanceRequest, UrgencyLevel, RequestStatus } from '../types';

interface AssistanceTriageProps {
  requests: AssistanceRequest[];
  onOpenEvaluator: (req: AssistanceRequest) => void;
  onUpdateStatus: (reqId: string, status: RequestStatus) => void;
}

export const AssistanceTriage: React.FC<AssistanceTriageProps> = ({
  requests,
  onOpenEvaluator,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.public_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.approximate_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.operational_notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'ALL' || req.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesUrgency && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Case Ref (EA-1001), Location or Notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical Threat</option>
            <option value="HIGH">High Priority</option>
            <option value="STANDARD">Standard</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="EVACUATED">Evacuated</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3.5">Case Ref</th>
                <th className="px-4 py-3.5">Urgency</th>
                <th className="px-4 py-3.5">Location Area</th>
                <th className="px-4 py-3.5">Accessibility Needs</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map(req => {
                return (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-700">
                      {req.public_ref}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                        req.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{req.approximate_address}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[240px]">{req.operational_notes}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {req.requirements.map(r => (
                          <span key={r} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {r.replace('_', ' ').toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        req.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'EVACUATED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => onOpenEvaluator(req)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition inline-flex items-center space-x-1"
                      >
                        <Route className="w-3.5 h-3.5" />
                        <span>Evaluate</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

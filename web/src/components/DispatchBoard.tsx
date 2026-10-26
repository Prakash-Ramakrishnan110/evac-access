import React, { useState } from 'react';
import { Send, Clock, CheckCircle2, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { Assignment, AssignmentStatus } from '../types';
import { api } from '../services/api';

interface DispatchBoardProps {
  assignments: Assignment[];
  onRefresh: () => void;
}

export const DispatchBoard: React.FC<DispatchBoardProps> = ({
  assignments,
  onRefresh
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, newStatus: AssignmentStatus) => {
    setUpdatingId(id);
    try {
      await api.updateAssignmentStatus(id, newStatus, `Status transitioned to ${newStatus}`);
      onRefresh();
    } catch (err) {
      console.warn("Update status local fallback:", err);
      onRefresh();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Send className="w-4 h-4 text-blue-600" />
            <span>Active Responder Mission Dispatches</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time responder team telemetry, mission acknowledgements, and SLA tracking
          </p>
        </div>
        <div className="text-xs text-slate-600 font-mono">
          Active Missions: <strong className="text-emerald-600 font-bold">{assignments.length}</strong>
        </div>
      </div>

      {/* Dispatches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.length === 0 ? (
          <div className="col-span-2 bg-white p-8 text-center text-slate-500 rounded-xl border border-slate-200 shadow-sm">
            No active responder dispatches yet. Use the Route Evaluator to assign a team to an assistance request.
          </div>
        ) : (
          assignments.map(item => {
            return (
              <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-bold text-slate-900">{item.team_name}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    item.status === 'EN_ROUTE' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Target:</span>
                    <strong className="text-blue-700 font-mono font-bold">Case {item.request_detail?.public_ref || item.request}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="text-slate-800 font-semibold text-right truncate max-w-[200px]">{item.request_detail?.approximate_address || 'Puri Sector'}</span>
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      {item.notes}
                    </div>
                  )}
                </div>

                {/* Workflow State Stepper */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  {item.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'ACKNOWLEDGED')}
                      disabled={updatingId === item.id}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-xs transition"
                    >
                      Acknowledge Mission
                    </button>
                  )}
                  {item.status === 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'EN_ROUTE')}
                      disabled={updatingId === item.id}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                    >
                      Mark En Route
                    </button>
                  )}
                  {item.status === 'EN_ROUTE' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                      disabled={updatingId === item.id}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                    >
                      Confirm Evacuee at Shelter (Completed)
                    </button>
                  )}
                  {item.status === 'COMPLETED' && (
                    <div className="w-full text-center py-2 text-xs text-emerald-700 font-bold flex items-center justify-center space-x-1 bg-emerald-50 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Evacuation Successfully Concluded</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

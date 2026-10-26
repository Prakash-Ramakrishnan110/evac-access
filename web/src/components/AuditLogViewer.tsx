import React, { useState } from 'react';
import { FileText, Shield, Clock, Search, Lock } from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditLogViewerProps {
  auditEvents: AuditEvent[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ auditEvents }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = auditEvents.filter(ev =>
    ev.actor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.entity_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
              Tamper-Evident Audit &amp; Verification Trail
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>APPEND-ONLY</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed chronological log of all safety decisions, route evaluations, and dispatches
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Actor, Action or Case..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No audit events found matching query.
            </div>
          ) : (
            filteredEvents.map(event => {
              const formattedDate = new Date(event.timestamp).toLocaleString();
              return (
                <div key={event.id} className="p-4 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-emerald-700">{event.action}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-slate-800">{event.actor_name}</span>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-mono px-1.5 py-0.2 rounded border border-blue-200">
                        {event.entity_type} #{event.entity_id}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">
                      {event.reason}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 font-mono flex items-center space-x-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

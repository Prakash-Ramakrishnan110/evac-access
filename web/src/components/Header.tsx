import React from 'react';
import { AlertTriangle, Clock, RefreshCw, User, LogOut } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  freshnessMinutes?: number;
  onRefreshData: () => void;
  isLoading?: boolean;
  currentRole?: UserRole;
  onSwitchRole?: () => void;
}

const ROLE_INFO: Record<UserRole, { name: string; title: string; color: string }> = {
  COORDINATOR: { name: 'Priya Sharma', title: 'Incident Commander', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  RESPONDER: { name: 'Rajesh Jena', title: 'NDRF Rescue', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REVIEWER: { name: 'Sunita Das', title: 'Accessibility Auditor', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ADMIN: { name: 'State SDMA Admin', title: 'Governance Root', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  DEMO_VIEWER: { name: 'Public Observer', title: 'Interactive Demo', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export const Header: React.FC<HeaderProps> = ({
  freshnessMinutes = 14,
  onRefreshData,
  isLoading = false,
  currentRole = 'COORDINATOR',
  onSwitchRole
}) => {
  const roleMeta = ROLE_INFO[currentRole] || ROLE_INFO.DEMO_VIEWER;

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-xs">
      {/* Top Incident Status Ribbon */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 text-white text-[11px] font-semibold px-6 py-1.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
          <span className="tracking-wide uppercase font-bold">
            Simulated Emergency Incident — National Disaster Decision Support Platform
          </span>
          <span className="hidden lg:inline bg-amber-400 text-slate-900 font-extrabold text-[9.5px] px-2 py-0.5 rounded font-mono">
            HSC 2027 SPECIAL EDITION
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-[11px]">
          <span className="text-blue-100 font-medium">RPwD Act 2016 (Section 8) &amp; NDMP 2019 Certified</span>
        </div>
      </div>

      {/* Main Top Header Bar */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">Puri District Coastal Sector</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-mono text-[11px]">Surge Elevation: +35cm</span>
          </div>

          {/* Active Persona Pill */}
          <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleMeta.color}`}>
            <User className="w-3 h-3" />
            <span>{roleMeta.name}</span>
            <span className="text-[10px] opacity-75 font-normal">({roleMeta.title})</span>
          </div>
        </div>

        {/* Freshness & Action Controls */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Hazard: <strong className="text-slate-900">{freshnessMinutes}m ago</strong></span>
            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-1.5 py-0.2 rounded ml-1">
              VERIFIED FRESH
            </span>
          </div>

          <button
            onClick={onRefreshData}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-xs disabled:opacity-50"
            title="Sync live incident feeds with backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Feeds</span>
          </button>

          {onSwitchRole && (
            <button
              onClick={onSwitchRole}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
              title="Switch demo persona or return to login screen"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-300" />
              <span>Switch Persona</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

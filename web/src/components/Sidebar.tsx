import React, { useState } from 'react';
import {
  LayoutDashboard, Map, LifeBuoy, Route, Home,
  Send, Bell, FileText, Shield, User, ChevronRight, AlertTriangle,
  Bot, Waves, Radio, Smartphone, Award, Sparkles, LogOut
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab =
  | 'command'
  | 'map'
  | 'copilot'
  | 'predictive'
  | 'requests'
  | 'evaluator'
  | 'shelters'
  | 'dispatch'
  | 'mesh'
  | 'citizensos'
  | 'alerts'
  | 'scorecard'
  | 'audit';

export const ROLE_ALLOWED_TABS: Record<UserRole, NavTab[]> = {
  COORDINATOR: ['command', 'copilot', 'predictive', 'map', 'requests', 'evaluator', 'shelters', 'dispatch', 'alerts', 'scorecard'],
  RESPONDER: ['dispatch', 'map', 'mesh', 'shelters'],
  REVIEWER: ['command', 'shelters', 'evaluator', 'audit', 'map'],
  ADMIN: ['command', 'audit', 'shelters', 'scorecard', 'map'],
  DEMO_VIEWER: ['command', 'copilot', 'evaluator', 'map', 'citizensos', 'scorecard'],
};

export const ROLE_DEFAULT_TAB: Record<UserRole, NavTab> = {
  COORDINATOR: 'command',
  RESPONDER: 'dispatch',
  REVIEWER: 'shelters',
  ADMIN: 'command',
  DEMO_VIEWER: 'command',
};

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSwitchRole?: () => void;
  urgentCount?: number;
  openSheltersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  onRoleChange,
  onSwitchRole,
  urgentCount = 3,
  openSheltersCount = 3
}) => {
  const allowedTabs = ROLE_ALLOWED_TABS[currentRole] || ROLE_ALLOWED_TABS.DEMO_VIEWER;

  const handleRoleSelection = (newRole: UserRole) => {
    onRoleChange(newRole);
    const newAllowed = ROLE_ALLOWED_TABS[newRole] || ROLE_ALLOWED_TABS.DEMO_VIEWER;
    if (!newAllowed.includes(activeTab)) {
      onTabChange(ROLE_DEFAULT_TAB[newRole] || 'command');
    }
  };
  const navItems = [
    {
      id: 'command' as NavTab,
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: currentRole === 'COORDINATOR' ? 'COMMAND' : currentRole === 'ADMIN' ? 'OVERVIEW' : undefined,
    },
    {
      id: 'copilot' as NavTab,
      label: 'EvacAI Co-Pilot',
      icon: Bot,
      badge: 'AI GEN',
      highlight: true,
    },
    {
      id: 'predictive' as NavTab,
      label: 'Predictive Inundation',
      icon: Waves,
      badge: 'FORECAST',
    },
    {
      id: 'map' as NavTab,
      label: 'Tactical GIS Map',
      icon: Map,
      badge: currentRole === 'RESPONDER' ? 'NAV' : 'LIVE',
    },
    {
      id: 'requests' as NavTab,
      label: 'Assistance Triage',
      icon: LifeBuoy,
      count: urgentCount,
      countClass: 'bg-red-100 text-red-700 border border-red-200',
      badge: currentRole === 'COORDINATOR' ? 'PRIORITY' : undefined,
    },
    {
      id: 'evaluator' as NavTab,
      label: 'Route Feasibility',
      icon: Route,
      highlight: currentRole === 'COORDINATOR' || currentRole === 'DEMO_VIEWER',
      badge: currentRole === 'DEMO_VIEWER' ? 'DEMO' : currentRole === 'REVIEWER' ? 'AUDIT' : undefined,
    },
    {
      id: 'shelters' as NavTab,
      label: 'Shelter Directory',
      icon: Home,
      count: openSheltersCount,
      countClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      badge: currentRole === 'REVIEWER' ? 'VERIFY' : undefined,
    },
    {
      id: 'dispatch' as NavTab,
      label: 'Responder Dispatch',
      icon: Send,
      badge: currentRole === 'RESPONDER' ? 'MY DUTY' : undefined,
      highlight: currentRole === 'RESPONDER',
    },
    {
      id: 'mesh' as NavTab,
      label: 'Offline P2P Mesh',
      icon: Radio,
      badge: 'BLE RESIL',
    },
    {
      id: 'citizensos' as NavTab,
      label: 'Citizen SOS Portal',
      icon: Smartphone,
      badge: 'AAA PORTAL',
    },
    {
      id: 'alerts' as NavTab,
      label: 'Accessible Alerts',
      icon: Bell,
      badge: currentRole === 'COORDINATOR' ? 'ALERT' : undefined,
    },
    {
      id: 'scorecard' as NavTab,
      label: 'HSC 2027 Impact',
      icon: Award,
      badge: 'RPwD 100%',
    },
    {
      id: 'audit' as NavTab,
      label: 'Audit Trail',
      icon: FileText,
      badge: currentRole === 'ADMIN' ? 'ROOT' : undefined,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 shadow-sm z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
              EvacAccess <span className="text-blue-600">India</span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 font-medium truncate">
            Disaster Decision Support
          </p>
        </div>
      </div>

      {/* Incident Status Pill */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/80">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ACTIVE INCIDENT</span>
          </span>
          <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-bold">
            SIMULATION
          </span>
        </div>
        <div className="text-xs font-mono font-bold text-slate-900 truncate">
          ODISHA-PURI-FLOOD-2026
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Operations Matrix
          </span>
          <span className="text-[9.5px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
            {allowedTabs.length} of 13 Tools
          </span>
        </div>

        {navItems
          .filter((item) => allowedTabs.includes(item.id))
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {item.badge && (
                    <span className="text-[9px] font-mono bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${item.countClass}`}>
                      {item.count}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </div>
              </button>
            );
          })}
      </nav>

      {/* Responder Role Switcher at Bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
          <span>Active Persona</span>
          <span className="text-[9px] font-mono text-emerald-600 font-bold">RBAC ACTIVE</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs space-y-2">
          <div className="flex items-center space-x-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentRole === 'COORDINATOR' ? 'bg-blue-100 text-blue-700' :
              currentRole === 'RESPONDER' ? 'bg-emerald-100 text-emerald-700' :
              currentRole === 'REVIEWER' ? 'bg-amber-100 text-amber-700' :
              currentRole === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
              'bg-indigo-100 text-indigo-700'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {currentRole === 'COORDINATOR' ? 'Priya Sharma' :
                 currentRole === 'RESPONDER' ? 'Rajesh Jena (NDRF)' :
                 currentRole === 'REVIEWER' ? 'Sunita Das (Auditor)' :
                 currentRole === 'ADMIN' ? 'State SDMA Admin' : 'Public Observer'}
              </div>
              <div className="text-[10px] text-slate-500 truncate font-medium">
                {currentRole === 'COORDINATOR' ? 'Incident Commander' :
                 currentRole === 'RESPONDER' ? 'Field Tactical Rescue' :
                 currentRole === 'REVIEWER' ? 'Accessibility Verification' :
                 currentRole === 'ADMIN' ? 'System Governance' : 'Guided Simulation'}
              </div>
            </div>
          </div>

          <select
            value={currentRole}
            onChange={(e) => handleRoleSelection(e.target.value as UserRole)}
            className="w-full bg-slate-50 text-slate-800 font-medium text-[11px] rounded-md px-2 py-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="COORDINATOR">Incident Coordinator (Priya)</option>
            <option value="RESPONDER">Field Responder (Rajesh)</option>
            <option value="REVIEWER">Reviewer / Supervisor (Sunita)</option>
            <option value="ADMIN">System Administrator</option>
            <option value="DEMO_VIEWER">Demo Viewer</option>
          </select>

          {onSwitchRole && (
            <button
              onClick={onSwitchRole}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition border border-slate-200/80 cursor-pointer"
              title="Return to 1-Click Demo Persona Login Portal"
            >
              <LogOut className="w-3 h-3 text-slate-500" />
              <span>Switch Demo Persona</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

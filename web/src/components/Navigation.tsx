import React from 'react';
import {
  LayoutDashboard, Map, LifeBuoy, Route, Home,
  Send, Bell, FileText, ChevronRight, Bot, Waves, Radio, Smartphone, Award
} from 'lucide-react';
import { UserRole } from '../types';
import { ROLE_ALLOWED_TABS } from './Sidebar';

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

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentRole?: UserRole;
  urgentCount?: number;
  openSheltersCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  currentRole = 'COORDINATOR',
  urgentCount = 3,
  openSheltersCount = 3
}) => {
  const allowed = ROLE_ALLOWED_TABS[currentRole] || ROLE_ALLOWED_TABS.DEMO_VIEWER;
  const tabs = [
    { id: 'command' as NavTab, label: 'Command Center', icon: LayoutDashboard },
    { id: 'copilot' as NavTab, label: 'EvacAI Co-Pilot', icon: Bot, badge: 'AI' },
    { id: 'predictive' as NavTab, label: 'Predictive Inundation', icon: Waves },
    { id: 'map' as NavTab, label: 'Tactical GIS Map', icon: Map, badge: 'LIVE' },
    { id: 'requests' as NavTab, label: 'Assistance Triage', icon: LifeBuoy, count: urgentCount, countClass: 'bg-red-500/80 text-white' },
    { id: 'evaluator' as NavTab, label: 'Route Feasibility', icon: Route, highlight: true },
    { id: 'shelters' as NavTab, label: 'Shelter Directory', icon: Home, count: openSheltersCount, countClass: 'bg-emerald-600/80 text-white' },
    { id: 'dispatch' as NavTab, label: 'Responder Dispatch', icon: Send },
    { id: 'mesh' as NavTab, label: 'Offline Mesh', icon: Radio },
    { id: 'citizensos' as NavTab, label: 'Citizen SOS', icon: Smartphone, badge: 'AAA' },
    { id: 'alerts' as NavTab, label: 'Accessible Alerts', icon: Bell },
    { id: 'scorecard' as NavTab, label: 'HSC 2027 Impact', icon: Award, badge: '100%' },
    { id: 'audit' as NavTab, label: 'Audit Trail', icon: FileText },
  ];

  return (
    <nav className="border-b border-[#1E2E55] bg-[#0A1227] px-4">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
        {tabs.filter(tab => allowed.includes(tab.id)).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-blue-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-[#131F3F] border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>

              {tab.badge && (
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded font-bold">
                  {tab.badge}
                </span>
              )}

              {tab.count !== undefined && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${tab.countClass}`}>
                  {tab.count}
                </span>
              )}

              {tab.highlight && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

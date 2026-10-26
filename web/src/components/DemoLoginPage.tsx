import React from 'react';
import {
  Shield, Send, CheckSquare, Settings, Eye, ArrowRight, Sparkles
} from 'lucide-react';
import { UserRole } from '../types';

export interface PersonaProfile {
  role: UserRole;
  name: string;
  title: string;
  organization: string;
  accessLevel: string;
  summary: string;
  icon: React.ElementType;
  colorScheme: {
    iconBg: string;
    badgeBg: string;
    borderHover: string;
    button: string;
  };
}

interface DemoLoginPageProps {
  onSelectRole: (role: UserRole, profile: PersonaProfile) => void;
}

const DEMO_PERSONAS: PersonaProfile[] = [
  {
    role: 'COORDINATOR',
    name: 'Priya Sharma',
    title: 'Incident Coordinator',
    organization: 'ODRF Disaster Control',
    accessLevel: '10 Tools • Full Command',
    summary: 'Strategic triage, EvacAI Co-Pilot & emergency broadcasts.',
    icon: Shield,
    colorScheme: {
      iconBg: 'bg-blue-100 text-blue-700',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      borderHover: 'hover:border-blue-400 hover:shadow-blue-50',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  },
  {
    role: 'RESPONDER',
    name: 'Rajesh Jena',
    title: 'Field Responder',
    organization: 'NDRF Unit 03 (Puri)',
    accessLevel: '4 Tools • Field Tactical',
    summary: 'Extraction duties, tactical GIS map & offline mesh radar.',
    icon: Send,
    colorScheme: {
      iconBg: 'bg-emerald-100 text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      borderHover: 'hover:border-emerald-400 hover:shadow-emerald-50',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
  },
  {
    role: 'REVIEWER',
    name: 'Sunita Das',
    title: 'Reviewer / Supervisor',
    organization: 'Disability Welfare Dept',
    accessLevel: '5 Tools • Safety Audit',
    summary: 'Shelter step-free verification & route audit sign-offs.',
    icon: CheckSquare,
    colorScheme: {
      iconBg: 'bg-amber-100 text-amber-700',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      borderHover: 'hover:border-amber-400 hover:shadow-amber-50',
      button: 'bg-amber-600 hover:bg-amber-700 text-white'
    }
  },
  {
    role: 'ADMIN',
    name: 'State SDMA Admin',
    title: 'System Administrator',
    organization: 'State Disaster Authority',
    accessLevel: '5 Tools • Governance',
    summary: 'SHA-256 audit ledger, system telemetry & impact scorecard.',
    icon: Settings,
    colorScheme: {
      iconBg: 'bg-purple-100 text-purple-700',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      borderHover: 'hover:border-purple-400 hover:shadow-purple-50',
      button: 'bg-purple-600 hover:bg-purple-700 text-white'
    }
  },
  {
    role: 'DEMO_VIEWER',
    name: 'Evaluation Jury',
    title: 'Demo Viewer',
    organization: 'HSC 2027 Committee',
    accessLevel: '6 Tools • Guided Demo',
    summary: 'Scenario EA-1001 walkthrough & citizen accessible portal.',
    icon: Eye,
    colorScheme: {
      iconBg: 'bg-indigo-100 text-indigo-700',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      borderHover: 'hover:border-indigo-400 hover:shadow-indigo-50',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white'
    }
  }
];

export const DemoLoginPage: React.FC<DemoLoginPageProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between py-6 px-4 sm:px-8 font-sans">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full pb-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                EvacAccess <span className="text-blue-600">India</span>
              </h1>
              <span className="bg-slate-200 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                HSC 2027
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              National Disaster Decision Support &amp; Evacuation Protocol
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 font-medium">Active Simulation:</span>
          <span className="font-bold text-slate-900">Odisha Flood (EA-1001)</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full my-auto py-8">
        {/* Title Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Select Your Operational Identity
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto font-medium">
            Each role grants strict permissions and dedicated operational options tailored to that responder's duty.
          </p>
        </div>

        {/* 5 Compact, Perfectly Aligned Persona Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {DEMO_PERSONAS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.role}
                onClick={() => onSelectRole(p.role, p)}
                className={`bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all duration-150 flex flex-col justify-between text-center cursor-pointer group ${p.colorScheme.borderHover}`}
              >
                <div>
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl mx-auto flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${p.colorScheme.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title & Name */}
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </h3>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {p.organization}
                  </div>

                  {/* Access Badge */}
                  <div className="mt-2.5 mb-3">
                    <span className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${p.colorScheme.badgeBg}`}>
                      {p.accessLevel}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-[11px] text-slate-600 leading-snug min-h-[34px]">
                    {p.summary}
                  </p>
                </div>

                {/* Login Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRole(p.role, p);
                  }}
                  className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer ${p.colorScheme.button}`}
                >
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          EvacAccess India • Hack for Social Cause (HSC) 2027
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-600">
          <span>RPwD Act 2016 (Sec 8)</span>
          <span>•</span>
          <span>NDMP 2019 Certified</span>
        </div>
      </footer>
    </div>
  );
};

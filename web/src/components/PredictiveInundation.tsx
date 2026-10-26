import React, { useState } from 'react';
import {
  Waves, Clock, AlertTriangle, ShieldCheck, TrendingUp,
  MapPin, CheckCircle2, ChevronRight, RefreshCw, Layers,
  Compass, Droplets, Zap, Users
} from 'lucide-react';
import { Shelter, AssistanceRequest } from '../types';

interface PredictiveInundationProps {
  shelters: Shelter[];
  requests: AssistanceRequest[];
  onOpenEvaluator: (req: AssistanceRequest) => void;
}

interface SectorForecast {
  sector: string;
  elevationMeters: number;
  currentDepthCm: number;
  plus1hDepthCm: number;
  plus3hDepthCm: number;
  plus6hDepthCm: number;
  vulnerableCount: number;
  status: 'SAFE' | 'ADVISORY' | 'CRITICAL';
  primaryBarrier: string;
}

export const PredictiveInundation: React.FC<PredictiveInundationProps> = ({
  shelters,
  requests,
  onOpenEvaluator
}) => {
  const [timeStep, setTimeStep] = useState<0 | 1 | 3 | 6>(1);
  const [activeLayer, setActiveLayer] = useState<'depth' | 'wheelchair' | 'medical'>('wheelchair');

  const sectors: SectorForecast[] = [
    {
      sector: 'Sector 1 (Coastal Lowland / Marine Drive)',
      elevationMeters: 1.8,
      currentDepthCm: 35,
      plus1hDepthCm: 48,
      plus3hDepthCm: 72,
      plus6hDepthCm: 110,
      vulnerableCount: 12,
      status: 'CRITICAL',
      primaryBarrier: 'Impassable for all ground vehicles; water depth > 30cm threshold'
    },
    {
      sector: 'Sector 2 (Puri Town Lowlands)',
      elevationMeters: 2.4,
      currentDepthCm: 15,
      plus1hDepthCm: 22,
      plus3hDepthCm: 38,
      plus6hDepthCm: 55,
      vulnerableCount: 8,
      status: 'CRITICAL',
      primaryBarrier: 'Wheelchair curbs submerged; ramp access endangered at 2 shelters'
    },
    {
      sector: 'Sector 3 (District Hospital Corridor)',
      elevationMeters: 3.8,
      currentDepthCm: 5,
      plus1hDepthCm: 8,
      plus3hDepthCm: 14,
      plus6hDepthCm: 25,
      vulnerableCount: 15,
      status: 'ADVISORY',
      primaryBarrier: 'Elevated roadway intact, high-risk for bedridden patient transport'
    },
    {
      sector: 'Sector 4 (Grand Road / Temple Precinct)',
      elevationMeters: 4.5,
      currentDepthCm: 0,
      plus1hDepthCm: 0,
      plus3hDepthCm: 5,
      plus6hDepthCm: 12,
      vulnerableCount: 6,
      status: 'SAFE',
      primaryBarrier: 'Minor runoff; pedestrian & wheelchair movement unrestricted'
    },
    {
      sector: 'Sector 5 (Station Road Overpass Ridge)',
      elevationMeters: 6.2,
      currentDepthCm: 0,
      plus1hDepthCm: 0,
      plus3hDepthCm: 0,
      plus6hDepthCm: 0,
      vulnerableCount: 4,
      status: 'SAFE',
      primaryBarrier: 'High elevation safe evacuation corridor to Jagannath Shelter'
    }
  ];

  const getDepthForStep = (s: SectorForecast) => {
    switch (timeStep) {
      case 0: return s.currentDepthCm;
      case 1: return s.plus1hDepthCm;
      case 3: return s.plus3hDepthCm;
      case 6: return s.plus6hDepthCm;
    }
  };

  const getRiskStatusForStep = (depth: number) => {
    if (depth >= 30) return { label: 'CRITICAL HAZARD', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
    if (depth >= 10) return { label: 'WHEELCHAIR BLOCKED', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    if (depth > 0) return { label: 'CAUTION RUNOFF', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    return { label: 'ACCESSIBLE CORRIDOR', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-900 border border-cyan-500/30 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-600/20">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-wide">Predictive Inundation & Vulnerability Forecaster</h1>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  HYDRO-TOPOGRAPHY AI
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                4-Dimensional hydrological progression modeling cross-referenced with RPwD accessibility limits
              </p>
            </div>
          </div>

          {/* Time Forecast Buttons */}
          <div className="flex items-center space-x-1.5 bg-[#0A1227] border border-cyan-500/30 rounded-xl p-1 text-xs">
            <span className="text-[11px] font-mono text-cyan-300 px-2 flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              TIMELINE:
            </span>
            {([0, 1, 3, 6] as const).map((step) => (
              <button
                key={step}
                onClick={() => setTimeStep(step)}
                className={`px-3 py-1.5 rounded-lg font-bold font-mono transition-all ${
                  timeStep === step
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {step === 0 ? 'NOW (T+0)' : `T+${step}h`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Filters & Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Critical Inundated Sectors</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {timeStep >= 3 ? '3 Sectors Impassable' : '1 Sector Submerged'}
            </div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Preemptive Evacuee Pool</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {timeStep === 0 ? '12 Divyangjan' : timeStep === 1 ? '20 Divyangjan' : '35 Divyangjan'}
            </div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Max Projected Water Depth</div>
            <div className="text-lg font-bold text-amber-300 mt-0.5 font-mono">
              {timeStep === 0 ? '35 cm' : timeStep === 1 ? '48 cm' : timeStep === 3 ? '72 cm' : '110 cm'}
            </div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Safe Corridor Window</div>
            <div className="text-lg font-bold text-emerald-300 mt-0.5 font-mono">
              {timeStep <= 1 ? 'Remaining: 45 mins' : 'Remaining: 18 mins'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table: Micro-Topographical Progression Matrix */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#131F37] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Sector Flood Inundation & Hard-Barrier Matrix (Forecast Horizon: +{timeStep} Hour{timeStep === 1 ? '' : 's'})
            </h2>
          </div>

          {/* Filter Layers */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Risk Filter:</span>
            <button
              onClick={() => setActiveLayer('wheelchair')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeLayer === 'wheelchair' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Wheelchair Limit (&gt;10cm)
            </button>
            <button
              onClick={() => setActiveLayer('medical')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeLayer === 'medical' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Oxygen / Life-Support
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0A1227] text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Zone / Sector Name</th>
                <th className="py-3 px-4">Topography Elevation</th>
                <th className="py-3 px-4">Projected Depth (T+{timeStep}h)</th>
                <th className="py-3 px-4">Status & Mobility Feasibility</th>
                <th className="py-3 px-4">Identified Hard Barrier</th>
                <th className="py-3 px-4 text-right">Preemptive Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {sectors.map((sec, idx) => {
                const depth = getDepthForStep(sec);
                const risk = getRiskStatusForStep(depth);
                return (
                  <tr key={idx} className="hover:bg-[#1A253C] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200 flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{sec.sector}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {sec.vulnerableCount} Registered Divyangjan / Elders
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {sec.elevationMeters}m MSL
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className={`text-sm font-bold ${depth >= 30 ? 'text-red-400' : depth >= 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {depth} cm
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${risk.color}`}>
                        {risk.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs">
                      {sec.primaryBarrier}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {depth >= 10 ? (
                        <button
                          onClick={() => {
                            const matchingReq = requests[0];
                            if (matchingReq) onOpenEvaluator(matchingReq);
                          }}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1 shadow-md shadow-red-600/30"
                        >
                          <span>Preempt Route</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                          Clear Passage
                        </span>
                      )}
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

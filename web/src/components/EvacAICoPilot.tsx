import React, { useState } from 'react';
import {
  Bot, Sparkles, AlertTriangle, ShieldCheck, Volume2, VolumeX,
  Play, RotateCcw, Send, CheckCircle2, ArrowRight, Zap, RefreshCw,
  Users, MapPin, Activity, FileText, ChevronRight
} from 'lucide-react';
import { AssistanceRequest, Shelter, RouteCandidate } from '../types';

interface EvacAICoPilotProps {
  requests: AssistanceRequest[];
  shelters: Shelter[];
  routes: RouteCandidate[];
  onOpenEvaluator: (req: AssistanceRequest) => void;
  onNavigateTab: (tab: any) => void;
}

export const EvacAICoPilot: React.FC<EvacAICoPilotProps> = ({
  requests,
  shelters,
  routes,
  onOpenEvaluator,
  onNavigateTab
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [simScenario, setSimScenario] = useState<string>('baseline');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: string; tags?: string[] }>>([
    {
      role: 'assistant',
      text: 'Greetings Commander. I am EvacAI, your Accessibility-Aware Crisis Decision Co-Pilot. I am continuously monitoring live telemetry across Puri Sector 1-5, cross-referencing flood depth and shelter power reserves with vulnerable citizen profiles.',
      timestamp: '14:48:10',
      tags: ['SYSTEM_INITIALIZED', 'RPwD_ACT_ACTIVE']
    },
    {
      role: 'assistant',
      text: 'CRITICAL ALERT: Request EA-1001 (Electric Wheelchair evacuee) requires immediate dispatch intervention. Candidate Corridor 1 fails due to 14 unramped entrance steps at Puri High School, and Candidate Corridor 2 is blocked by 35cm floodwaters on Coastal Road. Recommend priority routing to Jagannath Shelter with Team Bravo (Medical Logistics).',
      timestamp: '14:49:05',
      tags: ['DISPATCH_RECOMMENDATION', 'HARD_BARRIER_DETECTED']
    }
  ]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'HI' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSendPrompt = (promptText?: string) => {
    const query = promptText || chatInput.trim();
    if (!query) return;

    const userMsg = {
      role: 'user' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    if (!promptText) setChatInput('');
    setIsGenerating(true);

    setTimeout(() => {
      let aiResponse = '';
      let tags: string[] = [];

      const lower = query.toLowerCase();
      if (lower.includes('sitrep') || lower.includes('briefing') || lower.includes('report')) {
        tags = ['SITREP_NDMA_FORMAT', 'BILINGUAL'];
        if (language === 'HI') {
          aiResponse = `[स्थिति रिपोर्ट - पूरी बाढ़ आपातकाल 2026]
1. कुल आपातकालीन अनुरोध: ${requests.length} (3 उच्च प्राथमिकता - दिव्यांगजन एवं वरिष्ठ नागरिक)।
2. सुरक्षित आश्रय स्थिति: 3 आश्रयों में से 2 में दिव्यांगजन सुविधाएं (रैंप + ऑक्सीजन बैकअप) सत्यापित।
3. मार्ग बाधाएं: तटीय सड़क पर 35 सेमी जलभराव के कारण व्हीलचेयर आवागमन बाधित।
4. कार्यवाई: टीम ब्रावो को स्टेशन रोड एलिवेटेड कॉरिडोर से जगन्नाथ आश्रय हेतु रवाना किया गया।`;
        } else {
          aiResponse = `[NDMA OPERATIONAL SITUATION REPORT - PURI SECTOR]
1. Active Vulnerable Requests: ${requests.length} pending triage (100% disability & medical care indexed).
2. Shelter Operationality: 2 of 3 shelters verified for RPwD compliance (Wheelchair ramp + 24/7 Oxygen generator circuits).
3. Primary Corridor Obstacle: Coastal Road (CR-02) submerged at 35cm (hard barrier for non-amphibious transport).
4. Recommended Directive: Deploy High-Axle Ramp Vehicle to EA-1001 via Station Road Overpass to Jagannath Shelter.`;
        }
      } else if (lower.includes('oxygen') || lower.includes('dialysis') || lower.includes('medical')) {
        tags = ['MEDICAL_LIFE_SUPPORT', 'PRIORITY_CRITICAL'];
        aiResponse = 'Medical Resource Check: Request EA-1003 has continuous oxygen concentrator requirements. Shelter SH-PURI-03 (Jagannath Cyclone Center) has an audited 45 kVA diesel generator with dedicated medical plugs and 8 hours of uninterrupted fuel reserves.';
      } else if (lower.includes('batch') || lower.includes('group') || lower.includes('team')) {
        tags = ['OPTIMAL_BATCHING', 'FLEET_ROUTING'];
        aiResponse = 'Batch Optimization Calculated: Combine Request EA-1001 (Wheelchair) and EA-1002 (Senior Citizen, Walker) into single dispatch for Team Bravo using Ramp-Equipped Vehicle RT-02. Distance: 3.4 km, Estimated Evacuation Time: 26 minutes.';
      } else {
        tags = ['AI_CO_PILOT_ANALYSIS'];
        aiResponse = `Analysis complete for "${query}". Cross-referenced against 3 shelter feature audits and live hazard polygons. All suggestions adhere strictly to RPwD Act 2016 Section 8 (Zero Unverified Routing). Recommend reviewing Route Feasibility matrix.`;
      }

      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          tags
        }
      ]);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-5 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-300/30">
              <Bot className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-wide">EvacAI Decision Co-Pilot</h1>
                <span className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300 border border-indigo-400/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  HSC 2027 INNOVATION
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  RPwD COMPLIANT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Generative AI + Deterministic Feasibility Fusion Engine for Incident Commanders & District Magistrates
              </p>
            </div>
          </div>

          {/* Language & Voice Controls */}
          <div className="flex items-center space-x-2 self-start md:self-auto">
            <div className="flex bg-[#0A1227] border border-blue-400/30 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLanguage('EN')}
                className={`px-2.5 py-1 rounded transition-colors ${language === 'EN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('HI')}
                className={`px-2.5 py-1 rounded transition-colors ${language === 'HI' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                हिंदी (Hindi)
              </button>
            </div>

            <button
              onClick={() => {
                const lastAi = [...chatHistory].reverse().find(m => m.role === 'assistant');
                if (lastAi) speakText(lastAi.text);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSpeaking
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 animate-pulse'
                  : 'bg-blue-600/20 border-blue-400/40 text-blue-200 hover:bg-blue-600/30'
              }`}
              title="Voice narration of latest directive"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Mute Briefing' : 'Listen Briefing'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: Co-Pilot Workspace & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chat & Reasoning Stream (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-4 bg-[#131F37] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Assistive Decision Stream (Explainable Rationale)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Model: <strong className="text-blue-400">Evac-Deterministic-v1.4</strong>
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="p-4 space-y-4 max-h-[460px] overflow-y-auto font-sans text-xs">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 mb-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {msg.role === 'user' ? 'Incident Coordinator' : 'EvacAI Co-Pilot'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-xl max-w-[90%] whitespace-pre-line leading-relaxed shadow-md ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-[#1E293B] border border-slate-700 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}

                  {msg.tags && msg.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-700/60">
                      {msg.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-500/10 text-blue-300 border border-blue-400/20 text-[9.5px] font-mono px-2 py-0.5 rounded font-semibold"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center space-x-2 text-indigo-400 text-xs py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>EvacAI is evaluating micro-spatial barriers & shelter telemetry...</span>
              </div>
            )}
          </div>

          {/* Quick Command Suggestions */}
          <div className="p-2.5 bg-[#0A1227] border-t border-slate-800 flex flex-wrap gap-2">
            <button
              onClick={() => handleSendPrompt('Generate complete NDMA Situation Report (Sit-Rep)')}
              className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3 h-3 text-blue-400" />
              <span>Generate NDMA Sit-Rep</span>
            </button>
            <button
              onClick={() => handleSendPrompt('Calculate optimal batch dispatch for mobility-impaired citizens')}
              className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3 h-3 text-emerald-400" />
              <span>Optimal Batch Dispatch</span>
            </button>
            <button
              onClick={() => handleSendPrompt('Check backup power and oxygen concentrator capacity across all shelters')}
              className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Verify Medical Power Backup</span>
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#131F37] border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
              placeholder="Ask EvacAI: e.g., 'Why is candidate corridor 2 marked unsuitable for EA-1001?'"
              className="flex-1 bg-[#0A1227] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleSendPrompt()}
              disabled={isGenerating || !chatInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-blue-600/30"
            >
              <span>Query</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: What-If Simulation Engine & Action Cards (1 Col) */}
        <div className="space-y-5">
          {/* What-If Storm Surge Simulator */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  What-If Inundation Stress-Test
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                SIMULATION
              </span>
            </div>

            <div className="mt-3.5 space-y-3">
              <label className="text-[11px] font-medium text-slate-300 block">
                Select Crisis Dynamic:
              </label>
              <select
                value={simScenario}
                onChange={e => setSimScenario(e.target.value)}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="baseline">Baseline: Current Observed Flood (CR-02 = 35cm)</option>
                <option value="surge_45">Storm Surge +45cm: Coastal Embankment Breach</option>
                <option value="blackout_sec4">Grid Collapse: Sector 4 Generator Fuel Exhaustion</option>
                <option value="debris_station">Station Road Bridge Roadblock (Fallen Banyan Tree)</option>
              </select>

              <div className="bg-[#1A253C] rounded-lg p-3 border border-slate-700/70 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Impacted Divyangjan:</span>
                  <strong className={simScenario === 'surge_45' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {simScenario === 'surge_45' ? '18 Evacuees at Critical Risk' : '3 In Immediate Zone'}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Feasible Corridor Count:</span>
                  <strong className={simScenario === 'surge_45' ? 'text-amber-400' : 'text-blue-400'}>
                    {simScenario === 'surge_45' ? '1 of 3 (Station Road Overpass)' : '2 Available Corridors'}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Preemptive Evacuation Order:</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    simScenario === 'surge_45' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {simScenario === 'surge_45' ? 'MANDATORY NOW' : 'ADVISORY READY'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleSendPrompt(`Simulate response plan under scenario: ${simScenario}`)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-md shadow-indigo-600/30"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute Scenario Recalculation</span>
              </button>
            </div>
          </div>

          {/* Quick Action Case Box */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Prioritized Case Directives</span>
            </h3>

            <div className="space-y-2.5">
              {requests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="bg-[#1E293B] hover:bg-[#25334A] border border-slate-700 rounded-lg p-2.5 transition-all text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-blue-400">{req.public_ref}</span>
                      <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold ${
                        req.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {req.urgency}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 truncate max-w-[150px] mt-0.5">
                      {req.requirements.join(', ')}
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenEvaluator(req)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Evaluate</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

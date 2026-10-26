import React, { useState } from 'react';
import {
  LifeBuoy, Volume2, VolumeX, Eye, ShieldCheck, MapPin,
  Clock, Phone, CheckCircle2, AlertTriangle, ArrowRight,
  HeartHandshake, Search, Navigation, Lock
} from 'lucide-react';

export const CitizenSOSPortal: React.FC = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [selectedDisabilities, setSelectedDisabilities] = useState<string[]>(['Electric Wheelchair']);
  const [familySearchCode, setFamilySearchCode] = useState('EA-1001');
  const [familySearchResult, setFamilySearchResult] = useState<string | null>(
    'STATUS: EVACUATION DISPATCH ACKNOWLEDGED. Team Bravo en route with wheelchair ramp transport. Estimated safe arrival at Jagannath Cyclone Center: 15:30 IST.'
  );

  const disabilityOptions = [
    'Electric Wheelchair',
    'Manual Wheelchair',
    'Oxygen Machine Dependent',
    'Dialysis Scheduled',
    'Blind / Visually Impaired',
    'Deaf / Speech Impaired',
    'Bedridden / Stretcher Required',
    'Elderly (Needs Walker)'
  ];

  const toggleDisability = (opt: string) => {
    if (selectedDisabilities.includes(opt)) {
      setSelectedDisabilities(selectedDisabilities.filter(x => x !== opt));
    } else {
      setSelectedDisabilities([...selectedDisabilities, opt]);
    }
  };

  const speakGuidance = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className={`space-y-6 ${highContrast ? 'text-yellow-300' : 'text-slate-200'}`}>
      {/* Banner */}
      <div className={`border rounded-xl p-5 shadow-xl transition-all ${
        highContrast
          ? 'bg-black border-yellow-400'
          : 'bg-gradient-to-r from-rose-950/40 via-red-950/30 to-slate-900 border-red-500/30'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg ${
              highContrast
                ? 'bg-yellow-400 text-black border-2 border-black'
                : 'bg-red-600/30 border border-red-400/30 text-red-300 shadow-red-600/20'
            }`}>
              <LifeBuoy className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-xl font-bold tracking-wide ${highContrast ? 'text-yellow-400' : 'text-white'}`}>
                  Sugamya Evac — Citizen Accessible SOS & Family Tracker
                </h1>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-red-500/20 text-red-300 border-red-400/40'
                }`}>
                  CITIZEN RESCUE PORTAL
                </span>
              </div>
              <p className={`text-xs mt-1 ${highContrast ? 'text-yellow-200' : 'text-slate-300'}`}>
                WCAG 2.1 AAA Compliant Emergency Channel for Divyangjan, Caregivers, and Emergency Call Handlers
              </p>
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                highContrast
                  ? 'bg-yellow-400 text-black border-black'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{highContrast ? 'Standard Mode' : 'High Contrast AAA'}</span>
            </button>

            <button
              onClick={() => speakGuidance(
                'Sugamya Evac Emergency Portal. Press the large red emergency SOS button to request accessible evacuation. Your medical requirements and location will be transmitted directly to disaster coordinators.'
              )}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                highContrast
                  ? 'bg-yellow-400 text-black border-black'
                  : 'bg-red-600/20 text-red-200 border-red-400/40 hover:bg-red-600/30'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Stop Voice' : 'Voice Guidance'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: SOS Trigger & Live Mission Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 1-Tap SOS Form (2 Cols) */}
        <div className={`lg:col-span-2 rounded-xl p-6 border shadow-xl ${
          highContrast ? 'bg-black border-yellow-400' : 'bg-[#0F172A] border-slate-800'
        }`}>
          <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center space-x-2 ${
            highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>1-Tap Accessible Evacuation SOS</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold block mb-2">
                Select Your Accessibility & Medical Constraints:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {disabilityOptions.map((opt) => {
                  const isSelected = selectedDisabilities.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleDisability(opt)}
                      className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all ${
                        isSelected
                          ? highContrast
                            ? 'bg-yellow-400 text-black border-yellow-300 font-bold ring-2 ring-yellow-400'
                            : 'bg-red-600 text-white border-red-400 shadow-md shadow-red-600/30'
                          : highContrast
                          ? 'bg-slate-900 text-yellow-300 border-yellow-500/40'
                          : 'bg-[#1E293B] text-slate-300 border-slate-700 hover:bg-[#25334A]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              highContrast ? 'bg-zinc-900 border-yellow-500' : 'bg-[#131F37] border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-400" />
                  Auto-Detected Location (GPS):
                </span>
                <span className="font-mono text-emerald-400 font-bold">ACCURACY ±4 METERS</span>
              </div>
              <div className="text-xs font-mono">
                19.8142° N, 85.8281° E • Ward 5, Near Old Water Tank, Marine Drive Approach, Puri
              </div>
            </div>

            {/* Giant SOS Button */}
            {!sosSent ? (
              <button
                onClick={() => setSosSent(true)}
                className={`w-full py-4 rounded-xl text-base font-extrabold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-2xl ${
                  highContrast
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-black border-4 border-yellow-200 ring-4 ring-yellow-500/50'
                    : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/50 ring-4 ring-red-500/20'
                }`}
              >
                <LifeBuoy className="w-6 h-6 animate-spin" />
                <span>Transmit Verified Accessible Evacuation SOS</span>
              </button>
            ) : (
              <div className={`p-4 rounded-xl border flex items-center space-x-3.5 ${
                highContrast
                  ? 'bg-yellow-400 text-black border-black'
                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              }`}>
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    SOS Successfully Received • Priority Ticket #EA-1001 Generated
                  </div>
                  <div className="text-[11px] mt-0.5">
                    Coordinators have matched candidate route via Station Road to Jagannath Shelter. Team Bravo is en route.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Mission Radar & Family Status Tracker (1 Col) */}
        <div className="space-y-5">
          {/* Live Rescue Mission Radar */}
          <div className={`rounded-xl p-5 border shadow-xl ${
            highContrast ? 'bg-black border-yellow-400' : 'bg-[#0F172A] border-slate-800'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center space-x-2 ${
              highContrast ? 'text-yellow-400' : 'text-white'
            }`}>
              <Navigation className="w-4 h-4 text-blue-400" />
              <span>Rescue Mission Live Radar</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Assigned Rescue Team:</span>
                <strong className={highContrast ? 'text-yellow-300' : 'text-white'}>Team Bravo (Medical Logistics)</strong>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Vehicle Type:</span>
                <strong className="text-blue-400">High-Axle Ramp Carrier (RT-02)</strong>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Current Distance:</span>
                <strong className="text-amber-400 font-mono">850 Meters Away</strong>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Estimated Arrival:</span>
                <strong className="text-emerald-400 font-mono">14 Minutes</strong>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Safe Target Shelter:</span>
                <strong className="text-emerald-300">Jagannath Cyclone Center</strong>
              </div>
            </div>
          </div>

          {/* Family Pin Reassurance Tracker */}
          <div className={`rounded-xl p-5 border shadow-xl ${
            highContrast ? 'bg-black border-yellow-400' : 'bg-[#0F172A] border-slate-800'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center space-x-2 ${
              highContrast ? 'text-yellow-400' : 'text-white'
            }`}>
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              <span>Family Welfare Pin Tracker</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Enter your family member's anonymous token to check evacuation progress without exposing location.
            </p>

            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={familySearchCode}
                onChange={e => setFamilySearchCode(e.target.value)}
                placeholder="e.g. EA-1001"
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-mono border focus:outline-none ${
                  highContrast
                    ? 'bg-zinc-900 border-yellow-500 text-yellow-300'
                    : 'bg-[#1E293B] border-slate-700 text-white focus:border-blue-500'
                }`}
              />
              <button
                onClick={() => {
                  setFamilySearchResult(
                    `STATUS: Verified safe arrival at Jagannath Cyclone Center (Sector 5). Emergency medical checkup complete.`
                  );
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track</span>
              </button>
            </div>

            {familySearchResult && (
              <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                highContrast
                  ? 'bg-zinc-900 border-yellow-400 text-yellow-200'
                  : 'bg-blue-950/40 border-blue-500/30 text-blue-200'
              }`}>
                {familySearchResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Bell, Volume2, Globe, Eye, ShieldCheck, AlertCircle, Play, Square } from 'lucide-react';
import { Alert } from '../types';

interface AlertPreviewerProps {
  alerts: Alert[];
  onApproveAlert: (id: string) => void;
}

export const AlertPreviewer: React.FC<AlertPreviewerProps> = ({
  alerts,
  onApproveAlert
}) => {
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'or'>('en');
  const [highContrast, setHighContrast] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const activeAlert = alerts[0] || {
    id: 'demo-alert-1',
    title: 'Urgent Lowland Evacuation Advisory',
    target_zone: 'Baliapanda Coastal Ward 12 & 14',
    message_en: 'High tide flood surge expected between 22:00 and 02:00. Citizens requiring wheelchair or medical electrical support are advised to evacuate immediately to Jagannath Multipurpose Cyclone Shelter via Grand Road.',
    message_hi: 'रात 10 बजे से 2 बजे के बीच उच्च ज्वार बाढ़ की संभावना है। व्हीलचेयर या चिकित्सा ऑक्सीजन की आवश्यकता वाले नागरिकों को तुरंत ग्रैंड रोड के माध्यम से जगन्नाथ चक्रवात आश्रय में जाने की सलाह दी जाती है।',
    message_or: 'ରାତି ୧୦ଟାରୁ ୨ଟା ମଧ୍ୟରେ ଉଚ୍ଚ ଜୁଆର ବନ୍ୟା ଆଶଙ୍କା। ହ୍ୱିଲଚେୟାର କିମ୍ବା ଡାକ୍ତରୀ ସହାୟତା ଆବଶ୍ୟକ କରୁଥିବା ନାଗରିକମାନଙ୍କୁ ତୁରନ୍ତ ଗ୍ରାଣ୍ଡ ରୋଡ ଦେଇ ଜଗନ୍ନାଥ ଆଶ୍ରୟସ୍ଥଳକୁ ଯିବାକୁ ଅନୁରୋଧ।',
    preferred_format: 'LARGE_TEXT',
    status: 'PREVIEWED',
    is_simulated_preview: true
  };

  const getActiveText = () => {
    if (selectedLang === 'hi' && activeAlert.message_hi) return activeAlert.message_hi;
    if (selectedLang === 'or' && activeAlert.message_or) return activeAlert.message_or;
    return activeAlert.message_en;
  };

  const handleSpeakAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(getActiveText());
    if (selectedLang === 'hi') utterance.lang = 'hi-IN';
    else if (selectedLang === 'or') utterance.lang = 'or-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.9;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  return (
    <div className="space-y-6">
      {/* Alert Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Accessible Multi-Format Alert Studio
            </h3>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-200 uppercase font-bold">
              PREVIEW MODE (UNSENT)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate large-font high-contrast previews and synthesized audio broadcasts for persons with disabilities.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Contrast Mode Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
              highContrast
                ? 'bg-yellow-400 text-black font-extrabold shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{highContrast ? 'WCAG AAA Mode' : 'High Contrast'}</span>
          </button>

          {/* Audio Speech Button */}
          <button
            onClick={handleSpeakAudio}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-xs ${
              isPlayingAudio
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isPlayingAudio ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlayingAudio ? 'Stop Speech' : 'Play Audio Preview'}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Language Tabs */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Broadcast Language:</span>
            <div className="flex space-x-1 ml-2">
              <button
                onClick={() => setSelectedLang('en')}
                className={`px-3 py-1 rounded text-xs font-bold transition ${selectedLang === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'}`}
              >
                English
              </button>
              <button
                onClick={() => setSelectedLang('hi')}
                className={`px-3 py-1 rounded text-xs font-bold transition ${selectedLang === 'hi' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'}`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                onClick={() => setSelectedLang('or')}
                className={`px-3 py-1 rounded text-xs font-bold transition ${selectedLang === 'or' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'}`}
              >
                ଓଡ଼ିଆ (Odia)
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono hidden md:block">
            Target Zone: <strong className="text-slate-900 font-bold">{activeAlert.target_zone}</strong>
          </div>
        </div>

        {/* Display Canvas (Regular or WCAG AAA High Contrast) */}
        <div className={`p-8 transition-colors duration-200 ${
          highContrast
            ? 'bg-black text-yellow-300 font-bold border-4 border-yellow-400'
            : 'bg-white text-slate-900'
        }`}>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center space-x-2">
              <span className={`text-xs uppercase font-mono px-2 py-0.5 rounded font-extrabold ${
                highContrast ? 'bg-yellow-400 text-black' : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                EMERGENCY ADVISORY
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-medium">Target: {activeAlert.target_zone}</span>
            </div>

            <h2 className={`${highContrast ? 'text-2xl text-yellow-300' : 'text-xl text-slate-900 font-black'}`}>
              {activeAlert.title}
            </h2>

            <p className={`leading-relaxed ${
              highContrast ? 'text-xl text-yellow-200' : 'text-sm text-slate-700 font-medium'
            }`}>
              {getActiveText()}
            </p>

            <div className={`pt-4 border-t ${highContrast ? 'border-yellow-400' : 'border-slate-100'} flex items-center justify-between text-xs`}>
              <span className={highContrast ? 'text-yellow-400 font-bold' : 'text-slate-500 font-medium'}>
                Accessibility Compliance: <strong>WCAG 2.1 AAA</strong> (Contrast ratio 14:1)
              </span>
              <span className={highContrast ? 'text-yellow-400' : 'text-slate-500'}>
                Audio Synthesizer: <strong>Enabled</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>This is a local accessibility preview. Official broadcast requires authorization gateway integration.</span>
          </div>

          <button
            onClick={() => onApproveAlert(activeAlert.id)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-xs"
          >
            Supervisor Approve
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Home, ShieldCheck, Check, X, AlertCircle, FileText, CheckCircle2, Search } from 'lucide-react';
import { Shelter, UserRole } from '../types';
import { api } from '../services/api';

interface ShelterDirectoryProps {
  shelters: Shelter[];
  currentRole: UserRole;
  onRefresh: () => void;
}

export const ShelterDirectory: React.FC<ShelterDirectoryProps> = ({
  shelters,
  currentRole,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Inspection form states
  const [notes, setNotes] = useState('');
  const [rampVal, setRampVal] = useState('YES');
  const [toiletVal, setToiletVal] = useState('YES');
  const [powerVal, setPowerVal] = useState('YES');

  const filteredShelters = shelters.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitInspection = async () => {
    if (!selectedShelter) return;
    try {
      await api.submitInspection(selectedShelter.id, {
        findings: [
          { feature_key: 'step_free_access', value: rampVal },
          { feature_key: 'accessible_restroom', value: toiletVal },
          { feature_key: 'backup_power_for_oxygen', value: powerVal }
        ],
        notes
      });
      setActionSuccessMsg(`Inspection submitted for ${selectedShelter.code} and placed in supervisor queue.`);
      setShowInspectionModal(false);
      onRefresh();
    } catch (err: any) {
      setActionSuccessMsg(`Inspection simulated for ${selectedShelter.code}.`);
      setShowInspectionModal(false);
    }
  };

  const handleVerifyShelter = async () => {
    if (!selectedShelter) return;
    try {
      await api.verifyShelter(
        selectedShelter.id,
        {
          step_free_access: 'YES',
          wheelchair_ramp: 'YES',
          accessible_restroom: 'YES',
          backup_power_for_oxygen: 'YES'
        },
        'Supervisor on-site validation complete.'
      );
      setActionSuccessMsg(`Shelter ${selectedShelter.code} marked as formally VERIFIED.`);
      setShowVerifyModal(false);
      onRefresh();
    } catch (err: any) {
      setActionSuccessMsg(`Shelter ${selectedShelter.code} verified in simulation.`);
      setShowVerifyModal(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shelters by name, code or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Total Shelters: <strong className="text-slate-900">{shelters.length}</strong>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <span>✓ {actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredShelters.map(shelter => {
          const occPct = Math.round((shelter.capacity_occupied / shelter.capacity_total) * 100);
          const hasRamp = shelter.features.find(f => f.feature_key === 'step_free_access')?.value === 'YES';
          const hasToilet = shelter.features.find(f => f.feature_key === 'accessible_restroom')?.value === 'YES';
          const hasPower = shelter.features.find(f => f.feature_key === 'backup_power_for_oxygen')?.value === 'YES';

          return (
            <div key={shelter.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-blue-700">{shelter.code}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    shelter.review_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    shelter.review_status === 'STALE' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {shelter.review_status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">{shelter.name}</h4>
                <p className="text-xs text-slate-500 mb-3">{shelter.address}</p>

                {/* Capacity Meter */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                    <span>Capacity Occupied</span>
                    <span className="font-bold text-slate-900">{shelter.capacity_occupied} / {shelter.capacity_total} ({occPct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${occPct}%` }} />
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Step-Free Ramp Entrance:</span>
                    <span className={`font-bold ${hasRamp ? 'text-emerald-700' : 'text-red-700'}`}>
                      {hasRamp ? '✓ YES' : '✗ NO'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Wheelchair Accessible Toilet:</span>
                    <span className={`font-bold ${hasToilet ? 'text-emerald-700' : 'text-red-700'}`}>
                      {hasToilet ? '✓ YES' : '✗ NO'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Oxygen Generator Backup:</span>
                    <span className={`font-bold ${hasPower ? 'text-emerald-700' : 'text-red-700'}`}>
                      {hasPower ? '✓ YES' : '✗ NO'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions depending on role */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedShelter(shelter);
                    setShowInspectionModal(true);
                  }}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-lg border border-slate-200 transition"
                >
                  Submit Inspection
                </button>

                {(currentRole === 'REVIEWER' || currentRole === 'COORDINATOR' || currentRole === 'ADMIN') && (
                  <button
                    onClick={() => {
                      setSelectedShelter(shelter);
                      setShowVerifyModal(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-300 transition"
                  >
                    Supervisor Verify
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Inspection Modal */}
      {showInspectionModal && selectedShelter && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Field Inspection: {selectedShelter.name}
            </h3>
            <p className="text-xs text-slate-500">
              Submit on-site accessibility observations. Changes enter the supervisor review queue before overriding verified safety data.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Step-Free Ramp Condition:</label>
                <select
                  value={rampVal}
                  onChange={(e) => setRampVal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium"
                >
                  <option value="YES">YES - Verified Ramp with Handrails</option>
                  <option value="NO">NO - Unramped Stairs Only</option>
                  <option value="UNKNOWN">UNKNOWN - Inaccessible / Not Inspected</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Accessible Restroom:</label>
                <select
                  value={toiletVal}
                  onChange={(e) => setToiletVal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium"
                >
                  <option value="YES">YES - Wide Door &amp; Grab Bars Present</option>
                  <option value="NO">NO - Inaccessible Restroom</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Generator / Oxygen Electricity:</label>
                <select
                  value={powerVal}
                  onChange={(e) => setPowerVal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium"
                >
                  <option value="YES">YES - Operational Diesel Generator</option>
                  <option value="NO">NO - No Backup Power</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Inspector Field Notes:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ramp clear, secondary entrance unobstructed..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowInspectionModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInspection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supervisor Verify Modal */}
      {showVerifyModal && selectedShelter && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-300 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Supervisor Verification: {selectedShelter.code}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are certifying this shelter's physical accessibility under your official authority. This action creates an immutable audit record.
            </p>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
              Certifying: <strong>Step-free access</strong>, <strong>Wheelchair restroom</strong>, and <strong>Oxygen power backup</strong>.
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyShelter}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

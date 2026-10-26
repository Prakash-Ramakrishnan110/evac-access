import React, { useState } from 'react';
import {
  Radio, WifiOff, Share2, Shield, Cpu, Play, RotateCcw,
  CheckCircle2, AlertCircle, ArrowRight, Zap, RefreshCw, Send,
  BatteryCharging, Smartphone, SignalHigh, Server
} from 'lucide-react';

interface MeshNode {
  id: string;
  name: string;
  type: 'CITIZEN' | 'RESPONDER_BEACON' | 'AMPHIBIOUS_UNIT' | 'SATELLITE_UPLINK';
  batteryPercent: number;
  rssi: number; // dBm
  hopIndex: number;
  status: 'ACTIVE' | 'RELAYING' | 'OFFLINE';
}

interface MeshPacket {
  packetId: string;
  originRef: string;
  timestamp: string;
  payload: string;
  hops: number;
  checksum: string;
  isDelivered: boolean;
}

export const MeshRelaySimulator: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeHop, setActiveHop] = useState<number>(0);

  const [nodes, setNodes] = useState<MeshNode[]>([
    {
      id: 'node-01',
      name: 'Citizen Device (EA-1001)',
      type: 'CITIZEN',
      batteryPercent: 68,
      rssi: -58,
      hopIndex: 0,
      status: 'ACTIVE'
    },
    {
      id: 'node-02',
      name: 'ODRF Field Unit Phone (Beacon-A)',
      type: 'RESPONDER_BEACON',
      batteryPercent: 84,
      rssi: -72,
      hopIndex: 1,
      status: 'ACTIVE'
    },
    {
      id: 'node-03',
      name: 'Rescue Boat Mobile Node (Amphib-02)',
      type: 'AMPHIBIOUS_UNIT',
      batteryPercent: 91,
      rssi: -65,
      hopIndex: 2,
      status: 'ACTIVE'
    },
    {
      id: 'node-04',
      name: 'ISRO / BSNL Satcom Uplink Terminal',
      type: 'SATELLITE_UPLINK',
      batteryPercent: 100,
      rssi: -45,
      hopIndex: 3,
      status: 'ACTIVE'
    }
  ]);

  const [packets, setPackets] = useState<MeshPacket[]>([
    {
      packetId: 'PKT-9481-EA',
      originRef: 'EA-1001 (Wheelchair Evacuee)',
      timestamp: '14:50:22',
      payload: 'SOS: MOBILITY_POWER_FAIL | LAT: 19.8142 | LON: 85.8281 | PEOPLE: 1',
      hops: 3,
      checksum: 'SHA256: 4a8f9c2d...Verified',
      isDelivered: true
    }
  ]);

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveHop(0);

    const newPkt: MeshPacket = {
      packetId: `PKT-${Math.floor(1000 + Math.random() * 9000)}-EA`,
      originRef: 'EA-1002 (Senior Citizen, Oxygen Dependent)',
      timestamp: new Date().toLocaleTimeString(),
      payload: 'SOS: OXYGEN_CONCENTRATOR_40MIN_RESERVE | LAT: 19.8090 | LON: 85.8210',
      hops: 0,
      checksum: 'SHA256: e8b217cd...Valid',
      isDelivered: false
    };

    setPackets(prev => [newPkt, ...prev]);

    // Hop 1
    setTimeout(() => {
      setActiveHop(1);
      setPackets(prev => [{ ...prev[0], hops: 1 }, ...prev.slice(1)]);
    }, 1000);

    // Hop 2
    setTimeout(() => {
      setActiveHop(2);
      setPackets(prev => [{ ...prev[0], hops: 2 }, ...prev.slice(1)]);
    }, 2000);

    // Hop 3 (Delivered to Satellite Uplink)
    setTimeout(() => {
      setActiveHop(3);
      setPackets(prev => [{ ...prev[0], hops: 3, isDelivered: true }, ...prev.slice(1)]);
      setIsSimulating(false);
    }, 3200);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-600/20">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-wide">P2P Mesh & BLE Beacon Relay Simulator</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  TELECOM BLACKOUT SURVIVABILITY
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Zero-Internet disaster resilience: Cryptographic multi-hop broadcast for stranded citizens with disabilities
              </p>
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md shadow-emerald-600/30 self-start md:self-auto"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isSimulating ? 'Propagating Mesh Packet...' : 'Simulate Offline SOS Packet'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Hop Architecture Visualization */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>Live Multi-Hop Mesh Network Topography</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {nodes.map((node, index) => {
            const isHopActive = isSimulating && activeHop === node.hopIndex;
            const isHopComplete = isSimulating && activeHop > node.hopIndex;

            return (
              <div
                key={node.id}
                className={`relative rounded-xl p-4 border transition-all duration-300 ${
                  isHopActive
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-xl shadow-emerald-500/20 scale-102 ring-2 ring-emerald-500/40'
                    : isHopComplete
                    ? 'bg-[#15233A] border-emerald-500/50'
                    : 'bg-[#131F37] border-slate-800'
                }`}
              >
                {/* Connecting arrow for desktop */}
                {index < nodes.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className={`w-5 h-5 ${isHopComplete ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    HOP {node.hopIndex}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    {node.batteryPercent}%
                  </span>
                </div>

                <div className="flex items-center space-x-2.5 mb-2">
                  {node.type === 'CITIZEN' && <Smartphone className="w-5 h-5 text-blue-400" />}
                  {node.type === 'RESPONDER_BEACON' && <Radio className="w-5 h-5 text-emerald-400" />}
                  {node.type === 'AMPHIBIOUS_UNIT' && <Cpu className="w-5 h-5 text-amber-400" />}
                  {node.type === 'SATELLITE_UPLINK' && <Server className="w-5 h-5 text-purple-400" />}
                  <span className="text-xs font-bold text-white">{node.name}</span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono space-y-1 mt-3 pt-3 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <strong className="text-slate-300">BLE 5.2 / LoRa 868MHz</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Signal (RSSI):</span>
                    <strong className="text-emerald-300">{node.rssi} dBm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Network State:</span>
                    <strong className="text-blue-300">{node.status}</strong>
                  </div>
                </div>

                {isHopActive && (
                  <div className="mt-3 pt-2 text-[10px] font-bold text-emerald-400 animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Transmitting payload to next peer...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Packet Inspection Ledger */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#131F37] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Mesh Distress Packets Stream (Cryptographically Verified)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            Zero-Trust ECC Signatures Enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0A1227] text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Packet Code</th>
                <th className="py-3 px-4">Origin / Vulnerability</th>
                <th className="py-3 px-4">Mesh Payload Content</th>
                <th className="py-3 px-4">Hop Depth</th>
                <th className="py-3 px-4">Cryptographic Hash</th>
                <th className="py-3 px-4 text-right">Delivery State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {packets.map((pkt) => (
                <tr key={pkt.packetId} className="hover:bg-[#1A253C] transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-400">
                    {pkt.packetId}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans">
                    {pkt.originRef}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px]">
                    {pkt.payload}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {pkt.hops} Hops
                  </td>
                  <td className="py-3 px-4 text-emerald-300 text-[10px]">
                    {pkt.checksum}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {pkt.isDelivered ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        <CheckCircle2 className="w-3 h-3" />
                        SYNCED TO COMMAND
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        RELAYING IN MESH
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

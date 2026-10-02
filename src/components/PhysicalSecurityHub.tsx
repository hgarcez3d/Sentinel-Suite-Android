import React, { useState } from 'react';
import { PhysicalSecurityState, SystemAuditMetric } from '../types/agents';
import { ProximityRadar } from './ProximityRadar';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Radio,
  EyeOff,
  Flame,
  AlertTriangle,
  Lock,
  Unlock,
  MapPin,
  Crosshair,
  Compass,
  Sliders,
  Bell,
  Cpu,
  RefreshCw,
  HardDrive,
  Mic,
  Camera,
  Power,
  Zap,
  Activity,
  WifiOff
} from 'lucide-react';

interface PhysicalSecurityHubProps {
  physicalSec: PhysicalSecurityState;
  systemMetrics: SystemAuditMetric;
  onToggleAntiTamper: () => void;
  onToggleBlackout: () => void;
  onOpenRapidFill: () => void;
  onUpdateGeofence?: (meters: number) => void;
  onToggleAirGap?: () => void;
  onOpenInterceptor?: () => void;
  isAirGapActive?: boolean;
}

export const PhysicalSecurityHub: React.FC<PhysicalSecurityHubProps> = ({
  physicalSec,
  systemMetrics,
  onToggleAntiTamper,
  onToggleBlackout,
  onOpenRapidFill,
  onUpdateGeofence,
  onToggleAirGap,
  onOpenInterceptor,
  isAirGapActive = false
}) => {
  const [geofenceRadius, setGeofenceRadius] = useState(physicalSec.geofenceRadiusMeters || 150);
  const [activeSubView, setActiveSubView] = useState<'radar' | 'blackout' | 'perimeter'>('radar');

  const handleSliderChange = (val: number) => {
    setGeofenceRadius(val);
    if (onUpdateGeofence) {
      onUpdateGeofence(val);
    }
  };

  const suspiciousBeacons = physicalSec.proximityBeacons.filter(
    b => b.threatScore === 'suspicious' || b.threatScore === 'hostile'
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080c14] overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar pb-10">
      {/* 1. Sleek Top Status & Sub-View Switcher Bar */}
      <div className="bg-gradient-to-r from-[#0c162c] via-[#101a33] to-[#0c162c] border border-cyan-500/40 rounded-2xl p-3 sm:p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 relative">
              <Shield size={20} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-black uppercase text-white tracking-wider">
                  PHYSICAL DEFENSE & GEOFENCE
                </h1>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  VALKYRIE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                360° Circular RF Radar · Screen-Off Blackout · Anti-Tamper Sensors
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            {onToggleAirGap && (
              <button
                onClick={onToggleAirGap}
                className={`px-2.5 py-1 rounded-xl text-[10.5px] font-mono font-bold flex items-center gap-1 border transition-all ${
                  isAirGapActive
                    ? 'bg-red-600 text-white border-red-400 shadow-md animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="True Air-Gap: 100% Radio Silence"
              >
                <WifiOff size={12} className={isAirGapActive ? 'text-white' : 'text-slate-400'} />
                <span>{isAirGapActive ? '100% OFFLINE' : 'Air-Gap'}</span>
              </button>
            )}

            {onOpenInterceptor && (
              <button
                onClick={onOpenInterceptor}
                className="px-2.5 py-1 rounded-xl text-[10.5px] font-mono font-bold bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/50 flex items-center gap-1 transition-all"
                title="Covert Data & Protocol Interceptor"
              >
                <EyeOff size={12} className="text-purple-400" />
                <span>Intercept</span>
              </button>
            )}

            <button
              onClick={onToggleBlackout}
              className="px-2.5 py-1 rounded-xl text-[10.5px] font-mono font-bold bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/50 flex items-center gap-1 transition-all"
              title="Turn Screen Off (Blackout Mode)"
            >
              <EyeOff size={12} className="text-red-400" />
              <span>Blackout</span>
            </button>
            <button
              onClick={onOpenRapidFill}
              className="px-2.5 py-1 rounded-xl text-[10.5px] font-mono font-bold bg-red-600 hover:bg-red-500 text-white border border-red-400 shadow-sm flex items-center gap-1 transition-all"
            >
              <Flame size={12} />
              <span>Rapid-Fill</span>
            </button>
          </div>
        </div>

        {/* Clean Graphic Sub-View Switcher */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#060a14] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveSubView('radar')}
            className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeSubView === 'radar'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio size={13} className={activeSubView === 'radar' ? 'text-cyan-400' : 'text-slate-500'} />
            <span className="truncate">360° Radar</span>
          </button>

          <button
            onClick={() => setActiveSubView('blackout')}
            className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeSubView === 'blackout'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <EyeOff size={13} className={activeSubView === 'blackout' ? 'text-red-400' : 'text-slate-500'} />
            <span className="truncate">Covert Defense</span>
          </button>

          <button
            onClick={() => setActiveSubView('perimeter')}
            className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeSubView === 'perimeter'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={13} className={activeSubView === 'perimeter' ? 'text-amber-400' : 'text-slate-500'} />
            <span className="truncate">Geofence & Tamper</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Clean 360° Circular Radar Canvas (Primary Graphic View) */}
      {activeSubView === 'radar' && (
        <div className="space-y-3 animate-in fade-in-50 duration-150">
          <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-2 shadow-2xl">
            <ProximityRadar
              beacons={physicalSec.proximityBeacons}
              geofenceRadiusMeters={geofenceRadius}
            />
          </div>
        </div>
      )}

      {/* VIEW 2: Covert Defense (Screen-Off Blackout Mode & Wiretap Telemetry) */}
      {activeSubView === 'blackout' && (
        <div className="space-y-3 animate-in fade-in-50 duration-150">
          <div className="bg-gradient-to-br from-[#120a16] via-[#0d101c] to-[#070b14] border-2 border-red-500/50 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 shadow-inner">
                  <EyeOff size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black uppercase text-red-200 tracking-wider">
                      COVERT PHYSICAL DEFENSE (SCREEN-OFF BLACKOUT)
                    </h2>
                    <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/50 font-bold uppercase animate-pulse">
                      SIMULATED POWER-OFF
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Turns the mobile display completely pitch black to deceive physical captors, while silently recording and transmitting live telemetry.
                  </p>
                </div>
              </div>

              {/* Big Trigger Button */}
              <button
                onClick={onToggleBlackout}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white border border-red-400 shadow-xl shadow-red-950/70 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <Power size={16} />
                <span>ENGAGE BLACKOUT (TURN SCREEN OFF)</span>
              </button>
            </div>

            {/* 3 Active Covert Telemetry Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-red-500/20 text-xs font-mono">
              <div className="bg-black/60 p-3 rounded-xl border border-red-950/60 space-y-1">
                <div className="flex items-center justify-between text-cyan-400 font-bold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    <span>1. GPS GEOFENCE TELEMETRY</span>
                  </span>
                  <span className="text-[9px] text-emerald-400">14 Sats</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Streams continuous breadcrumb coordinates: <code className="text-cyan-300">37.7749° N, -122.4194° W</code> (±0.8m accuracy) with LoRa/Cellular bursts.
                </p>
              </div>

              <div className="bg-black/60 p-3 rounded-xl border border-red-950/60 space-y-1">
                <div className="flex items-center justify-between text-amber-400 font-bold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Mic size={13} className="animate-pulse" />
                    <span>2. COVERT AUDIO WIRETAP</span>
                  </span>
                  <span className="text-[9px] text-amber-300">Background</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Silently records room acoustics and whisper spikes (-38 dB SPL) into encrypted 5s RAM buffers dispatched to the command base.
                </p>
              </div>

              <div className="bg-black/60 p-3 rounded-xl border border-red-950/60 space-y-1">
                <div className="flex items-center justify-between text-purple-400 font-bold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Camera size={13} />
                    <span>3. OPTICAL SENSOR BURST</span>
                  </span>
                  <span className="text-[9px] text-purple-300">IR Shutter</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Low-light optical lens captures intermittent stealth snapshots and detects physical room movement or flashlight beams.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Geofence & Anti-Tamper Controls */}
      {activeSubView === 'perimeter' && (
        <div className="space-y-3 animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Geofence Perimeter Range Controller */}
            <div className="bg-[#0d1424] border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Geofence Radius
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  {geofenceRadius} Meters
                </span>
              </div>

              <input
                type="range"
                min={25}
                max={500}
                step={25}
                value={geofenceRadius}
                onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>25m (Close)</span>
                <span>150m (Standard)</span>
                <span>500m (Max Range)</span>
              </div>
            </div>

            {/* Anti-Tamper Toggle */}
            <div
              onClick={onToggleAntiTamper}
              className={`rounded-xl p-4 border cursor-pointer transition-all flex items-center justify-between ${
                physicalSec.antiTamperActive
                  ? 'bg-amber-950/25 border-amber-500/50 shadow-md'
                  : 'bg-[#0d1424] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <Lock size={16} className={physicalSec.antiTamperActive ? 'text-amber-400' : 'text-slate-400'} />
                  <span className="text-xs font-bold font-mono text-slate-200 uppercase">
                    Anti-Tamper Sensors
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Accelerometer drop, enclosure seal & USB unbind tripwire
                </p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                physicalSec.antiTamperActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}>
                {physicalSec.antiTamperActive ? 'ARMED' : 'DISARMED'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

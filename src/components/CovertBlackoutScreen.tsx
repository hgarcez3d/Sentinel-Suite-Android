import React, { useState, useEffect, useRef } from 'react';
import {
  EyeOff,
  Radio,
  MapPin,
  Mic,
  Camera,
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  Power,
  Compass,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';

interface CovertBlackoutScreenProps {
  isActive: boolean;
  onExit: () => void;
  geofenceRadiusMeters: number;
}

export const CovertBlackoutScreen: React.FC<CovertBlackoutScreenProps> = ({
  isActive,
  onExit,
  geofenceRadiusMeters
}) => {
  // 'stealth' = 100% black screen, 'hud' = dim tactical operator view
  const [displayMode, setDisplayMode] = useState<'stealth' | 'hud'>('hud');
  const [tapCount, setTapCount] = useState(0);
  const [showHint, setShowHint] = useState(true);

  // Live Simulated Telemetry
  const [coords, setCoords] = useState({
    lat: 37.774929,
    lng: -122.419416,
    alt: 14.2,
    accuracy: 0.8
  });
  const [audioLevel, setAudioLevel] = useState(38); // decibels
  const [audioWave, setAudioWave] = useState<number[]>([12, 18, 35, 48, 22, 15, 42, 60, 30, 20]);
  const [framesCaptured, setFramesCaptured] = useState(128);
  const [packetsDispatched, setPacketsDispatched] = useState(42);
  const [opticalMotionDetected, setOpticalMotionDetected] = useState(false);
  const [deviceArmedTime, setDeviceArmedTime] = useState(0);

  // Timer for session duration and live jitter
  useEffect(() => {
    if (!isActive) {
      setDeviceArmedTime(0);
      return;
    }

    const timer = setInterval(() => {
      setDeviceArmedTime(prev => prev + 1);

      // Micro-jitter GPS coordinates (simulating live satellite tracking)
      setCoords(c => ({
        lat: Number((c.lat + (Math.random() - 0.5) * 0.00004).toFixed(6)),
        lng: Number((c.lng + (Math.random() - 0.5) * 0.00004).toFixed(6)),
        alt: Number((14.0 + Math.random() * 0.6).toFixed(1)),
        accuracy: Number((0.7 + Math.random() * 0.3).toFixed(1))
      }));

      // Audio mic jitter
      const newDb = Math.floor(32 + Math.random() * 26);
      setAudioLevel(newDb);
      setAudioWave(prev => [
        ...prev.slice(1),
        Math.floor(Math.random() * 70 + 10)
      ]);

      // Every 3 seconds, increment dispatch and frames
      if (Math.random() > 0.4) {
        setPacketsDispatched(p => p + 1);
        setFramesCaptured(f => f + 1);
      }

      // Intermittent optical motion
      if (Math.random() > 0.85) {
        setOpticalMotionDetected(true);
        setTimeout(() => setOpticalMotionDetected(false), 1400);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  // Hide hint after 4 seconds if in stealth
  useEffect(() => {
    if (displayMode === 'stealth') {
      const hintTimeout = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(hintTimeout);
    } else {
      setShowHint(true);
    }
  }, [displayMode]);

  // Triple tap handler to toggle HUD in stealth mode
  const handleScreenTouch = () => {
    setTapCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setDisplayMode('hud');
        return 0;
      }
      return next;
    });

    setTimeout(() => setTapCount(0), 800);
  };

  if (!isActive) return null;

  return (
    <div
      onClick={handleScreenTouch}
      className={`fixed inset-0 z-[100] transition-colors duration-300 select-none overflow-y-auto ${
        displayMode === 'stealth'
          ? 'bg-black cursor-pointer'
          : 'bg-[#03060a] text-emerald-400 font-mono'
      }`}
    >
      {/* 1. TRUE STEALTH MODE (Pitch Black Screen) */}
      {displayMode === 'stealth' && (
        <div className="h-full w-full flex flex-col items-center justify-between p-6">
          {/* Subtle indicator only during first 4 seconds */}
          {showHint ? (
            <div className="text-center space-y-2 mt-8 animate-pulse text-zinc-700 text-[10px] font-mono">
              <EyeOff size={16} className="mx-auto text-zinc-600 mb-1" />
              <p>SCREEN OFF · PHYSICAL DEFENSE ACTIVE</p>
              <p className="text-[9px] text-zinc-800">
                [Triple-tap screen to awaken Operator HUD]
              </p>
            </div>
          ) : (
            <div className="w-1 h-1 bg-zinc-950 rounded-full" />
          )}

          {/* Discreet wake up touch targets at corners */}
          <div className="w-full flex justify-between items-center text-zinc-900 text-[9px] opacity-40 hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDisplayMode('hud');
              }}
              className="p-3 text-zinc-600 hover:text-zinc-300 font-mono"
            >
              [Tap for HUD]
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExit();
              }}
              className="p-3 text-red-950 hover:text-red-500 font-mono"
            >
              [Disengage]
            </button>
          </div>
        </div>
      )}

      {/* 2. OPERATOR COVERT HUD MODE (Tactical Night-Vision Telemetry View) */}
      {displayMode === 'hud' && (
        <div className="min-h-full max-w-2xl mx-auto p-4 flex flex-col justify-between space-y-4">
          {/* Top Status Header */}
          <div className="bg-[#050a12] border border-emerald-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(16,185,129,0.1)]">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 relative">
                  <Shield size={18} className="animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-300">
                      COVERT DEFENSE: ACTIVE BLACKOUT
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-500/50 animate-pulse font-bold">
                      LIVE WIRETAP
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-600">
                    Display simulated off to outsiders · Streaming Geo, Audio & Optic bursts
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDisplayMode('stealth');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 shadow-sm"
                  title="Make screen 100% black again"
                >
                  <EyeOff size={11} />
                  <span>Black Screen</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExit();
                  }}
                  className="px-3 py-1 rounded-lg text-[10px] font-bold bg-red-950/80 border border-red-500/60 text-red-300 hover:bg-red-900 hover:text-white flex items-center gap-1 shadow-sm"
                  title="Exit Blackout and return to normal UI"
                >
                  <Power size={11} />
                  <span>Disengage</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
              <div className="bg-black/50 p-2 rounded-xl border border-emerald-950">
                <span className="text-emerald-700 block text-[9.5px]">Defense Uptime</span>
                <span className="font-bold text-emerald-300">
                  {Math.floor(deviceArmedTime / 60)}m {deviceArmedTime % 60}s
                </span>
              </div>
              <div className="bg-black/50 p-2 rounded-xl border border-emerald-950">
                <span className="text-emerald-700 block text-[9.5px]">Bursts Dispatched</span>
                <span className="font-bold text-cyan-300">{packetsDispatched} pkts</span>
              </div>
              <div className="bg-black/50 p-2 rounded-xl border border-emerald-950">
                <span className="text-emerald-700 block text-[9.5px]">Cryptographic Feed</span>
                <span className="font-bold text-purple-300">ChaCha20 Poly</span>
              </div>
            </div>
          </div>

          {/* 3 Telemetry Pillars: GEO, AUDIO, OPTIC */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. GEO TELEMETRY */}
            <div className="bg-[#050b14] border border-cyan-500/30 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <MapPin size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    GPS Geofence
                  </span>
                </div>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  14 Sats Locked
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between bg-black/40 px-2 py-1 rounded">
                  <span className="text-slate-500">Latitude:</span>
                  <span className="text-cyan-300 font-bold">{coords.lat}° N</span>
                </div>
                <div className="flex justify-between bg-black/40 px-2 py-1 rounded">
                  <span className="text-slate-500">Longitude:</span>
                  <span className="text-cyan-300 font-bold">{coords.lng}° W</span>
                </div>
                <div className="flex justify-between bg-black/40 px-2 py-1 rounded">
                  <span className="text-slate-500">Altitude / Acc:</span>
                  <span className="text-slate-300">{coords.alt}m (±{coords.accuracy}m)</span>
                </div>
                <div className="flex justify-between bg-black/40 px-2 py-1 rounded">
                  <span className="text-slate-500">Geofence Radius:</span>
                  <span className="text-emerald-400 font-bold">{geofenceRadiusMeters}m Zone</span>
                </div>
              </div>

              <div className="text-[9.5px] text-cyan-600 font-mono">
                Dispatched over LoRa Mesh & Encrypted Cellular Uplink.
              </div>
            </div>

            {/* 2. AUDIO WIRETAP MONITOR */}
            <div className="bg-[#050b14] border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Mic size={14} className="animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Audio Wiretap
                  </span>
                </div>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-500/40 font-bold">
                  {audioLevel} dB SPL
                </span>
              </div>

              {/* Dynamic waveform visualization */}
              <div className="h-14 bg-black/60 rounded-lg p-2 border border-slate-900 flex items-end justify-between gap-1">
                {audioWave.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-amber-500/40 to-amber-400 rounded-xs transition-all duration-150"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mic State:</span>
                  <span className="text-amber-400 font-bold">Background Recording</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Acoustic Status:</span>
                  <span className="text-slate-300">
                    {audioLevel > 50 ? 'Speech Detected' : 'Ambient Room Noise'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. VISUAL / OPTIC SURVEILLANCE */}
            <div className="bg-[#050b14] border border-purple-500/30 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <div className="flex items-center gap-1.5 text-purple-300">
                  <Camera size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Visual Sensors
                  </span>
                </div>
                <span className={`text-[9px] px-1 py-0.2 rounded border font-bold ${
                  opticalMotionDetected
                    ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
                    : 'bg-purple-950 text-purple-300 border-purple-500/40'
                }`}>
                  {opticalMotionDetected ? 'OPTICAL MOTION' : 'LENS ARMED'}
                </span>
              </div>

              {/* Simulated Shutter Feed Box */}
              <div className="h-14 bg-black/70 rounded-lg p-2 border border-slate-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 to-transparent pointer-events-none" />
                <div className="text-center font-mono text-[10px] text-purple-400 space-y-0.5">
                  <p className="font-bold">LOW-LIGHT IR BURST</p>
                  <p className="text-slate-500 text-[9px]">{framesCaptured} snapshots buffered</p>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Front Shutter:</span>
                  <span className="text-purple-300 font-bold">Periodic 10s Capture</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tamper Trap:</span>
                  <span className="text-emerald-400 font-bold">Camera Covert Locked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Strip at Bottom */}
          <div className="bg-[#080d19] border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <AlertTriangle size={15} className="text-amber-400" />
              <span>
                To deceive observers, switch to <strong className="text-slate-200">Black Screen</strong>. The phone looks powered off.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDisplayMode('stealth');
                }}
                className="px-4 py-2 rounded-xl font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <EyeOff size={14} />
                <span>Turn Screen Pitch Black</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExit();
                }}
                className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-red-600 to-rose-700 text-white border border-red-500 shadow-md flex items-center gap-1.5 transition-all"
              >
                <Power size={14} />
                <span>Disengage Blackout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

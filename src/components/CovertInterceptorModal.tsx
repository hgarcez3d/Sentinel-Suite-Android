import React, { useState, useEffect } from 'react';
import { InterceptedTransmission, TrueAirGapState, ProtocolType } from '../types/interceptor';
import { dataInterceptorService } from '../services/dataInterceptorService';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Wifi,
  WifiOff,
  Bluetooth,
  MapPin,
  Mic,
  MicOff,
  Camera,
  MessageSquare,
  Phone,
  PhoneOff,
  Lock,
  Unlock,
  AlertTriangle,
  Zap,
  Power,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Sparkles,
  Filter,
  CheckCircle2,
  RefreshCw,
  EyeOff,
  Cpu
} from 'lucide-react';

interface CovertInterceptorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleAirGap?: () => void;
}

export const CovertInterceptorModal: React.FC<CovertInterceptorModalProps> = ({
  isOpen,
  onClose,
  onToggleAirGap
}) => {
  const [interceptions, setInterceptions] = useState<InterceptedTransmission[]>(() =>
    dataInterceptorService.getInterceptions()
  );
  const [airGapState, setAirGapState] = useState<TrueAirGapState>(() =>
    dataInterceptorService.getAirGapState()
  );
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = dataInterceptorService.subscribe(() => {
      setInterceptions(dataInterceptorService.getInterceptions());
      setAirGapState(dataInterceptorService.getAirGapState());
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleToggleAirGap = () => {
    dataInterceptorService.toggleTrueAirGap();
    if (onToggleAirGap) {
      onToggleAirGap();
    }
  };

  const handleBlock = (id: string) => {
    dataInterceptorService.blockTransmission(id);
  };

  const handleDecoy = (id: string) => {
    dataInterceptorService.injectDecoyData(id);
  };

  const handleBlockAll = () => {
    dataInterceptorService.blockAllTransmissions();
  };

  const filtered = interceptions.filter(i => {
    if (selectedFilter === 'all') return true;
    return i.protocol === selectedFilter;
  });

  const getProtocolIcon = (proto: ProtocolType) => {
    switch (proto) {
      case 'SMS':
        return <MessageSquare size={14} className="text-amber-400" />;
      case 'AUDIO_MIC':
        return <Mic size={14} className="text-red-400 animate-pulse" />;
      case 'CAMERA_OPTIC':
        return <Camera size={14} className="text-purple-400" />;
      case 'GPS_TELEMETRY':
        return <MapPin size={14} className="text-cyan-400" />;
      case 'CELLULAR_DATA':
        return <Radio size={14} className="text-emerald-400" />;
      default:
        return <Phone size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#090e1a] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.15)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#0d162a] via-[#101b33] to-[#0d162a] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 relative">
              <EyeOff size={22} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wider">
                  COVERT EGRESS & PROTOCOL INTERCEPTOR
                </h2>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/50 font-bold uppercase">
                  ANTI-EXFILTRATION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sniffs & intercepts hidden background SMS, ambient microphone wiretaps, stealth camera frames & telemetry leaks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. TRUE AIR-GAP (100% OFFLINE ZERO-RADIO KILL SWITCH) BANNER */}
        <div className="p-4 bg-gradient-to-br from-[#130b18] via-[#0e1222] to-[#090e1a] border-b border-red-500/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${
                  airGapState.isAirGapActive
                    ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  {airGapState.isAirGapActive ? <WifiOff size={18} /> : <Radio size={18} />}
                </div>
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                  TRUE AIR-GAP: 100% ZERO-RADIO OFFLINE KILL SWITCH
                </h3>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 max-w-xl leading-relaxed">
                Standard airplane mode secretly leaves Bluetooth, Wi-Fi location, and GPS receivers active. <strong>True Air-Gap</strong> completely isolates the device by cutting cellular modem, Wi-Fi chipsets, Bluetooth beacons, GPS satellite sockets, and hardware mic listeners.
              </p>
            </div>

            {/* Big 1-Click Action Button */}
            <button
              onClick={handleToggleAirGap}
              className={`px-5 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl ${
                airGapState.isAirGapActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400 shadow-emerald-950/50'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border border-red-400 shadow-red-950/70'
              }`}
            >
              <Power size={15} />
              <span>
                {airGapState.isAirGapActive
                  ? 'AIR-GAP ACTIVE · RESTORE ALL RADIOS'
                  : 'ENGAGE TRUE AIR-GAP (100% OFFLINE)'}
              </span>
            </button>
          </div>

          {/* Radio Status Verification Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-800/80 text-[10.5px] font-mono">
            <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${
              airGapState.isAirGapActive
                ? 'bg-red-950/40 border-red-500/40 text-red-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <PhoneOff size={13} className={airGapState.isAirGapActive ? 'text-red-400' : 'text-slate-500'} />
              <div>
                <span className="block text-[9px] text-slate-500">Cellular / SMS:</span>
                <span className="font-bold">{airGapState.isAirGapActive ? 'CUT (0 dBm)' : 'ONLINE'}</span>
              </div>
            </div>

            <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${
              airGapState.isAirGapActive
                ? 'bg-red-950/40 border-red-500/40 text-red-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <WifiOff size={13} className={airGapState.isAirGapActive ? 'text-red-400' : 'text-slate-500'} />
              <div>
                <span className="block text-[9px] text-slate-500">Wi-Fi (All):</span>
                <span className="font-bold">{airGapState.isAirGapActive ? 'HARDWARE OFF' : 'CONNECTED'}</span>
              </div>
            </div>

            <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${
              airGapState.isAirGapActive
                ? 'bg-red-950/40 border-red-500/40 text-red-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <Bluetooth size={13} className={airGapState.isAirGapActive ? 'text-red-400' : 'text-slate-500'} />
              <div>
                <span className="block text-[9px] text-slate-500">Bluetooth / BLE:</span>
                <span className="font-bold">{airGapState.isAirGapActive ? 'RADIO SILENT' : 'STANDBY'}</span>
              </div>
            </div>

            <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${
              airGapState.isAirGapActive
                ? 'bg-red-950/40 border-red-500/40 text-red-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <MapPin size={13} className={airGapState.isAirGapActive ? 'text-red-400' : 'text-slate-500'} />
              <div>
                <span className="block text-[9px] text-slate-500">GPS / GNSS:</span>
                <span className="font-bold">{airGapState.isAirGapActive ? 'SEVERED' : 'TRACKING'}</span>
              </div>
            </div>

            <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${
              airGapState.isAirGapActive
                ? 'bg-red-950/40 border-red-500/40 text-red-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <Radio size={13} className={airGapState.isAirGapActive ? 'text-red-400' : 'text-slate-500'} />
              <div>
                <span className="block text-[9px] text-slate-500">NFC / UWB:</span>
                <span className="font-bold">{airGapState.isAirGapActive ? 'POWER OFF' : 'STANDBY'}</span>
              </div>
            </div>

            <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${
              airGapState.isAirGapActive
                ? 'bg-red-950/40 border-red-500/40 text-red-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <MicOff size={13} className={airGapState.isAirGapActive ? 'text-red-400' : 'text-slate-500'} />
              <div>
                <span className="block text-[9px] text-slate-500">Mic Guard:</span>
                <span className="font-bold">{airGapState.isAirGapActive ? 'MUTED' : 'ARMED'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Intercepted Traffic Filter Bar */}
        <div className="p-3 bg-[#080d17] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Intercepts' },
              { id: 'SMS', label: 'Silent SMS' },
              { id: 'AUDIO_MIC', label: 'Ambient Audio' },
              { id: 'CAMERA_OPTIC', label: 'Stealth Camera' },
              { id: 'GPS_TELEMETRY', label: 'GPS Leaks' },
              { id: 'CELLULAR_DATA', label: 'Raw Sockets' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all border ${
                  selectedFilter === f.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleBlockAll}
            className="px-3 py-1 rounded-lg font-bold bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 flex items-center gap-1 transition-all"
          >
            <Lock size={12} />
            <span>Block All Queues</span>
          </button>
        </div>

        {/* 3. Intercepted Transmissions Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filtered.map(item => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  item.status === 'blocked'
                    ? 'bg-[#090d16] border-slate-800/80 opacity-75'
                    : item.status === 'decoy_injected'
                    ? 'bg-[#0a141d] border-cyan-500/30'
                    : 'bg-[#120e18] border-red-500/50 shadow-sm'
                }`}
              >
                {/* Header Row: Click to Expand / Inspect */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-800/25 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-black/60 border border-slate-800 shrink-0">
                      {getProtocolIcon(item.protocol)}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-white truncate">
                          {item.sourceApp}
                        </span>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 truncate">
                          {item.sourcePackage}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border uppercase ${
                          item.status === 'blocked'
                            ? 'bg-slate-900 text-slate-400 border-slate-800'
                            : item.status === 'decoy_injected'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                            : 'bg-red-950 text-red-300 border-red-500/60 animate-pulse'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[10.5px] font-mono text-slate-400 truncate mt-0.5">
                        <span className="text-red-400 font-bold">{item.dataType}</span> · Target: {item.destination}
                      </p>
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status !== 'blocked' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlock(item.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50 flex items-center gap-1 shadow-xs"
                        title="Sever transmission socket"
                      >
                        <Lock size={12} />
                        <span>Block</span>
                      </button>
                    )}

                    {item.status !== 'decoy_injected' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecoy(item.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 flex items-center gap-1 shadow-xs"
                        title="Feed synthetic decoy telemetry"
                      >
                        <Sparkles size={12} />
                        <span>Decoy</span>
                      </button>
                    )}

                    <div className="p-1 text-slate-500">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Progressive Disclosure: Payload Decryption & Detection Trigger */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 p-3.5 bg-[#060a12] space-y-3 animate-in fade-in-50 duration-150 text-xs font-mono">
                    <div className="bg-black/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-slate-500 text-[10px] block font-bold uppercase">
                        Android OS Kernel Detection Trigger:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {item.detectionTrigger}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold uppercase text-cyan-400">Intercepted Payload Inspection:</span>
                        <span>Size: {item.dataSizeKb} KB · Dispatched: {item.timestamp}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-black/80 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono break-all whitespace-pre-wrap">
                        {item.payloadSnippet}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

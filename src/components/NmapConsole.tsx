import React, { useState, useRef, useEffect } from 'react';
import { ScanProfile, NmapLogLine } from '../types/network';
import {
  Terminal,
  Play,
  Square,
  ChevronUp,
  ChevronDown,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';

interface NmapConsoleProps {
  profiles: ScanProfile[];
  selectedProfile: ScanProfile;
  onSelectProfile: (profile: ScanProfile) => void;
  selectedSubnet: string;
  onSelectSubnet: (subnet: string) => void;
  isScanning: boolean;
  scanProgress: number;
  logs: NmapLogLine[];
  onStartScan: () => void;
  onStopScan: () => void;
  onClearLogs: () => void;
}

export const NmapConsole: React.FC<NmapConsoleProps> = ({
  profiles,
  selectedProfile,
  onSelectProfile,
  selectedSubnet,
  onSelectSubnet,
  isScanning,
  scanProgress,
  logs,
  onStartScan,
  onStopScan,
  onClearLogs
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of terminal
  useEffect(() => {
    if (isExpanded && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  return (
    <div className="border-t border-slate-800 bg-[#0c1322]/95 backdrop-blur-md transition-all duration-300 z-30 shadow-2xl">
      {/* Control Strip */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Subnet & Profile Pickers */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0f172a] px-2.5 py-1.5 rounded-lg border border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subnet:</span>
            <select
              value={selectedSubnet}
              onChange={e => onSelectSubnet(e.target.value)}
              className="bg-transparent text-xs font-mono text-cyan-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="192.168.1.0/24" className="bg-slate-900 text-slate-100">192.168.1.0/24</option>
              <option value="10.0.0.0/24" className="bg-slate-900 text-slate-100">10.0.0.0/24</option>
              <option value="172.16.1.0/24" className="bg-slate-900 text-slate-100">172.16.1.0/24</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0f172a] px-2.5 py-1.5 rounded-lg border border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profile:</span>
            <select
              value={selectedProfile.id}
              onChange={e => {
                const found = profiles.find(p => p.id === e.target.value);
                if (found) onSelectProfile(found);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Command preview badge */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800">
          <Terminal size={13} className="text-cyan-400" />
          <span>{selectedProfile.command}</span>
        </div>

        {/* Right: Scan Action & Terminal Toggle */}
        <div className="flex items-center gap-2">
          {isScanning ? (
            <button
              onClick={onStopScan}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-red-950/50"
            >
              <Square size={13} />
              <span>Abort</span>
            </button>
          ) : (
            <button
              onClick={onStartScan}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00e5ff] hover:bg-cyan-300 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-cyan-950/40"
            >
              <Play size={13} />
              <span>Run Nmap Scan</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              isExpanded ? 'bg-slate-800 text-cyan-400' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={14} />
            <span>Console ({logs.length})</span>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Progress bar during scan */}
      {isScanning && (
        <div className="w-full bg-slate-900 h-1 relative overflow-hidden">
          <div
            className="bg-[#00e5ff] h-full transition-all duration-300 shadow-[0_0_10px_#00e5ff]"
            style={{ width: `${scanProgress * 100}%` }}
          />
        </div>
      )}

      {/* Expandable Terminal Log Viewer */}
      {isExpanded && (
        <div className="border-t border-slate-800 bg-[#060a12] p-4 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              NMAP OUTPUT STREAM • {selectedSubnet}
            </span>
            <button
              onClick={onClearLogs}
              title="Clear Terminal Output"
              className="p-1 hover:text-slate-300 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>

          <div className="h-44 overflow-y-auto space-y-1 custom-scrollbar text-[11.5px] leading-relaxed">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic py-4 text-center">
                Terminal ready. Click "Run Nmap Scan" to start topology sweep and live device fingerprinting.
              </div>
            ) : (
              logs.map(log => {
                let color = 'text-slate-300';
                let IconComp = Info;
                if (log.type === 'command') {
                  color = 'text-cyan-400 font-bold';
                  IconComp = Terminal;
                } else if (log.type === 'critical') {
                  color = 'text-red-400 font-semibold';
                  IconComp = Flame;
                } else if (log.type === 'warning') {
                  color = 'text-amber-400 font-medium';
                  IconComp = AlertTriangle;
                } else if (log.type === 'success') {
                  color = 'text-emerald-400';
                  IconComp = CheckCircle;
                }

                return (
                  <div key={log.id} className={`flex items-start gap-2 ${color}`}>
                    <span className="text-slate-600 select-none text-[10px] w-14 shrink-0">
                      [{log.timestamp}]
                    </span>
                    <IconComp size={12} className="shrink-0 mt-0.5 opacity-80" />
                    <span className="break-all">{log.text}</span>
                  </div>
                );
              })
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

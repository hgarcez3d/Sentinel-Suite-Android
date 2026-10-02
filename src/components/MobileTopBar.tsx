import React from 'react';
import {
  Radio,
  ShieldAlert,
  Sliders,
  Terminal,
  Search,
  X,
  EyeOff,
  Network,
  List
} from 'lucide-react';
import { SecurityStatus, DeviceType } from '../types/network';

interface MobileTopBarProps {
  totalHosts: number;
  criticalCount: number;
  warningCount: number;
  stealthModeActive: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterStatus: SecurityStatus | null;
  onFilterStatusChange: (status: SecurityStatus | null) => void;
  filterType: DeviceType | null;
  onFilterTypeChange: (type: DeviceType | null) => void;
  isNmapOpen: boolean;
  onToggleNmap: () => void;
  isShellOpen: boolean;
  onToggleShell: () => void;
  onOpenTelemetryModal: () => void;
  viewMode: 'graph' | 'list';
  onToggleViewMode: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  totalHosts,
  criticalCount,
  warningCount,
  stealthModeActive,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterType,
  onFilterTypeChange,
  isNmapOpen,
  onToggleNmap,
  isShellOpen,
  onToggleShell,
  onOpenTelemetryModal,
  viewMode,
  onToggleViewMode
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);

  return (
    <header className="shrink-0 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800/80 px-3.5 pt-2.5 pb-2 z-30 shadow-md">
      {/* Top Identity Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Mobile App Title & Status */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,229,255,0.3)] shrink-0">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide text-white uppercase truncate">
                SENTINEL <span className="text-[#00e5ff]">SUITE</span>
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shrink-0">
                APK / MOBILE
              </span>
            </div>
            <p className="text-[9.5px] font-mono text-slate-400 truncate">
              Mobile Node · First Mate Popeye · Edge Unit Alpha
            </p>
          </div>
        </div>

        {/* Action icons / View switch & status pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {stealthModeActive && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold flex items-center gap-0.5">
              <EyeOff size={10} /> BLACKOUT
            </span>
          )}

          {/* Clean View Toggle: List vs Network Graph */}
          <button
            onClick={onToggleViewMode}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono flex items-center gap-1 border transition-all ${
              viewMode === 'list'
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-xs'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={viewMode === 'graph' ? 'Switch to Clean Practical List View' : 'Switch to Graph View'}
          >
            {viewMode === 'graph' ? (
              <>
                <List size={12} className="text-cyan-400" />
                <span>List View</span>
              </>
            ) : (
              <>
                <Network size={12} className="text-cyan-400" />
                <span>Graph View</span>
              </>
            )}
          </button>

          {/* Quick Critical Filter Pill */}
          <button
            onClick={() => onFilterStatusChange(filterStatus === 'critical' ? null : 'critical')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono flex items-center gap-1 border transition-all ${
              filterStatus === 'critical'
                ? 'bg-red-600 text-white border-red-400 shadow-md'
                : criticalCount > 0
                ? 'bg-red-950/40 border-red-500/40 text-red-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <ShieldAlert size={12} className={criticalCount > 0 ? 'text-red-400' : 'text-slate-500'} />
            <span>{criticalCount}</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchExpanded(prev => !prev)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSearchExpanded || searchQuery
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Search Hosts & Ports"
          >
            <Search size={14} />
          </button>

          {/* Synapse Autonomous Shell Terminal (with Voice/Jarvis) */}
          <button
            onClick={onToggleShell}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
              isShellOpen
                ? 'bg-[#00e5ff] text-slate-950 border-cyan-300 shadow-md shadow-cyan-950/40'
                : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300 hover:text-white'
            }`}
            title="Synapse Defense Shell (Run commands & voice interact)"
          >
            <Terminal size={12} className="text-cyan-400" />
            <span>Shell</span>
          </button>

          {/* Nmap Scanner Toggle */}
          <button
            onClick={onToggleNmap}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
              isNmapOpen
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-950/40'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Nmap Scanner & Subnet Probing"
          >
            <Radio size={12} className="text-amber-400" />
            <span className="hidden sm:inline">Nmap</span>
          </button>
        </div>
      </div>

      {/* Expandable Search Input on Mobile */}
      {isSearchExpanded && (
        <div className="relative mb-2 animate-in slide-in-from-top-1 duration-150">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search IP, camera, ESP8266, port 554..."
            autoFocus
            className="w-full bg-[#060a12] border border-cyan-500/40 rounded-lg pl-7 pr-7 py-1 text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Filter Row Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10.5px]">
        <button
          onClick={() => {
            onFilterStatusChange(null);
            onFilterTypeChange(null);
          }}
          className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors ${
            filterStatus === null && filterType === null
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}
        >
          All ({totalHosts})
        </button>

        <button
          onClick={() => onFilterStatusChange(filterStatus === 'warning' ? null : 'warning')}
          className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors ${
            filterStatus === 'warning'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}
        >
          Warning ({warningCount})
        </button>

        <button
          onClick={() => onFilterTypeChange(filterType === 'camera' ? null : 'camera')}
          className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors ${
            filterType === 'camera'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}
        >
          RTSP Cams
        </button>

        <button
          onClick={() => onFilterTypeChange(filterType === 'rogue' ? null : 'rogue')}
          className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors ${
            filterType === 'rogue'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}
        >
          Rogue Hardware
        </button>

        <button
          onClick={() => onFilterTypeChange(filterType === 'iot' ? null : 'iot')}
          className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors ${
            filterType === 'iot'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}
        >
          Smart IoT
        </button>

        <button
          onClick={onOpenTelemetryModal}
          className="ml-auto px-2 py-0.5 rounded-md font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 shrink-0 flex items-center gap-1"
        >
          <Sliders size={11} />
          <span>Kernel & Dossier</span>
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { SecurityStatus, DeviceType } from '../types/network';
import { AgentRole } from '../types/agents';
import { AGENT_PROFILES } from '../data/agentProfiles';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  X,
  Radio,
  Camera,
  Cpu,
  Flame,
  Globe,
  Bot,
  Layers,
  Sparkles,
  Zap,
  EyeOff
} from 'lucide-react';

interface HeaderHUDProps {
  totalHosts: number;
  criticalCount: number;
  warningCount: number;
  secureCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterStatus: SecurityStatus | null;
  onFilterStatusChange: (status: SecurityStatus | null) => void;
  filterType: DeviceType | null;
  onFilterTypeChange: (type: DeviceType | null) => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  isThreatIntelOpen: boolean;
  onToggleThreatIntel: () => void;
  activeAgent: AgentRole;
  onSelectAgent: (role: AgentRole) => void;
  onOpenTelemetryDashboard: () => void;
  stealthModeActive: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  totalHosts,
  criticalCount,
  warningCount,
  secureCount,
  searchQuery,
  onSearchChange,
  filterStatus,
  filterType,
  onFilterStatusChange,
  onFilterTypeChange,
  isChatOpen,
  onToggleChat,
  isThreatIntelOpen,
  onToggleThreatIntel,
  activeAgent,
  onSelectAgent,
  onOpenTelemetryDashboard,
  stealthModeActive
}) => {
  return (
    <header className="border-b border-slate-800/90 bg-[#0c1322]/95 backdrop-blur-md px-4 py-3 z-30 shadow-xl flex flex-col gap-3">
      {/* Top Row: Brand, Multi-Agent Squad & Telemetry HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-wider">
                SENTINEL AI <span className="text-[#00e5ff]">SECURITY SUITE</span>
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                MOBILE
              </span>
              <span className="hidden md:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                FIRST MATE POPEYE ON DECK
              </span>
              {stealthModeActive && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold flex items-center gap-1 animate-pulse">
                  <EyeOff size={11} /> STEALTH ARMED
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Mobile Security Unit · First Mate Popeye · Autonomous Multi-Agent Defense
            </p>
          </div>
        </div>

        {/* Multi-Agent Quick Jump Buttons */}
        <div className="hidden xl:flex items-center gap-1 bg-[#0f172a] p-1 rounded-xl border border-slate-800">
          {(Object.keys(AGENT_PROFILES) as AgentRole[]).map(role => {
            const profile = AGENT_PROFILES[role];
            const isCurrent = isChatOpen && activeAgent === role;
            return (
              <button
                key={role}
                onClick={() => {
                  onSelectAgent(role);
                  if (!isChatOpen) onToggleChat();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isCurrent
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={profile.title}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: profile.accentHex }}
                />
                <span>{profile.name}</span>
              </button>
            );
          })}
        </div>

        {/* Telemetry Metric Pills & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Online Hosts */}
          <div className="bg-[#0f172a] px-3 py-1.5 rounded-xl border border-slate-800 hidden sm:flex items-center gap-2 text-xs">
            <Globe className="text-cyan-400" size={15} />
            <span className="text-slate-400">Hosts:</span>
            <strong className="text-white font-mono">{totalHosts}</strong>
          </div>

          {/* Critical Risk Pill */}
          <button
            onClick={() => onFilterStatusChange(filterStatus === 'critical' ? null : 'critical')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
              filterStatus === 'critical'
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/50'
                : criticalCount > 0
                ? 'bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/40'
                : 'bg-[#0f172a] border-slate-800 text-slate-400'
            }`}
          >
            <ShieldAlert size={14} className={criticalCount > 0 ? 'text-red-400' : 'text-slate-500'} />
            <span className="hidden sm:inline">Critical:</span>
            <strong className="font-mono">{criticalCount}</strong>
          </button>

          {/* Warning Pill */}
          <button
            onClick={() => onFilterStatusChange(filterStatus === 'warning' ? null : 'warning')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
              filterStatus === 'warning'
                ? 'bg-amber-600 text-white border-amber-500'
                : warningCount > 0
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
                : 'bg-[#0f172a] border-slate-800 text-slate-400'
            }`}
          >
            <AlertTriangle size={14} className={warningCount > 0 ? 'text-amber-400' : 'text-slate-500'} />
            <span className="hidden sm:inline">Warning:</span>
            <strong className="font-mono">{warningCount}</strong>
          </button>

          {/* Proximity Radar & Telemetry Dashboard Modal Button */}
          <button
            onClick={onOpenTelemetryDashboard}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md group"
            title="Open Circular Proximity Radar, Kernel Integrity & Daily Dossier"
          >
            <Radio size={14} className="text-cyan-400 group-hover:animate-pulse" />
            <span className="hidden sm:inline">Proximity Radar</span>
          </button>

          {/* Threat Intelligence Panel Button */}
          <button
            onClick={onToggleThreatIntel}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg ${
              isThreatIntelOpen
                ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-purple-950/60 border border-purple-400/50'
                : 'bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/40'
            }`}
            title="Open Gemini AI Threat Intelligence & Campaign Attribution Panel"
          >
            <ShieldAlert size={14} className="text-red-400" />
            <span className="hidden sm:inline">Threat Intel</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/30 text-purple-200 border border-purple-500/40 font-bold">
              AI
            </span>
          </button>

          {/* Toggle Multi-Agent Chat Panel Button */}
          <button
            onClick={onToggleChat}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg ${
              isChatOpen
                ? 'bg-[#00e5ff] text-slate-950 shadow-cyan-950/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Talk to Dedicated Gemini Agents"
          >
            <Bot size={15} />
            <span>Agent Chat</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Search Bar & Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search by IP (192.168.1.104), Hostname, Port (554), Vendor..."
            className="w-full bg-[#080c14] border border-slate-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
          <button
            onClick={() => {
              onFilterStatusChange(null);
              onFilterTypeChange(null);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filterStatus === null && filterType === null
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Hosts
          </button>

          <button
            onClick={() => onFilterTypeChange(filterType === 'camera' ? null : 'camera')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
              filterType === 'camera'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Camera size={13} />
            <span>IP Cameras</span>
          </button>

          <button
            onClick={() => onFilterTypeChange(filterType === 'rogue' ? null : 'rogue')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
              filterType === 'rogue'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Flame size={13} />
            <span>Rogue Hardware</span>
          </button>

          <button
            onClick={() => onFilterTypeChange(filterType === 'iot' ? null : 'iot')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
              filterType === 'iot'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Cpu size={13} />
            <span>Smart IoT</span>
          </button>
        </div>
      </div>
    </header>
  );
};

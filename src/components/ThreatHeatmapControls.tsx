import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  Radio,
  Sliders,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Info,
  Server
} from 'lucide-react';
import { HeatmapMode, SubnetThreatMetrics } from '../types/network';

interface ThreatHeatmapControlsProps {
  enabled: boolean;
  onToggleEnabled: () => void;
  mode: HeatmapMode;
  onSelectMode: (mode: HeatmapMode) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  subnets: SubnetThreatMetrics[];
  selectedSubnetId: string | null;
  onSelectSubnet: (subnetId: string | null) => void;
}

export const ThreatHeatmapControls: React.FC<ThreatHeatmapControlsProps> = ({
  enabled,
  onToggleEnabled,
  mode,
  onSelectMode,
  opacity,
  onChangeOpacity,
  subnets,
  selectedSubnetId,
  onSelectSubnet
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const highestRiskSubnet = subnets[0];

  return (
    <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 max-w-[280px] sm:max-w-sm pointer-events-auto">
      {/* Primary Toggle & Status Bar */}
      <div className="bg-[#0f172a]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-xl flex items-center justify-between gap-2 text-xs">
        <button
          onClick={onToggleEnabled}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
            enabled
              ? 'bg-gradient-to-r from-red-600/80 to-amber-600/80 text-white shadow-md border border-red-400/40'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
          }`}
          title="Toggle Subnet Threat Density Heatmap"
        >
          <Flame size={14} className={enabled ? 'text-amber-300' : 'text-slate-500'} />
          <span>Heatmap</span>
          <span
            className={`px-1 py-0.2 rounded text-[9.5px] font-mono uppercase ${
              enabled ? 'bg-black/30 text-amber-200' : 'bg-slate-900 text-slate-500'
            }`}
          >
            {enabled ? 'Active' : 'Off'}
          </span>
        </button>

        {enabled && (
          <div className="flex items-center gap-2 pr-1">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {subnets.length} Subnets Analyzed
            </span>
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 text-[11px]"
              title="Expand Heatmap Controls & Subnet Threat Breakdown"
            >
              <Sliders size={13} className="text-[#00e5ff]" />
              <span className="hidden sm:inline">Controls</span>
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        )}
      </div>

      {/* Expanded Controls & Subnet Threat Density Breakdown Drawer */}
      {enabled && isExpanded && (
        <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/90 rounded-xl p-3.5 shadow-2xl text-xs space-y-3.5 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          {/* 1. Heatmap Mode Selector */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers size={13} className="text-[#00e5ff]" />
                Density Metric
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">D3 Contour Field</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onSelectMode('threat_index')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition-all ${
                  mode === 'threat_index'
                    ? 'bg-red-500/20 border border-red-500/50 text-red-200 font-semibold'
                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <ShieldAlert size={13} className={mode === 'threat_index' ? 'text-red-400' : 'text-slate-500'} />
                <span className="truncate">Composite Index</span>
              </button>

              <button
                onClick={() => onSelectMode('vulnerabilities')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition-all ${
                  mode === 'vulnerabilities'
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200 font-semibold'
                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Flame size={13} className={mode === 'vulnerabilities' ? 'text-amber-400' : 'text-slate-500'} />
                <span className="truncate">CVE Severity</span>
              </button>

              <button
                onClick={() => onSelectMode('port_exposure')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition-all ${
                  mode === 'port_exposure'
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 font-semibold'
                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Server size={13} className={mode === 'port_exposure' ? 'text-cyan-400' : 'text-slate-500'} />
                <span className="truncate">Port Exposure</span>
              </button>

              <button
                onClick={() => onSelectMode('traffic_load')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition-all ${
                  mode === 'traffic_load'
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 font-semibold'
                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Activity size={13} className={mode === 'traffic_load' ? 'text-emerald-400' : 'text-slate-500'} />
                <span className="truncate">Traffic Load</span>
              </button>
            </div>
          </div>

          {/* 2. Opacity / Intensity Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Heatmap Intensity / Glow</span>
              <span className="font-mono text-cyan-400">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.95"
              step="0.05"
              value={opacity}
              onChange={e => onChangeOpacity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
            />
          </div>

          {/* 3. Subnet Threat Density Breakdown List */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              <span>Subnet Risk Dossier</span>
              {selectedSubnetId && (
                <button
                  onClick={() => onSelectSubnet(null)}
                  className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {subnets.map(subnet => {
                const isSelected = selectedSubnetId === subnet.subnetId;
                return (
                  <div
                    key={subnet.subnetId}
                    onClick={() => onSelectSubnet(isSelected ? null : subnet.subnetId)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-[#00e5ff] shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: subnet.color }}
                        />
                        <span className="font-mono font-bold text-white text-[11px]">{subnet.cidr}</span>
                      </div>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${subnet.color}25`,
                          color: subnet.color,
                          border: `1px solid ${subnet.color}50`
                        }}
                      >
                        {subnet.threatLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] text-slate-400">
                      <span className="truncate max-w-[170px]">{subnet.vlanName}</span>
                      <span className="text-slate-300 font-mono">
                        {subnet.totalDevices} {subnet.totalDevices === 1 ? 'host' : 'hosts'}
                      </span>
                    </div>

                    {/* Threat Score Progress Bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${subnet.compositeThreatScore}%`,
                            backgroundColor: subnet.color
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-300 shrink-0">
                        {subnet.compositeThreatScore}/100
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

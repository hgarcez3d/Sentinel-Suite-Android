import React, { useState } from 'react';
import { NetworkDevice, SecurityStatus, DeviceType } from '../types/network';
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Router,
  Camera,
  Server,
  Laptop,
  Smartphone,
  Cpu,
  Flame,
  Radio,
  Lock,
  Unlock,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
  Hash
} from 'lucide-react';

interface CleanDeviceInventoryProps {
  devices: NetworkDevice[];
  selectedDevice: NetworkDevice | null;
  onSelectDevice: (device: NetworkDevice) => void;
  onToggleIsolation: (id: string) => void;
  filterStatus: SecurityStatus | null;
  filterType: DeviceType | null;
  searchQuery: string;
}

export const CleanDeviceInventory: React.FC<CleanDeviceInventoryProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  onToggleIsolation,
  filterStatus,
  filterType,
  searchQuery
}) => {
  const [activeSubnetFilter, setActiveSubnetFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'threat' | 'ip' | 'name'>('threat');

  // Group subnets
  const subnets = Array.from(new Set(devices.map(d => d.subnet || 'Default Subnet')));

  // Filter devices
  const filtered = devices.filter(d => {
    if (filterStatus && d.securityStatus !== filterStatus) return false;
    if (filterType && d.deviceType !== filterType) return false;
    if (activeSubnetFilter !== 'all' && (d.subnet || 'Default Subnet') !== activeSubnetFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inIp = d.ip.toLowerCase().includes(q);
      const inHost = d.hostname.toLowerCase().includes(q);
      const inVendor = d.vendor.toLowerCase().includes(q);
      const inPort = d.openPorts.some(p => p.port.toString().includes(q) || p.service.toLowerCase().includes(q));
      if (!inIp && !inHost && !inVendor && !inPort) return false;
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'threat') {
      const score = (dev: NetworkDevice) =>
        dev.securityStatus === 'critical' ? 3 : dev.securityStatus === 'warning' ? 2 : 1;
      return score(b) - score(a);
    }
    if (sortBy === 'ip') {
      const num = (ip: string) =>
        ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0);
      return num(a.ip) - num(b.ip);
    }
    return a.hostname.localeCompare(b.hostname);
  });

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'gateway': return <Router className="w-4 h-4 text-cyan-400" />;
      case 'camera': return <Camera className="w-4 h-4 text-red-400" />;
      case 'server': return <Server className="w-4 h-4 text-blue-400" />;
      case 'workstation': return <Laptop className="w-4 h-4 text-purple-400" />;
      case 'mobile': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'rogue': return <Flame className="w-4 h-4 text-red-500" />;
      default: return <Cpu className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080c14] overflow-hidden">
      {/* Subnet Filter Tabs & Sorting Bar */}
      <div className="shrink-0 bg-[#0c1220] border-b border-slate-800/80 px-3.5 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveSubnetFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all ${
              activeSubnetFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            All Subnets ({devices.length})
          </button>
          {subnets.map(sub => {
            const count = devices.filter(d => (d.subnet || 'Default Subnet') === sub).length;
            return (
              <button
                key={sub}
                onClick={() => setActiveSubnetFilter(sub)}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all shrink-0 ${
                  activeSubnetFilter === sub
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {sub} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-auto text-[10.5px]">
          <span className="text-slate-500 font-mono hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-md px-2 py-0.5 font-mono text-[10.5px] focus:outline-none"
          >
            <option value="threat">By Threat Level</option>
            <option value="ip">By IP Address</option>
            <option value="name">By Hostname</option>
          </select>
        </div>
      </div>

      {/* Device List Table / Clean Cards */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar pb-16">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No devices matched the selected filter or query.
          </div>
        ) : (
          sorted.map(device => {
            const isSelected = selectedDevice?.id === device.id;
            const isCrit = device.securityStatus === 'critical';
            const isWarn = device.securityStatus === 'warning';

            return (
              <div
                key={device.id}
                onClick={() => onSelectDevice(device)}
                className={`rounded-xl border transition-all cursor-pointer p-3 relative ${
                  isSelected
                    ? 'bg-[#101b30] border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                    : isCrit
                    ? 'bg-[#160d13]/90 border-red-500/40 hover:border-red-400 hover:bg-[#1f1019]'
                    : isWarn
                    ? 'bg-[#17130c]/90 border-amber-500/40 hover:border-amber-400 hover:bg-[#20180d]'
                    : 'bg-[#0d1424]/90 border-slate-800 hover:border-slate-700 hover:bg-[#111a2e]'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  {/* Left: Device Icon & Basic Info */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={`p-2 rounded-lg shrink-0 border ${
                        isCrit
                          ? 'bg-red-500/20 border-red-500/40'
                          : isWarn
                          ? 'bg-amber-500/20 border-amber-500/40'
                          : 'bg-slate-800/80 border-slate-700/60'
                      }`}
                    >
                      {getDeviceIcon(device.deviceType)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-mono font-bold text-white tracking-wide">
                          {device.ip}
                        </span>
                        <span className="text-[11px] text-slate-300 font-semibold truncate">
                          {device.hostname}
                        </span>
                        {device.isIsolated && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950 border border-red-500/40 text-red-300 font-bold">
                            QUARANTINED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[10.5px] text-slate-400">
                        <span className="truncate">{device.vendor}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500 text-[10px]">{device.mac}</span>
                        {device.subnet && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-cyan-400/90 text-[10px]">{device.subnet}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Security Status Pill & Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isCrit ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                        <ShieldAlert size={12} className="text-red-400" />
                        CRITICAL ({device.vulnerabilities.length})
                      </span>
                    ) : isWarn ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <AlertTriangle size={12} className="text-amber-400" />
                        WARNING ({device.vulnerabilities.length})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        SECURE
                      </span>
                    )}

                    <ChevronRight size={15} className="text-slate-500" />
                  </div>
                </div>

                {/* Open Ports & Vulnerabilities Chip Row */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10.5px] flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-500 text-[10px] font-mono">Ports:</span>
                    {device.openPorts.slice(0, 4).map(p => (
                      <span
                        key={p.port}
                        className={`px-1.5 py-0.2 rounded font-mono text-[9.5px] border ${
                          p.isHighRisk
                            ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        {p.port}/{p.service}
                      </span>
                    ))}
                    {device.openPorts.length > 4 && (
                      <span className="text-slate-500 text-[9.5px] font-mono">
                        +{device.openPorts.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Quarantine / Isolate Quick Trigger */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onToggleIsolation(device.id);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-colors border ${
                      device.isIsolated
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/40'
                        : 'bg-red-950/40 text-red-300 border-red-500/40 hover:bg-red-900/50'
                    }`}
                  >
                    {device.isIsolated ? (
                      <>
                        <Unlock size={10} /> Release
                      </>
                    ) : (
                      <>
                        <Lock size={10} /> Quarantine
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

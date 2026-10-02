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
  Layers,
  Network,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Zap,
  Activity,
  Wifi
} from 'lucide-react';

interface NetworkSubnetManagerProps {
  devices: NetworkDevice[];
  selectedDevice: NetworkDevice | null;
  onSelectDevice: (device: NetworkDevice) => void;
  onToggleIsolation: (id: string) => void;
  filterStatus: SecurityStatus | null;
  filterType: DeviceType | null;
  searchQuery: string;
}

export const NetworkSubnetManager: React.FC<NetworkSubnetManagerProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  onToggleIsolation,
  filterStatus,
  filterType,
  searchQuery
}) => {
  const [selectedSubnet, setSelectedSubnet] = useState<string>('all');
  const [activeSegmentTab, setActiveSegmentTab] = useState<'grid' | 'table'>('grid');
  const [viewDensity, setViewDensity] = useState<'clean' | 'detailed'>('clean');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Extract unique subnets and compute stats
  const subnetMap = devices.reduce((acc, dev) => {
    const sub = dev.subnet || '192.168.1.0/24 (LAN)';
    if (!acc[sub]) {
      acc[sub] = {
        name: sub,
        devices: [],
        critical: 0,
        warning: 0,
        isolated: 0,
        gateway: null as NetworkDevice | null
      };
    }
    acc[sub].devices.push(dev);
    if (dev.securityStatus === 'critical') acc[sub].critical++;
    if (dev.securityStatus === 'warning') acc[sub].warning++;
    if (dev.isIsolated) acc[sub].isolated++;
    if (dev.deviceType === 'gateway') acc[sub].gateway = dev;
    return acc;
  }, {} as Record<string, { name: string; devices: NetworkDevice[]; critical: number; warning: number; isolated: number; gateway: NetworkDevice | null }>);

  const subnetsList = Object.values(subnetMap);

  // Filter devices
  const filteredDevices = devices.filter(d => {
    if (filterStatus && d.securityStatus !== filterStatus) return false;
    if (filterType && d.deviceType !== filterType) return false;
    if (selectedSubnet !== 'all' && (d.subnet || '192.168.1.0/24 (LAN)') !== selectedSubnet) return false;
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
      {/* 1. Subnet Architecture Bar (Clean Visual Hierarchy) */}
      <div className="shrink-0 bg-[#0c1220] border-b border-slate-800 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-black uppercase text-slate-200 tracking-wider">
              Network Architecture & Subnet Segments
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Clean vs Detailed Toggle */}
            <button
              onClick={() => setViewDensity(prev => prev === 'clean' ? 'detailed' : 'clean')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
                viewDensity === 'clean'
                  ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Clean visualization: Hide secondary info until clicked"
            >
              {viewDensity === 'clean' ? '✦ Clean View' : 'Full Specs'}
            </button>

            <button
              onClick={() => setActiveSegmentTab('grid')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                activeSegmentTab === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setActiveSegmentTab('table')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                activeSegmentTab === 'table'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Subnet Cluster Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedSubnet('all')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all shrink-0 flex items-center gap-2 border ${
              selectedSubnet === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Wifi size={13} className="text-cyan-400" />
            <span>All Segments</span>
            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded text-[10px]">
              {devices.length} hosts
            </span>
          </button>

          {subnetsList.map(subnet => (
            <button
              key={subnet.name}
              onClick={() => setSelectedSubnet(subnet.name)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all shrink-0 flex items-center gap-2 border ${
                selectedSubnet === subnet.name
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                subnet.critical > 0 ? 'bg-red-500 animate-pulse' : subnet.warning > 0 ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <span>{subnet.name}</span>
              <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded text-[10px]">
                {subnet.devices.length}
              </span>
              {subnet.critical > 0 && (
                <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-1 py-0.2 rounded text-[9px]">
                  {subnet.critical} alert
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Content Display Area */}
      <div className="flex-1 overflow-y-auto p-3.5 custom-scrollbar">
        {filteredDevices.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <ShieldCheck size={36} className="text-slate-600" />
            <p className="text-xs font-mono">No hosts matching current filters</p>
          </div>
        ) : activeSegmentTab === 'grid' ? (
          /* Clean Visual Host Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDevices.map(device => {
              const isCritical = device.securityStatus === 'critical';
              const isWarning = device.securityStatus === 'warning';
              const isSelected = selectedDevice?.id === device.id;

              const isExpanded = viewDensity === 'detailed' || expandedCardId === device.id || isSelected;

              return (
                <div
                  key={device.id}
                  onClick={() => {
                    onSelectDevice(device);
                    setExpandedCardId(expandedCardId === device.id ? null : device.id);
                  }}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#11192e] border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                      : isCritical
                      ? 'bg-[#150d14] border-red-500/50 hover:border-red-400'
                      : isWarning
                      ? 'bg-[#14120e] border-amber-500/40 hover:border-amber-400'
                      : 'bg-[#0d1424] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Clean Essential Status Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isCritical ? 'bg-red-500/20 text-red-400' : isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {getDeviceIcon(device.deviceType)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-slate-200 font-mono tracking-tight truncate">
                            {device.hostname}
                          </h3>
                          {device.isIsolated && (
                            <span className="bg-red-900/60 text-red-300 border border-red-500/50 text-[8.5px] px-1 py-0.2 rounded font-mono font-bold shrink-0">
                              ISOLATED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-cyan-400 font-semibold">{device.ip}</p>
                      </div>
                    </div>

                    {/* Threat Status & Ports summary pills */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {device.openPorts.length} ports
                      </span>
                      <div className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase border ${
                        isCritical
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        {device.securityStatus}
                      </div>
                    </div>
                  </div>

                  {/* Clean View Hint (Only shown when not expanded) */}
                  {!isExpanded && (
                    <div className="mt-2 pt-1.5 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span className="truncate max-w-[180px]">{device.vendor}</span>
                      <span className="text-cyan-400 flex items-center gap-0.5">
                        Inspect <ChevronRight size={11} />
                      </span>
                    </div>
                  )}

                  {/* Progressive Disclosure: Full details only when expanded or clicked */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in-50 duration-150">
                      {/* Device Specs / Subnet info */}
                      <div className="space-y-1 text-[10.5px] font-mono">
                        <div className="flex items-center justify-between text-slate-400 bg-black/30 px-2 py-1 rounded">
                          <span>Subnet:</span>
                          <span className="text-slate-200">{device.subnet || '192.168.1.0/24'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 bg-black/30 px-2 py-1 rounded">
                          <span>MAC / Vendor:</span>
                          <span className="text-slate-300 truncate max-w-[170px]">{device.vendor}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 bg-black/30 px-2 py-1 rounded">
                          <span>OS Fingerprint:</span>
                          <span className="text-slate-300 truncate max-w-[170px]">{device.osFingerprint}</span>
                        </div>
                      </div>

                      {/* Ports & Vulnerabilities tags */}
                      <div className="flex flex-wrap items-center gap-1 my-1.5">
                        {device.openPorts.slice(0, 4).map(p => (
                          <span
                            key={p.port}
                            className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded border ${
                              p.isHighRisk
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            :{p.port} ({p.service})
                          </span>
                        ))}
                        {device.openPorts.length > 4 && (
                          <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            +{device.openPorts.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Action Bottom Strip */}
                      <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="text-[9.5px] font-mono text-cyan-400">
                          Click to open Inspector Drawer
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleIsolation(device.id);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
                            device.isIsolated
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                          }`}
                        >
                          {device.isIsolated ? (
                            <>
                              <Unlock size={11} /> Reconnect
                            </>
                          ) : (
                            <>
                              <Lock size={11} /> Isolate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Clean Network Subnet Table */
          <div className="bg-[#0c1220] border border-slate-800 rounded-xl overflow-x-auto shadow-xl">
            <table className="w-full text-left text-[11px] font-mono text-slate-300">
              <thead className="bg-[#080d17] border-b border-slate-800 text-slate-400 uppercase text-[9.5px]">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Hostname</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Subnet</th>
                  <th className="py-2.5 px-3">Vendor / OS</th>
                  <th className="py-2.5 px-3">Open Ports</th>
                  <th className="py-2.5 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDevices.map(device => {
                  const isCritical = device.securityStatus === 'critical';
                  const isWarning = device.securityStatus === 'warning';

                  return (
                    <tr
                      key={device.id}
                      onClick={() => onSelectDevice(device)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          isCritical
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}>
                          {device.securityStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-200 flex items-center gap-1.5">
                        {getDeviceIcon(device.deviceType)}
                        <span>{device.hostname}</span>
                      </td>
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold">{device.ip}</td>
                      <td className="py-2.5 px-3 text-slate-400">{device.subnet || '192.168.1.0/24'}</td>
                      <td className="py-2.5 px-3 text-slate-300">{device.vendor} ({device.osFingerprint})</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          {device.openPorts.slice(0, 3).map(p => (
                            <span key={p.port} className="bg-slate-900 border border-slate-700 px-1 py-0.2 rounded text-[9px] text-slate-300">
                              :{p.port}
                            </span>
                          ))}
                          {device.openPorts.length > 3 && (
                            <span className="text-[9px] text-slate-500">+{device.openPorts.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleIsolation(device.id);
                          }}
                          className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold border ${
                            device.isIsolated
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-red-500/20 text-red-300 border-red-500/40'
                          }`}
                        >
                          {device.isIsolated ? 'Restore' : 'Isolate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { ProximityBeacon } from '../types/agents';
import {
  Radio,
  Wifi,
  Bluetooth,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Sliders,
  Filter,
  Activity,
  Layers,
  Zap,
  Info,
  ExternalLink,
  Crosshair
} from 'lucide-react';

interface ProximityRadarProps {
  beacons: ProximityBeacon[];
  geofenceRadiusMeters: number;
  onSelectBeacon?: (beacon: ProximityBeacon) => void;
}

export const ProximityRadar: React.FC<ProximityRadarProps> = ({
  beacons,
  geofenceRadiusMeters,
  onSelectBeacon
}) => {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [selectedBeaconId, setSelectedBeaconId] = useState<string | null>(beacons[0]?.id || null);
  const [hoveredBeaconId, setHoveredBeaconId] = useState<string | null>(null);
  const [protocolFilter, setProtocolFilter] = useState<'all' | 'bluetooth_ble' | 'wifi_beacon' | 'sub_ghz'>('all');
  const [rangeScaleMeters, setRangeScaleMeters] = useState<number>(20); // 10m, 20m, 50m
  const [isRotating, setIsRotating] = useState(true);

  // Radar continuous 360-degree sweep animation
  useEffect(() => {
    if (!isRotating) return;
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      setSweepAngle(prev => (prev + (delta * 0.08)) % 360);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRotating]);

  const filteredBeacons = beacons.filter(b => {
    if (protocolFilter === 'all') return true;
    return b.protocol === protocolFilter;
  });

  const activeSelected = beacons.find(b => b.id === selectedBeaconId) || beacons[0];

  // Radar dimensions in SVG (Center: 200, 200, Radius: 170)
  const center = 200;
  const maxRadius = 165;

  const getBeaconCoords = (distanceMeters: number, bearingDeg: number) => {
    // Map distance (0 to rangeScaleMeters) to radar radius (0 to maxRadius)
    const normDist = Math.min(distanceMeters / rangeScaleMeters, 1.0);
    const r = normDist * maxRadius;
    const rad = ((bearingDeg - 90) * Math.PI) / 180; // 0 deg is North (top)
    const x = center + r * Math.cos(rad);
    const y = center + r * Math.sin(rad);
    return { x, y, r };
  };

  // Convert sweep angle to vector endpoint
  const sweepRad = ((sweepAngle - 90) * Math.PI) / 180;
  const sweepEndX = center + maxRadius * Math.cos(sweepRad);
  const sweepEndY = center + maxRadius * Math.sin(sweepRad);

  return (
    <div className="bg-[#0b101d] rounded-2xl border border-slate-800 p-5 space-y-5 shadow-2xl">
      {/* Top Header & Range/Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 relative">
            <Radio size={20} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                RF Proximity Radar
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                360° Circular Array
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time Bluetooth BLE & Wi-Fi signal triangulation, distance & stability mapping
            </p>
          </div>
        </div>

        {/* Filter Pills & Range Scale */}
        <div className="flex items-center gap-2">
          {/* Protocol Filter */}
          <div className="flex items-center bg-[#070b14] p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setProtocolFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                protocolFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({beacons.length})
            </button>
            <button
              onClick={() => setProtocolFilter('bluetooth_ble')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                protocolFilter === 'bluetooth_ble'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bluetooth size={12} /> BLE
            </button>
            <button
              onClick={() => setProtocolFilter('wifi_beacon')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                protocolFilter === 'wifi_beacon'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wifi size={12} /> Wi-Fi
            </button>
            <button
              onClick={() => setProtocolFilter('sub_ghz')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                protocolFilter === 'sub_ghz'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap size={12} /> Sub-GHz
            </button>
          </div>

          {/* Range Scale */}
          <select
            value={rangeScaleMeters}
            onChange={e => setRangeScaleMeters(Number(e.target.value))}
            className="bg-[#070b14] text-cyan-400 text-xs font-mono font-bold px-2.5 py-1.5 rounded-xl border border-slate-800 focus:outline-none cursor-pointer"
          >
            <option value={10}>Radius: 10m</option>
            <option value={20}>Radius: 20m</option>
            <option value={50}>Radius: 50m</option>
          </select>

          {/* Toggle Rotation Sweep */}
          <button
            onClick={() => setIsRotating(prev => !prev)}
            title={isRotating ? 'Pause Radar Sweep' : 'Resume Sweep'}
            className={`p-2 rounded-xl border transition-colors ${
              isRotating
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <RotateCw size={14} className={isRotating ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Grid: Radar Screen on Left, Detailed Telemetry Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Circular Radar Canvas (SVG) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <div className="relative w-[340px] sm:w-[380px] h-[340px] sm:h-[380px]">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full select-none overflow-visible"
            >
              <defs>
                {/* Sweep Gradient Sector */}
                <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
                </linearGradient>

                {/* Target Pulsing Glow Filters */}
                <filter id="radarHostileGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="radarCyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 1. Radar Circular Dark Base */}
              <circle
                cx={center}
                cy={center}
                r={maxRadius}
                fill="#060913"
                stroke="#1e293b"
                strokeWidth="2"
              />

              {/* 2. Concentric Distance Range Rings */}
              {[0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                const r = maxRadius * ratio;
                const distMark = (rangeScaleMeters * ratio).toFixed(0);
                return (
                  <g key={idx}>
                    <circle
                      cx={center}
                      cy={center}
                      r={r}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="1.2"
                      strokeDasharray={ratio < 1.0 ? '4,4' : 'none'}
                      strokeOpacity="0.8"
                    />
                    {/* Range Labels along 90-degree axis */}
                    <text
                      x={center + 6}
                      y={center - r + 12}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {distMark}m
                    </text>
                  </g>
                );
              })}

              {/* 3. Radial Crosshairs (N, S, E, W & 45-deg angles) */}
              <line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} stroke="#1e293b" strokeWidth="1" strokeDasharray="2,4" />
              <line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} stroke="#1e293b" strokeWidth="1" strokeDasharray="2,4" />

              {/* Angle Degree Ticks & Labels */}
              {[
                { angle: 0, label: '0° N' },
                { angle: 90, label: '90° E' },
                { angle: 180, label: '180° S' },
                { angle: 270, label: '270° W' }
              ].map(tick => {
                const rad = ((tick.angle - 90) * Math.PI) / 180;
                const tx = center + (maxRadius + 14) * Math.cos(rad);
                const ty = center + (maxRadius + 14) * Math.sin(rad) + 3;
                return (
                  <text
                    key={tick.angle}
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {tick.label}
                  </text>
                );
              })}

              {/* 4. Active Rotating Sweep Ray & Cone */}
              {isRotating && (
                <g>
                  {/* Sweep ray line */}
                  <line
                    x1={center}
                    y1={center}
                    x2={sweepEndX}
                    y2={sweepEndY}
                    stroke="#00e5ff"
                    strokeWidth="1.8"
                    filter="url(#radarCyanGlow)"
                  />
                  {/* Subtle sweep trail polygon */}
                  <path
                    d={`M ${center} ${center} L ${sweepEndX} ${sweepEndY} A ${maxRadius} ${maxRadius} 0 0 0 ${
                      center + maxRadius * Math.cos(sweepRad - 0.45)
                    } ${center + maxRadius * Math.sin(sweepRad - 0.45)} Z`}
                    fill="url(#radarSweepGrad)"
                  />
                </g>
              )}

              {/* 5. Center Observer Node (Your Protected Device) */}
              <circle
                cx={center}
                cy={center}
                r="6"
                fill="#00e5ff"
                stroke="#080c14"
                strokeWidth="2"
                filter="url(#radarCyanGlow)"
              />
              <circle
                cx={center}
                cy={center}
                r="10"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="1"
                strokeOpacity="0.5"
                className="animate-ping"
              />

              {/* 6. Discovered Emitters / Beacons Blips */}
              {filteredBeacons.map(beacon => {
                const coords = getBeaconCoords(beacon.estimatedDistanceMeters, beacon.bearingDegrees);
                const isSelected = selectedBeaconId === beacon.id;
                const isHovered = hoveredBeaconId === beacon.id;

                const color =
                  beacon.threatScore === 'hostile'
                    ? '#ef4444'
                    : beacon.threatScore === 'suspicious'
                    ? '#f59e0b'
                    : '#10b981';

                // Size mapped to signal stability (higher stability = crisper target)
                const blipRadius = 6 + (beacon.stabilityScore / 100) * 3;

                return (
                  <g
                    key={beacon.id}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => {
                      setSelectedBeaconId(beacon.id);
                      if (onSelectBeacon) onSelectBeacon(beacon);
                    }}
                    onMouseEnter={() => setHoveredBeaconId(beacon.id)}
                    onMouseLeave={() => setHoveredBeaconId(null)}
                  >
                    {/* Pulsing halo ring for hostile / suspicious */}
                    {beacon.threatScore !== 'safe' && (
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={blipRadius + 6}
                        fill={color}
                        fillOpacity="0.25"
                        filter={beacon.threatScore === 'hostile' ? 'url(#radarHostileGlow)' : undefined}
                      />
                    )}

                    {/* Selection Reticle Brackets */}
                    {isSelected && (
                      <g>
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r={blipRadius + 8}
                          fill="none"
                          stroke="#00e5ff"
                          strokeWidth="1.8"
                          strokeDasharray="4,3"
                        />
                        <line x1={coords.x - blipRadius - 12} y1={coords.y} x2={coords.x - blipRadius - 4} y2={coords.y} stroke="#00e5ff" strokeWidth="1.5" />
                        <line x1={coords.x + blipRadius + 4} y1={coords.y} x2={coords.x + blipRadius + 12} y2={coords.y} stroke="#00e5ff" strokeWidth="1.5" />
                        <line x1={coords.x} y1={coords.y - blipRadius - 12} x2={coords.x} y2={coords.y - blipRadius - 4} stroke="#00e5ff" strokeWidth="1.5" />
                        <line x1={coords.x} y1={coords.y + blipRadius + 4} x2={coords.x} y2={coords.y + blipRadius + 12} stroke="#00e5ff" strokeWidth="1.5" />
                      </g>
                    )}

                    {/* Target Solid Center Blip */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={blipRadius}
                      fill={color}
                      stroke="#0b101d"
                      strokeWidth="2"
                    />

                    {/* Beacon ID Label */}
                    <text
                      x={coords.x}
                      y={coords.y + blipRadius + 11}
                      textAnchor="middle"
                      fill={isSelected ? '#00e5ff' : '#cbd5e1'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {beacon.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-[0_0_8px_#ef4444]" />
              Hostile / Rogue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Suspicious RF
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Trusted
            </span>
          </div>
        </div>

        {/* Selected Beacon Detailed Telemetry Card */}
        <div className="lg:col-span-6 space-y-4">
          {activeSelected ? (
            <div className="bg-[#0f172a] rounded-xl border border-slate-700/80 p-4 space-y-4 shadow-xl">
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">{activeSelected.name}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        activeSelected.threatScore === 'hostile'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : activeSelected.threatScore === 'suspicious'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {activeSelected.threatScore}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{activeSelected.deviceType}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-mono">{activeSelected.manufacturer}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase">Estimated Range</div>
                  <div className="text-xl font-black text-cyan-400 font-mono">
                    {activeSelected.estimatedDistanceMeters}m
                  </div>
                </div>
              </div>

              {/* 4 Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Signal Strength (RSSI)
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-white">
                      {activeSelected.rssi} dBm
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Tx: {activeSelected.txPower ?? 0} dBm
                    </span>
                  </div>
                  {/* RSSI Signal Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        activeSelected.rssi > -60
                          ? 'bg-emerald-400'
                          : activeSelected.rssi > -75
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.max(10, Math.min(100, (activeSelected.rssi + 100) * 1.6))}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Signal Stability Score
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-cyan-400">
                      {activeSelected.stabilityScore}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {activeSelected.stabilityScore > 75 ? 'Stable' : 'Fluctuating'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full"
                      style={{ width: `${activeSelected.stabilityScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Bearing & Direction
                  </div>
                  <div className="font-mono text-sm font-bold text-white flex items-center gap-1.5">
                    <Crosshair size={14} className="text-cyan-400" />
                    <span>{activeSelected.bearingDegrees}° Azimuth</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    RF Frequency Band
                  </div>
                  <div className="font-mono text-xs font-semibold text-slate-200 truncate">
                    {activeSelected.frequency}
                  </div>
                </div>
              </div>

              {/* Hardware Identifiers & Ping */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">MAC Address / BSSID</span>
                  <span className="text-slate-200 font-bold">{activeSelected.macAddress}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block uppercase">Last Detection</span>
                  <span className="text-emerald-400">{activeSelected.lastPing}</span>
                </div>
              </div>

              {/* Tactical Assessment Notice */}
              <div
                className={`p-3 rounded-lg border text-xs leading-relaxed ${
                  activeSelected.threatScore === 'hostile'
                    ? 'bg-red-950/30 border-red-500/40 text-red-300'
                    : activeSelected.threatScore === 'suspicious'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {activeSelected.threatScore === 'hostile' ? (
                    <ShieldAlert size={14} className="text-red-400" />
                  ) : activeSelected.threatScore === 'suspicious' ? (
                    <AlertTriangle size={14} className="text-amber-400" />
                  ) : (
                    <ShieldCheck size={14} className="text-emerald-400" />
                  )}
                  <span>Tactical Perimeter Assessment</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {activeSelected.threatScore === 'hostile'
                    ? 'Rogue wireless sniffing or evil-twin injection signature detected. Enforce physical quarantine or activate RF jammer shield.'
                    : activeSelected.threatScore === 'suspicious'
                    ? 'Unregistered or ad-hoc transceiver detected within immediate proximity. Recommend physical inspection of premises.'
                    : 'Authorized asset with consistent cryptographic beacon handshakes and expected RSSI attenuation.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 bg-[#0f172a] rounded-xl border border-slate-800">
              Select an emitter on the radar circle to view signal telemetry.
            </div>
          )}

          {/* Quick Beacon List Selector */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
            {filteredBeacons.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBeaconId(b.id)}
                className={`w-full p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                  selectedBeaconId === b.id
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      b.threatScore === 'hostile'
                        ? 'bg-red-400'
                        : b.threatScore === 'suspicious'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="font-bold font-mono text-[11px]">{b.id}</span>
                  <span className="truncate">{b.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                  <span className="text-slate-400">{b.estimatedDistanceMeters}m</span>
                  <span className="text-cyan-400 font-bold">{b.rssi} dBm</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

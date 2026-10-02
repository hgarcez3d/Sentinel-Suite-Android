import React, { useState } from 'react';
import { NetworkDevice, PortInfo, Vulnerability } from '../types/network';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Pin,
  Copy,
  Check,
  Radio,
  Cpu,
  Wifi,
  Terminal,
  Activity,
  Server,
  Camera,
  Laptop,
  Smartphone,
  Router,
  Flame
} from 'lucide-react';

interface DeviceDetailModalProps {
  device: NetworkDevice;
  onClose: () => void;
  onToggleIsolation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRescanDevice: (device: NetworkDevice) => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  device,
  onClose,
  onToggleIsolation,
  onTogglePin,
  onRescanDevice
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'vulnerabilities' | 'ports' | 'fingerprint'>('vulnerabilities');

  const copyNmapCommand = () => {
    const cmd = `nmap -sS -sV -O -p- --script vuln ${device.ip}`;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDeviceIcon = () => {
    switch (device.deviceType) {
      case 'gateway': return <Router className="w-5 h-5 text-cyan-400" />;
      case 'camera': return <Camera className="w-5 h-5 text-red-400" />;
      case 'server': return <Server className="w-5 h-5 text-blue-400" />;
      case 'workstation': return <Laptop className="w-5 h-5 text-purple-400" />;
      case 'mobile': return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'rogue': return <Flame className="w-5 h-5 text-red-500" />;
      default: return <Cpu className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
      />
      <div className="fixed inset-x-0 bottom-0 max-h-[85vh] sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[480px] bg-[#0c1322] border-t sm:border-t-0 sm:border-l border-slate-800 rounded-t-2xl sm:rounded-none shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2 sm:hidden shrink-0" />
      {/* Top Header */}
      <div className="p-5 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
            {getDeviceIcon()}
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {device.hostname}
              {device.isPinned && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  PINNED
                </span>
              )}
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="capitalize">{device.deviceType.replace('_', ' ')}</span>
              <span>•</span>
              <span className="text-cyan-400 font-mono">{device.ip}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* Security Status Banner */}
        <div
          className={`p-4 rounded-xl border ${
            device.securityStatus === 'critical'
              ? 'bg-red-950/30 border-red-500/40 text-red-300'
              : device.securityStatus === 'warning'
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 font-bold text-sm tracking-wide uppercase">
              {device.securityStatus === 'critical' ? (
                <>
                  <ShieldAlert className="text-red-400" size={18} />
                  <span>Critical Vulnerability Detected</span>
                </>
              ) : device.securityStatus === 'warning' ? (
                <>
                  <AlertTriangle className="text-amber-400" size={18} />
                  <span>Audit Warning / High Risk</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="text-emerald-400" size={18} />
                  <span>Hardened & Protected</span>
                </>
              )}
            </div>

            {device.vulnerabilities.length > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/50 font-bold">
                {device.vulnerabilities.length} CVEs
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {device.securityStatus === 'critical'
              ? 'Unauthenticated camera feed broadcast or remote code execution vector exposed. Isolate immediately.'
              : device.securityStatus === 'warning'
              ? 'Potentially insecure services, default ports, or unencrypted management connections found.'
              : 'Host is following security baselines with filtered management ports and encrypted protocols.'}
          </p>
        </div>

        {/* Action Controls Bar */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onToggleIsolation(device.id)}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              device.isIsolated
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-600/90 hover:bg-red-500 text-white shadow-lg shadow-red-950/50'
            }`}
          >
            {device.isIsolated ? <Unlock size={15} /> : <Lock size={15} />}
            <span>{device.isIsolated ? 'Restore Traffic' : 'Quarantine Host'}</span>
          </button>

          <button
            onClick={() => onRescanDevice(device)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw size={15} className="text-cyan-400" />
            <span>Targeted Rescan</span>
          </button>

          <button
            onClick={() => onTogglePin(device.id)}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
              device.isPinned
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Pin size={14} />
            <span>{device.isPinned ? 'Unpin Position' : 'Pin in Graph'}</span>
          </button>

          <button
            onClick={copyNmapCommand}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied CLI' : 'Copy Nmap CLI'}</span>
          </button>
        </div>

        {/* Device Technical Specs Grid */}
        <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-4">
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3">
            Hardware & Network Telemetry
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-slate-500 text-[11px]">Vendor / OUI</div>
              <div className="font-medium text-slate-200 truncate">{device.vendor}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">MAC Address</div>
              <div className="font-mono text-cyan-400">{device.mac}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Latency & RSSI</div>
              <div className="text-slate-200">
                {device.latencyMs} ms {device.rssiSignalDbm ? `(${device.rssiSignalDbm} dBm)` : ''}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Traffic (Rx / Tx)</div>
              <div className="text-slate-200">
                {(device.rxRateKbps / 1024).toFixed(1)} / {(device.txRateKbps / 1024).toFixed(1)} MB/s
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation for Vulnerabilities / Open Ports / Fingerprint */}
        <div className="flex border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('vulnerabilities')}
            className={`pb-2.5 px-3 font-semibold relative transition-colors ${
              activeTab === 'vulnerabilities' ? 'text-red-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vulnerabilities ({device.vulnerabilities.length})
            {activeTab === 'vulnerabilities' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ports')}
            className={`pb-2.5 px-3 font-semibold relative transition-colors ${
              activeTab === 'ports' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Open Ports ({device.openPorts.length})
            {activeTab === 'ports' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('fingerprint')}
            className={`pb-2.5 px-3 font-semibold relative transition-colors ${
              activeTab === 'fingerprint' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OS Fingerprint
            {activeTab === 'fingerprint' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
        </div>

        {/* Tab 1: Vulnerabilities */}
        {activeTab === 'vulnerabilities' && (
          <div className="space-y-3">
            {device.vulnerabilities.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs bg-slate-900/30 rounded-xl border border-slate-800/60">
                <ShieldCheck className="mx-auto mb-2 text-emerald-400" size={24} />
                No known CVEs or insecure services detected on this host.
              </div>
            ) : (
              device.vulnerabilities.map(vuln => (
                <div
                  key={vuln.cveId}
                  className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-red-400 text-sm">{vuln.cveId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                      CVSS {vuln.cvssScore} {vuln.severity}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200">{vuln.title}</div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{vuln.description}</p>
                  <div className="mt-2 pt-2 border-t border-red-500/20 text-cyan-300 text-[11px]">
                    <strong className="text-slate-300">Remediation: </strong>
                    {vuln.remediation}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Open Ports & Services */}
        {activeTab === 'ports' && (
          <div className="space-y-2">
            {device.openPorts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs bg-slate-900/30 rounded-xl border border-slate-800/60">
                All common ports filtered or closed by firewall.
              </div>
            ) : (
              device.openPorts.map(port => (
                <div
                  key={`${port.port}-${port.protocol}`}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    port.isHighRisk
                      ? 'bg-red-950/20 border-red-500/40 text-red-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">
                        {port.port}/{port.protocol}
                      </span>
                      <span className="font-semibold text-white">{port.service}</span>
                    </div>
                    {port.version && (
                      <div className="text-[11px] text-slate-400 mt-0.5">{port.version}</div>
                    )}
                    {port.riskNotes && (
                      <div className="text-[10px] font-semibold text-red-400 mt-1 flex items-center gap-1">
                        <AlertTriangle size={11} />
                        {port.riskNotes}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      port.isHighRisk
                        ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {port.state}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: OS Fingerprint */}
        {activeTab === 'fingerprint' && (
          <div className="space-y-3 bg-[#0f172a] rounded-xl border border-slate-800 p-4 text-xs">
            <div>
              <div className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
                OS Details (Nmap Fingerprint)
              </div>
              <div className="font-mono text-cyan-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {device.osFingerprint}
              </div>
            </div>

            <div>
              <div className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
                Last Scan Execution
              </div>
              <div className="text-slate-300">{device.lastScanned}</div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
                Raw Nmap Command Reference
              </div>
              <code className="block font-mono text-[11px] bg-slate-950 text-slate-300 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                nmap -sS -sV -O -p- --script vuln {device.ip}
              </code>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

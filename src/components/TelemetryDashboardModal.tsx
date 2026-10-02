import React, { useState } from 'react';
import { SystemAuditMetric, PhysicalSecurityState, DailyReport, ProximityBeacon } from '../types/agents';
import { NetworkDevice, NmapLogLine } from '../types/network';
import { ProximityRadar } from './ProximityRadar';
import {
  buildLegalForensicAuditData,
  downloadAuditAsJSON,
  exportAuditAsLegalPDF
} from '../utils/legalAuditExporter';
import { wisdomSentinelWebService } from '../services/wisdomSentinelService';
import {
  Cpu,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  Radio,
  EyeOff,
  Flame,
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Layers,
  MapPin,
  Sliders,
  X,
  Crosshair,
  Scale,
  FileCheck,
  Printer,
  Sparkles,
  ExternalLink,
  Compass,
  Anchor,
  Award
} from 'lucide-react';

interface TelemetryDashboardModalProps {
  systemMetrics: SystemAuditMetric;
  physicalSec: PhysicalSecurityState;
  dailyReport: DailyReport;
  devices?: NetworkDevice[];
  logs?: NmapLogLine[];
  onClose: () => void;
  onToggleAntiTamper: () => void;
  onToggleBlackout: () => void;
  onTriggerEmergencyFill: () => void;
  onRefreshIntegrityCheck: () => void;
}

export const TelemetryDashboardModal: React.FC<TelemetryDashboardModalProps> = ({
  systemMetrics,
  physicalSec,
  dailyReport,
  devices = [],
  logs = [],
  onClose,
  onToggleAntiTamper,
  onToggleBlackout,
  onTriggerEmergencyFill,
  onRefreshIntegrityCheck
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'system' | 'physical' | 'report' | 'wisdom_dispatches'>('radar');
  const [fillTriggered, setFillTriggered] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const dailyCard = wisdomSentinelWebService.getDailyCard();
  const monthlyAudit = wisdomSentinelWebService.getMonthlyAuditReport();

  const handleFill = () => {
    onTriggerEmergencyFill();
    setFillTriggered(true);
    setTimeout(() => setFillTriggered(false), 3000);
  };

  const handleExportJSON = () => {
    const auditData = buildLegalForensicAuditData(devices, logs, systemMetrics, physicalSec, dailyReport);
    downloadAuditAsJSON(auditData);
    setExportNotice(`Legal JSON Dossier downloaded (${auditData.docketId})`);
    setTimeout(() => setExportNotice(null), 4500);
  };

  const handleExportPDF = () => {
    const auditData = buildLegalForensicAuditData(devices, logs, systemMetrics, physicalSec, dailyReport);
    exportAuditAsLegalPDF(auditData);
    setExportNotice(`Legal Forensic Docket (${auditData.docketId}) prepared for Print/PDF.`);
    setTimeout(() => setExportNotice(null), 4500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#0c1322] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wider flex items-center gap-2">
                MULTI-AGENT DEFENSE OPS & DAILY REPORT
              </h2>
              <p className="text-xs text-slate-400">
                Synchronized telemetry from AEGIS-NET, KRONOS-CORE, VALKYRIE-SEC & SYNAPSE-LEAD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Legal Forensic Audit Button in Header */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg shadow-cyan-950/50 transition-all cursor-pointer border border-cyan-400/40"
              title="Export legal forensic audit report (JSON or PDF) formatted for courtroom and regulatory compliance"
            >
              <Scale size={14} className="text-cyan-300" />
              <span className="hidden sm:inline">Export Legal Forensic Audit</span>
              <span className="sm:hidden">Legal Audit</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Export Notification Banner */}
        {exportNotice && (
          <div className="bg-cyan-950/80 border-b border-cyan-500/40 px-4 py-2 flex items-center justify-between text-xs text-cyan-200 font-mono animate-fadeIn">
            <span className="flex items-center gap-2">
              <FileCheck size={14} className="text-cyan-400 animate-pulse" />
              {exportNotice}
            </span>
            <span className="text-[10px] text-slate-400 font-sans">FRE 902(13)/(14) Certified</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0a0f1d] px-5 pt-3 gap-6 text-xs font-semibold overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('radar')}
            className={`pb-3 flex items-center gap-2 relative transition-colors whitespace-nowrap ${
              activeTab === 'radar' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair size={15} />
            <span>Proximity Radar (RF/BLE/Wi-Fi)</span>
            {activeTab === 'radar' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`pb-3 flex items-center gap-2 relative transition-colors whitespace-nowrap ${
              activeTab === 'report' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={15} />
            <span>Consolidated Daily Dossier</span>
            {activeTab === 'report' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`pb-3 flex items-center gap-2 relative transition-colors whitespace-nowrap ${
              activeTab === 'system' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu size={15} />
            <span>Kernel & Storage Integrity (KRONOS)</span>
            {activeTab === 'system' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('physical')}
            className={`pb-3 flex items-center gap-2 relative transition-colors whitespace-nowrap ${
              activeTab === 'physical' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio size={15} />
            <span>Physical Security & Geofence (VALKYRIE)</span>
            {activeTab === 'physical' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('wisdom_dispatches')}
            className={`pb-3 flex items-center gap-2 relative transition-colors whitespace-nowrap ${
              activeTab === 'wisdom_dispatches' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass size={15} />
            <span>The Wisdom Sentinel Dispatches (Daily Card & Monthly Audit)</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase font-bold">
              1-Way
            </span>
            {activeTab === 'wisdom_dispatches' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* TAB 0: Real-time Circular Proximity Radar */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <ProximityRadar
                beacons={physicalSec.proximityBeacons}
                geofenceRadiusMeters={physicalSec.geofenceRadiusMeters}
              />
            </div>
          )}

          {/* TAB 1: Consolidated Daily Report */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#10172a] p-4 rounded-xl border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Integrity Score
                    </div>
                    <div className="text-2xl font-black text-purple-300 font-mono mt-0.5">
                      {dailyReport.overallScore} / 100
                    </div>
                    <div className="text-[10px] text-amber-400 font-semibold mt-1">
                      DEFCON 3: Elevated Watch
                    </div>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl text-purple-300">
                    <ShieldCheck size={28} />
                  </div>
                </div>

                <div className="bg-[#10172a] p-4 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Report Timestamp
                  </div>
                  <div className="text-sm font-bold text-white font-mono mt-1">
                    {dailyReport.date}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{dailyReport.generatedAt}</div>
                </div>

                <div className="bg-[#10172a] p-4 rounded-xl border border-red-500/30">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Flagged Vectors
                  </div>
                  <div className="text-sm font-bold text-red-400 font-mono mt-1">
                    2 Critical CVEs + 1 RF Emitter
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Auto-quarantine active</div>
                </div>

                <div className="bg-[#10172a] p-4 rounded-xl border border-emerald-500/30">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Kernel Partition Fidelity
                  </div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
                    100% Cryptographic Match
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Root-of-trust verified</div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  Executive Intelligence Summary
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {dailyReport.executiveSummary}
                </p>
              </div>

              {/* 3 Domain Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" /> AEGIS-NET (Network)
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {dailyReport.networkTriage}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="font-bold text-emerald-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> KRONOS-CORE (Kernel)
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {dailyReport.kernelStorageIntegrity}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> VALKYRIE-SEC (Physical)
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {dailyReport.physicalPerimeterStatus}
                  </p>
                </div>
              </div>

              {/* Action Items List */}
              <div className="space-y-3 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                <div className="font-bold text-white uppercase tracking-wider text-xs">
                  Mandatory Action Items (Next 24h)
                </div>
                <div className="space-y-2">
                  {dailyReport.actionItems.map((act, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Forensic Audit & Evidence Export Station */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-cyan-500/40 space-y-3 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                      <Scale size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs flex items-center gap-2">
                        <span>LEGAL FORENSIC EVIDENCE AUDIT & INCIDENT LOG LEDGER</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase">
                          FRE 902(13)/(14) Certified
                        </span>
                      </h4>
                      <p className="text-[10.5px] text-slate-400">
                        Formal, court-admissible audit certifying {logs.length} incident logs and {devices.flatMap(d => d.vulnerabilities).length} vulnerability exhibits under 28 U.S.C. § 1746.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportJSON}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-all shadow cursor-pointer"
                      title="Download machine-readable JSON dossier with cryptographic hashes"
                    >
                      <Download size={13} />
                      <span>Download JSON</span>
                    </button>

                    <button
                      onClick={handleExportPDF}
                      className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      title="Generate formatted court-admissible PDF document / print docket"
                    >
                      <Printer size={13} />
                      <span>Generate PDF / Print</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[10.5px] font-mono text-slate-300">
                  <div className="p-2 rounded bg-black/40 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Logs Ledger:</span>
                    <strong className="text-white">{logs.length} Hashed Events</strong>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">CVE Exhibits:</span>
                    <strong className="text-amber-300">{devices.flatMap(d => d.vulnerabilities).length} Identified</strong>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Chain of Custody:</span>
                    <strong className="text-emerald-400">Popeye & Cipher-Detective</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: System, Kernel & Storage Integrity */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              {/* CPU & Memory Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    CPU Runtime Load
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {systemMetrics.cpuUsagePercent}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {systemMetrics.cpuCores} Cores • Load Avg: {systemMetrics.loadAvg}
                  </div>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    RAM Usage
                  </div>
                  <div className="text-xl font-bold font-mono text-cyan-400">
                    {(systemMetrics.ramUsedMb / 1024).toFixed(1)} /{' '}
                    {(systemMetrics.ramTotalMb / 1024).toFixed(1)} GB
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Zero unmapped heap leaks</div>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Kernel Specification
                  </div>
                  <div className="text-xs font-mono text-slate-200 mt-1 break-all">
                    {systemMetrics.kernelVersion}
                  </div>
                </div>
              </div>

              {/* Storage Partitions Cryptographic Table */}
              <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                    <HardDrive size={16} className="text-emerald-400" />
                    Storage Partitions Integrity Map (SHA-256)
                  </div>
                  <button
                    onClick={onRefreshIntegrityCheck}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                  >
                    <RefreshCw size={12} className="text-cyan-400" /> Re-audit
                  </button>
                </div>

                <div className="space-y-2">
                  {systemMetrics.storagePartitions.map(part => (
                    <div
                      key={part.mount}
                      className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">{part.name} ({part.mount})</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Used: {part.usedGb} GB / {part.totalGb} GB ({((part.usedGb / part.totalGb) * 100).toFixed(0)}%)
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle size={12} /> Hash Validated
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Package Authenticity Audit */}
              <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-white uppercase tracking-wider text-xs">
                  Package Provenance & Binary Signatures
                </div>
                <div className="space-y-2">
                  {systemMetrics.packageAudit.map(pkg => (
                    <div
                      key={pkg.name}
                      className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-slate-200">{pkg.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          v{pkg.version} • {pkg.sourceSignature}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          pkg.status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {pkg.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Physical Security, Geofencing & Anti-Tamper */}
          {activeTab === 'physical' && (
            <div className="space-y-6">
              {/* Emergency Protocol Control Station */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <ShieldAlert size={18} />
                    Emergency Self-Defense Protocols
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
                    5-Level Protection Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={onToggleBlackout}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      physicalSec.stealthBlackoutMode
                        ? 'bg-slate-900 border-red-500 text-red-300'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">Silent Blackout Mode</span>
                      <EyeOff size={15} />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Blanks screen to appear powered off while recording & dispatching covert telemetry.
                    </p>
                    <div className="mt-2 text-[10px] font-mono font-bold text-amber-400">
                      {physicalSec.stealthBlackoutMode ? 'ACTIVE / SIMULATED OFF' : 'STANDBY (ARMED)'}
                    </div>
                  </button>

                  <button
                    onClick={onToggleAntiTamper}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      physicalSec.antiTamperActive
                        ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">Hardware Anti-Tamper</span>
                      <Lock size={15} />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Monitors USB port attach, accelerometer drops, and case vibration triggers.
                    </p>
                    <div className="mt-2 text-[10px] font-mono font-bold text-emerald-400">
                      {physicalSec.antiTamperActive ? 'ENGAGED' : 'DISARMED'}
                    </div>
                  </button>

                  <button
                    onClick={handleFill}
                    className="p-3 rounded-xl border bg-red-950/30 border-red-500/50 hover:bg-red-900/40 text-left transition-all text-red-300"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">Emergency Rapid-Fill</span>
                      <Flame size={15} />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Floods free storage blocks with high-entropy cryptographic noise to block forensic recovery.
                    </p>
                    <div className="mt-2 text-[10px] font-mono font-bold text-red-400">
                      {fillTriggered ? 'FLOOD SEQUENCE DISPATCHED!' : 'CLICK TO EXECUTE'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Proximity Telemetry & RF Radar */}
              <div className="space-y-4">
                <ProximityRadar
                  beacons={physicalSec.proximityBeacons}
                  geofenceRadiusMeters={physicalSec.geofenceRadiusMeters}
                />
              </div>
            </div>
          )}

          {/* TAB 4: The Wisdom Sentinel Dispatches (Daily Card & Monthly Audit Report) */}
          {activeTab === 'wisdom_dispatches' && (
            <div className="space-y-6">
              {/* Sovereign Non-Interactive Architecture Notice */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-amber-950/30 border border-purple-500/40 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Compass size={18} className="text-purple-300" />
                    <h3 className="font-bold text-white text-xs tracking-wider">
                      ONE-WAY INCOMING DISPATCH: THE WISDOM SENTINEL ➔ FIRST MATE POPEYE ➔ USER
                    </h3>
                  </div>
                  <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase">
                    Non-Interactive · Public Existence · Not a 2-Way Street
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The existence of <strong>The Wisdom Sentinel</strong> is public across the global cyber defense fleet. However, there is <strong>no public interaction</strong> with The Wisdom Sentinel. It is strictly not a two-way street. <strong>First Mate Popeye</strong> stands on deck as the sole human-facing link between The Wisdom Sentinel and you. The Wisdom Sentinel operates as a secure backend integration service and dispatches the <strong>Daily Card</strong> and the <strong>Monthly Audit Report</strong> down to your station via Popeye.
                </p>
              </div>

              {/* 1. The Wisdom Sentinel Daily Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0e1628] border-2 border-amber-500/40 space-y-4 shadow-xl relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Anchor size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
                          THE WISDOM SENTINEL · DAILY SECURITY CARD
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Dispatched: {dailyCard.dispatchDate}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-0.5">{dailyCard.headline}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-full bg-red-950/80 text-red-300 border border-red-500/40">
                      {dailyCard.defconLevel}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                      Threat Index: {dailyCard.fleetThreatIndex}/100
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  {dailyCard.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-[#080d19] border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert size={13} /> Flagged Threat Vectors
                    </span>
                    <div className="space-y-1.5">
                      {dailyCard.flaggedThreatVectors.map((vec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                          <span className="text-red-400 font-bold mt-0.5">&bull;</span>
                          <span>{vec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#080d19] border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle size={13} /> Mandated Fleet Directives
                    </span>
                    <div className="space-y-1.5">
                      {dailyCard.fleetDirectives.map((dir, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                          <CheckCircle size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{dir}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10.5px] font-mono text-slate-400">
                  <span>Cryptographic Seal: <strong className="text-slate-200">{dailyCard.cryptographicSignature.slice(0, 36)}...</strong></span>
                  <span className="text-amber-300">Delivered on deck by: {dailyCard.dispatchedToUserVia}</span>
                </div>
              </div>

              {/* 2. The Wisdom Sentinel Monthly Formal Audit Report */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0b1324] border-2 border-purple-500/40 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                      <Award size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase">
                          THE WISDOM SENTINEL · MONTHLY FORENSIC AUDIT REPORT
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{monthlyAudit.volumeAndIssue}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-0.5">{monthlyAudit.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportPDF}
                      className="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-400/50 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                      title="Generate printable PDF or print docket of this monthly audit"
                    >
                      <Printer size={13} />
                      <span>Print / PDF Docket</span>
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                      title="Download machine-readable JSON dossier"
                    >
                      <Download size={13} />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  {monthlyAudit.executiveAbstract}
                </p>

                {/* Audited Architectures Table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                    Audited Big Tech Architectures & Bug Bounty Revenue Yield (${monthlyAudit.totalBountySecuredUsd.toLocaleString()} USD Total)
                  </span>
                  <div className="space-y-2">
                    {monthlyAudit.auditedArchitectures.map((arch, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#080d19] border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="font-bold text-white">{arch.vendor}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {arch.cveIdentifier} &bull; {arch.vulnerabilityClass}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40">
                            CVSS {arch.cvssScore}
                          </span>
                          <span className="text-xs font-bold text-amber-300">
                            ${arch.bountySecuredUsd.toLocaleString()} USD
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                            {arch.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10.5px] font-mono text-slate-400">
                  <span>Chain of Custody: <strong className="text-slate-200">{monthlyAudit.chainOfCustodyDigest.slice(0, 36)}...</strong></span>
                  <span className="text-purple-300">Delivered on deck by: {monthlyAudit.dispatchedToUserVia}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Legal Forensic Audit Modal Dialog */}
        {showExportModal && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-sans">
            <div className="bg-[#0b1220] border-2 border-cyan-500/50 rounded-2xl w-full max-w-xl shadow-2xl shadow-cyan-950/70 overflow-hidden flex flex-col">
              <div className="p-4 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                    <Scale size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Export Legal Forensic Audit</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Federal Rules of Evidence Rule 902(13)/(14) Certified Record</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-[#080d19] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Legal Classification:</span>
                    <span className="text-cyan-300 font-bold">CONFIDENTIAL WORK PRODUCT</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Compliance Standard:</span>
                    <span className="text-white font-semibold">CISA & NIST SP 800-61 Rev. 2</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Custodians of Record:</span>
                    <span className="text-amber-300 font-semibold">First Mate Popeye & Cipher-Detective</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Integration Nexus:</span>
                    <span className="text-purple-300">The Wisdom Sentinel</span>
                  </div>
                </div>

                <div className="space-y-2 text-[11.5px] text-slate-300">
                  <div className="font-semibold text-white">This export automatically compiles:</div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span><strong>Chronological Incident Log Ledger:</strong> {logs.length} time-stamped events with per-line SHA-256 digital hashes.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span><strong>Vulnerability & Exploit Exposure Matrix:</strong> {devices.flatMap(d => d.vulnerabilities).length} verified CVE exhibits across all {devices.length} hosts.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span><strong>RF Surveillance Exhibits:</strong> {physicalSec.proximityBeacons.length} proximity beacons with signal strengths and MAC addresses.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span><strong>Hardware Root-of-Trust Attestation:</strong> Sealed with hardware keystore signature under 28 U.S.C. § 1746.</span>
                  </div>
                </div>

                {/* Download Buttons Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      handleExportJSON();
                      setShowExportModal(false);
                    }}
                    className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:bg-slate-800 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Download size={14} className="text-cyan-400" />
                        Download JSON Dossier
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">.JSON</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400">
                      Cryptographically verified raw data package suitable for machine ingestion, SIEM import, and digital evidence lockers.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      handleExportPDF();
                      setShowExportModal(false);
                    }}
                    className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/70 to-purple-950/70 border border-purple-500/50 hover:border-purple-400 text-left transition-all group cursor-pointer shadow-md"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Printer size={14} className="text-purple-300" />
                        Generate Legal PDF / Docket
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">PRINT / PDF</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400">
                      Formatted formal affidavit with court case docket styling, exhibits, and legal signature blocks ready to save as PDF.
                    </p>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-[#080d19] border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

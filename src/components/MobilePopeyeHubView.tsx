import React, { useState } from 'react';
import { wisdomSentinelWebService } from '../services/wisdomSentinelService';
import {
  Anchor,
  FileText,
  Calendar,
  Award,
  Sparkles,
  Download,
  Printer,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity,
  Layers,
  FileCheck
} from 'lucide-react';
import {
  buildLegalForensicAuditData,
  downloadAuditAsJSON,
  exportAuditAsLegalPDF
} from '../utils/legalAuditExporter';
import { NetworkDevice, NmapLogLine } from '../types/network';
import { SystemAuditMetric, PhysicalSecurityState, DailyReport } from '../types/agents';

interface MobilePopeyeHubViewProps {
  devices: NetworkDevice[];
  logs: NmapLogLine[];
  systemMetrics: SystemAuditMetric;
  physicalSec: PhysicalSecurityState;
  dailyReport: DailyReport;
  onOpenTelemetryModal: () => void;
}

export const MobilePopeyeHubView: React.FC<MobilePopeyeHubViewProps> = ({
  devices,
  logs,
  systemMetrics,
  physicalSec,
  dailyReport,
  onOpenTelemetryModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'monthly' | 'export'>('daily');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const dailyCard = wisdomSentinelWebService.getDailyCard();
  const monthlyAudit = wisdomSentinelWebService.getMonthlyAuditReport();
  const syncState = wisdomSentinelWebService.getSyncState();

  const handleExportJSON = () => {
    const auditData = buildLegalForensicAuditData(devices, logs, systemMetrics, physicalSec, dailyReport);
    downloadAuditAsJSON(auditData);
    setExportNotice(`Docket ${auditData.docketId} exported as JSON`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportPDF = () => {
    const auditData = buildLegalForensicAuditData(devices, logs, systemMetrics, physicalSec, dailyReport);
    exportAuditAsLegalPDF(auditData);
    setExportNotice(`Docket ${auditData.docketId} formatted for PDF print.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#080c14] p-3.5 space-y-3.5 custom-scrollbar pb-6">
      {/* Top Liaison Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/40 rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Anchor size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-black uppercase text-amber-200 tracking-wider">
                FIRST MATE POPEYE
              </h2>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                SOLE LIAISON
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Downlink channel from The Wisdom Sentinel Central Registry
            </p>
          </div>
        </div>

        <p className="text-[10.5px] text-slate-300 leading-relaxed bg-[#0b101c]/80 p-2 rounded-lg border border-slate-800">
          The existence of <strong className="text-amber-300">The Wisdom Sentinel</strong> is public, but strictly non-interactive. First Mate Popeye receives the official <span className="text-cyan-300">Daily Card</span> and <span className="text-purple-300">Monthly Audit Report</span> down to this mobile APK node.
        </p>

        {/* Sync Node Bar */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
            <span className="text-slate-500 block">Mobile Node:</span>
            <span className="text-cyan-300 font-bold">Alpha (APK Unit)</span>
          </div>
          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
            <span className="text-slate-500 block">Web Station:</span>
            <span className="text-slate-300 font-bold">Forensic Monitor (Sync)</span>
          </div>
        </div>
      </div>

      {/* Sub tabs: Daily Card | Monthly Report | Legal Export */}
      <div className="flex items-center gap-1.5 bg-[#0e1626] p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveSubTab('daily')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all ${
            activeSubTab === 'daily'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar size={13} />
          <span>Daily Card</span>
        </button>

        <button
          onClick={() => setActiveSubTab('monthly')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all ${
            activeSubTab === 'monthly'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award size={13} />
          <span>Monthly Audit</span>
        </button>

        <button
          onClick={() => setActiveSubTab('export')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all ${
            activeSubTab === 'export'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale size={13} />
          <span>Legal Export</span>
        </button>
      </div>

      {exportNotice && (
        <div className="bg-cyan-950/80 border border-cyan-500/50 p-2.5 rounded-lg text-xs font-mono text-cyan-200 flex items-center gap-2 animate-fadeIn">
          <FileCheck size={14} className="text-cyan-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* SUB-TAB 1: Daily Card */}
      {activeSubTab === 'daily' && (
        <div className="space-y-3">
          <div className="bg-[#0c1322] border border-amber-500/30 rounded-xl p-3.5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                {dailyCard.cardId}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {dailyCard.dispatchDate}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1.5">
              {dailyCard.headline}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {dailyCard.summary}
            </p>

            <div className="border-t border-slate-800 pt-2.5 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Fleet Directives from Wisdom Sentinel:
              </span>
              {dailyCard.fleetDirectives.map((directive: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                  <span className="text-amber-400 font-bold shrink-0">#{idx + 1}</span>
                  <span>{directive}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Monthly Audit */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-3">
          <div className="bg-[#0c1322] border border-purple-500/30 rounded-xl p-3.5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                {monthlyAudit.volumeAndIssue}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                Bounty: ${monthlyAudit.totalBountySecuredUsd.toLocaleString()}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1">
              {monthlyAudit.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {monthlyAudit.executiveAbstract}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9.5px] block">Audited Targets</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {monthlyAudit.auditedArchitectures.length} Vectors
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9.5px] block">Liaison</span>
                <span className="text-amber-400 font-bold text-sm">
                  {monthlyAudit.dispatchedToUserVia}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-2.5">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                Formal Journal Reference:
              </span>
              <span className="text-[11px] text-cyan-300 block font-mono truncate">
                {monthlyAudit.formalJournalUrl}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Legal Forensic Export */}
      {activeSubTab === 'export' && (
        <div className="space-y-3">
          <div className="bg-[#0c1322] border border-cyan-500/30 rounded-xl p-3.5 shadow-lg">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Scale size={14} className="text-cyan-400" />
              Courtroom & Regulatory Chain of Custody
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              Generate cryptographic chain-of-custody dossiers with SHA-256 evidence hashing, MITRE ATT&CK correlation, and Popeye bug-bounty documentation for legal or CISA compliance.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all border border-cyan-400/40"
              >
                <Printer size={14} />
                <span>Legal PDF / Print</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-bold text-xs border border-slate-700 shadow-md transition-all"
              >
                <Download size={14} />
                <span>JSON Docket</span>
              </button>
            </div>
          </div>

          <button
            onClick={onOpenTelemetryModal}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800/80 transition-colors"
          >
            <Layers size={14} className="text-cyan-400" />
            <span>Open Advanced System & Storage Integrity View</span>
          </button>
        </div>
      )}
    </div>
  );
};

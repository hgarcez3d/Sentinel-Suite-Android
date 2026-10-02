import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Search,
  Anchor,
  FileText,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Lock,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  Terminal,
  Crosshair,
  FileCheck,
  X
} from 'lucide-react';
import { ThreatIntelligenceReport } from '../types/agents';
import { NmapLogLine } from '../types/network';
import { TelemetryContext, analyzeThreatIntelligence } from '../services/geminiAgentService';

interface ThreatIntelligencePanelProps {
  logs: NmapLogLine[];
  telemetry: TelemetryContext;
  onClose?: () => void;
  onSelectAgent?: (role: any) => void;
}

export const ThreatIntelligencePanel: React.FC<ThreatIntelligencePanelProps> = ({
  logs,
  telemetry,
  onClose,
  onSelectAgent
}) => {
  const [report, setReport] = useState<ThreatIntelligenceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLogsInspector, setShowLogsInspector] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeThreatIntelligence(logs, telemetry);
      setReport(result);
    } catch (err) {
      console.error('Threat Intelligence analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Run initial analysis on mount
    runAnalysis();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border-l border-slate-800/90 shadow-2xl overflow-hidden font-sans text-xs">
      {/* 1. Header with Gemini AI Trigger */}
      <div className="p-3.5 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600/30 to-purple-600/30 border border-red-500/40 flex items-center justify-center text-red-400 shadow-md">
            <ShieldAlert size={16} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-xs tracking-wider">THREAT INTELLIGENCE</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold flex items-center gap-1">
                <Sparkles size={10} className="text-purple-400" /> GEMINI AI
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400">Attack Pattern Identification & Campaign Attribution</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-400 hover:to-purple-500 disabled:opacity-50 text-white shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
            title="Analyze current stream of scan logs with Gemini"
          >
            <RefreshCw size={13} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Logs'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Threat Intelligence Panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrollable Findings Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
        {isAnalyzing && !report && (
          <div className="p-8 text-center space-y-3">
            <RefreshCw size={24} className="animate-spin text-[#00e5ff] mx-auto" />
            <p className="text-xs text-slate-300 font-mono">Gemini AI analyzing {logs.length} scan logs and network topology...</p>
          </div>
        )}

        {report && (
          <>
            {/* Campaign Summary Card */}
            <div className="bg-[#0f172a]/95 border border-red-500/40 rounded-xl p-3.5 shadow-xl space-y-2.5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-purple-500" />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Crosshair size={12} /> Emerging Attack Campaign
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 uppercase">
                  {report.overallThreatLevel}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white tracking-tight">{report.campaignName}</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">{report.executiveSummary}</p>

              <div className="flex items-center justify-between text-[10.5px] border-t border-slate-800/80 pt-2 font-mono text-slate-400">
                <span>Kill Chain: <strong className="text-amber-300">{report.killChainStage}</strong></span>
                <span>Logs Scanned: <strong className="text-white">{report.analyzedLogCount}</strong></span>
              </div>
            </div>

            {/* MITRE ATT&CK Techniques Card */}
            <div className="bg-[#0f172a]/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={13} className="text-[#00e5ff]" />
                  Observed Attack Patterns (MITRE ATT&CK)
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">{report.attackPatterns.length} Techniques</span>
              </div>

              <div className="space-y-2">
                {report.attackPatterns.map(pattern => (
                  <div key={pattern.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-[#00e5ff] px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                          {pattern.techniqueId}
                        </span>
                        <span className="font-bold text-white text-[11px]">{pattern.name}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          pattern.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {pattern.severity}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-slate-300">{pattern.description}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {pattern.targetEntities.map((t, idx) => (
                        <span key={idx} className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          🎯 {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CIPHER-DETECTIVE's Forensic Re-Engineering Card */}
            <div className="bg-[#0f172a]/90 border border-rose-500/30 rounded-xl p-3.5 space-y-2.5 shadow-lg relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <Search size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-[12px] flex items-center gap-1.5">
                      <span>CIPHER-DETECTIVE</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">Forensic Private Eye</span>
                    </h4>
                    <span className="text-[10px] text-rose-300 font-mono">House Breakers Tracking · Mirroring & Countermeasures</span>
                  </div>
                </div>
                {onSelectAgent && (
                  <button
                    onClick={() => onSelectAgent('detective')}
                    className="text-[10px] text-rose-300 hover:text-white font-semibold underline cursor-pointer"
                  >
                    Consult Detective
                  </button>
                )}
              </div>

              <p className="text-[10.5px] text-slate-300 leading-relaxed italic border-l-2 border-rose-500/60 pl-2">
                "Treating network intrusion as a physical burglary. Mirroring adversary vectors, re-engineering exploitation protocols, deploying countermeasures, and geo-tracking files for legal prosecution."
              </p>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-[10.5px]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase text-[9.5px]">Locating House Breakers (Entry Vector):</span>
                  <span className="text-rose-200 font-mono font-semibold">{report.forensicAudit.adversaryEntryVector}</span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase text-[9.5px]">Re-Engineered & Mirrored Attack Protocol:</span>
                  <span className="text-slate-200">{report.forensicAudit.protocolObserved}</span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase text-[9.5px]">File Geo-Tracking & Artifact Fingerprint (SHA-256):</span>
                  <span className="text-cyan-400 font-mono break-all text-[9.5px] bg-slate-950 p-1.5 rounded border border-slate-800">
                    {report.forensicAudit.sha256}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Physical Origin & Geo-Estimate:</span>
                  <span className="text-amber-300 font-mono font-semibold">{report.forensicAudit.originGeoEstimate}</span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Legal Forensic Audit & Chain of Custody:</span>
                  <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                    <FileCheck size={11} /> Cryptographically Signed & Admissible
                  </span>
                </div>
              </div>
            </div>

            {/* POPEYE: First Mate Bug Bounty & Centralized Records Card */}
            <div className="bg-[#0f172a]/90 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5 shadow-lg relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Anchor size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-[12px] flex items-center gap-1.5">
                      <span>FIRST MATE POPEYE</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">Ship's First Mate</span>
                    </h4>
                    <span className="text-[10px] text-amber-300 font-mono">Sole Link to Wisdom Sentinel · Bug Hunter Chief</span>
                  </div>
                </div>
                {onSelectAgent && (
                  <button
                    onClick={() => onSelectAgent('popeye')}
                    className="text-[10px] text-amber-300 hover:text-white font-semibold underline cursor-pointer"
                  >
                    Consult Popeye
                  </button>
                )}
              </div>

              <p className="text-[10.5px] text-slate-300 leading-relaxed italic border-l-2 border-amber-500/60 pl-2">
                "Popeye is the First Mate and sole link between The Wisdom Sentinel and the user. The existence of The Wisdom Sentinel is public across the fleet, but there is NO public interaction with it—it is strictly not a two-way street. The Wisdom Sentinel sends the Daily Card and Monthly Audit Report down to the user via Popeye."
              </p>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-[10.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hierarchy & Command:</span>
                  <span className="text-amber-200 font-semibold">First Mate (Sole Link to Wisdom Sentinel · One-Way Receiver)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Tech Architecture:</span>
                  <span className="text-white font-semibold">{report.popeyeDossier.targetArchitecture}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vulnerability Class:</span>
                  <span className="text-amber-300 font-mono">{report.popeyeDossier.vulnerabilityClass}</span>
                </div>

                {/* Noble Source of Revenue Banner */}
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/40 border border-amber-500/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-amber-400 animate-pulse" />
                    <div>
                      <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Bug Bounty Program Reward (Noble Revenue)</div>
                      <div className="text-[12px] text-white font-mono font-bold">{report.popeyeDossier.estimatedBountyTier}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    CVSS {report.popeyeDossier.cvssRating}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Daily Report & Monthly Paper:</span>
                  <span className="text-cyan-300 font-mono">Sentinel Cyber Analysis Journal Publication Ready</span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Government Security Agents Liaison:</span>
                  <span className="text-slate-300 font-mono">{report.popeyeDossier.governmentLiaisonNotice}</span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Responsible Disclosure Status:</span>
                  <span className="text-emerald-400 font-semibold">{report.popeyeDossier.responsibleDisclosureStatus}</span>
                </div>
              </div>
            </div>

            {/* Tactical Countermeasures Checklist */}
            <div className="bg-[#0f172a]/90 border border-slate-800 rounded-xl p-3.5 space-y-2 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Recommended Tactical Countermeasures
              </span>

              <div className="space-y-1.5">
                {report.recommendedCountermeasures.map((cm, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-200">
                    <span className="font-mono text-cyan-400 font-bold">{idx + 1}.</span>
                    <span>{cm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyzed Logs Inspector (Collapsible) */}
            <div className="bg-[#0f172a]/90 border border-slate-800 rounded-xl p-3 shadow-lg">
              <button
                onClick={() => setShowLogsInspector(prev => !prev)}
                className="w-full flex items-center justify-between text-[11px] text-slate-300 font-semibold hover:text-white"
              >
                <span className="flex items-center gap-1.5">
                  <Terminal size={13} className="text-cyan-400" />
                  <span>Inspected Log Stream ({logs.length} Lines)</span>
                </span>
                {showLogsInspector ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showLogsInspector && (
                <div className="mt-2.5 max-h-48 overflow-y-auto space-y-1 font-mono text-[10px] p-2 bg-black/60 rounded-lg border border-slate-800">
                  {logs.slice(-12).map(l => (
                    <div
                      key={l.id}
                      className={`truncate ${
                        l.type === 'critical'
                          ? 'text-red-400 font-bold'
                          : l.type === 'warning'
                          ? 'text-amber-300'
                          : l.type === 'success'
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="text-slate-600">[{l.timestamp}]</span> {l.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

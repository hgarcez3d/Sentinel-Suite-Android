import React, { useState } from 'react';
import { AmmunitionScript, ScriptCategory, ScriptExecutionLog } from '../types/ammunition';
import { ammunitionFactoryService } from '../services/ammunitionFactoryService';
import {
  Zap,
  Shield,
  ShieldAlert,
  Flame,
  Terminal,
  Play,
  RotateCcw,
  Plus,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Code,
  Radio,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Activity
} from 'lucide-react';

interface AmmunitionFactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToShell?: (command: string) => void;
  onScriptExecuted?: (script: AmmunitionScript, log: ScriptExecutionLog) => void;
}

export const AmmunitionFactoryModal: React.FC<AmmunitionFactoryModalProps> = ({
  isOpen,
  onClose,
  onSendToShell,
  onScriptExecuted
}) => {
  const [scripts, setScripts] = useState<AmmunitionScript[]>(() =>
    ammunitionFactoryService.getScripts()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedScriptId, setExpandedScriptId] = useState<string | null>(null);
  const [runningScriptId, setRunningScriptId] = useState<string | null>(null);
  const [activeLogs, setActiveLogs] = useState<Record<string, string[]>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForgeForm, setShowForgeForm] = useState(false);

  // New script forge form state
  const [newThreatName, setNewThreatName] = useState('');
  const [newTargetCVE, setNewTargetCVE] = useState('');
  const [newCategory, setNewCategory] = useState<ScriptCategory>('network_quarantine');
  const [newAssignedAgent, setNewAssignedAgent] = useState<'AEGIS-NET' | 'KRONOS-CORE' | 'VALKYRIE-SEC' | 'SYNAPSE-LEAD' | 'CIPHER-STEALTH'>('AEGIS-NET');

  if (!isOpen) return null;

  const filteredScripts = scripts.filter(s => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  const handleExecute = async (script: AmmunitionScript) => {
    setRunningScriptId(script.id);
    setExpandedScriptId(script.id);

    try {
      const { log, script: updated } = await ammunitionFactoryService.executeScript(script.id, 'operator');
      setActiveLogs(prev => ({ ...prev, [script.id]: log.stdoutLines }));
      setScripts(ammunitionFactoryService.getScripts());
      if (onScriptExecuted) {
        onScriptExecuted(updated, log);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunningScriptId(null);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendToShell = (script: AmmunitionScript) => {
    if (onSendToShell) {
      onSendToShell(`ammunition run ${script.id}`);
      onClose();
    }
  };

  const handleCreateNewScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreatName.trim()) return;

    const payload = `#!/bin/bash
# [SENTINEL-AMMUNITION-FACTORY] FORGED PROTOCOL
# TARGET: ${newThreatName} (${newTargetCVE || 'DYNAMIC WEB THREAT'})
echo "[*] [${newAssignedAgent}] Deploying automated countermeasure..."
echo "[*] Analyzing anomaly vectors and isolating unauthorized sub-flows..."
iptables -I INPUT 1 -m string --string "${newThreatName.substring(0, 8)}" --algo bm -j DROP 2>/dev/null || true
echo "[+] SUCCESS: Countermeasure active against ${newThreatName}."`;

    const created = ammunitionFactoryService.addCustomScript({
      name: `Countermeasure: ${newThreatName}`,
      codename: `${newAssignedAgent}_${newThreatName.replace(/\s+/g, '_').toUpperCase()}.SH`,
      category: newCategory,
      assignedAgent: newAssignedAgent,
      threatTarget: newTargetCVE ? `${newThreatName} (${newTargetCVE})` : newThreatName,
      threatLevel: 'CRITICAL',
      syncedFromWisdomSentinel: false,
      description: `Custom automated defense playbook forged to neutralize ${newThreatName}.`,
      scriptPayload: payload,
      estimatedRuntimeMs: 1500,
      actionType: 'quarantine'
    });

    setScripts(ammunitionFactoryService.getScripts());
    setShowForgeForm(false);
    setNewThreatName('');
    setNewTargetCVE('');
    setExpandedScriptId(created.id);
  };

  const getCategoryBadge = (cat: ScriptCategory) => {
    switch (cat) {
      case 'network_quarantine':
        return <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded text-[9.5px] font-mono">Quarantine</span>;
      case 'rf_airwall':
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded text-[9.5px] font-mono">RF Air-Wall</span>;
      case 'active_honeytoken':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[9.5px] font-mono">Honeytoken</span>;
      case 'memory_shield':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[9.5px] font-mono">Memory Seal</span>;
      case 'crypto_sinkhole':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[9.5px] font-mono">DNS Sinkhole</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[9.5px] font-mono">Defense</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#090e1a] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.15)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0d162a] via-[#101b33] to-[#0d162a] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 relative">
              <Zap size={22} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wider">
                  AMMUNITION FACTORY
                </h2>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  DEFENSE & COUNTERMEASURE FORGE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated playbooks forged dynamically as new threats are identified by The Wisdom Sentinel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForgeForm(prev => !prev)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-all"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Forge New Script</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Forge New Script Form (Collapsible) */}
        {showForgeForm && (
          <form
            onSubmit={handleCreateNewScript}
            className="p-4 bg-[#0a1120] border-b border-cyan-500/30 space-y-3 animate-in slide-in-from-top-2 text-xs font-mono"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-400" />
                Forge Custom Countermeasure Playbook
              </span>
              <button
                type="button"
                onClick={() => setShowForgeForm(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Threat Name / Signature:</label>
                <input
                  type="text"
                  placeholder="e.g. Cobalt Strike DNS Beacon"
                  value={newThreatName}
                  onChange={e => setNewThreatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:border-cyan-400 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target CVE / Anomaly Identifier:</label>
                <input
                  type="text"
                  placeholder="e.g. CVE-2024-43573"
                  value={newTargetCVE}
                  onChange={e => setNewTargetCVE(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:border-cyan-400 outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Playbook Category:</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as ScriptCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:border-cyan-400 outline-hidden"
                >
                  <option value="network_quarantine">Network Quarantine & ARP Null</option>
                  <option value="rf_airwall">RF & BLE Air-Shield Scrambler</option>
                  <option value="active_honeytoken">Active Honeytoken Decoy</option>
                  <option value="memory_shield">Kernel Memory Seal</option>
                  <option value="crypto_sinkhole">C2 DNS Sinkhole</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assigned Autonomous Agent:</label>
                <select
                  value={newAssignedAgent}
                  onChange={e => setNewAssignedAgent(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:border-cyan-400 outline-hidden"
                >
                  <option value="AEGIS-NET">AEGIS-NET (Subnet & Quarantine)</option>
                  <option value="VALKYRIE-SEC">VALKYRIE-SEC (RF & Air-Guard)</option>
                  <option value="KRONOS-CORE">KRONOS-CORE (Kernel & Memory)</option>
                  <option value="SYNAPSE-LEAD">SYNAPSE-LEAD (Honeytokens & C2)</option>
                  <option value="CIPHER-STEALTH">CIPHER-STEALTH (Port Knocking)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForgeForm(false)}
                className="px-3 py-1 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-950/50"
              >
                Compile Playbook into Factory
              </button>
            </div>
          </form>
        )}

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 p-3 bg-[#080d17] border-b border-slate-800/80 overflow-x-auto custom-scrollbar">
          {[
            { id: 'all', label: 'All Ammunition' },
            { id: 'network_quarantine', label: 'Network Quarantine' },
            { id: 'rf_airwall', label: 'RF Air-Shield' },
            { id: 'active_honeytoken', label: 'Honeytokens' },
            { id: 'memory_shield', label: 'Memory Seals' },
            { id: 'crypto_sinkhole', label: 'DNS Sinkholes' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Script Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredScripts.map(script => {
            const isExpanded = expandedScriptId === script.id;
            const isRunning = runningScriptId === script.id;
            const executionOutput = activeLogs[script.id];

            return (
              <div
                key={script.id}
                className="bg-[#0c1322] border border-slate-800/90 hover:border-slate-700 rounded-xl overflow-hidden transition-all shadow-sm"
              >
                {/* Clean Top Bar: Click to Expand / Inspect */}
                <div
                  onClick={() => setExpandedScriptId(isExpanded ? null : script.id)}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
                      <Terminal size={16} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-white truncate">
                          {script.name}
                        </span>
                        {getCategoryBadge(script.category)}
                      </div>
                      <p className="text-[10.5px] font-mono text-slate-400 truncate mt-0.5">
                        <span className="text-cyan-400 font-bold">{script.assignedAgent}</span> · Target: {script.threatTarget}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Status Right Side */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Execute Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExecute(script);
                      }}
                      disabled={isRunning}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-sm ${
                        isRunning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40'
                      }`}
                      title="Run script as 1-click button"
                    >
                      <Play size={12} className={isRunning ? 'animate-spin' : ''} />
                      <span>{isRunning ? 'Executing...' : 'Run Button'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendToShell(script);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono"
                      title="Send to Synapse Command Shell"
                    >
                      <Terminal size={14} className="text-cyan-400" />
                    </button>

                    <div className="p-1 text-slate-500">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Progressive Disclosure: Details, Payload Code & Output Terminal */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 p-3.5 bg-[#080d17] space-y-3 animate-in fade-in-50 duration-150 text-xs font-mono">
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {script.description}
                    </p>

                    {/* Stats strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                      <div className="bg-black/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Codename:</span>
                        <span className="text-cyan-300 font-bold truncate block">{script.codename}</span>
                      </div>
                      <div className="bg-black/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Threat Rating:</span>
                        <span className="text-red-400 font-bold">{script.threatLevel}</span>
                      </div>
                      <div className="bg-black/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Executions:</span>
                        <span className="text-slate-200">{script.runCount} runs ({script.successRate}%)</span>
                      </div>
                      <div className="bg-black/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Wisdom Sync:</span>
                        <span className="text-emerald-400 font-bold">
                          {script.syncedFromWisdomSentinel ? 'Verified Fleet Sync' : 'Custom Local'}
                        </span>
                      </div>
                    </div>

                    {/* Code View Block */}
                    <div className="relative bg-black/70 rounded-xl p-3 border border-slate-800 overflow-x-auto text-[11px] text-cyan-300 font-mono">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1 mb-2">
                        <span>Bash Countermeasure Shell Code</span>
                        <button
                          onClick={() => handleCopyCode(script.id, script.scriptPayload)}
                          className="flex items-center gap-1 hover:text-slate-300"
                        >
                          {copiedId === script.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === script.id ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap">{script.scriptPayload}</pre>
                    </div>

                    {/* Live Execution Output Terminal */}
                    {executionOutput && (
                      <div className="bg-[#040810] border border-cyan-500/30 rounded-xl p-3 space-y-1 text-[10.5px]">
                        <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800 text-[10px]">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Execution Output (Exit Code: 0)
                          </span>
                          <span>Timestamp: {script.lastRunTimestamp}</span>
                        </div>
                        <div className="space-y-0.5 pt-1">
                          {executionOutput.map((line, idx) => (
                            <div key={idx} className={line.startsWith('[+]') ? 'text-emerald-400 font-bold' : line.startsWith('[-]') ? 'text-amber-400' : 'text-slate-300'}>
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

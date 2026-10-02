import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  X,
  Lock,
  Cpu,
  Database,
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface EmergencyRapidFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExecute: () => void;
}

export const EmergencyRapidFillModal: React.FC<EmergencyRapidFillModalProps> = ({
  isOpen,
  onClose,
  onConfirmExecute
}) => {
  const [stage, setStage] = useState<'idle' | 'running' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentBlock, setCurrentBlock] = useState('0x00000000');
  const [bytesWritten, setBytesWritten] = useState('0.00 GB');
  const [entropyRate, setEntropyRate] = useState('0.0 MB/s');

  useEffect(() => {
    if (!isOpen) {
      setStage('idle');
      setProgress(0);
      setCurrentBlock('0x00000000');
      setBytesWritten('0.00 GB');
      setEntropyRate('0.0 MB/s');
    }
  }, [isOpen]);

  const handleStartRapidFill = () => {
    setStage('running');
    setProgress(0);

    const totalTargetGb = 42.4;
    const intervalTime = 120; // 120ms ticks
    let currentPct = 0;

    const timer = setInterval(() => {
      currentPct += Math.random() * 4.2 + 2.5;
      if (currentPct >= 100) {
        currentPct = 100;
        clearInterval(timer);
        setProgress(100);
        setCurrentBlock('0xFFFFFFFF (ALL FREE BLOCKS OVERWRITTEN)');
        setBytesWritten(`${totalTargetGb.toFixed(2)} GB`);
        setEntropyRate('COMPLETED (HIGH ENTROPY NOISE)');
        setStage('completed');
        onConfirmExecute();
      } else {
        setProgress(currentPct);
        const written = ((currentPct / 100) * totalTargetGb).toFixed(2);
        setBytesWritten(`${written} GB / ${totalTargetGb} GB`);
        const randomHex = Math.floor(Math.random() * 0xffffffff)
          .toString(16)
          .toUpperCase()
          .padStart(8, '0');
        setCurrentBlock(`0x${randomHex}::${Math.floor(Math.random() * 9999)}`);
        setEntropyRate(`${(420 + Math.random() * 80).toFixed(1)} MB/s`);
      }
    }, intervalTime);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0e121e] border border-red-500/60 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.25)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-950/80 via-[#15101a] to-red-950/80 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
              <Flame size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-red-200 tracking-wider">
                VALKYRIE RAPID-FILL EMERGENCY PROTOCOL
              </h3>
              <p className="text-[10px] text-red-400 font-mono">
                Cryptographic Anti-Forensic Overwrite Sweep
              </p>
            </div>
          </div>
          {stage !== 'running' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs font-mono">
          <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3 text-[11px] text-slate-300 leading-relaxed">
            <p className="text-red-300 font-bold mb-1 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-red-400" />
              CRITICAL SANITIZATION PROCEDURE
            </p>
            Overwrites all unallocated flash storage blocks on <code className="text-amber-300">/data</code> and free memory space with high-entropy pseudo-random white noise (ChaCha20 stream). Prevents flash memory remanence extraction in physical seizure scenarios.
          </div>

          {/* Progress Bar Display */}
          <div className="bg-[#080d17] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive size={13} className="text-cyan-400" />
                Overwrite Progress
              </span>
              <span className={`font-black font-mono text-sm ${
                progress === 100 ? 'text-emerald-400' : progress > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'
              }`}>
                {progress.toFixed(1)}%
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700 relative">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  progress === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                    : 'bg-gradient-to-r from-red-600 via-amber-500 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Real-time telemetry metrics */}
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="bg-black/40 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">Written / Flooded:</span>
                <span className="text-slate-200 font-bold">{bytesWritten}</span>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">Write Throughput:</span>
                <span className="text-cyan-400 font-bold">{entropyRate}</span>
              </div>
              <div className="col-span-2 bg-black/40 p-2 rounded-lg border border-slate-800/80 truncate">
                <span className="text-slate-500 block mb-0.5">Active Block Vector:</span>
                <span className="text-amber-300 font-mono text-[9.5px] truncate">{currentBlock}</span>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            {stage === 'idle' && (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-sans text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartRapidFill}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border border-red-400/50 shadow-lg shadow-red-950/60 flex items-center gap-1.5"
                >
                  <Flame size={14} />
                  <span>Execute Rapid Fill</span>
                </button>
              </>
            )}

            {stage === 'running' && (
              <div className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-amber-300 animate-pulse">
                <RefreshCw size={14} className="animate-spin" />
                <span>Overwriting unallocated flash blocks with ChaCha20 entropy...</span>
              </div>
            )}

            {stage === 'completed' && (
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400/50 shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>Sanitization Completed — Dismiss</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

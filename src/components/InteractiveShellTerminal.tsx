import React, { useState, useRef, useEffect } from 'react';
import { NetworkDevice } from '../types/network';
import { executeShellCommand, CommandExecutionResult } from '../services/commandShellService';
import { speakAgentVoice, isSpeechRecognitionSupported, isSpeechSynthesisSupported, stopAgentVoice } from '../services/voiceAssistantService';
import {
  Terminal,
  Play,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Trash2,
  ShieldAlert,
  Lock,
  Unlock,
  Radio,
  Sparkles,
  Send,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface InteractiveShellTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: NetworkDevice[];
  onToggleIsolation: (deviceId: string) => void;
}

export const InteractiveShellTerminal: React.FC<InteractiveShellTerminalProps> = ({
  isOpen,
  onClose,
  devices,
  onToggleIsolation
}) => {
  const [history, setHistory] = useState<CommandExecutionResult[]>([
    {
      command: 'status',
      output: `SENTINEL AUTONOMOUS SHELL (SYNAPSE-LEAD v3.4 ONLINE)
Command lead active. Type 'help' or click microphone to speak voice commands (e.g. "Popeye, port 2553 exploit detected, compile on FR and send to IC3").`,
      status: 'success',
      timestamp: new Date().toTimeString().split(' ')[0]
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechSpeaking, setSpeechSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    if (isOpen && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  // Voice Recognition handler (Web Speech API)
  const toggleListening = () => {
    if (!speechSupported) {
      alert('Speech Recognition is not supported by your current browser. You can still type commands directly.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
        handleExecute(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition', e);
      setIsListening(false);
    }
  };

  const handleExecute = (cmdToRun?: string) => {
    const command = (cmdToRun || inputVal).trim();
    if (!command) return;

    if (command.toLowerCase() === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    }

    // Process specialized conversational commands like:
    // "Popeye, I just got a warning of an exploit is using port number 2553, can you coordinate the best practices, collect everything you can about the source and payload, compile all on the FR and send to IC3?"
    const result = executeShellCommand(command, {
      devices,
      onToggleIsolation
    });

    setHistory(prev => [...prev, result]);
    setInputVal('');

    // Jarvis Voice Response synthesis
    if (ttsEnabled) {
      let voiceReply = '';
      if (command.toLowerCase().includes('ic3') || command.toLowerCase().includes('port') || command.toLowerCase().includes('exploit')) {
        voiceReply = 'Acknowledged, Bear. Synapse Lead and First Mate Popeye have correlated the port telemetry, hashed the payload, compiled the Forensic Record, and queued the formal package for IC3 submission.';
      } else if (result.status === 'action_taken') {
        voiceReply = `Action executed by Synapse Lead: ${result.output.split('\n')[0].replace(/\[.*?\]/g, '')}`;
      } else {
        voiceReply = `Command executed. ${result.output.split('\n')[0]}`;
      }

      speakAgentVoice(
        voiceReply,
        'intelligence',
        () => setSpeechSpeaking(true),
        () => setSpeechSpeaking(false)
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-14 z-50 bg-[#060b14]/98 backdrop-blur-2xl border-t border-cyan-500/50 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] flex flex-col max-h-[75vh] animate-in slide-in-from-bottom-2 duration-200">
      {/* Terminal Title Bar */}
      <div className="px-3.5 py-2.5 bg-[#0a101d] border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Terminal size={14} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-white tracking-wide font-mono">
                SYNAPSE COMMAND SHELL
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                ROOT PRIV
              </span>
            </div>
            <p className="text-[9px] font-mono text-slate-400">
              Interactive Protection & Defense · Voice Enabled (Jarvis Mode)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* TTS Toggle */}
          <button
            onClick={() => {
              if (speechSpeaking) stopAgentVoice();
              setTtsEnabled(prev => !prev);
            }}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors ${
              ttsEnabled
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={ttsEnabled ? 'Agent Voice Response (Jarvis) Active' : 'Agent Voice Muted'}
          >
            {ttsEnabled ? <Volume2 size={13} className={speechSpeaking ? 'animate-pulse text-purple-300' : ''} /> : <VolumeX size={13} />}
            <span className="text-[9.5px] hidden sm:inline">{ttsEnabled ? 'Voice ON' : 'Muted'}</span>
          </button>

          {/* Clear */}
          <button
            onClick={() => setHistory([])}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Clear Terminal Display"
          >
            <Trash2 size={13} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Quick Macro Pills */}
      <div className="px-3 py-1.5 bg-[#070d18] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
        <button
          onClick={() => handleExecute('ic3-report compile 2553')}
          className="px-2 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-500/40 font-mono font-bold shrink-0 flex items-center gap-1 hover:bg-red-900/50"
        >
          <FileCheck size={11} />
          <span>FR / IC3 Report (Port 2553)</span>
        </button>

        <button
          onClick={() => handleExecute('isolate 192.168.1.104')}
          className="px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 font-mono font-bold shrink-0 flex items-center gap-1 hover:bg-cyan-900/50"
        >
          <Lock size={11} />
          <span>Isolate Camera (.104)</span>
        </button>

        <button
          onClick={() => handleExecute('iptables -L -n -v')}
          className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono shrink-0 hover:text-white"
        >
          iptables -L
        </button>

        <button
          onClick={() => handleExecute('netstat -tulnp')}
          className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono shrink-0 hover:text-white"
        >
          netstat
        </button>

        <button
          onClick={() => handleExecute('help')}
          className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono shrink-0 flex items-center gap-1 hover:text-white"
        >
          <HelpCircle size={10} />
          <span>Commands</span>
        </button>
      </div>

      {/* Terminal Output Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 font-mono text-[11px] bg-[#03060c] min-h-[220px] max-h-[360px] custom-scrollbar">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <span className="text-slate-600 select-none text-[9.5px]">[{item.timestamp}]</span>
              <span className="text-emerald-400">root@sentinel-lead:~#</span>
              <span>{item.command}</span>
            </div>
            <pre
              className={`whitespace-pre-wrap rounded-lg p-2 border font-mono text-[10.5px] leading-relaxed select-text ${
                item.status === 'action_taken'
                  ? 'bg-red-950/20 border-red-500/40 text-amber-200 shadow-xs'
                  : item.status === 'error'
                  ? 'bg-red-950/30 border-red-500/50 text-red-300'
                  : item.status === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-300'
              }`}
            >
              {item.output}
            </pre>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Interactive Command Input + Jarvis Voice Button */}
      <div className="p-2.5 bg-[#0a101d] border-t border-slate-800 flex items-center gap-2">
        {/* Voice Trigger (Jarvis Microphone) */}
        <button
          onClick={toggleListening}
          className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
            isListening
              ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-500/50 animate-pulse'
              : 'bg-cyan-950/50 text-cyan-400 border-cyan-500/40 hover:bg-cyan-900/60'
          }`}
          title={isListening ? 'Listening to voice command... (Tap to stop)' : 'Hold or Tap to Speak with Synapse Lead (Jarvis)'}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Text Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleExecute();
              }
            }}
            placeholder={
              isListening
                ? 'Listening to your voice command...'
                : 'Enter command or ask Synapse Lead (e.g. "isolate 192.168.1.104" or "compile FR for IC3")...'
            }
            className="w-full bg-[#040812] border border-cyan-500/30 focus:border-cyan-400 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={() => handleExecute()}
            disabled={!inputVal.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-cyan-400 hover:text-white disabled:text-slate-600 transition-colors"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { AgentRole, ChatMessage } from '../types/agents';
import { AGENT_PROFILES } from '../data/agentProfiles';
import { TelemetryContext, sendAgentQuery } from '../services/geminiAgentService';
import { speakAgentVoice, isSpeechRecognitionSupported, isSpeechSynthesisSupported, stopAgentVoice } from '../services/voiceAssistantService';
import {
  Send,
  Sparkles,
  Globe2,
  Cpu,
  ShieldAlert,
  Bot,
  User,
  ExternalLink,
  RefreshCw,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Terminal,
  Search,
  Anchor,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

interface AgentChatPanelProps {
  activeAgent: AgentRole;
  onSelectAgent: (role: AgentRole) => void;
  telemetry: TelemetryContext;
  onTriggerDailyReport: () => void;
}

export const AgentChatPanel: React.FC<AgentChatPanelProps> = ({
  activeAgent,
  onSelectAgent,
  telemetry,
  onTriggerDailyReport
}) => {
  const [messages, setMessages] = useState<Record<AgentRole, ChatMessage[]>>({
    network: [
      {
        id: 'net-welcome',
        agentId: 'network',
        sender: 'agent',
        text: 'AEGIS-NET online. Monitoring network perimeter, Wi-Fi 2.4/5GHz packets, and Nmap discovery matrix. Alert: 2 critical hosts flagged (unauthenticated RTSP camera and rogue Telnet ESP8266). How shall we proceed?',
        timestamp: 'Just now'
      }
    ],
    system: [
      {
        id: 'sys-welcome',
        agentId: 'system',
        sender: 'agent',
        text: 'KRONOS-CORE online. Linux 6.6 kernel integrity verified. Storage partitions mounted with SHA-256 cryptographic fidelity. Monitoring background services, memory allocations, and CPU scheduling. All systems nominal.',
        timestamp: 'Just now'
      }
    ],
    physical: [
      {
        id: 'phy-welcome',
        agentId: 'physical',
        sender: 'agent',
        text: 'VALKYRIE-SEC standing guard. Perimeter geofence calibrated (150m). Proximity radar active — detected suspicious BLE beacon at 3.5m range. Stealth Blackout & Anti-Tamper zero-fill emergency protocols are armed.',
        timestamp: 'Just now'
      }
    ],
    intelligence: [
      {
        id: 'int-welcome',
        agentId: 'intelligence',
        sender: 'agent',
        text: 'SYNAPSE-LEAD operational. I cross-correlate telemetry across Network, System, and Physical vectors. I am ready to generate your tactical Daily Defense Dossier or analyze persistent threat chains.',
        timestamp: 'Just now'
      }
    ],
    detective: [
      {
        id: 'det-welcome',
        agentId: 'detective',
        sender: 'agent',
        text: 'CIPHER-DETECTIVE on the case. Looking for the house breakers who breached our perimeter. I mirror exploit protocols, fingerprint malicious payload hashes, track adversary entry vectors, and seal courtroom-admissible evidence. Give me a target or suspicious packet stream.',
        timestamp: 'Just now'
      }
    ],
    popeye: [
      {
        id: 'pop-welcome',
        agentId: 'popeye',
        sender: 'agent',
        text: "Ahoy, Officer! First Mate POPEYE standing by on deck. I am your sole link to The Wisdom Sentinel. While the existence of The Wisdom Sentinel is public, there is NO public interaction with it—it is strictly not a two-way street. The Wisdom Sentinel is responsible for sending today's Daily Card and the Monthly Audit Report directly to your station, delivered and interpreted on deck through me. All crew findings are certified under my watch. Ready to review today's Daily Card, inspect the Monthly Audit Report, or compile our court-certified records!",
        timestamp: 'Just now'
      }
    ]
  });

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const currentProfile = AGENT_PROFILES[activeAgent];
  const currentMessages = messages[activeAgent] || [];

  const toggleListening = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech Recognition is not supported by your current browser. You can still type directly.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error', e);
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputVal;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      agentId: activeAgent,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [activeAgent]: [...(prev[activeAgent] || []), userMsg]
    }));

    if (!customText) setInputVal('');
    setIsLoading(true);

    try {
      const response = await sendAgentQuery(
        activeAgent,
        textToSend,
        [...(messages[activeAgent] || []), userMsg],
        telemetry
      );

      const agentMsg: ChatMessage = {
        id: `agt-${Date.now()}`,
        agentId: activeAgent,
        sender: 'agent',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources
      };

      setMessages(prev => ({
        ...prev,
        [activeAgent]: [...(prev[activeAgent] || []), agentMsg]
      }));

      // Jarvis-style Voice synthesis
      if (ttsEnabled) {
        speakAgentVoice(
          response.text,
          activeAgent,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        agentId: activeAgent,
        sender: 'system',
        text: `Error contacting ${currentProfile.name}: ${err.message || 'Unknown network error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => ({
        ...prev,
        [activeAgent]: [...(prev[activeAgent] || []), errorMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentIcon = (role: AgentRole) => {
    switch (role) {
      case 'network':
        return <Globe2 className="w-4 h-4 text-cyan-400" />;
      case 'system':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'physical':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'intelligence':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'detective':
        return <Search className="w-4 h-4 text-rose-400" />;
      case 'popeye':
        return <Anchor className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border-l border-slate-800/80 shadow-2xl overflow-hidden">
      {/* 1. Agent Selection Tabs */}
      <div className="bg-[#0f172a] border-b border-slate-800 p-2.5 flex items-center justify-between gap-1.5 overflow-x-auto custom-scrollbar">
        {(Object.keys(AGENT_PROFILES) as AgentRole[]).map(role => {
          const profile = AGENT_PROFILES[role];
          const isSelected = activeAgent === role;

          return (
            <button
              key={role}
              onClick={() => onSelectAgent(role)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isSelected ? 'bg-slate-950 border border-slate-700' : 'bg-slate-900'
                }`}
              >
                {getAgentIcon(role)}
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold tracking-tight">{profile.name}</div>
                <div className="text-[9px] text-slate-500 capitalize">{role} Agent</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Active Agent Identity Header */}
      <div className="px-4 py-3 bg-[#0d1424] border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner"
            style={{
              backgroundColor: `${currentProfile.accentHex}15`,
              borderColor: `${currentProfile.accentHex}40`
            }}
          >
            {getAgentIcon(activeAgent)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wider">{currentProfile.name}</span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${currentProfile.accentHex}20`,
                  color: currentProfile.accentHex
                }}
              >
                {currentProfile.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">{currentProfile.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeAgent === 'intelligence' && (
            <button
              onClick={onTriggerDailyReport}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all shadow-sm"
              title="Generate Daily Defense Dossier"
            >
              <Zap size={13} className="text-purple-400" />
              <span>Daily Report</span>
            </button>
          )}

          <button
            onClick={() =>
              setMessages(prev => ({
                ...prev,
                [activeAgent]: prev[activeAgent].slice(0, 1)
              }))
            }
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            title="Clear Chat Thread"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 3. Messages Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        {currentMessages.map(msg => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border"
                  style={{
                    backgroundColor: isSystem ? '#ef444420' : `${currentProfile.accentHex}18`,
                    borderColor: isSystem ? '#ef444450' : `${currentProfile.accentHex}40`
                  }}
                >
                  {isSystem ? <Terminal size={14} className="text-red-400" /> : getAgentIcon(activeAgent)}
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 ${
                  isUser
                    ? 'bg-[#00e5ff]/15 border border-[#00e5ff]/35 text-slate-100 rounded-br-none'
                    : isSystem
                    ? 'bg-red-950/30 border border-red-500/40 text-red-200'
                    : 'bg-[#131b2e] border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 font-mono mb-1">
                  <span className="font-semibold" style={{ color: !isUser && !isSystem ? currentProfile.accentHex : undefined }}>
                    {isUser ? 'OPERATOR' : isSystem ? 'SYSTEM EVENT' : currentProfile.name}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="text-[12px] leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Grounding Sources (Google Search) */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={11} className="text-cyan-400" /> Search Grounding Intel:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 text-[10px] border border-slate-700 hover:border-cyan-500 transition-colors"
                        >
                          <span className="truncate max-w-[140px]">{s.title}</span>
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5 text-cyan-300">
                  <User size={14} />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center text-slate-400 text-xs py-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${currentProfile.accentHex}18`,
                borderColor: `${currentProfile.accentHex}40`
              }}
            >
              <RefreshCw size={13} className="animate-spin text-cyan-400" />
            </div>
            <div className="flex items-center gap-2 bg-[#131b2e] px-3.5 py-2 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px]">
              <span>{currentProfile.name} analyzing live telemetry...</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Quick Suggested Tactical Prompts */}
      <div className="px-4 py-2 bg-[#0c1322] border-t border-slate-800/80">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Zap size={11} className="text-amber-400" /> Quick Tactical Prompts
        </div>
        <div className="flex flex-wrap gap-1.5">
          {currentProfile.quickPrompts.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(q)}
              className="text-[10px] font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 5. User Input Bar with Jarvis Microphone & Voice Toggle */}
      <div className="p-3 bg-[#0f172a] border-t border-slate-800">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Jarvis Voice Speech-to-Text Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40 hover:bg-cyan-900/60'
            }`}
            title={isListening ? 'Listening to voice... (tap to finish)' : 'Voice input (Speak like Jarvis)'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Voice Response Mute/Unmute */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) stopAgentVoice();
              setTtsEnabled(prev => !prev);
            }}
            className={`p-2 rounded-xl border transition-colors ${
              ttsEnabled
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={ttsEnabled ? 'Voice playback active' : 'Voice muted'}
          >
            {ttsEnabled ? (
              <Volume2 size={16} className={isSpeaking ? 'animate-pulse text-purple-300' : ''} />
            ) : (
              <VolumeX size={16} />
            )}
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice command...'
                : `Instruct ${currentProfile.name} or tap Mic to speak...`
            }
            disabled={isLoading}
            className="flex-1 bg-[#080c14] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="px-3.5 py-2 rounded-xl bg-[#00e5ff] hover:bg-cyan-300 disabled:opacity-40 text-slate-950 font-bold transition-all flex items-center justify-center shadow-lg shadow-cyan-950/40"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

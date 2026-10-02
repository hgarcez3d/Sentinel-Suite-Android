import React, { useState, useEffect, useRef } from 'react';
import { TrainingMovieClip, MovieClipScene } from '../types/trainingClips';
import { TRAINING_MOVIE_CLIPS } from '../data/trainingMovieClipsData';
import { TrainingClipVisualCanvas } from './TrainingClipVisualCanvas';
import { speakAgentVoice, stopAgentVoice } from '../services/voiceAssistantService';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
  Shield,
  Radio,
  EyeOff,
  Zap,
  CheckCircle2,
  Subtitles,
  FastForward,
  Sparkles,
  BookOpen,
  FileText,
  Terminal,
  AlertTriangle,
  HelpCircle,
  Cpu,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';

interface TacticalVideoTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionTrigger: (actionType: 'toggle_airgap' | 'open_interceptor' | 'open_ammo' | 'open_radar' | 'open_nmap' | 'open_wisdom') => void;
  initialClipId?: string;
}

export const TacticalVideoTrainingModal: React.FC<TacticalVideoTrainingModalProps> = ({
  isOpen,
  onClose,
  onActionTrigger,
  initialClipId
}) => {
  const [selectedClip, setSelectedClip] = useState<TrainingMovieClip>(() => {
    const found = TRAINING_MOVIE_CLIPS.find(c => c.id === initialClipId);
    return found || TRAINING_MOVIE_CLIPS[0];
  });

  const [activeTab, setActiveTab] = useState<'video' | 'field_manual' | 'transcript'>('video');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const prevSceneIndexRef = useRef<number>(-1);

  // Reset playback when clip changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(true);
    setActiveSceneIndex(0);
    prevSceneIndexRef.current = -1;
  }, [selectedClip]);

  // Main playback timer loop
  useEffect(() => {
    if (!isOpen || !isPlaying || activeTab !== 'video') return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.25 * playbackSpeed;
        if (next >= selectedClip.durationSeconds) {
          setIsPlaying(false);
          return selectedClip.durationSeconds;
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, playbackSpeed, selectedClip, activeTab]);

  // Determine active scene based on currentTime
  useEffect(() => {
    const foundIdx = selectedClip.scenes.findIndex(
      s => currentTime >= s.timestampStart && currentTime < s.timestampEnd
    );
    const newIdx = foundIdx !== -1 ? foundIdx : selectedClip.scenes.length - 1;
    setActiveSceneIndex(newIdx);

    // Trigger voiceover narration when entering a new scene
    if (newIdx !== prevSceneIndexRef.current && ttsEnabled && isPlaying && activeTab === 'video') {
      prevSceneIndexRef.current = newIdx;
      const scene = selectedClip.scenes[newIdx];
      if (scene) {
        speakAgentVoice(scene.narrationVoiceover, 'intelligence');
      }
    }
  }, [currentTime, selectedClip, ttsEnabled, isPlaying, activeTab]);

  // Stop voice when closing
  useEffect(() => {
    if (!isOpen) {
      stopAgentVoice();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentScene = selectedClip.scenes[activeSceneIndex] || selectedClip.scenes[0];
  const progressRatio = Math.min(1, currentTime / selectedClip.durationSeconds);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    prevSceneIndexRef.current = -1;
  };

  const handleJumpScene = (scene: MovieClipScene) => {
    handleSeek(scene.timestampStart);
    setIsPlaying(true);
    setActiveTab('video');
  };

  const handleTryFeature = () => {
    stopAgentVoice();
    onClose();
    onActionTrigger(selectedClip.actionButtonType);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Air-Gap Defense':
        return <Radio size={14} className="text-red-400" />;
      case 'Data Interception':
        return <EyeOff size={14} className="text-purple-400" />;
      case 'Ammunition Factory':
        return <Zap size={14} className="text-cyan-400" />;
      case 'Physical Security':
        return <Shield size={14} className="text-amber-400" />;
      case 'Network Intelligence':
        return <Layers size={14} className="text-emerald-400" />;
      default:
        return <FileText size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#080d18] border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,229,255,0.2)] flex flex-col max-h-[96vh] overflow-hidden">
        {/* 1. Header Bar with Tabs */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-[#0d162a] via-[#101c36] to-[#0d162a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 relative">
              <Film size={20} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-black uppercase text-white tracking-wider">
                  TACTICAL BRIEFINGS // OPERATIVE THEATER
                </h2>
                <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  MASTERCLASS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                {selectedClip.title} ({selectedClip.codename})
              </p>
            </div>
          </div>

          {/* Sub-view switcher & Voiceover toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#060a14] p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'video'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film size={12} />
                <span>Movie</span>
              </button>
              <button
                onClick={() => setActiveTab('field_manual')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'field_manual'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen size={12} />
                <span>Field Manual</span>
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'transcript'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText size={12} />
                <span>Transcript</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (ttsEnabled) stopAgentVoice();
                setTtsEnabled(!ttsEnabled);
              }}
              className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors ${
                ttsEnabled
                  ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={ttsEnabled ? 'AI Voiceover Active' : 'AI Voiceover Muted'}
            >
              {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="text-[10px] hidden sm:inline">{ttsEnabled ? 'Voice ON' : 'Muted'}</span>
            </button>

            <button
              onClick={() => {
                stopAgentVoice();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 2. Main Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
          {/* TAB 1: MOVIE VIDEO PLAYER */}
          {activeTab === 'video' && (
            <div className="space-y-3.5">
              {/* Cinematic Visual Canvas Player */}
              <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl">
                <TrainingClipVisualCanvas
                  scene={currentScene}
                  playbackProgress={progressRatio}
                  isPlaying={isPlaying}
                />

                {/* Subtitles Overlay */}
                <div className="absolute inset-x-0 bottom-3 px-4 flex justify-center pointer-events-none">
                  <div className="bg-black/85 backdrop-blur-md border border-cyan-500/50 rounded-lg px-3 py-1.5 max-w-lg text-center shadow-lg">
                    <span className="text-cyan-300 text-xs sm:text-sm font-mono font-bold leading-snug">
                      {currentScene.subtitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Video Timeline & Playback Controller */}
              <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-3 space-y-2.5">
                {/* Scrubber Bar */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                      handleSeek(ratio * selectedClip.durationSeconds);
                    }}
                    className="flex-1 h-2.5 bg-slate-950 rounded-full cursor-pointer relative overflow-hidden border border-slate-800"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-100"
                      style={{ width: `${progressRatio * 100}%` }}
                    />
                  </div>
                  <span>{formatTime(selectedClip.durationSeconds)}</span>
                </div>

                {/* Controls & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 transition-all"
                    >
                      {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>

                    <button
                      onClick={() => {
                        handleSeek(0);
                        setIsPlaying(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                      title="Replay from beginning"
                    >
                      <RotateCcw size={14} />
                    </button>

                    {/* Chapter Scene Jump Buttons */}
                    <div className="flex items-center gap-1 ml-2">
                      {selectedClip.scenes.map((scene, idx) => (
                        <button
                          key={scene.id}
                          onClick={() => handleJumpScene(scene)}
                          className={`px-2 py-1 rounded text-[10px] font-mono transition-all border ${
                            activeSceneIndex === idx
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          Scene {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('field_manual')}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition-all"
                    >
                      <BookOpen size={12} />
                      <span>Read Deep Dive</span>
                    </button>

                    <button
                      onClick={handleTryFeature}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold font-mono bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white border border-red-400 shadow-md shadow-red-950/60 flex items-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                      <Sparkles size={14} />
                      <span>{selectedClip.actionButtonText}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Comprehensive Scene In-Depth Explanation Box */}
              <div className="bg-[#0c1424] border border-cyan-500/30 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-cyan-300">
                      {currentScene.title}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      {selectedClip.codename}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Scene {activeSceneIndex + 1} of {selectedClip.scenes.length}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans bg-black/40 p-2.5 rounded-lg border border-slate-800/80">
                  {currentScene.inDepthExplanation}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                  {currentScene.keyPoints.map((point, idx) => (
                    <div key={idx} className="bg-black/50 p-2 rounded-lg border border-slate-800 flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 leading-tight">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPREHENSIVE FIELD MANUAL (MAXIMUM EXPLANATION) */}
          {activeTab === 'field_manual' && (
            <div className="space-y-4 text-xs font-mono">
              {/* Header card */}
              <div className="bg-gradient-to-r from-[#101b33] via-[#0d162a] to-[#101b33] border border-amber-500/40 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-amber-400" />
                    <h3 className="text-sm font-black uppercase text-white font-mono">
                      OPERATIVE FIELD MANUAL & TECHNICAL DEEP DIVE
                    </h3>
                  </div>
                  <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50 font-bold">
                    {selectedClip.badge}
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-sans leading-relaxed">
                  Full reference architecture, Linux kernel mechanisms, threat vector analysis, and step-by-step operator checklist for <strong>{selectedClip.title}</strong>.
                </p>
              </div>

              {/* 1. Attack Vector & Real-World Threat */}
              <div className="bg-[#0b1220] border border-red-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-xs">
                  <AlertTriangle size={14} />
                  <span>1. The Threat Vector (Why & How This Attack Happens)</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-xs bg-black/40 p-3 rounded-lg border border-slate-800">
                  {selectedClip.deepDive.attackVectorExplained}
                </p>

                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Threat Protocols & Frequencies In Scope:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedClip.deepDive.threatProtocols.map((proto, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/30 text-[10px]">
                        {proto}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Kernel-Level Defense Mechanism */}
              <div className="bg-[#0b1220] border border-cyan-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-xs">
                  <Cpu size={14} />
                  <span>2. Kernel-Level Defense Architecture (How Sentinel Defeats It)</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-xs bg-black/40 p-3 rounded-lg border border-slate-800">
                  {selectedClip.deepDive.kernelMechanism}
                </p>

                <div className="pt-1 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Underlying Linux & Kernel Subsystem Commands:
                  </span>
                  <div className="bg-black/80 p-2.5 rounded-lg border border-cyan-500/30 text-cyan-300 font-mono text-[11px] space-y-1">
                    {selectedClip.deepDive.linuxCommandsUsed.map((cmd, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-slate-500">$</span>
                        <span>{cmd}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Step-by-Step Operator Guide */}
              <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-bold uppercase text-xs">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>3. Step-by-Step Operative Action Checklist</span>
                </div>

                <div className="space-y-2">
                  {selectedClip.deepDive.stepByStepOperatorGuide.map((step) => (
                    <div key={step.stepNumber} className="bg-black/50 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold shrink-0 text-xs">
                        {step.stepNumber}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-xs">{step.title}</h4>
                        <p className="text-slate-300 font-sans text-xs">{step.instruction}</p>
                        <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 inline-block">
                          Expected: {step.expectedResult}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Tactical Pro-Tips & FAQ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Pro-Tips */}
                <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-xs">
                    <Sparkles size={14} />
                    <span>Tactical Field Pro-Tips</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-sans">
                    {selectedClip.deepDive.tacticalProTips.map((tip, idx) => (
                      <div key={idx} className="bg-black/40 p-2 rounded-lg border border-slate-800 text-slate-300">
                        • {tip}
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ */}
                <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-xs">
                    <HelpCircle size={14} />
                    <span>Frequently Asked Questions</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {selectedClip.deepDive.faq.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                        className="bg-black/40 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-purple-500/40 transition-colors"
                      >
                        <span className="font-bold text-purple-300 block mb-0.5">
                          Q: {item.question}
                        </span>
                        <p className="text-slate-300 text-[11px] font-sans">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action trigger footer */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleTryFeature}
                  className="px-5 py-2 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border border-red-400 shadow-lg shadow-red-950 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
                >
                  <Sparkles size={14} />
                  <span>Execute {selectedClip.targetFeature}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLETE VERBATIM SPOKEN TRANSCRIPT */}
          {activeTab === 'transcript' && (
            <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-purple-400" />
                  <h3 className="font-bold text-white uppercase text-xs">
                    VERBATIM AI TACTICAL SPOKEN TRANSCRIPT
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500">
                  Total Duration: {selectedClip.durationSeconds}s
                </span>
              </div>

              <div className="space-y-3">
                {selectedClip.scenes.map((scene, idx) => (
                  <div key={scene.id} className="bg-black/40 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/40 text-[9px] font-bold">
                          SCENE {idx + 1} ({formatTime(scene.timestampStart)} - {formatTime(scene.timestampEnd)})
                        </span>
                        <span className="font-bold text-white text-xs">{scene.title}</span>
                      </div>
                      <button
                        onClick={() => handleJumpScene(scene)}
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        <Play size={10} />
                        <span>Play Scene</span>
                      </button>
                    </div>

                    <p className="text-slate-200 font-sans text-xs italic pl-2 border-l-2 border-purple-500/50">
                      "{scene.narrationVoiceover}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Movie Clip Selector / Playlist (Horizontal Grid of All 6 Clips) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Complete Academy Briefing Library (6 Video Modules):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {TRAINING_MOVIE_CLIPS.map(clip => {
                const isSelected = selectedClip.id === clip.id;

                return (
                  <div
                    key={clip.id}
                    onClick={() => {
                      setSelectedClip(clip);
                      prevSceneIndexRef.current = -1;
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#101b30] border-cyan-400 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400'
                        : 'bg-[#090e1a] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(clip.category)}
                        <span className="text-[9px] font-mono text-slate-400">{clip.category}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {clip.durationSeconds}s
                      </span>
                    </div>

                    <h4 className="text-xs font-bold font-mono text-white truncate">
                      {clip.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {clip.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  Sparkles
} from 'lucide-react';

interface TacticalVideoTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionTrigger: (actionType: 'toggle_airgap' | 'open_interceptor' | 'open_ammo' | 'open_radar') => void;
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

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

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
    if (!isOpen || !isPlaying) return;

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
  }, [isOpen, isPlaying, playbackSpeed, selectedClip]);

  // Determine active scene based on currentTime
  useEffect(() => {
    const foundIdx = selectedClip.scenes.findIndex(
      s => currentTime >= s.timestampStart && currentTime < s.timestampEnd
    );
    const newIdx = foundIdx !== -1 ? foundIdx : selectedClip.scenes.length - 1;
    setActiveSceneIndex(newIdx);

    // Trigger voiceover narration when entering a new scene
    if (newIdx !== prevSceneIndexRef.current && ttsEnabled && isPlaying) {
      prevSceneIndexRef.current = newIdx;
      const scene = selectedClip.scenes[newIdx];
      if (scene) {
        speakAgentVoice(scene.narrationVoiceover, 'intelligence');
      }
    }
  }, [currentTime, selectedClip, ttsEnabled, isPlaying]);

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
      default:
        return <Shield size={14} className="text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#080d18] border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,229,255,0.2)] flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#0d162a] via-[#101c36] to-[#0d162a] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 relative">
              <Film size={20} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-black uppercase text-white tracking-wider">
                  SENTINEL TACTICAL VIDEO BRIEFINGS
                </h2>
                <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  TRAINING THEATER
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Interactive movie clips demonstrating True Air-Gap, Covert Interception & Defense Scripts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Main Theater Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 custom-scrollbar">
          {/* 1. Cinematic Visual Canvas Player */}
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

          {/* 2. Video Timeline & Playback Controller */}
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
                className="flex-1 h-2 bg-slate-950 rounded-full cursor-pointer relative overflow-hidden border border-slate-800"
              >
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-100"
                  style={{ width: `${progressRatio * 100}%` }}
                />
              </div>
              <span>{formatTime(selectedClip.durationSeconds)}</span>
            </div>

            {/* Playback Controls Row */}
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
                <div className="hidden sm:flex items-center gap-1 ml-2">
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

              {/* Action Button: Try It Yourself */}
              <button
                onClick={handleTryFeature}
                className="px-4 py-1.5 rounded-lg text-xs font-bold font-mono bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white border border-red-400 shadow-md shadow-red-950/60 flex items-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <Sparkles size={14} />
                <span>{selectedClip.actionButtonText}</span>
              </button>
            </div>
          </div>

          {/* 3. Scene Telemetry & Key Takeaways Card */}
          <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-3.5 space-y-2">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
              {currentScene.keyPoints.map((point, idx) => (
                <div key={idx} className="bg-black/50 p-2 rounded-lg border border-slate-800 flex items-start gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 leading-tight">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Movie Clip Selector / Playlist (Horizontal Grid) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Briefing Library (Select Movie Clip):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {TRAINING_MOVIE_CLIPS.map(clip => {
                const isSelected = selectedClip.id === clip.id;

                return (
                  <div
                    key={clip.id}
                    onClick={() => setSelectedClip(clip)}
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

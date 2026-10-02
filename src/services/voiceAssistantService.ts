/**
 * Speech Recognition and Synthesis Hook
 * Gives Sentinel AI Suite full bi-directional voice capability (Jarvis-style)
 */

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

// Map agent personality to voice settings
export function speakAgentVoice(
  text: string,
  agentRole: string,
  onStart?: () => void,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported()) return null;

  try {
    window.speechSynthesis.cancel(); // cancel any ongoing speech

    // Clean markdown/asterisks/code blocks so speech is natural like Jarvis
    const cleanText = text
      .replace(/```[\s\S]*?```/g, ' [code omitted] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanText) return null;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = window.speechSynthesis.getVoices();

    // Select suitable voice
    let voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Enhanced')));
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith('en'));
    }
    if (voice) {
      utterance.voice = voice;
    }

    // Role-tailored tone and pitch:
    if (agentRole === 'intelligence') {
      // SYNAPSE-LEAD: Calm, measured, poised Jarvis-like cadence
      utterance.rate = 1.02;
      utterance.pitch = 0.95;
    } else if (agentRole === 'popeye') {
      // POPEYE: Stalwart, deeper nautical officer tone
      utterance.rate = 1.0;
      utterance.pitch = 0.88;
    } else if (agentRole === 'detective') {
      // CIPHER-DETECTIVE: Crisp, forensic noir pace
      utterance.rate = 1.05;
      utterance.pitch = 0.92;
    } else if (agentRole === 'network') {
      // AEGIS-NET: Quick tactical telecom operator
      utterance.rate = 1.1;
      utterance.pitch = 1.05;
    } else if (agentRole === 'physical') {
      // VALKYRIE: Vigilant, assertive guardian
      utterance.rate = 1.08;
      utterance.pitch = 1.0;
    } else {
      // KRONOS
      utterance.rate = 1.0;
      utterance.pitch = 0.9;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    if (onEnd) onEnd();
    return null;
  }
}

export function stopAgentVoice(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

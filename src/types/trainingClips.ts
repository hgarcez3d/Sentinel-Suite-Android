export interface MovieClipScene {
  id: string;
  timestampStart: number; // in seconds
  timestampEnd: number;
  title: string;
  subtitle: string;
  narrationVoiceover: string;
  visualGraphicType: 'radio_waves_cut' | 'packet_sniff_egress' | 'ammo_forge_script' | 'radar_blackout_sensor';
  keyPoints: string[];
}

export interface TrainingMovieClip {
  id: string;
  title: string;
  codename: string;
  category: 'Air-Gap Defense' | 'Data Interception' | 'Ammunition Factory' | 'Physical Security';
  durationSeconds: number;
  badge: string;
  description: string;
  scenes: MovieClipScene[];
  targetFeature: string;
  actionButtonText: string;
  actionButtonType: 'toggle_airgap' | 'open_interceptor' | 'open_ammo' | 'open_radar';
}

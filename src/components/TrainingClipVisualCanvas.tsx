import React, { useEffect, useRef } from 'react';
import { MovieClipScene } from '../types/trainingClips';

interface TrainingClipVisualCanvasProps {
  scene: MovieClipScene;
  playbackProgress: number; // 0 to 1
  isPlaying: boolean;
}

export const TrainingClipVisualCanvas: React.FC<TrainingClipVisualCanvasProps> = ({
  scene,
  playbackProgress,
  isPlaying
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      // Dark sci-fi background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Subtle holographic grid
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render based on visualGraphicType
      if (scene.visualGraphicType === 'radio_waves_cut') {
        renderRadioWavesScene(ctx, width, height, time, playbackProgress);
      } else if (scene.visualGraphicType === 'packet_sniff_egress') {
        renderPacketSniffScene(ctx, width, height, time, playbackProgress);
      } else if (scene.visualGraphicType === 'ammo_forge_script') {
        renderAmmoForgeScene(ctx, width, height, time, playbackProgress);
      } else {
        renderRadarBlackoutScene(ctx, width, height, time, playbackProgress);
      }

      // Scanline overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }

      // Cinematic corner markers
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      const cLen = 14;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(12, 12 + cLen);
      ctx.lineTo(12, 12);
      ctx.lineTo(12 + cLen, 12);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(width - 12 - cLen, 12);
      ctx.lineTo(width - 12, 12);
      ctx.lineTo(width - 12, 12 + cLen);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(12, height - 12 - cLen);
      ctx.lineTo(12, height - 12);
      ctx.lineTo(12 + cLen, height - 12);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(width - 12 - cLen, height - 12);
      ctx.lineTo(width - 12, height - 12);
      ctx.lineTo(width - 12, height - 12 - cLen);
      ctx.stroke();

      // Top recording badge & timestamp
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(28, 26, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText('TACTICAL BRIEFING // CLASSIFIED', 40, 30);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [scene, playbackProgress, isPlaying]);

  // SCENE 1: Radio Waves & True Air-Gap Cut
  const renderRadioWavesScene = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    progress: number
  ) => {
    const cx = width / 2;
    const cy = height / 2;
    const isAirGapActive = progress > 0.35;

    // Draw Phone Chassis
    ctx.strokeStyle = isAirGapActive ? '#ff4444' : '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = '#0a101d';
    const pw = 70;
    const ph = 120;
    ctx.beginPath();
    ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, 12);
    ctx.fill();
    ctx.stroke();

    // Phone screen area
    ctx.fillStyle = isAirGapActive ? '#15080c' : '#0e182c';
    ctx.roundRect(cx - pw / 2 + 5, cy - ph / 2 + 10, pw - 10, ph - 20, 6);
    ctx.fill();

    // Screen icon
    ctx.fillStyle = isAirGapActive ? '#ff4444' : '#00e5ff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isAirGapActive ? 'AIR-GAP' : 'STANDBY', cx, cy - 8);
    ctx.fillText(isAirGapActive ? '100% OFF' : 'LEAKING', cx, cy + 10);

    // Radiating Waves
    if (!isAirGapActive) {
      // Leaking active waves
      for (let i = 1; i <= 4; i++) {
        const r = (i * 24 + time * 30) % 95 + 40;
        const alpha = Math.max(0, 1 - r / 135);
        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Leaking labels
      ctx.fillStyle = '#ffaa00';
      ctx.font = '9px monospace';
      ctx.fillText('⚠ BLE BEACON LEAK', cx - 90, cy - 35);
      ctx.fillText('⚠ WI-FI SCAN', cx + 90, cy - 35);
      ctx.fillText('⚠ GPS SATELLITE', cx + 90, cy + 35);
      ctx.fillText('⚠ CELLULAR TOWER', cx - 90, cy + 35);
    } else {
      // Collapsing red protective air-gap shield
      const shieldR = 65 + Math.sin(time * 3) * 3;
      ctx.strokeStyle = 'rgba(255, 68, 68, 0.85)';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, shieldR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('⚡ 100% ZERO-RADIO SHIELD', cx, cy + ph / 2 + 25);
      ctx.fillStyle = '#a0aec0';
      ctx.font = '9px monospace';
      ctx.fillText('CELLULAR / WI-FI / BLE / GPS CUT (0 dBm)', cx, cy + ph / 2 + 38);
    }
  };

  // SCENE 2: Packet Sniff & Egress Interceptor
  const renderPacketSniffScene = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    progress: number
  ) => {
    const cx = width / 2;
    const cy = height / 2;

    // Left: Rogue App Node
    ctx.fillStyle = '#1e111d';
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(40, cy - 40, 80, 80, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ff3366';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ROGUE APP', 80, cy - 15);
    ctx.fillText('SMS / MIC', 80, cy);
    ctx.fillText('EXFILTRATE', 80, cy + 15);

    // Center: Sentinel Interceptor Trap
    ctx.fillStyle = '#0c1a2e';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 50, cy - 50, 100, 100, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('SENTINEL', cx, cy - 20);
    ctx.fillText('INTERCEPTOR', cx, cy - 5);
    ctx.fillStyle = '#00ffaa';
    ctx.fillText('BINDER HOOK', cx, cy + 12);
    ctx.fillStyle = '#a0aec0';
    ctx.font = '8px monospace';
    ctx.fillText('TRAPPING EGRESS', cx, cy + 28);

    // Right: Sinkhole & Decoy Injection
    ctx.fillStyle = '#111827';
    ctx.strokeStyle = progress > 0.5 ? '#00ffaa' : '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(width - 120, cy - 40, 80, 80, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = progress > 0.5 ? '#00ffaa' : '#ff4444';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(progress > 0.5 ? 'DECOY DATA' : 'BLOCKED', width - 80, cy - 10);
    ctx.fillText(progress > 0.5 ? 'INJECTED' : 'DROPPED', width - 80, cy + 5);
    ctx.fillStyle = '#a0aec0';
    ctx.font = '8px monospace';
    ctx.fillText(progress > 0.5 ? 'GPS={0,0}' : '0 BYTES OUT', width - 80, cy + 20);

    // Flowing packet particles
    for (let i = 0; i < 6; i++) {
      const pOffset = (time * 1.5 + i * 0.16) % 1;
      const px = 120 + pOffset * (cx - 50 - 120);
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(px, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (progress > 0.3) {
      // From interceptor to sinkhole
      for (let i = 0; i < 6; i++) {
        const pOffset = (time * 1.5 + i * 0.16) % 1;
        const px = cx + 50 + pOffset * (width - 120 - (cx + 50));
        ctx.fillStyle = progress > 0.5 ? '#00ffaa' : '#ff4444';
        ctx.beginPath();
        ctx.arc(px, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // SCENE 3: Ammunition Factory & SOAR Script Forge
  const renderAmmoForgeScene = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    progress: number
  ) => {
    const cx = width / 2;
    const cy = height / 2;

    // Terminal Code Window
    ctx.fillStyle = '#080e1a';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 140, cy - 65, 280, 130, 8);
    ctx.fill();
    ctx.stroke();

    // Title bar
    ctx.fillStyle = '#0f1c30';
    ctx.roundRect(cx - 140, cy - 65, 280, 22, [8, 8, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('AMMUNITION_FACTORY // AEGIS_QUARANTINE.SH', cx - 130, cy - 50);

    // Code lines with typing animation
    ctx.font = '8.5px monospace';
    const lines = [
      '$ [WISDOM SENTINEL] Threat CVE-2024-38077 detected',
      '$ iptables -I FORWARD 1 -s 192.168.1.185 -j DROP',
      '$ ip neigh replace 192.168.1.185 lladdr 00:00:00:00:00:00',
      '$ echo "[+] SCRIPT ARMED AS 1-CLICK TACTICAL BUTTON"',
      '$ status: 100% COMPILED // SOAR PLAYBOOK READY'
    ];

    const linesToShow = Math.min(lines.length, Math.floor(progress * 6) + 1);
    for (let i = 0; i < linesToShow; i++) {
      ctx.fillStyle = i === linesToShow - 1 ? '#00ffaa' : i === 0 ? '#ffaa00' : '#88c0d0';
      ctx.fillText(lines[i], cx - 130, cy - 25 + i * 16);
    }

    // Glowing execute button on canvas
    ctx.fillStyle = progress > 0.6 ? '#00ffaa' : '#00e5ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx + 40, cy + 35, 90, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(progress > 0.6 ? '✔ EXECUTED' : '▶ RUN BUTTON', cx + 85, cy + 49);
  };

  // SCENE 4: 360° Radar & Covert Blackout
  const renderRadarBlackoutScene = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    progress: number
  ) => {
    const cx = width / 2;
    const cy = height / 2;
    const isBlackout = progress > 0.45;

    if (!isBlackout) {
      // 360° Radar rings
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
      ctx.lineWidth = 1;
      for (let r = 25; r <= 85; r += 20) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - 95, cy);
      ctx.lineTo(cx + 95, cy);
      ctx.moveTo(cx, cy - 95);
      ctx.lineTo(cx, cy + 95);
      ctx.stroke();

      // Sweeping radar beam
      const angle = time * 2;
      ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 85, angle, angle + 0.5);
      ctx.closePath();
      ctx.fill();

      // Target blips
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(cx + 45, cy - 35, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffaa00';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('PINEAPPLE AP', cx + 55, cy - 32);
    } else {
      // Covert Blackout Screen
      ctx.fillStyle = '#05070a';
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 85, cy - 65, 170, 130, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SCREEN OFF // BLACKOUT', cx, cy - 20);

      ctx.fillStyle = '#00ffaa';
      ctx.font = '9px monospace';
      ctx.fillText('✔ GPS BREADCRUMB ACTIVE', cx, cy);
      ctx.fillText('✔ COVERT AUDIO BUFFERING', cx, cy + 16);
      ctx.fillStyle = '#88c0d0';
      ctx.font = '8px monospace';
      ctx.fillText('DOUBLE TAP DISPLAY TO UNLOCK', cx, cy + 38);
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-cyan-500/40 shadow-inner">
      <canvas
        ref={canvasRef}
        width={560}
        height={315}
        className="w-full h-full object-cover block"
      />
    </div>
  );
};

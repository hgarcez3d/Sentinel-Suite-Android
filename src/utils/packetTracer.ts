import { NetworkDevice, NetworkLink } from '../types/network';

export interface TracerPacket {
  id: string;
  linkId: string;
  sourceId: string;
  targetId: string;
  sourceIp: string;
  targetIp: string;
  sourceName: string;
  targetName: string;
  direction: 'forward' | 'reverse';
  progress: number; // 0 to 1
  speedPxPerSec: number; // velocity proportional to bandwidth utilization
  utilization: number; // 0 to 1
  packetType: string;
  payloadSummary: string;
  color: string;
  coreColor: string;
  size: number;
  tailLength: number;
  isHighRisk: boolean;
}

/**
 * Initializes and generates active tracer packets for a set of network links
 */
export function generateTracerPackets(
  links: NetworkLink[],
  devices: NetworkDevice[]
): TracerPacket[] {
  const deviceMap = new Map<string, NetworkDevice>();
  devices.forEach(d => deviceMap.set(d.id, d));

  const packets: TracerPacket[] = [];

  links.forEach(link => {
    if (!link.isActive) return;

    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

    const sourceDev = deviceMap.get(sourceId);
    const targetDev = deviceMap.get(targetId);

    const sourceIp = sourceDev?.ip || sourceId;
    const targetIp = targetDev?.ip || targetId;
    const sourceName = sourceDev?.hostname || sourceId;
    const targetName = targetDev?.hostname || targetId;

    const util = Math.max(0.05, Math.min(1.0, link.bandwidthUtilization || 0.1));

    // Determine packet count based on bandwidth utilization
    let packetCount = 1;
    if (util >= 0.75) {
      packetCount = 4;
    } else if (util >= 0.5) {
      packetCount = 3;
    } else if (util >= 0.22) {
      packetCount = 2;
    }

    // Speed strictly proportional to bandwidth utilization:
    // Low utilization (0.05) ~ 45 px/s
    // High utilization (1.0) ~ 310 px/s
    const speedPxPerSec = Math.round(38 + Math.pow(util, 1.15) * 270);

    // Identify risk and specialized payload types
    const hasBackyardCam = sourceId.includes('cam-backyard') || targetId.includes('cam-backyard');
    const hasRogueEsp = sourceId.includes('rogue') || targetId.includes('rogue');
    const isCriticalRisk = hasBackyardCam || hasRogueEsp ||
      sourceDev?.securityStatus === 'critical' || targetDev?.securityStatus === 'critical';

    for (let i = 0; i < packetCount; i++) {
      // Alternate direction for multi-packet connections (bidirectional TX/RX)
      const isReverse = i % 2 === 1;
      const initialProgress = (i / packetCount + Math.random() * 0.15) % 1.0;

      let packetType = 'TCP_DATA';
      let payloadSummary = 'Standard LAN Traffic';
      let color = '#00e5ff';
      let coreColor = '#ffffff';

      if (hasBackyardCam) {
        packetType = 'RTSP_SURVEILLANCE';
        payloadSummary = 'Unauthenticated RTSP Stream (CVE-2021-36260)';
        color = '#ef4444';
        coreColor = '#fecaca';
      } else if (hasRogueEsp) {
        packetType = 'TELNET_SHELL';
        payloadSummary = 'Unencrypted Telnet Root Shell Infiltration';
        color = '#ef4444';
        coreColor = '#ffffff';
      } else if (sourceId.includes('nas') || targetId.includes('nas')) {
        packetType = 'SMB_DATA';
        payloadSummary = 'SMBv3 Encrypted Storage Stream';
        color = util > 0.6 ? '#e0f2fe' : '#00e5ff';
        coreColor = '#ffffff';
      } else if (sourceId.includes('macbook') || targetId.includes('macbook')) {
        packetType = 'TLS_STREAM';
        payloadSummary = 'AirPlay 2 High-Bitrate Media / TLS 1.3';
        color = '#38bdf8';
        coreColor = '#ffffff';
      } else if (link.connectionType === 'wifi_5g') {
        packetType = 'WIFI_80211AX';
        payloadSummary = 'Wi-Fi 6 5GHz OFDM Packet';
        color = '#10b981';
        coreColor = '#d1fae5';
      } else if (link.connectionType === 'wifi_2g') {
        packetType = 'WIFI_80211N';
        payloadSummary = 'Wi-Fi 4 2.4GHz Legacy Frame';
        color = '#f59e0b';
        coreColor = '#fef3c7';
      } else if (link.connectionType === 'ethernet_10g') {
        packetType = '10G_FIBER';
        payloadSummary = '10 Gigabit Core Trunk Frame';
        color = '#38bdf8';
        coreColor = '#ffffff';
      }

      packets.push({
        id: `pkt-${link.id}-${i}`,
        linkId: link.id,
        sourceId,
        targetId,
        sourceIp: isReverse ? targetIp : sourceIp,
        targetIp: isReverse ? sourceIp : targetIp,
        sourceName: isReverse ? targetName : sourceName,
        targetName: isReverse ? sourceName : targetName,
        direction: isReverse ? 'reverse' : 'forward',
        progress: initialProgress,
        speedPxPerSec,
        utilization: util,
        packetType,
        payloadSummary,
        color,
        coreColor,
        size: 3.0 + util * 1.5,
        tailLength: Math.round(5 + util * 20),
        isHighRisk: isCriticalRisk
      });
    }
  });

  return packets;
}

/**
 * Updates positions of tracer packets based on delta time and current node coordinates
 */
export function updateTracerPackets(
  packets: TracerPacket[],
  dtSec: number,
  getNodePosition: (id: string) => { x: number; y: number } | null
): {
  id: string;
  packet: TracerPacket;
  cx: number;
  cy: number;
  tailX: number;
  tailY: number;
  angleDeg: number;
}[] {
  const results: {
    id: string;
    packet: TracerPacket;
    cx: number;
    cy: number;
    tailX: number;
    tailY: number;
    angleDeg: number;
  }[] = [];

  packets.forEach(pkt => {
    const sPos = getNodePosition(pkt.sourceId);
    const tPos = getNodePosition(pkt.targetId);

    if (!sPos || !tPos) return;

    const dx = tPos.x - sPos.x;
    const dy = tPos.y - sPos.y;
    const dist = Math.hypot(dx, dy) || 1;

    // Advance progress based on physical speed proportional to bandwidth
    const dPhase = (pkt.speedPxPerSec * dtSec) / dist;
    pkt.progress = (pkt.progress + dPhase) % 1.0;

    // Calculate current coordinates based on direction
    const phase = pkt.direction === 'forward' ? pkt.progress : 1.0 - pkt.progress;
    const cx = sPos.x + dx * phase;
    const cy = sPos.y + dy * phase;

    // Unit vector for packet motion direction
    const motionSign = pkt.direction === 'forward' ? 1 : -1;
    const ux = (dx / dist) * motionSign;
    const uy = (dy / dist) * motionSign;

    // Tail start position (stretching backward behind the packet head)
    const tailX = cx - ux * pkt.tailLength;
    const tailY = cy - uy * pkt.tailLength;

    const angleDeg = Math.atan2(uy, ux) * (180 / Math.PI);

    results.push({
      id: pkt.id,
      packet: pkt,
      cx,
      cy,
      tailX,
      tailY,
      angleDeg
    });
  });

  return results;
}

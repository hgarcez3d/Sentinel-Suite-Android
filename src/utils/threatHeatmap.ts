import * as d3 from 'd3';
import { NetworkDevice, HeatmapMode, SubnetThreatMetrics } from '../types/network';

export interface DeviceThreatWeight {
  deviceId: string;
  threatScore: number; // 0 - 100
  heatRadius: number; // in pixels
  color: string;
  intensity: number; // 0 - 1
  label: string;
}

export interface SubnetClusterGeometry {
  metrics: SubnetThreatMetrics;
  centroid: { x: number; y: number };
  pathData: string;
  maxThreatDevice: NetworkDevice | null;
}

/**
 * Calculates individual threat score (0-100) and heat radius for a device based on mode
 */
export function calculateDeviceThreat(
  device: NetworkDevice,
  mode: HeatmapMode = 'threat_index'
): DeviceThreatWeight {
  const isIsolated = device.isIsolated;
  const highRiskPorts = device.openPorts.filter(p => p.isHighRisk).length;
  const maxCvss = device.vulnerabilities.reduce((max, v) => Math.max(max, v.cvssScore), 0);
  const totalVulns = device.vulnerabilities.length;
  const trafficKps = device.rxRateKbps + device.txRateKbps;

  let threatScore = 0;
  let label = 'Nominal';

  switch (mode) {
    case 'vulnerabilities': {
      if (totalVulns === 0) {
        threatScore = device.securityStatus === 'warning' ? 25 : 0;
      } else {
        const cvssWeight = (maxCvss / 10) * 70;
        const countWeight = Math.min(30, totalVulns * 15);
        threatScore = Math.min(100, Math.round(cvssWeight + countWeight));
      }
      label = totalVulns > 0 ? `${totalVulns} CVEs (CVSS ${maxCvss.toFixed(1)})` : 'Clean';
      break;
    }

    case 'port_exposure': {
      const openCount = device.openPorts.length;
      const riskScore = highRiskPorts * 35;
      const generalPortScore = Math.min(30, openCount * 6);
      threatScore = Math.min(100, riskScore + generalPortScore);
      label = `${openCount} ports (${highRiskPorts} high-risk)`;
      break;
    }

    case 'traffic_load': {
      const loadScore = Math.min(100, Math.round((trafficKps / 20000) * 100));
      threatScore = loadScore;
      label = `${(trafficKps / 1000).toFixed(1)} Mbps`;
      break;
    }

    case 'threat_index':
    default: {
      let base = 0;
      if (device.deviceType === 'rogue') base += 35;
      if (device.securityStatus === 'critical') base += 45;
      else if (device.securityStatus === 'warning') base += 25;

      const cvssPart = (maxCvss / 10) * 35;
      const portPart = highRiskPorts * 10;
      const isoDampening = isIsolated ? 0.7 : 1.0;

      threatScore = Math.min(100, Math.round((base + cvssPart + portPart) * isoDampening));
      label = device.securityStatus.toUpperCase();
      break;
    }
  }

  // Determine heat halo radius and color
  const minRadius = (device.radius || 30) + 30;
  const maxRadius = minRadius + 95;
  const heatRadius = Math.round(minRadius + (threatScore / 100) * (maxRadius - minRadius));

  let color = '#10b981'; // Green
  let intensity = 0.3;

  if (threatScore >= 75) {
    color = '#ef4444'; // Red
    intensity = 0.85;
  } else if (threatScore >= 50) {
    color = '#f97316'; // Orange
    intensity = 0.7;
  } else if (threatScore >= 25) {
    color = '#eab308'; // Amber
    intensity = 0.55;
  } else if (threatScore >= 10) {
    color = '#06b6d4'; // Cyan
    intensity = 0.4;
  }

  return {
    deviceId: device.id,
    threatScore,
    heatRadius,
    color,
    intensity,
    label
  };
}

/**
 * Groups devices by subnet and computes cluster threat metrics
 */
export function computeSubnetMetrics(
  devices: NetworkDevice[],
  mode: HeatmapMode = 'threat_index'
): SubnetThreatMetrics[] {
  const subnetMap = new Map<string, { cidr: string; vlanName: string; devices: NetworkDevice[] }>();

  devices.forEach(d => {
    let cidr = d.subnet;
    if (!cidr) {
      // Default to /24 from IP
      const parts = d.ip.split('.');
      if (parts.length === 4) {
        cidr = `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
      } else {
        cidr = '192.168.1.0/24';
      }
    }

    const vlanName = d.vlanName || 'Default Subnet';
    const key = cidr;

    if (!subnetMap.has(key)) {
      subnetMap.set(key, { cidr, vlanName, devices: [] });
    }
    subnetMap.get(key)!.devices.push(d);
  });

  const results: SubnetThreatMetrics[] = [];

  subnetMap.forEach((group, cidr) => {
    const devs = group.devices;
    const totalDevices = devs.length;
    const criticalCount = devs.filter(d => d.securityStatus === 'critical').length;
    const warningCount = devs.filter(d => d.securityStatus === 'warning').length;
    const secureCount = devs.filter(d => d.securityStatus === 'secure').length;

    let maxCvss = 0;
    let totalVulns = 0;
    let highRiskPortsCount = 0;
    let totalThreatScore = 0;

    devs.forEach(d => {
      const dThreat = calculateDeviceThreat(d, mode);
      totalThreatScore += dThreat.threatScore;

      d.vulnerabilities.forEach(v => {
        if (v.cvssScore > maxCvss) maxCvss = v.cvssScore;
        totalVulns++;
      });

      highRiskPortsCount += d.openPorts.filter(p => p.isHighRisk).length;
    });

    const avgScore = totalDevices > 0 ? totalThreatScore / totalDevices : 0;
    // Composite threat score incorporates both average density and maximum threat severity
    const compositeThreatScore = Math.min(
      100,
      Math.round(avgScore * 0.6 + (maxCvss * 10) * 0.3 + (criticalCount > 0 ? 15 : 0))
    );

    let threatLevel: SubnetThreatMetrics['threatLevel'] = 'nominal';
    let color = '#10b981';

    if (compositeThreatScore >= 70 || criticalCount >= 2) {
      threatLevel = 'critical';
      color = '#ef4444';
    } else if (compositeThreatScore >= 45 || criticalCount >= 1) {
      threatLevel = 'high';
      color = '#f97316';
    } else if (compositeThreatScore >= 25 || warningCount >= 2) {
      threatLevel = 'moderate';
      color = '#eab308';
    } else if (compositeThreatScore >= 10 || warningCount >= 1) {
      threatLevel = 'low';
      color = '#06b6d4';
    }

    results.push({
      subnetId: `subnet-${cidr.replace(/[^a-zA-Z0-9]/g, '_')}`,
      cidr,
      vlanName: group.vlanName,
      deviceIds: devs.map(d => d.id),
      totalDevices,
      criticalCount,
      warningCount,
      secureCount,
      maxCvss,
      totalVulnerabilities: totalVulns,
      highRiskPortsCount,
      compositeThreatScore,
      threatLevel,
      color
    });
  });

  return results.sort((a, b) => b.compositeThreatScore - a.compositeThreatScore);
}

/**
 * Computes polygon hull with padded perimeter for a cluster of nodes
 */
export function generateSubnetHullPath(
  devices: NetworkDevice[],
  padding = 80
): { pathData: string; centroid: { x: number; y: number } } | null {
  const validPoints = devices
    .filter(d => typeof d.x === 'number' && typeof d.y === 'number')
    .map(d => [d.x as number, d.y as number] as [number, number]);

  if (validPoints.length === 0) return null;

  // Compute centroid
  const sumX = validPoints.reduce((acc, p) => acc + p[0], 0);
  const sumY = validPoints.reduce((acc, p) => acc + p[1], 0);
  const centroid = {
    x: sumX / validPoints.length,
    y: sumY / validPoints.length
  };

  // Case 1: Single node cluster -> smooth circle
  if (validPoints.length === 1) {
    const [x, y] = validPoints[0];
    const r = padding + 35;
    const pathData = `M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y} Z`;
    return { pathData, centroid: { x, y } };
  }

  // Case 2: 2 nodes -> capsule/pill path
  if (validPoints.length === 2) {
    const [p1, p2] = validPoints;
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const dist = Math.hypot(dx, dy) || 1;
    const nx = -dy / dist;
    const ny = dx / dist;
    const r = padding + 25;

    const corner1: [number, number] = [p1[0] + nx * r, p1[1] + ny * r];
    const corner2: [number, number] = [p2[0] + nx * r, p2[1] + ny * r];
    const corner3: [number, number] = [p2[0] - nx * r, p2[1] - ny * r];
    const corner4: [number, number] = [p1[0] - nx * r, p1[1] - ny * r];

    const pathData = `
      M ${corner1[0]} ${corner1[1]}
      L ${corner2[0]} ${corner2[1]}
      A ${r} ${r} 0 0 1 ${corner3[0]} ${corner3[1]}
      L ${corner4[0]} ${corner4[1]}
      A ${r} ${r} 0 0 1 ${corner1[0]} ${corner1[1]}
      Z
    `;
    return { pathData, centroid };
  }

  // Case 3: 3+ nodes -> Convex hull with expanded smoothed spline
  let hull = d3.polygonHull(validPoints);
  if (!hull || hull.length < 3) {
    // If collinear, generate bounding capsule around extreme points
    const minX = Math.min(...validPoints.map(p => p[0]));
    const maxX = Math.max(...validPoints.map(p => p[0]));
    const minY = Math.min(...validPoints.map(p => p[1]));
    const maxY = Math.max(...validPoints.map(p => p[1]));
    const r = padding + 25;
    const pathData = `
      M ${minX - r} ${minY - r}
      H ${maxX + r}
      V ${maxY + r}
      H ${minX - r}
      Z
    `;
    return { pathData, centroid };
  }

  // Expand hull vertices away from centroid by padding
  const expandedHull: [number, number][] = hull.map(([vx, vy]) => {
    const dx = vx - centroid.x;
    const dy = vy - centroid.y;
    const dist = Math.hypot(dx, dy) || 1;
    return [
      vx + (dx / dist) * padding,
      vy + (dy / dist) * padding
    ];
  });

  const lineGenerator = d3.line<[number, number]>()
    .x(d => d[0])
    .y(d => d[1])
    .curve(d3.curveCatmullRomClosed.alpha(0.6));

  const pathData = lineGenerator(expandedHull) || '';
  return { pathData, centroid };
}

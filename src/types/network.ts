export type DeviceType =
  | 'gateway'
  | 'access_point'
  | 'camera'
  | 'server'
  | 'workstation'
  | 'mobile'
  | 'iot'
  | 'rogue';

export type SecurityStatus = 'secure' | 'warning' | 'critical' | 'scanning';

export type ConnectionType = 'ethernet_10g' | 'ethernet_1g' | 'wifi_5g' | 'wifi_2g' | 'mesh';

export interface PortInfo {
  port: number;
  protocol: 'tcp' | 'udp';
  service: string;
  state: 'open' | 'filtered' | 'closed';
  version?: string;
  isHighRisk?: boolean;
  riskNotes?: string;
}

export interface Vulnerability {
  cveId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore: number;
  title: string;
  description: string;
  remediation: string;
}

export interface NetworkDevice {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  deviceType: DeviceType;
  vendor: string;
  osFingerprint: string;
  securityStatus: SecurityStatus;
  connectedToId?: string | null;
  connectionType: ConnectionType;
  openPorts: PortInfo[];
  vulnerabilities: Vulnerability[];
  latencyMs: number;
  rssiSignalDbm?: number;
  rxRateKbps: number;
  txRateKbps: number;
  lastScanned: string;
  isIsolated: boolean;
  isPinned?: boolean;
  notes?: string;
  subnet?: string;
  vlanName?: string;

  // D3 force simulation properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  radius?: number;
}

export interface NetworkLink {
  id: string;
  source: string | NetworkDevice;
  target: string | NetworkDevice;
  connectionType: ConnectionType;
  bandwidthUtilization: number;
  isActive: boolean;
}

export interface ScanProfile {
  id: string;
  title: string;
  command: string;
  description: string;
}

export interface NmapLogLine {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'critical' | 'command';
}

export type HeatmapMode = 'threat_index' | 'vulnerabilities' | 'port_exposure' | 'traffic_load';

export interface SubnetThreatMetrics {
  subnetId: string;
  cidr: string;
  vlanName: string;
  deviceIds: string[];
  totalDevices: number;
  criticalCount: number;
  warningCount: number;
  secureCount: number;
  maxCvss: number;
  totalVulnerabilities: number;
  highRiskPortsCount: number;
  compositeThreatScore: number; // 0 - 100
  threatLevel: 'nominal' | 'low' | 'moderate' | 'high' | 'critical';
  color: string;
}

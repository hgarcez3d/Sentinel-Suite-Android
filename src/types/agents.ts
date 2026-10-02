export type AgentRole = 'network' | 'system' | 'physical' | 'intelligence' | 'detective' | 'popeye';

export interface AgentProfile {
  id: AgentRole;
  name: string;
  title: string;
  tagline: string;
  avatarIcon: string;
  color: string;
  accentHex: string;
  model: string;
  badge: string;
  systemInstruction: string;
  quickPrompts: string[];
}

export interface AttackPattern {
  id: string;
  name: string;
  mitreTactic: string;
  techniqueId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  targetEntities: string[];
}

export interface ForensicEvidence {
  fileOrArtifact: string;
  sha256: string;
  originGeoEstimate: string;
  protocolObserved: string;
  chainOfCustodyRecord: string;
  adversaryEntryVector: string;
}

export interface BugHunterReport {
  targetArchitecture: string;
  vulnerabilityClass: string;
  cvssRating: number;
  estimatedBountyTier: string;
  responsibleDisclosureStatus: string;
  governmentLiaisonNotice: string;
}

export interface ThreatIntelligenceReport {
  id: string;
  timestamp: string;
  campaignName: string;
  overallThreatLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'NOMINAL';
  executiveSummary: string;
  attackPatterns: AttackPattern[];
  killChainStage: string;
  forensicAudit: ForensicEvidence;
  popeyeDossier: BugHunterReport;
  recommendedCountermeasures: string[];
  analyzedLogCount: number;
}

export interface ChatMessage {
  id: string;
  agentId: AgentRole;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  sources?: { title: string; url: string }[];
  isTelemetrySnapshot?: boolean;
}

export interface SystemAuditMetric {
  cpuUsagePercent: number;
  cpuCores: number;
  loadAvg: string;
  kernelVersion: string;
  ramUsedMb: number;
  ramTotalMb: number;
  storagePartitions: {
    name: string;
    mount: string;
    usedGb: number;
    totalGb: number;
    integrityVerified: boolean;
  }[];
  packageAudit: {
    name: string;
    version: string;
    sourceSignature: string;
    verifiedOrigin: boolean;
    status: 'verified' | 'tampered' | 'untrusted';
  }[];
}

export interface ProximityBeacon {
  id: string;
  name: string;
  deviceType: string;
  protocol: 'bluetooth_ble' | 'wifi_beacon' | 'uwb' | 'sub_ghz';
  frequency: string;
  estimatedDistanceMeters: number;
  rssi: number;
  stabilityScore: number; // 0 to 100%
  bearingDegrees: number; // 0 to 360 degrees on circular radar
  threatScore: 'safe' | 'suspicious' | 'hostile';
  macAddress: string;
  manufacturer: string;
  lastPing: string;
  txPower?: number;
  historyRssi?: number[];
}

export interface PhysicalSecurityState {
  antiTamperActive: boolean;
  stealthBlackoutMode: boolean;
  cameraMicrophoneSurveillanceLock: boolean;
  geofenceRadiusMeters: number;
  perimeterAlertCount: number;
  emergencyFillProtocolReady: boolean;
  proximityBeacons: ProximityBeacon[];
}

export interface DailyReport {
  id: string;
  date: string;
  generatedAt: string;
  overallScore: number;
  executiveSummary: string;
  networkTriage: string;
  kernelStorageIntegrity: string;
  physicalPerimeterStatus: string;
  actionItems: string[];
  recommendations: string[];
}

export interface WisdomSentinelNode {
  appletId: string;
  name: string;
  platform: 'mobile' | 'web' | 'integration_hub';
  url: string;
  status: 'active' | 'syncing' | 'idle';
  lastPing: string;
  popeyeLiaison: string;
  registeredRecordsCount: number;
}

export interface WisdomSentinelSyncState {
  hubName: string;
  status: 'SYNCHRONIZED' | 'SYNCING' | 'OFFLINE';
  lastSyncTimestamp: string;
  mobileNode: WisdomSentinelNode;
  webNode: WisdomSentinelNode;
  popeyesActiveCount: number;
  totalRecordsIngested: number;
  monthlyPaperTitle: string;
  monthlyPaperPublicationDate: string;
  cyberAnalysisJournalUrl: string;
  governmentLiaisonAgency: string;
  totalBountyRevenueSecuredUsd: number;
}

export interface WisdomSentinelDailyCard {
  cardId: string;
  dispatchDate: string;
  defconLevel: string;
  fleetThreatIndex: number;
  headline: string;
  summary: string;
  fleetDirectives: string[];
  flaggedThreatVectors: string[];
  cryptographicSignature: string;
  dispatchedToUserVia: 'First Mate Popeye';
  transmissionType: 'ONE_WAY_BROADCAST';
}

export interface WisdomSentinelMonthlyAuditReport {
  reportId: string;
  title: string;
  publicationDate: string;
  volumeAndIssue: string;
  executiveAbstract: string;
  auditedArchitectures: {
    vendor: string;
    vulnerabilityClass: string;
    cveIdentifier: string;
    cvssScore: number;
    bountySecuredUsd: number;
    status: string;
  }[];
  totalBountySecuredUsd: number;
  formalJournalUrl: string;
  complianceStandards: string[];
  chainOfCustodyDigest: string;
  dispatchedToUserVia: 'First Mate Popeye';
  transmissionType: 'ONE_WAY_AUDIT_DISPATCH';
}



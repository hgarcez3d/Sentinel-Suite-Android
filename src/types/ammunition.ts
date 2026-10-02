export type ScriptCategory =
  | 'network_quarantine'
  | 'active_honeytoken'
  | 'memory_shield'
  | 'rf_airwall'
  | 'crypto_sinkhole'
  | 'forensic_rapid_wipe';

export type ThreatLevelTarget = 'ZERO_DAY' | 'CRITICAL' | 'HIGH' | 'TACTICAL';

export interface AmmunitionScript {
  id: string;
  name: string;
  codename: string;
  category: ScriptCategory;
  assignedAgent: 'AEGIS-NET' | 'KRONOS-CORE' | 'VALKYRIE-SEC' | 'SYNAPSE-LEAD' | 'CIPHER-STEALTH';
  threatTarget: string; // e.g. "CVE-2024-38077 / Rogue AP probe"
  threatLevel: ThreatLevelTarget;
  syncedFromWisdomSentinel: boolean;
  description: string;
  scriptPayload: string; // Shell / Python execution code
  estimatedRuntimeMs: number;
  lastRunTimestamp?: string;
  runCount: number;
  successRate: number; // 99%
  status: 'ready' | 'running' | 'executed' | 'failed';
  actionType: 'quarantine' | 'decoy_deploy' | 'kernel_lock' | 'rf_scramble' | 'sinkhole' | 'storage_wipe';
}

export interface ScriptExecutionLog {
  id: string;
  scriptId: string;
  timestamp: string;
  executedBy: 'operator' | 'synapse_agent' | 'wisdom_sentinel';
  stdoutLines: string[];
  status: 'success' | 'warning' | 'error';
  targetEntity?: string;
}

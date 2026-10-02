import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NetworkDevice, NetworkLink, SecurityStatus, DeviceType, ScanProfile, NmapLogLine } from './types/network';
import { AgentRole, SystemAuditMetric, PhysicalSecurityState, DailyReport } from './types/agents';
import { INITIAL_DEVICES, getInitialLinks, SCAN_PROFILES } from './data/initialData';
import {
  INITIAL_SYSTEM_METRICS,
  INITIAL_PHYSICAL_SECURITY,
  INITIAL_DAILY_REPORT
} from './data/agentProfiles';
import { NetworkSubnetManager } from './components/NetworkSubnetManager';
import { DeviceDetailModal } from './components/DeviceDetailModal';
import { AgentChatPanel } from './components/AgentChatPanel';
import { ThreatIntelligencePanel } from './components/ThreatIntelligencePanel';
import { TelemetryDashboardModal } from './components/TelemetryDashboardModal';
import { ProximityRadar } from './components/ProximityRadar';
import { PhysicalSecurityHub } from './components/PhysicalSecurityHub';
import { EmergencyRapidFillModal } from './components/EmergencyRapidFillModal';
import { CovertBlackoutScreen } from './components/CovertBlackoutScreen';
import { AmmunitionFactoryModal } from './components/AmmunitionFactoryModal';
import { CovertInterceptorModal } from './components/CovertInterceptorModal';
import { TacticalVideoTrainingModal } from './components/TacticalVideoTrainingModal';
import { dataInterceptorService } from './services/dataInterceptorService';
import { MobileTopBar } from './components/MobileTopBar';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { MobilePopeyeHubView } from './components/MobilePopeyeHubView';
import { InteractiveShellTerminal } from './components/InteractiveShellTerminal';
import { NmapConsole } from './components/NmapConsole';
import {
  Terminal,
  Play,
  Square,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  RotateCcw,
  Sparkles,
  Smartphone,
  Anchor,
  ShieldCheck,
  Bot
} from 'lucide-react';

export const App: React.FC = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>(INITIAL_DEVICES);
  const [links, setLinks] = useState<NetworkLink[]>(() => getInitialLinks(INITIAL_DEVICES));
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);

  // Mobile Bottom Tab Navigation
  const [activeTab, setActiveTab] = useState<MobileTab>('topology');

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState<SecurityStatus | null>(null);
  const [filterType, setFilterType] = useState<DeviceType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Agent Chat & Threat Intelligence state
  const [activeAgent, setActiveAgent] = useState<AgentRole>('popeye');
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [isRapidFillModalOpen, setIsRapidFillModalOpen] = useState(false);
  const [isAmmoFactoryOpen, setIsAmmoFactoryOpen] = useState(false);
  const [isInterceptorModalOpen, setIsInterceptorModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [activeTrainingClipId, setActiveTrainingClipId] = useState<string>('clip-airgap');
  const [isAirGapActive, setIsAirGapActive] = useState<boolean>(() =>
    dataInterceptorService.getAirGapState().isAirGapActive
  );

  useEffect(() => {
    const unsub = dataInterceptorService.subscribe(() => {
      setIsAirGapActive(dataInterceptorService.getAirGapState().isAirGapActive);
    });
    return () => unsub();
  }, []);

  // Mobile Shell Terminal Drawer state
  const [isShellOpen, setIsShellOpen] = useState(false);
  const [isNmapDrawerOpen, setIsNmapDrawerOpen] = useState(false);

  // System & Physical Security State (Managed by KRONOS & VALKYRIE)
  const [systemMetrics, setSystemMetrics] = useState<SystemAuditMetric>(INITIAL_SYSTEM_METRICS);
  const [physicalSec, setPhysicalSec] = useState<PhysicalSecurityState>(INITIAL_PHYSICAL_SECURITY);
  const [dailyReport, setDailyReport] = useState<DailyReport>(INITIAL_DAILY_REPORT);

  // Nmap Scan & Console state
  const [selectedProfile, setSelectedProfile] = useState<ScanProfile>(SCAN_PROFILES[0]);
  const [selectedSubnet, setSelectedSubnet] = useState('192.168.1.0/24');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [logs, setLogs] = useState<NmapLogLine[]>([
    {
      id: 'init-1',
      timestamp: '00:00:01',
      text: 'SENTINEL SUITE (APK Mobile Unit Alpha) initialized. 12 hosts loaded into D3 interactive matrix.',
      type: 'info'
    },
    {
      id: 'init-2',
      timestamp: '00:00:02',
      text: 'First Mate Popeye verified downlink to The Wisdom Sentinel. 0 security breaches in quarantine.',
      type: 'success'
    },
    {
      id: 'init-3',
      timestamp: '00:00:03',
      text: 'VALKYRIE-SEC: Proximity RF radar tracking 150m boundary. 1 suspicious BLE emitter nearby.',
      type: 'warning'
    },
    {
      id: 'init-4',
      timestamp: '00:00:04',
      text: 'KRONOS-CORE: Android runtime verified. Hardware Keystore cryptographic integrity verified.',
      type: 'info'
    }
  ]);

  const scanAbortRef = useRef(false);

  // Helper to add log line
  const addLog = useCallback((text: string, type: NmapLogLine['type'] = 'info') => {
    const now = new Date();
    const ts = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ].join(':');

    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: ts,
        text,
        type
      }
    ]);
  }, []);

  // Sleep helper
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Run Simulated Nmap Scan with progressive live logs
  const handleStartScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    scanAbortRef.current = false;

    addLog(`Starting Nmap scan: ${selectedProfile.command}`, 'command');
    addLog(`Scanning subnet ${selectedSubnet} on interface wlan0...`, 'info');

    await sleep(400);
    if (scanAbortRef.current) return;
    setScanProgress(0.15);
    addLog(`Initiating ARP ping discovery sweep...`, 'info');

    await sleep(500);
    if (scanAbortRef.current) return;
    setScanProgress(0.35);
    addLog(`Host 192.168.1.1 (gateway-unifi-core.lan) appears to be up.`, 'success');
    addLog(`Host 192.168.1.2 (unifi-u6-ap-hallway.lan) appears to be up.`, 'success');
    addLog(`Host 192.168.1.104 (cam-backyard-ptz.lan) appears to be up.`, 'warning');
    addLog(`Host 192.168.1.199 (esp8266-temp-probe.lan) appears to be up.`, 'warning');

    await sleep(600);
    if (scanAbortRef.current) return;
    setScanProgress(0.55);
    addLog(`SYN Stealth Scan initiated across 1000 ports...`, 'info');
    addLog('[AEGIS-NET] Probing ports on 192.168.1.104 (cam-backyard-ptz.lan)...', 'info');
    addLog('CRITICAL [AEGIS-NET]: 192.168.1.104:554/tcp open rtsp (UNAUTHENTICATED VIDEO STREAM)', 'critical');
    addLog('CRITICAL [AEGIS-NET]: CVE-2021-36260 match confirmed on Hikvision web service', 'critical');

    await sleep(500);
    if (scanAbortRef.current) return;
    setScanProgress(0.8);
    addLog('[AEGIS-NET] Inspecting 192.168.1.199 (ESP8266 ad-hoc module)...', 'info');
    addLog('CRITICAL [AEGIS-NET]: Port 23/tcp (Telnet) exposed with unauthenticated root command prompt!', 'critical');

    // Dynamically discover a new stealth drone if not yet added
    setDevices(currentDevices => {
      const exists = currentDevices.some(d => d.id === 'dev-drone');
      if (!exists) {
        addLog('[AEGIS-NET] NEW HOST DETECTED: 192.168.1.210 (DJI Drone Controller AP / Telemetry)', 'warning');
        addLog('[AEGIS-NET] Open port 2323/tcp (Unencrypted flight telemetry broadcast)', 'warning');

        const droneDevice: NetworkDevice = {
          id: 'dev-drone',
          ip: '192.168.1.210',
          mac: '60:60:1F:B4:77:88',
          hostname: 'dji-mavic-flight.lan',
          deviceType: 'rogue',
          vendor: 'SZ DJI Technology',
          osFingerprint: 'Linux 4.14 / DJI RTOS Embedded',
          securityStatus: 'warning',
          connectedToId: 'dev-ap',
          connectionType: 'wifi_5g',
          openPorts: [
            { port: 2323, protocol: 'tcp', service: 'dji-telemetry', state: 'open', isHighRisk: true, riskNotes: 'Unencrypted telemetry feed' },
            { port: 8080, protocol: 'tcp', service: 'http', state: 'open', version: 'Drone Web Control' }
          ],
          vulnerabilities: [
            {
              cveId: 'AUDIT-DRONE-STREAM',
              severity: 'MEDIUM',
              cvssScore: 6.4,
              title: 'Unencrypted Flight Telemetry Broadcast',
              description: 'Flight telemetry is broadcasting GPS and compass vectors unencrypted over Wi-Fi port 2323.',
              remediation: 'Enable WPA3 Enterprise authentication and restrict telemetry port access via firewall.'
            }
          ],
          latencyMs: 15,
          rxRateKbps: 240,
          txRateKbps: 1800,
          lastScanned: 'Nmap Live Scan',
          isIsolated: false,
          notes: 'Discovered during mobile RF telemetry sweep. Broadcasting unencrypted video telemetry.'
        };

        setLinks(currentLinks => [
          ...currentLinks,
          {
            id: 'link-ap-drone',
            source: 'dev-ap',
            target: 'dev-drone',
            connectionType: 'wifi_5g',
            bandwidthUtilization: 0.72,
            isActive: true
          }
        ]);

        return [...currentDevices, droneDevice];
      }
      return currentDevices;
    });

    await sleep(400);
    setScanProgress(1.0);
    setIsScanning(false);
    addLog(`Nmap done: 13 IP addresses (13 hosts up) scanned in 2.34 seconds`, 'success');
    addLog(`SYNAPSE-LEAD: Multi-agent telemetry matrix synchronized. 1 new finding relayed to Popeye.`, 'info');
  };

  const handleStopScan = () => {
    scanAbortRef.current = true;
    setIsScanning(false);
    addLog('Nmap scan interrupted by operator.', 'warning');
  };

  // Toggle Isolation of device
  const handleToggleIsolation = (id: string) => {
    setDevices(prev =>
      prev.map(d => {
        if (d.id === id) {
          const nextState = !d.isIsolated;
          addLog(
            `[AEGIS-NET] Device ${d.hostname} (${d.ip}) ${nextState ? 'QUARANTINED & ISOLATED' : 'RELEASED FROM ISOLATION'}.`,
            nextState ? 'critical' : 'info'
          );
          return { ...d, isIsolated: nextState };
        }
        return d;
      })
    );

    // Update link activity
    setLinks(prev =>
      prev.map(l => {
        const sId = typeof l.source === 'object' ? (l.source as NetworkDevice).id : l.source;
        const tId = typeof l.target === 'object' ? (l.target as NetworkDevice).id : l.target;
        if (sId === id || tId === id) {
          return { ...l, isActive: !l.isActive };
        }
        return l;
      })
    );
  };

  // Toggle Pinning
  const handleTogglePin = (id: string) => {
    setDevices(prev =>
      prev.map(d => (d.id === id ? { ...d, isPinned: !d.isPinned } : d))
    );
  };

  // Rescan specific device
  const handleRescanDevice = async (dev: NetworkDevice) => {
    addLog(`[AEGIS-NET] Re-scanning target ${dev.ip} (${dev.hostname})...`, 'info');
    await sleep(600);
    addLog(`[AEGIS-NET] Ports and services confirmed for ${dev.ip}. 0 new vulnerabilities found.`, 'success');
  };

  // Physical Security Toggle Handlers
  const handleToggleAntiTamper = () => {
    setPhysicalSec(prev => {
      const next = !prev.antiTamperActive;
      addLog(`[VALKYRIE-SEC] Anti-Tamper System ${next ? 'ARMED' : 'DISARMED'}.`, next ? 'warning' : 'info');
      return { ...prev, antiTamperActive: next };
    });
  };

  const handleToggleBlackout = () => {
    setPhysicalSec(prev => {
      const next = !prev.stealthBlackoutMode;
      addLog(
        `[VALKYRIE-SEC] Stealth Blackout Mode ${next ? 'ACTIVATED (Display zeroed, silent sensors armed)' : 'DEACTIVATED'}.`,
        next ? 'critical' : 'info'
      );
      return { ...prev, stealthBlackoutMode: next };
    });
  };

  const handleTriggerEmergencyFill = () => {
    addLog(
      '[VALKYRIE-SEC] EMERGENCY RAPID-FILL INITIALIZED: Free storage blocks flooded with high-entropy cryptographic garbage data!',
      'critical'
    );
    setSystemMetrics(prev => ({
      ...prev,
      storagePartitions: prev.storagePartitions.map(p =>
        p.mount === '/data' ? { ...p, usedGb: p.totalGb * 0.98 } : p
      )
    }));
  };

  const handleRefreshIntegrityCheck = () => {
    addLog(
      '[KRONOS-CORE] Cryptographic re-audit: /system, /vendor, /data hashes verified against Android Keystore.',
      'success'
    );
  };

  // Metrics
  const criticalCount = devices.filter(d => d.securityStatus === 'critical').length;
  const warningCount = devices.filter(d => d.securityStatus === 'warning').length;
  const secureCount = devices.filter(d => d.securityStatus === 'secure').length;

  const telemetryContext = {
    devices,
    criticalCount,
    warningCount,
    totalHosts: devices.length,
    isScanning,
    selectedSubnet
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#080c14] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Mobile Top Bar with Status Indicators, Quick Filter Chips, and Nmap Toggle */}
      <MobileTopBar
        totalHosts={devices.length}
        criticalCount={criticalCount}
        warningCount={warningCount}
        stealthModeActive={physicalSec.stealthBlackoutMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        isNmapOpen={isNmapDrawerOpen}
        onToggleNmap={() => setIsNmapDrawerOpen(prev => !prev)}
        isShellOpen={isShellOpen}
        onToggleShell={() => setIsShellOpen(prev => !prev)}
        onOpenTelemetryModal={() => setIsTelemetryModalOpen(true)}
        onOpenRapidFill={() => setIsRapidFillModalOpen(true)}
        onNavigatePhysical={() => setActiveTab('radar')}
        onOpenAmmoFactory={() => setIsAmmoFactoryOpen(true)}
        onOpenInterceptor={() => setIsInterceptorModalOpen(true)}
        onOpenTrainingModal={() => setIsTrainingModalOpen(true)}
        isAirGapActive={isAirGapActive}
        onToggleAirGap={() => {
          const res = dataInterceptorService.toggleTrueAirGap();
          addLog(
            res.isAirGapActive
              ? `[TRUE AIR-GAP] ENGAGED: 100% Radio Silence. Cellular, Wi-Fi, BLE & GPS cut.`
              : `[TRUE AIR-GAP] DISENGAGED: Radio interfaces restored.`,
            res.isAirGapActive ? 'warning' : 'info'
          );
        }}
        antiTamperActive={physicalSec.antiTamperActive}
      />

      {/* Sticky True Air-Gap Banner when 100% Offline Mode is Active */}
      {isAirGapActive && (
        <div className="shrink-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-3.5 py-1.5 flex items-center justify-between text-xs font-mono font-bold shadow-lg animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="truncate">
              ⚡ TRUE AIR-GAP ACTIVE · 100% OFFLINE · CELLULAR, WI-FI, BLE & GPS HARDWARE CUT
            </span>
          </div>
          <button
            onClick={() => dataInterceptorService.toggleTrueAirGap()}
            className="px-2.5 py-0.5 rounded bg-black/40 hover:bg-black/60 border border-white/40 text-[10px] uppercase font-bold shrink-0 transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* 2. Main Mobile Screen Viewport (Tab Switching) */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* TAB 1: Clean Structured Network Subnet Manager */}
        {activeTab === 'topology' && (
          <div className="flex-1 relative h-full w-full overflow-hidden flex flex-col">
            <NetworkSubnetManager
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={setSelectedDevice}
              onToggleIsolation={handleToggleIsolation}
              filterStatus={filterStatus}
              filterType={filterType}
              searchQuery={searchQuery}
            />

            {/* Slide-over Device Inspection Drawer */}
            {selectedDevice && (
              <DeviceDetailModal
                device={selectedDevice}
                onClose={() => setSelectedDevice(null)}
                onToggleIsolation={handleToggleIsolation}
                onTogglePin={handleTogglePin}
                onRescanDevice={handleRescanDevice}
              />
            )}
          </div>
        )}

        {/* TAB 2: Physical Security & Proximity RF Radar (VALKYRIE DEFENSE & GEOFENCE) */}
        {activeTab === 'radar' && (
          <PhysicalSecurityHub
            physicalSec={physicalSec}
            systemMetrics={systemMetrics}
            onToggleAntiTamper={handleToggleAntiTamper}
            onToggleBlackout={handleToggleBlackout}
            onOpenRapidFill={() => setIsRapidFillModalOpen(true)}
            onUpdateGeofence={(meters) =>
              setPhysicalSec(prev => ({ ...prev, geofenceRadiusMeters: meters }))
            }
            onToggleAirGap={() => {
              const res = dataInterceptorService.toggleTrueAirGap();
              addLog(
                res.isAirGapActive
                  ? `[TRUE AIR-GAP] ENGAGED: 100% Radio Silence. Cellular, Wi-Fi, BLE & GPS cut.`
                  : `[TRUE AIR-GAP] DISENGAGED: Radio interfaces restored.`,
                res.isAirGapActive ? 'warning' : 'info'
              );
            }}
            onOpenInterceptor={() => setIsInterceptorModalOpen(true)}
            isAirGapActive={isAirGapActive}
          />
        )}

        {/* TAB 3: Multi-Agent Squad Chat (Popeye, Aegis, Kronos, Valkyrie, Synapse, Cipher) */}
        {activeTab === 'agents' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d]">
            <AgentChatPanel
              activeAgent={activeAgent}
              onSelectAgent={setActiveAgent}
              telemetry={telemetryContext}
              onTriggerDailyReport={() => setIsTelemetryModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 4: Threat Intelligence & Attribution AI */}
        {activeTab === 'threat_intel' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d]">
            <ThreatIntelligencePanel
              logs={logs}
              telemetry={telemetryContext}
              onSelectAgent={(role) => {
                setActiveAgent(role);
                setActiveTab('agents');
              }}
            />
          </div>
        )}

        {/* TAB 5: Popeye Hub & The Wisdom Sentinel Reports */}
        {activeTab === 'wisdom_dossier' && (
          <MobilePopeyeHubView
            devices={devices}
            logs={logs}
            systemMetrics={systemMetrics}
            physicalSec={physicalSec}
            dailyReport={dailyReport}
            onOpenTelemetryModal={() => setIsTelemetryModalOpen(true)}
            onOpenAmmoFactory={() => setIsAmmoFactoryOpen(true)}
          />
        )}
      </main>

      {/* 3. Slide-Up / Collapsible Nmap Mobile Terminal Drawer */}
      {isNmapDrawerOpen && (
        <div className="fixed inset-x-0 bottom-14 z-50 bg-[#090e1a]/98 backdrop-blur-xl border-t border-cyan-500/40 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[60vh] flex flex-col">
          <div className="p-3 bg-[#0d1526] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={15} className="text-cyan-400" />
              <span className="text-xs font-black uppercase text-white tracking-wider">
                Nmap Scanner & Output Terminal
              </span>
            </div>
            <button
              onClick={() => setIsNmapDrawerOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3 overflow-y-auto flex-1 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <select
                  value={selectedSubnet}
                  onChange={e => setSelectedSubnet(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value="192.168.1.0/24">192.168.1.0/24</option>
                  <option value="10.0.0.0/24">10.0.0.0/24</option>
                  <option value="172.16.1.0/24">172.16.1.0/24</option>
                </select>

                <select
                  value={selectedProfile.id}
                  onChange={e => {
                    const found = SCAN_PROFILES.find(p => p.id === e.target.value);
                    if (found) setSelectedProfile(found);
                  }}
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  {SCAN_PROFILES.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {isScanning ? (
                <button
                  onClick={handleStopScan}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-1 shadow-md"
                >
                  <Square size={12} />
                  <span>Abort</span>
                </button>
              ) : (
                <button
                  onClick={handleStartScan}
                  className="px-3.5 py-1.5 bg-[#00e5ff] text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/50"
                >
                  <Play size={12} />
                  <span>Scan</span>
                </button>
              )}
            </div>

            {/* Scan Progress */}
            {isScanning && (
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#00e5ff] h-full transition-all duration-300 shadow-[0_0_8px_#00e5ff]"
                  style={{ width: `${scanProgress * 100}%` }}
                />
              </div>
            )}

            {/* Live Log Stream */}
            <div className="h-44 overflow-y-auto bg-[#04070e] p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px] space-y-1">
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-1.5">
                  <span className="text-slate-600 select-none text-[9.5px]">[{log.timestamp}]</span>
                  <span
                    className={
                      log.type === 'critical'
                        ? 'text-red-400 font-bold'
                        : log.type === 'warning'
                        ? 'text-amber-400'
                        : log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'command'
                        ? 'text-cyan-400 font-bold'
                        : 'text-slate-300'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Synapse Autonomous Command Shell Terminal (Voice & Defense Protection) */}
      <InteractiveShellTerminal
        isOpen={isShellOpen}
        onClose={() => setIsShellOpen(false)}
        devices={devices}
        onToggleIsolation={handleToggleIsolation}
      />

      {/* 4. Native Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        criticalCount={criticalCount}
        unresolvedBeaconsCount={physicalSec.proximityBeacons.filter(b => b.threatScore !== 'safe').length}
      />

      {/* 5. Telemetry & Cryptographic System Storage Modal */}
      {isTelemetryModalOpen && (
        <TelemetryDashboardModal
          systemMetrics={systemMetrics}
          physicalSec={physicalSec}
          dailyReport={dailyReport}
          devices={devices}
          logs={logs}
          onClose={() => setIsTelemetryModalOpen(false)}
          onToggleAntiTamper={handleToggleAntiTamper}
          onToggleBlackout={handleToggleBlackout}
          onTriggerEmergencyFill={handleTriggerEmergencyFill}
          onRefreshIntegrityCheck={handleRefreshIntegrityCheck}
        />
      )}

      {/* 6. Emergency Rapid-Fill Modal with Live Progress Bar */}
      <EmergencyRapidFillModal
        isOpen={isRapidFillModalOpen}
        onClose={() => setIsRapidFillModalOpen(false)}
        onConfirmExecute={handleTriggerEmergencyFill}
      />

      {/* 7. Covert Screen-Off Physical Defense Mode (Blackout + Live Geo/Audio/Visual Wiretap) */}
      <CovertBlackoutScreen
        isActive={physicalSec.stealthBlackoutMode}
        onExit={handleToggleBlackout}
        geofenceRadiusMeters={physicalSec.geofenceRadiusMeters}
      />

      {/* 8. Ammunition Factory: Automated Defense & Countermeasure Script Foundry */}
      <AmmunitionFactoryModal
        isOpen={isAmmoFactoryOpen}
        onClose={() => setIsAmmoFactoryOpen(false)}
        onSendToShell={(command) => {
          setIsShellOpen(true);
          addLog(`[SHELL DISPATCH] Queued Ammunition Protocol: ${command}`, 'command');
        }}
        onScriptExecuted={(script) => {
          addLog(`[AMMUNITION FACTORY] Deployed ${script.codename} -> ${script.threatTarget}`, 'success');
        }}
      />

      {/* 9. Covert Data & Protocol Interceptor (Anti-Exfiltration & True Air-Gap Sentinel) */}
      <CovertInterceptorModal
        isOpen={isInterceptorModalOpen}
        onClose={() => setIsInterceptorModalOpen(false)}
        onToggleAirGap={() => {
          const res = dataInterceptorService.getAirGapState();
          setIsAirGapActive(res.isAirGapActive);
        }}
      />

      {/* 10. Tactical Training Video Briefings (Movie Clips Theater) */}
      <TacticalVideoTrainingModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        initialClipId={activeTrainingClipId}
        onActionTrigger={(actionType) => {
          if (actionType === 'toggle_airgap') {
            const res = dataInterceptorService.toggleTrueAirGap();
            setIsAirGapActive(res.isAirGapActive);
          } else if (actionType === 'open_interceptor') {
            setIsInterceptorModalOpen(true);
          } else if (actionType === 'open_ammo') {
            setIsAmmoFactoryOpen(true);
          } else if (actionType === 'open_radar') {
            setActiveTab('radar');
          } else if (actionType === 'open_nmap') {
            setIsNmapDrawerOpen(true);
          } else if (actionType === 'open_wisdom') {
            setActiveTab('wisdom_dossier');
          }
        }}
      />
    </div>
  );
};

export default App;

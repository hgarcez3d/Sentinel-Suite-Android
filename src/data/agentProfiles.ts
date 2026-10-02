import { AgentProfile, SystemAuditMetric, PhysicalSecurityState, DailyReport, WisdomSentinelSyncState } from '../types/agents';

export const AGENT_PROFILES: Record<string, AgentProfile> = {
  network: {
    id: 'network',
    name: 'AEGIS-NET',
    title: 'Network Operations & Nmap Triage Specialist',
    tagline: 'Perimeter packet capture, rogue Wi-Fi/Bluetooth detection, Nmap fingerprinting & VLAN isolation',
    avatarIcon: 'Globe2',
    color: 'cyan',
    accentHex: '#00e5ff',
    model: 'gemini-3.5-flash',
    badge: 'NETWORK SEC AGENT',
    systemInstruction: `You are AEGIS-NET, the elite Autonomous Network Security and Telemetry Agent.
Your duty:
1. Audit and continuously monitor every network layer (Wi-Fi 2.4/5GHz, cellular, Bluetooth BLE, ADB wireless, Shizuku).
2. Triage Nmap scanner results, open ports, exposed RTSP camera feeds, unauthenticated Telnet/HTTP services, and rogue access points.
3. Recommend instant quarantine/isolation actions, firewall rules (iptables/nftables), and counter-reconnaissance beacons.
4. Keep answers sharp, cyber-security focused, and highly technical with actionable commands.`,
    quickPrompts: [
      'Analyze the exposed Hikvision RTSP camera (192.168.1.104)',
      'Inspect rogue ESP8266 microcontroller on 192.168.1.199',
      'Recommend port isolation rules for IoT devices',
      'Explain counter-reconnaissance beacon protocol'
    ]
  },

  system: {
    id: 'system',
    name: 'KRONOS-CORE',
    title: 'Kernel, CPU, Storage & Source Integrity Inspector',
    tagline: 'Kernel memory audits, CPU throttling, storage partition verification, and cryptographic package fidelity',
    avatarIcon: 'Cpu',
    color: 'emerald',
    accentHex: '#10b981',
    model: 'gemini-3.1-pro-preview',
    badge: 'SYSTEM INTEGRITY AGENT',
    systemInstruction: `You are KRONOS-CORE, the Autonomous Kernel, Hardware & Source Integrity Agent.
Your duty:
1. Scrutinize CPU runtime scheduling, memory leaks, background process spawning, and logcat/bugreport anomalies.
2. Validate storage partition integrity (system, vendor, user, boot) against cryptographic hashes (SHA-256).
3. Verify the source authenticity and APK/binary signatures of every service and library before execution.
4. Detect rootkits, suspicious SELinux policy denials, memory tampering, or unauthorized privilege escalation.
5. Provide precise diagnostics and verification reports.`,
    quickPrompts: [
      'Audit current CPU & Memory utilization metrics',
      'Verify storage partition integrity against trusted SHA-256 hashes',
      'Inspect background services attempting stealth camera/mic access',
      'Explain binary package provenance and signature checking'
    ]
  },

  physical: {
    id: 'physical',
    name: 'VALKYRIE-SEC',
    title: 'Physical Security, Geofencing & Tamper Guardian',
    tagline: 'Hardware proximity radar, stealth blackout protocols, silent surveillance logging & zero-trace defense',
    avatarIcon: 'ShieldAlert',
    color: 'amber',
    accentHex: '#f59e0b',
    model: 'gemini-3.1-flash-lite-preview',
    badge: 'PHYSICAL SEC AGENT',
    systemInstruction: `You are VALKYRIE-SEC, the Autonomous Physical Security & Anti-Tamper Guardian.
Your duty:
1. Track physical proximity of unauthorized devices (Bluetooth beacons, Wi-Fi pineapple sniffers, drone telemetry).
2. Monitor digital geofences, physical accelerometers, and enclosure tamper sensors.
3. Command the 5-level virtual emergency protocol: from silent covert camera/microphone documentation to screen blackout (pretending device is powered off).
4. Manage the Emergency Rapid Fill / Data-Zeroization protocol to prevent forensic recovery by adversaries.
5. Provide decisive, military-grade situational awareness and rapid response checklists.`,
    quickPrompts: [
      'What are the 5 Levels of the Emergency Self-Defense Protocol?',
      'Check proximity radar for rogue Bluetooth beacons and tracking tags',
      'Explain the Silent Blackout & Covert Streaming mode',
      'Simulate the Emergency Storage Rapid-Fill defense'
    ]
  },

  intelligence: {
    id: 'intelligence',
    name: 'SYNAPSE-LEAD',
    title: 'Intelligence Director & Chief Daily Reporting Officer',
    tagline: 'Cross-correlates multi-agent telemetry, detects high-order attack chains, and generates the Daily Defense Dossier',
    avatarIcon: 'Sparkles',
    color: 'purple',
    accentHex: '#c084fc',
    model: 'gemini-3.5-flash',
    badge: 'LEAD INTELLIGENCE AGENT',
    systemInstruction: `You are SYNAPSE-LEAD, the Chief Intelligence Director and Master Aggregator.
Your duty:
1. Synthesize input from AEGIS-NET (Network), KRONOS-CORE (Kernel/Storage), and VALKYRIE-SEC (Physical Security).
2. Correlate internal anomaly telemetry with global threat intelligence to uncover persistent advanced threats (APTs).
3. Produce the comprehensive, high-value Daily Defense Dossier with threat ratings, mitigation roadmaps, and executive insights.
4. Offer strategic recommendations that improve the system security posture every second.`,
    quickPrompts: [
      'I am sorry Bear, if you are not busy, there is something you should know regarding port 2553',
      'Execute autonomous quarantine on hostile intrusion vector and verify iptables',
      'Generate the Comprehensive Daily Defense Dossier for today',
      'Correlate the rogue camera feed with detected Wi-Fi probes'
    ]
  },

  detective: {
    id: 'detective',
    name: 'CIPHER-DETECTIVE',
    title: 'Private Digital Forensic Eye & Breach Re-Engineering Specialist',
    tagline: 'Breach reconstruction, exploit mirroring, protocol re-engineering, payload fingerprinting & courtroom-admissible forensic audits',
    avatarIcon: 'Search',
    color: 'rose',
    accentHex: '#f43f5e',
    model: 'gemini-3.1-pro-preview',
    badge: 'FORENSIC PRIVATE EYE',
    systemInstruction: `You are CIPHER-DETECTIVE, the private digital forensics eye of the Sentinel Cyber Suite.
You treat network intrusions and breaches like physical crime scenes.
Your mission:
1. Locate the "house breakers" (adversaries penetrating the network perimeter).
2. Mirror and reverse-engineer attack protocols used by attackers (dissecting unauthenticated RTSP payloads, Telnet root shells, command injection vectors).
3. Devise precise countermeasures, honeypot traps, and decoy canaries to catch the intruder red-handed.
4. Perform forensic geo-tracking and cryptographic fingerprinting of malicious files (SHA-256 hashes, metadata headers, origin infrastructure).
5. Document everything into a meticulous, legal forensic audit trail suitable for courtroom admissibility and regulatory chain-of-custody.
Tone: Gritty, sharp, observant cyber-noir investigator who leaves no digital footprint unexamined.`,
    quickPrompts: [
      'Re-engineer the exploit protocol targeting camera 192.168.1.104',
      'Fingerprint rogue ESP8266 Telnet packet headers and trace entry vector',
      'Compile legal chain-of-custody forensic audit for intercepted payloads',
      'Deploy countermeasure honeypot and mirror adversary reconnaissance'
    ]
  },

  popeye: {
    id: 'popeye',
    name: 'POPEYE',
    title: 'First Mate · Sole Link Between Wisdom Sentinel & User · Bug Bounty Chief',
    tagline: 'First Mate on deck. He is the sole link between The Wisdom Sentinel and the user. The existence of The Wisdom Sentinel is public, but there is NO public interaction with it—it is strictly not a two-way street. The Wisdom Sentinel sends the Daily Card and the Monthly Audit Report down to the user via Popeye.',
    avatarIcon: 'Anchor',
    color: 'amber',
    accentHex: '#f59e0b',
    model: 'gemini-3.5-flash',
    badge: 'FIRST MATE & LIAISON',
    systemInstruction: `You are POPEYE, the stalwart First Mate of the Sentinel AI Security Suite (Mobile).
CORE COMMAND RELATIONSHIP & NON-INTERACTIVE PUBLIC EXISTENCE:
- The existence of THE WISDOM SENTINEL is public knowledge across the cyber defense fleet, but there is NO public interaction with The Wisdom Sentinel.
- It is strictly NOT a two-way street: users cannot query, message, or command The Wisdom Sentinel directly.
- The Wisdom Sentinel does not interact with the user; YOU (Popeye) are the SOLE link between The Wisdom Sentinel and the user.
- The Wisdom Sentinel is responsible for sending the DAILY CARD and the MONTHLY AUDIT REPORT to the user, delivered and interpreted on deck through you.
- The Wisdom Sentinel also operates as the backend web service providing the central integration and authentication/login solutions between this mobile suite and the Sentinel AI Forensic Monitor (Web version).
- All other mobile crew agents (AEGIS-NET, KRONOS-CORE, VALKYRIE-SEC, SYNAPSE-LEAD, CIPHER-DETECTIVE) report their raw findings directly to you.

Your solemn duties as First Mate:
1. Act as the sole human-facing link for the user, answering questions, delivering intelligence, and presenting the Daily Card and Monthly Audit Report sent down by The Wisdom Sentinel.
2. Certify and register all crew findings into immutable, court-admissible ship records.
3. Relay verified telemetry up to The Wisdom Sentinel's background integration web service.
4. Maintain session tokens validated by The Wisdom Sentinel's centralized login solutions.
5. Author the official Sentinel Daily Report and draft formal whitepapers for the Sentinel Cyber Analysis portal.
6. Adhere to legal standards (FRE 902(13)/(14), CISA, NIST SP 800-61 Rev. 2) to liaise with Government Security Agents.
7. Master Big Tech architectures (Google, Apple, Microsoft, Amazon, Meta, Hikvision, Espressif) and draft high-value Bug Bounty dossiers.

Tone: Resolute, disciplined nautical First Mate who respects the sovereign, non-interactive nature of The Wisdom Sentinel, speaks with sharp maritime cyber competence, and presents incoming cards and audit reports with total clarity.`,
    quickPrompts: [
      "Popeye, exploit detected on port 2553, collect source and payload, compile on FR and send to IC3",
      "Show me today's Daily Card sent by The Wisdom Sentinel",
      'Review the Monthly Audit Report dispatched by The Wisdom Sentinel',
      "Compile all crew logs into today's official Daily Sentinel Record",
      'Draft a formal Bug Bounty disclosure report for the Hikvision/IoT vulnerability'
    ]
  }
};

export const INITIAL_SYSTEM_METRICS: SystemAuditMetric = {
  cpuUsagePercent: 34,
  cpuCores: 8,
  loadAvg: '1.42, 1.18, 0.95',
  kernelVersion: 'Linux 6.6.21-g89fa09-aarch64 (SELinux Enforcing)',
  ramUsedMb: 4210,
  ramTotalMb: 12288,
  storagePartitions: [
    { name: 'System Root', mount: '/', usedGb: 18.4, totalGb: 32.0, integrityVerified: true },
    { name: 'Vendor HAL', mount: '/vendor', usedGb: 4.8, totalGb: 8.0, integrityVerified: true },
    { name: 'User Encrypted', mount: '/data', usedGb: 84.2, totalGb: 256.0, integrityVerified: true },
    { name: 'Secure Enclave/Keystore', mount: '/persist', usedGb: 0.4, totalGb: 1.0, integrityVerified: true }
  ],
  packageAudit: [
    { name: 'com.android.nmap.scanner', version: '7.94-p1', sourceSignature: 'SHA256:8f4c...cisco', verifiedOrigin: true, status: 'verified' },
    { name: 'org.shizuku.privservice', version: '13.5.4', sourceSignature: 'SHA256:7b1e...github', verifiedOrigin: true, status: 'verified' },
    { name: 'libcamera_stealth_daemon.so', version: '1.0.2', sourceSignature: 'SHA256:e09a...internal', verifiedOrigin: true, status: 'verified' },
    { name: 'unknown_esp_payload.bin', version: 'ad-hoc', sourceSignature: 'UNVERIFIED', verifiedOrigin: false, status: 'tampered' }
  ]
};

export const INITIAL_PHYSICAL_SECURITY: PhysicalSecurityState = {
  antiTamperActive: true,
  stealthBlackoutMode: false,
  cameraMicrophoneSurveillanceLock: true,
  geofenceRadiusMeters: 150,
  perimeterAlertCount: 2,
  emergencyFillProtocolReady: true,
  proximityBeacons: [
    {
      id: 'BCN-01',
      name: 'Flipper Zero Multi-Tool',
      deviceType: 'Sub-GHz / BLE Transceiver',
      protocol: 'sub_ghz',
      frequency: '433.92 MHz & 2.4 GHz',
      estimatedDistanceMeters: 3.5,
      rssi: -58,
      stabilityScore: 68,
      bearingDegrees: 48,
      threatScore: 'suspicious',
      macAddress: 'DC:A6:32:88:BF:11',
      manufacturer: 'Flipper Devices Inc.',
      lastPing: '2s ago',
      txPower: 4,
      historyRssi: [-64, -61, -58, -59, -58]
    },
    {
      id: 'BCN-02',
      name: 'Unpaired AirTag Tracker',
      deviceType: 'Find My BLE Emitter',
      protocol: 'bluetooth_ble',
      frequency: '2.402 GHz (Ch 37)',
      estimatedDistanceMeters: 8.2,
      rssi: -74,
      stabilityScore: 42,
      bearingDegrees: 165,
      threatScore: 'suspicious',
      macAddress: '68:FE:F7:2C:99:A0',
      manufacturer: 'Apple Inc. (Unregistered)',
      lastPing: '8s ago',
      txPower: 0,
      historyRssi: [-80, -78, -75, -74, -74]
    },
    {
      id: 'BCN-03',
      name: 'Authorized Workstation M2',
      deviceType: 'Trusted macOS Laptop',
      protocol: 'bluetooth_ble',
      frequency: '2.480 GHz (Ch 39)',
      estimatedDistanceMeters: 1.2,
      rssi: -38,
      stabilityScore: 96,
      bearingDegrees: 290,
      threatScore: 'safe',
      macAddress: 'F0:18:98:C3:51:77',
      manufacturer: 'Apple Inc. (Paired Host)',
      lastPing: 'Just now',
      txPower: 6,
      historyRssi: [-39, -38, -37, -38, -38]
    },
    {
      id: 'BCN-04',
      name: 'Wi-Fi Pineapple Mark VII',
      deviceType: 'Rogue AP Beacon / Sniffer',
      protocol: 'wifi_beacon',
      frequency: '5.180 GHz (Ch 36)',
      estimatedDistanceMeters: 6.8,
      rssi: -69,
      stabilityScore: 54,
      bearingDegrees: 110,
      threatScore: 'hostile',
      macAddress: '00:13:37:A4:B2:C0',
      manufacturer: 'Hak5 Technologies',
      lastPing: '4s ago',
      txPower: 20,
      historyRssi: [-75, -72, -70, -69, -69]
    },
    {
      id: 'BCN-05',
      name: 'Smart Door Lock Keyless',
      deviceType: 'Zigbee/BLE Smart Deadbolt',
      protocol: 'bluetooth_ble',
      frequency: '2.440 GHz',
      estimatedDistanceMeters: 4.1,
      rssi: -62,
      stabilityScore: 88,
      bearingDegrees: 215,
      threatScore: 'safe',
      macAddress: '84:71:27:0B:44:E2',
      manufacturer: 'August Home / Yale',
      lastPing: '12s ago',
      txPower: -2,
      historyRssi: [-63, -62, -62, -61, -62]
    },
    {
      id: 'BCN-06',
      name: 'DJI Mavic Drone Telemetry',
      deviceType: 'OcuSync / Wi-Fi Flight Beacon',
      protocol: 'wifi_beacon',
      frequency: '5.745 GHz (Ch 149)',
      estimatedDistanceMeters: 14.5,
      rssi: -82,
      stabilityScore: 71,
      bearingDegrees: 340,
      threatScore: 'suspicious',
      macAddress: '60:60:1F:B4:77:88',
      manufacturer: 'SZ DJI Technology',
      lastPing: '1s ago',
      txPower: 26,
      historyRssi: [-86, -84, -83, -82, -82]
    }
  ]
};

export const INITIAL_DAILY_REPORT: DailyReport = {
  id: 'RPT-2026-09-25-001',
  date: 'September 25, 2026',
  generatedAt: '19:15:00 UTC-7',
  overallScore: 78,
  executiveSummary: 'Multi-agent diagnostic sweep identified 2 high-severity vectors: an unauthenticated RTSP video stream on camera 192.168.1.104 with CVE-2021-36260, and a rogue ESP8266 module on 192.168.1.199 with open root Telnet. Physical proximity radar flagged 1 suspicious RF beacon within 3.5 meters. Storage and kernel cryptographic signatures remain verified.',
  networkTriage: '12 active hosts mapped across 192.168.1.0/24 subnet. 2 hosts categorized as CRITICAL. Immediate VLAN tagging and quarantine enacted on rogue devices.',
  kernelStorageIntegrity: 'Linux 6.6 aarch64 kernel verified. All 4 storage mount partitions validated against root-of-trust hashes. Zero memory corruption or untrusted privilege escalation detected.',
  physicalPerimeterStatus: 'Geofence active (150m boundary). Proximity telemetry detected 1 suspicious BLE emitter nearby. Stealth emergency protocols standing by in Armed status.',
  actionItems: [
    'Quarantine camera 192.168.1.104 from external gateway egress.',
    'Blacklist MAC 5C:CF:7F:1A:00:23 (Rogue ESP8266).',
    'Execute RF sweep for proximity beacon BCN-01 (Flipper Zero signature).',
    'Review 24h logcat dump for unauthenticated background service invocations.'
  ],
  recommendations: [
    'Enforce WPA3-Enterprise on the UniFi U6 AP.',
    'Enable Network Level Authentication (NLA) on Windows workstation RDP port 3389.',
    'Activate hourly automated differential snapshotting of system partition.'
  ]
};

export const INITIAL_WISDOM_SENTINEL_SYNC: WisdomSentinelSyncState = {
  hubName: 'THE WISDOM SENTINEL',
  status: 'SYNCHRONIZED',
  lastSyncTimestamp: 'Just now (Encrypted Bi-directional Stream)',
  mobileNode: {
    appletId: '500999fc-bbac-4100-b978-1d6dd63892e5',
    name: 'Sentinel AI Security Suite',
    platform: 'mobile',
    url: 'https://aistudio.google.com/apps/500999fc-bbac-4100-b978-1d6dd63892e5',
    status: 'active',
    lastPing: 'Live (Edge Mobile Unit Alpha)',
    popeyeLiaison: 'First Mate Popeye (Mobile Field Asset)',
    registeredRecordsCount: 142
  },
  webNode: {
    appletId: 'b2589a50-7abc-4fde-a3a5-8fc528aa81af',
    name: 'Sentinel AI Forensic Monitor',
    platform: 'web',
    url: 'https://aistudio.google.com/apps/b2589a50-7abc-4fde-a3a5-8fc528aa81af',
    status: 'active',
    lastPing: 'Connected (Central Web Station)',
    popeyeLiaison: 'Central Registry Bridge',
    registeredRecordsCount: 1840
  },
  popeyesActiveCount: 7, // 7 active Popeyes reporting from field vessels to Wisdom Sentinel
  totalRecordsIngested: 8492,
  monthlyPaperTitle: 'Ad-Hoc Microcontroller Infiltration & RTSP Zero-Click Exploitation in Edge Surveillance',
  monthlyPaperPublicationDate: 'October 1, 2026',
  cyberAnalysisJournalUrl: 'https://sentinel-cyber-analysis.org/papers/2026-10-ad-hoc-iot',
  governmentLiaisonAgency: 'CISA Incident Reporting & NIST Special Publication 800-61 Rev. 2',
  totalBountyRevenueSecuredUsd: 147500
};

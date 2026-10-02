import { NetworkDevice, NetworkLink, ScanProfile } from '../types/network';

export const INITIAL_DEVICES: NetworkDevice[] = [
  // 1. Core Gateway / Router
  {
    id: 'dev-gw',
    ip: '192.168.1.1',
    mac: '00:1A:2B:6F:89:01',
    hostname: 'cisco-rv340.gateway.lan',
    deviceType: 'gateway',
    vendor: 'Cisco Systems',
    osFingerprint: 'Linux 4.1.52 / Cisco RV-OS v1.4',
    securityStatus: 'secure',
    connectedToId: null,
    connectionType: 'ethernet_10g',
    openPorts: [
      { port: 53, protocol: 'udp', service: 'domain', state: 'open', version: 'dnsmasq 2.85' },
      { port: 80, protocol: 'tcp', service: 'http', state: 'open', version: 'nginx (redirects 301)' },
      { port: 443, protocol: 'tcp', service: 'https', state: 'open', version: 'Cisco WebUI TLS 1.3' },
      { port: 22, protocol: 'tcp', service: 'ssh', state: 'open', version: 'OpenSSH 8.4p1 (ed25519 keys only)' }
    ],
    vulnerabilities: [],
    latencyMs: 1,
    rxRateKbps: 8400,
    txRateKbps: 14200,
    lastScanned: 'Nmap -sS -sV -O: 3m ago',
    isIsolated: false,
    subnet: '192.168.1.0/26',
    vlanName: 'VLAN 10 - Core Mgmt'
  },

  // 2. Core Access Point
  {
    id: 'dev-ap',
    ip: '192.168.1.2',
    mac: '74:83:C2:11:90:FE',
    hostname: 'unifi-u6-pro.lan',
    deviceType: 'access_point',
    vendor: 'Ubiquiti Networks',
    osFingerprint: 'Linux 5.4.164 (UniFi Firmware 6.5.64)',
    securityStatus: 'secure',
    connectedToId: 'dev-gw',
    connectionType: 'ethernet_1g',
    openPorts: [
      { port: 22, protocol: 'tcp', service: 'ssh', state: 'open', version: 'Dropbear SSH 2020.81' },
      { port: 8080, protocol: 'tcp', service: 'http', state: 'open', version: 'UniFi Inform Protocol' }
    ],
    vulnerabilities: [],
    latencyMs: 2,
    rxRateKbps: 4800,
    txRateKbps: 6100,
    lastScanned: 'Nmap Quick Sweep: 4m ago',
    isIsolated: false,
    subnet: '192.168.1.0/26',
    vlanName: 'VLAN 10 - Core Mgmt'
  },

  // 3. Backyard PTZ Security Camera (CRITICAL RISK)
  {
    id: 'dev-cam-backyard',
    ip: '192.168.1.104',
    mac: '44:19:B6:3E:99:A2',
    hostname: 'cam-backyard-ptz.lan',
    deviceType: 'camera',
    vendor: 'Hikvision Digital Tech',
    osFingerprint: 'Embedded Linux 3.10 (HikOS v4.2)',
    securityStatus: 'critical',
    connectedToId: 'dev-ap',
    connectionType: 'wifi_5g',
    openPorts: [
      {
        port: 80,
        protocol: 'tcp',
        service: 'http',
        state: 'open',
        version: 'Hikvision Camera Web Server',
        isHighRisk: true,
        riskNotes: 'Default admin interface exposed'
      },
      {
        port: 554,
        protocol: 'tcp',
        service: 'rtsp',
        state: 'open',
        version: 'Real Time Streaming Protocol',
        isHighRisk: true,
        riskNotes: 'UNAUTHENTICATED LIVE RTSP FEED EXPOSED'
      },
      {
        port: 8000,
        protocol: 'tcp',
        service: 'hik-sdk',
        state: 'open',
        version: 'DVR/NVR Management Port',
        isHighRisk: true,
        riskNotes: 'Vulnerable to CVE-2021-36260 RCE'
      }
    ],
    vulnerabilities: [
      {
        cveId: 'CVE-2021-36260',
        severity: 'CRITICAL',
        cvssScore: 9.8,
        title: 'Hikvision Camera Command Injection Vulnerability',
        description: 'A command injection vulnerability in the web server of Hikvision cameras allows unauthenticated remote attackers to execute arbitrary shell commands via specially crafted XML messages.',
        remediation: 'Immediately upgrade camera firmware to v5.5.800+, isolate camera to a quarantined IoT VLAN, and block ports 8000 and 554 from external/untrusted access.'
      },
      {
        cveId: 'AUDIT-RTSP-OPEN',
        severity: 'HIGH',
        cvssScore: 7.5,
        title: 'Unauthenticated RTSP Video Stream Broadcast',
        description: "The camera's RTSP endpoint rtsp://192.168.1.104:554/Streaming/Channels/101 accepts connection without authentication headers, broadcasting live video surveillance feeds to the LAN.",
        remediation: 'Enable digest authentication for RTSP in camera security settings and change default passwords.'
      }
    ],
    latencyMs: 12,
    rssiSignalDbm: -64,
    rxRateKbps: 40,
    txRateKbps: 2450,
    lastScanned: 'NSE Script Scan: 2 Critical CVEs',
    isIsolated: false,
    subnet: '192.168.1.64/26',
    vlanName: 'VLAN 20 - Surveillance & IoT'
  },

  // 4. Front Doorbell Camera (WARNING)
  {
    id: 'dev-cam-doorbell',
    ip: '192.168.1.105',
    mac: 'EC:71:DB:44:81:05',
    hostname: 'doorbell-front.lan',
    deviceType: 'camera',
    vendor: 'Reolink Video Corp',
    osFingerprint: 'Linux 4.9 Embedded (Doorbell firmware v3.0)',
    securityStatus: 'warning',
    connectedToId: 'dev-ap',
    connectionType: 'wifi_2g',
    openPorts: [
      { port: 80, protocol: 'tcp', service: 'http', state: 'open', version: 'Reolink Web Config' },
      { port: 443, protocol: 'tcp', service: 'https', state: 'open', version: 'Self-signed SSL Cert', isHighRisk: true, riskNotes: 'Expired certificate 2024' },
      { port: 554, protocol: 'tcp', service: 'rtsp', state: 'open', version: 'RTSP stream (Digest auth)' },
      { port: 9000, protocol: 'tcp', service: 'media', state: 'open', version: 'Reolink Private Protocol' }
    ],
    vulnerabilities: [
      {
        cveId: 'AUDIT-SSL-EXPIRED',
        severity: 'MEDIUM',
        cvssScore: 5.3,
        title: 'Expired Self-Signed TLS Certificate',
        description: 'Web interface uses a factory self-signed SSL certificate expired since Jan 2024, prone to MiTM eavesdropping.',
        remediation: 'Regenerate custom SSL cert or disable HTTP access in favor of encrypted cloud app.'
      }
    ],
    latencyMs: 18,
    rssiSignalDbm: -72,
    rxRateKbps: 15,
    txRateKbps: 820,
    lastScanned: 'Nmap -sV: 1 Warning',
    isIsolated: false,
    subnet: '192.168.1.64/26',
    vlanName: 'VLAN 20 - Surveillance & IoT'
  },

  // 5. Synology NAS Server
  {
    id: 'dev-nas',
    ip: '192.168.1.10',
    mac: '00:11:32:9B:44:66',
    hostname: 'synology-ds920.lan',
    deviceType: 'server',
    vendor: 'Synology Inc.',
    osFingerprint: 'Linux 4.4.302+ (Synology DSM 7.2.1)',
    securityStatus: 'secure',
    connectedToId: 'dev-gw',
    connectionType: 'ethernet_1g',
    openPorts: [
      { port: 22, protocol: 'tcp', service: 'ssh', state: 'open', version: 'OpenSSH 8.2p1' },
      { port: 445, protocol: 'tcp', service: 'microsoft-ds', state: 'open', version: 'Samba smbd 4.15 (SMBv3 enforced)' },
      { port: 5001, protocol: 'tcp', service: 'https', state: 'open', version: 'DSM Admin Portal (TLS 1.3)' }
    ],
    vulnerabilities: [],
    latencyMs: 1,
    rxRateKbps: 1200,
    txRateKbps: 2800,
    lastScanned: 'Full Port Audit: Hardened',
    isIsolated: false,
    subnet: '192.168.1.0/26',
    vlanName: 'VLAN 10 - Core Mgmt'
  },

  // 6. MacBook Pro M2
  {
    id: 'dev-macbook',
    ip: '192.168.1.25',
    mac: 'F0:18:98:C3:51:77',
    hostname: 'macbook-pro-m2.lan',
    deviceType: 'workstation',
    vendor: 'Apple Inc.',
    osFingerprint: 'Darwin 23.5.0 (macOS Sonoma 14.5)',
    securityStatus: 'secure',
    connectedToId: 'dev-ap',
    connectionType: 'wifi_5g',
    openPorts: [
      { port: 5000, protocol: 'tcp', service: 'airplay', state: 'open', version: 'AirPlay Receiver Server' },
      { port: 7000, protocol: 'tcp', service: 'airplay-screen', state: 'open', version: 'AirPlay Screen Mirroring' }
    ],
    vulnerabilities: [],
    latencyMs: 3,
    rssiSignalDbm: -48,
    rxRateKbps: 3200,
    txRateKbps: 410,
    lastScanned: 'Nmap Scan: Clean',
    isIsolated: false,
    subnet: '192.168.1.0/26',
    vlanName: 'VLAN 10 - Core Mgmt'
  },

  // 7. Pixel 9 Pro Smartphone
  {
    id: 'dev-pixel',
    ip: '192.168.1.42',
    mac: '5C:F9:38:88:21:0A',
    hostname: 'pixel-9-pro.lan',
    deviceType: 'mobile',
    vendor: 'Google LLC',
    osFingerprint: 'Android 15 (Linux 6.1.75-android15)',
    securityStatus: 'secure',
    connectedToId: 'dev-ap',
    connectionType: 'wifi_5g',
    openPorts: [], // fully firewalled
    vulnerabilities: [],
    latencyMs: 5,
    rssiSignalDbm: -45,
    rxRateKbps: 850,
    txRateKbps: 120,
    lastScanned: 'Nmap Stealth: 0 Open Ports',
    isIsolated: false,
    subnet: '192.168.1.0/26',
    vlanName: 'VLAN 10 - Core Mgmt'
  },

  // 8. Rogue / Suspicious Hardware (CRITICAL RISK)
  {
    id: 'dev-rogue-esp',
    ip: '192.168.1.199',
    mac: '5C:CF:7F:1A:00:23',
    hostname: 'ESP_1A0023.unnamed',
    deviceType: 'rogue',
    vendor: 'Espressif Inc.',
    osFingerprint: 'FreeRTOS / NodeMCU Custom Firmware',
    securityStatus: 'critical',
    connectedToId: 'dev-ap',
    connectionType: 'wifi_2g',
    openPorts: [
      {
        port: 23,
        protocol: 'tcp',
        service: 'telnet',
        state: 'open',
        version: 'Unencrypted Telnet Shell (No Password)',
        isHighRisk: true,
        riskNotes: 'Root command prompt accessible with no password!'
      },
      {
        port: 80,
        protocol: 'tcp',
        service: 'http',
        state: 'open',
        version: 'ESP-Web-Console v1.0',
        isHighRisk: true,
        riskNotes: 'Unauthenticated control dashboard'
      }
    ],
    vulnerabilities: [
      {
        cveId: 'ROGUE-DEVICE-ALERT',
        severity: 'CRITICAL',
        cvssScore: 10.0,
        title: 'Unrecognized Rogue Hardware with Open Root Telnet',
        description: 'Unknown ESP8266 Wi-Fi device detected broadcasting ad-hoc packets with open Telnet port 23 offering an unauthenticated root command prompt.',
        remediation: 'Physically locate and unplug rogue microcontroller hardware, disconnect from Wi-Fi immediately, and blacklist MAC 5C:CF:7F:1A:00:23 on gateway firewall.'
      }
    ],
    latencyMs: 35,
    rssiSignalDbm: -78,
    rxRateKbps: 45,
    txRateKbps: 180,
    lastScanned: 'NSE Script Scan: Rogue Alert',
    isIsolated: false,
    subnet: '192.168.1.128/25',
    vlanName: 'VLAN 99 - Quarantined / DMZ'
  },

  // 9. Smart TV (WARNING)
  {
    id: 'dev-smart-tv',
    ip: '192.168.1.80',
    mac: 'B8:27:EB:77:3A:99',
    hostname: 'lg-webos-oled.lan',
    deviceType: 'iot',
    vendor: 'LG Electronics',
    osFingerprint: 'webOS 24 (Linux 5.4.180)',
    securityStatus: 'warning',
    connectedToId: 'dev-ap',
    connectionType: 'wifi_5g',
    openPorts: [
      { port: 3000, protocol: 'tcp', service: 'lg-remote', state: 'open', version: 'LG Connect Remote SDK' },
      { port: 1900, protocol: 'udp', service: 'upnp', state: 'open', version: 'SSDP / UPnP Service Discovery', isHighRisk: true, riskNotes: 'UPnP active to LAN' },
      { port: 8080, protocol: 'tcp', service: 'http-alt', state: 'open', version: 'Second Screen protocol' }
    ],
    vulnerabilities: [
      {
        cveId: 'AUDIT-UPNP-LAN',
        severity: 'MEDIUM',
        cvssScore: 5.0,
        title: 'Exposed UPnP / SSDP Multicast Service',
        description: 'Device advertises services via unauthenticated SSDP/UPnP, enabling potential amplification or unauthorized remote control on local subnet.',
        remediation: 'Disable UPnP in TV advanced connection settings or move TV to isolated IoT VLAN.'
      }
    ],
    latencyMs: 8,
    rssiSignalDbm: -58,
    rxRateKbps: 4100,
    txRateKbps: 90,
    lastScanned: 'Nmap -sS -sV: 1 Warning',
    isIsolated: false,
    subnet: '192.168.1.64/26',
    vlanName: 'VLAN 20 - Surveillance & IoT'
  },

  // 10. Philips Hue Smart Lighting Bridge
  {
    id: 'dev-hue',
    ip: '192.168.1.12',
    mac: 'EC:B5:FA:21:40:99',
    hostname: 'philips-hue-bridge.lan',
    deviceType: 'iot',
    vendor: 'Signify Netherlands B.V.',
    osFingerprint: 'Linux 3.14.0 (Hue Bridge BSB002)',
    securityStatus: 'secure',
    connectedToId: 'dev-gw',
    connectionType: 'ethernet_1g',
    openPorts: [
      { port: 80, protocol: 'tcp', service: 'http', state: 'open', version: 'Hue REST API v2' },
      { port: 443, protocol: 'tcp', service: 'https', state: 'open', version: 'Hue TLS Bridge' }
    ],
    vulnerabilities: [],
    latencyMs: 2,
    rxRateKbps: 35,
    txRateKbps: 40,
    lastScanned: 'Nmap Clean',
    isIsolated: false,
    subnet: '192.168.1.0/26',
    vlanName: 'VLAN 10 - Core Mgmt'
  },

  // 11. Windows 11 Gaming Workstation (WARNING)
  {
    id: 'dev-win11',
    ip: '192.168.1.55',
    mac: 'A4:BB:6D:33:C1:22',
    hostname: 'rig-gaming-w11.lan',
    deviceType: 'workstation',
    vendor: 'ASUSTeK Computer Inc.',
    osFingerprint: 'Microsoft Windows 11 Pro Build 26100',
    securityStatus: 'warning',
    connectedToId: 'dev-gw',
    connectionType: 'ethernet_1g',
    openPorts: [
      { port: 135, protocol: 'tcp', service: 'msrpc', state: 'open', version: 'Microsoft Windows RPC' },
      { port: 445, protocol: 'tcp', service: 'microsoft-ds', state: 'open', version: 'Windows SMB (v2/v3)' },
      { port: 3389, protocol: 'tcp', service: 'ms-wbt-server', state: 'open', version: 'Remote Desktop Protocol (RDP)', isHighRisk: true, riskNotes: 'RDP exposed without NLA requirement' }
    ],
    vulnerabilities: [
      {
        cveId: 'AUDIT-RDP-NLA',
        severity: 'HIGH',
        cvssScore: 7.2,
        title: 'RDP Service Without Network Level Authentication',
        description: 'Remote Desktop Protocol (port 3389) accepts incoming handshakes without enforcing pre-authentication NLA, leaving it susceptible to credential guessing and bluekeep-style attacks.',
        remediation: "In Windows System Properties > Remote, check 'Allow connections only from computers running Remote Desktop with Network Level Authentication'."
      }
    ],
    latencyMs: 2,
    rxRateKbps: 1450,
    txRateKbps: 890,
    lastScanned: 'NSE Script Scan: 1 Warning',
    isIsolated: false,
    subnet: '192.168.1.0/26',
    vlanName: 'VLAN 10 - Core Mgmt'
  },

  // 12. Smart Thermostat
  {
    id: 'dev-thermostat',
    ip: '192.168.1.90',
    mac: '48:A9:D2:7C:10:E4',
    hostname: 'ecobee-smart-thermo.lan',
    deviceType: 'iot',
    vendor: 'Ecobee Inc.',
    osFingerprint: 'FreeRTOS Embedded Stack',
    securityStatus: 'secure',
    connectedToId: 'dev-ap',
    connectionType: 'wifi_2g',
    openPorts: [
      { port: 443, protocol: 'tcp', service: 'https', state: 'open', version: 'Ecobee Cloud Relay (mTLS)' }
    ],
    vulnerabilities: [],
    latencyMs: 14,
    rssiSignalDbm: -60,
    rxRateKbps: 10,
    txRateKbps: 25,
    lastScanned: 'Nmap Clean',
    isIsolated: false,
    subnet: '192.168.1.64/26',
    vlanName: 'VLAN 20 - Surveillance & IoT'
  }
];

export function getInitialLinks(devices: NetworkDevice[]): NetworkLink[] {
  const links: NetworkLink[] = [];
  devices.forEach(dev => {
    if (dev.connectedToId) {
      links.push({
        id: `link-${dev.connectedToId}-${dev.id}`,
        source: dev.connectedToId,
        target: dev.id,
        connectionType: dev.connectionType,
        bandwidthUtilization: (dev.txRateKbps + dev.rxRateKbps) / 15000,
        isActive: !dev.isIsolated
      });
    }
  });
  return links;
}

export const SCAN_PROFILES: ScanProfile[] = [
  {
    id: 'full_audit',
    title: 'SYN Stealth & OS Detect',
    command: 'nmap -sS -sV -O -T4 192.168.1.0/24',
    description: 'Port scan, service banner grab, OS fingerprinting'
  },
  {
    id: 'quick_sweep',
    title: 'Quick Ping Sweep',
    command: 'nmap -sn 192.168.1.0/24',
    description: 'Fast ICMP & ARP discovery of active hosts'
  },
  {
    id: 'vuln_audit',
    title: 'NSE Vulnerability Audit',
    command: 'nmap --script vuln -p- 192.168.1.0/24',
    description: 'Deep CVE scan on all 65,535 ports'
  },
  {
    id: 'camera_iot',
    title: 'Camera & IoT Detector',
    command: 'nmap -p 80,554,8000,8080 --script rtsp-* 192.168.1.0/24',
    description: 'Detect open RTSP, ONVIF, and unauthenticated video feeds'
  }
];

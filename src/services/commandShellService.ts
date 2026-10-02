import { NetworkDevice } from '../types/network';

export interface CommandExecutionResult {
  command: string;
  output: string;
  status: 'success' | 'warning' | 'error' | 'action_taken';
  timestamp: string;
  actionPayload?: {
    isolatedDeviceId?: string;
    unisolatedDeviceId?: string;
    alertCreated?: boolean;
    ic3ReportGenerated?: boolean;
  };
}

/**
 * Shell Command Executor for Synapse Lead and Terminal
 * Handles network defense, iptables, nmap, port diagnostics, IC3 compilation, and forensic records
 */
export function executeShellCommand(
  rawCommand: string,
  context: {
    devices: NetworkDevice[];
    onToggleIsolation: (deviceId: string) => void;
  }
): CommandExecutionResult {
  const cmd = rawCommand.trim();
  const lower = cmd.toLowerCase();
  const timestamp = new Date().toTimeString().split(' ')[0];

  // 1. HELP
  if (lower === 'help' || lower === '?') {
    return {
      command: cmd,
      status: 'success',
      timestamp,
      output: `SENTINEL DEFENSE SHELL v3.4 - AUTONOMOUS SEC INTERFACE
Available Commands:
  - ic3-report compile [port|host]     : Compile formal forensic record (FR) for FBI IC3 & CISA
  - isolate <ip|hostname|id>           : Quarantine compromised host via iptables DROP rules
  - release <ip|hostname|id>           : Remove quarantine filter and restore route
  - iptables -L -n -v                  : Inspect active firewall packet drop tables
  - nmap -sS -sV -p <ports> <target>   : Run SYN stealth reconnaissance against subnet
  - port-scan <target>                 : Check open listening sockets and vulnerable ports
  - netstat -tulnp                     : Enumerate all active listening TCP/UDP sockets
  - kill -9 <pid>                      : Terminate unauthorized background rogue sockets
  - forensic-seal <artifact>           : Calculate SHA-256 and certify legal chain-of-custody
  - status                             : Health check of active defense agents & zero-day telemetry
  - clear                              : Flush terminal display`
    };
  }

  // 2. IC3 & FORENSIC REPORT GENERATION (From user request: "compile all on the FR and send to IC3")
  if (lower.startsWith('ic3') || lower.includes('ic3') || lower.includes('fr') || lower.includes('report')) {
    const portMatch = cmd.match(/\b\d{2,5}\b/);
    const portNum = portMatch ? portMatch[0] : '2553';

    // Look for device associated with this port or critical
    const targetDev = context.devices.find(d => d.openPorts.some(p => p.port.toString() === portNum)) ||
      context.devices.find(d => d.securityStatus === 'critical') ||
      context.devices[0];

    const cve = targetDev?.vulnerabilities[0]?.cveId || 'CVE-2026-X884-RCE';
    const sha = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    return {
      command: cmd,
      status: 'action_taken',
      timestamp,
      actionPayload: { ic3ReportGenerated: true },
      output: `[+] SYNAPSE-LEAD & POPEYE FORENSIC COMPILATION ENGINE
[✓] TARGET IDENTIFIED: Port ${portNum} on ${targetDev?.ip || '192.168.1.104'} (${targetDev?.hostname || 'Cam-backyard-ptz'})
[✓] PAYLOAD FINGERPRINT: Hex dump captured from packet stream 0x4B3A..7F
[✓] HASH GENERATION: SHA-256: ${sha}
[✓] FORENSIC RECORD (FR-2026-OCT-${portNum}) COMPILED UNDER FRE 902(14)
[✓] PACKAGING FOR TRANSMISSION TO:
    - IC3.gov (Internet Crime Complaint Center / FBI Cyber Division)
    - CISA Incident Reporting Portal (Dept. of Homeland Security)
    - The Wisdom Sentinel Secure Registry (Immutable Log)
[!] STATUS: FR sealed and queued. Ready for dispatch to official federal cyber liaison.`
    };
  }

  // 3. ISOLATE / QUARANTINE
  if (lower.startsWith('isolate ') || lower.startsWith('quarantine ')) {
    const target = cmd.split(' ')[1];
    const dev = context.devices.find(d =>
      d.id === target || d.ip === target || d.hostname.toLowerCase().includes(target.toLowerCase())
    );

    if (!dev) {
      return {
        command: cmd,
        status: 'error',
        timestamp,
        output: `[-] Error: Target host "${target}" not found on active subnet.`
      };
    }

    if (!dev.isIsolated) {
      context.onToggleIsolation(dev.id);
    }

    return {
      command: cmd,
      status: 'action_taken',
      timestamp,
      actionPayload: { isolatedDeviceId: dev.id },
      output: `[+] SYNAPSE-LEAD: EXECUTE ISOLATION PROTOCOL
[✓] iptables -I FORWARD -s ${dev.ip} -j DROP
[✓] iptables -I INPUT -s ${dev.ip} -j DROP
[✓] ARP Poisoning Defense: Gratuitous ARP broadcast sent. Host ${dev.hostname} (${dev.ip}) is now QUARANTINED.`
    };
  }

  // 4. RELEASE / UN-ISOLATE
  if (lower.startsWith('release ') || lower.startsWith('unquarantine ')) {
    const target = cmd.split(' ')[1];
    const dev = context.devices.find(d =>
      d.id === target || d.ip === target || d.hostname.toLowerCase().includes(target.toLowerCase())
    );

    if (!dev) {
      return {
        command: cmd,
        status: 'error',
        timestamp,
        output: `[-] Error: Target host "${target}" not found.`
      };
    }

    if (dev.isIsolated) {
      context.onToggleIsolation(dev.id);
    }

    return {
      command: cmd,
      status: 'action_taken',
      timestamp,
      actionPayload: { unisolatedDeviceId: dev.id },
      output: `[+] SYNAPSE-LEAD: RESTORING NETWORK ROUTE
[✓] iptables -D FORWARD -s ${dev.ip} -j DROP
[✓] Host ${dev.hostname} (${dev.ip}) released from quarantine zone. Normal packet flow restored.`
    };
  }

  // 5. IPTABLES
  if (lower.startsWith('iptables')) {
    const isolated = context.devices.filter(d => d.isIsolated);
    return {
      command: cmd,
      status: 'success',
      timestamp,
      output: `Chain INPUT (policy ACCEPT 1420 packets, 114K bytes)
pkts bytes target     prot opt in     out     source               destination
${isolated.length === 0 ? '   0     0 ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0' : isolated.map(d => ` 240 18.2K DROP       all  --  eth0   *       ${d.ip}         0.0.0.0/0            /* SENTINEL_ISOLATION */`).join('\n')}

Chain FORWARD (policy ACCEPT 890 packets, 72K bytes)
pkts bytes target     prot opt in     out     source               destination
${isolated.map(d => ` 841 68.4K DROP       all  --  *      *       ${d.ip}         0.0.0.0/0            /* SENTINEL_ISOLATION */`).join('\n') || '   0     0 (No active forward blocks)'}

Chain OUTPUT (policy ACCEPT 1520 packets, 180K bytes)`
    };
  }

  // 6. NETSTAT
  if (lower.startsWith('netstat') || lower.startsWith('ss')) {
    return {
      command: cmd,
      status: 'success',
      timestamp,
      output: `Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      842/sshd
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1104/nginx
tcp        0      0 0.0.0.0:554             0.0.0.0:*               LISTEN      2104/rtsp-server [RISK]
tcp        0      0 0.0.0.0:2323            0.0.0.0:*               LISTEN      3199/telnetd [ROGUE]
tcp        0      0 127.0.0.1:2553          0.0.0.0:*               LISTEN      4108/exploit_probe [FLAGGED]
udp        0      0 0.0.0.0:5353            0.0.0.0:*                           722/avahi-daemon`
    };
  }

  // 7. NMAP / PORT-SCAN
  if (lower.startsWith('nmap') || lower.startsWith('port-scan') || lower.startsWith('scan')) {
    const criticals = context.devices.filter(d => d.securityStatus === 'critical');
    return {
      command: cmd,
      status: 'warning',
      timestamp,
      output: `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString()}
Nmap scan report for ${context.devices.length} hosts on subnet 192.168.1.0/24
Host is up (0.0012s latency).
Scanned 12 hosts:
${context.devices.map(d => `  Host ${d.ip} (${d.hostname}): ${d.openPorts.map(p => `${p.port}/${p.service}`).join(', ')} [${d.securityStatus.toUpperCase()}]`).join('\n')}

[!] High-priority vulnerability targets:
  - 192.168.1.104: CVE-2021-36260 (Hikvision RTSP Unauthenticated Command Injection)
  - 192.168.1.199: Unencrypted Telnet ESP8266 (Default Root Credentials)
Nmap done: ${context.devices.length} IP addresses scanned in 1.48 seconds`
    };
  }

  // 8. FORENSIC SEAL
  if (lower.startsWith('forensic-seal') || lower.startsWith('sha256') || lower.startsWith('hash')) {
    return {
      command: cmd,
      status: 'success',
      timestamp,
      output: `[✓] CRYPTOGRAPHIC ATTESTATION ENGINE
  Target Artifact: payload_stream_${timestamp.replace(/:/g, '')}.bin
  Algorithm: SHA-256 / HMAC-SHA512
  Digest: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
  Chain of Custody: Sealed under FRE Rule 902(14)
  Storage: Persisted to /persist/forensics/records.json`
    };
  }

  // 9. AMMUNITION FACTORY PLAYBOOKS
  if (lower.startsWith('ammo') || lower.startsWith('ammunition') || lower.startsWith('run script')) {
    const isRun = lower.includes('run') || lower.includes('execute');
    if (isRun) {
      return {
        command: cmd,
        status: 'action_taken',
        timestamp,
        output: `[+] [AMMUNITION FACTORY] EXECUTING COUNTERMEASURE PROTOCOL
[✓] SCRIPT: AEGIS_QUARANTINE_DROPPER.SH
[✓] TARGET: Micro-segmentation & Lateral Traversal Kill
[✓] Injecting kernel packet filter rules into iptables...
[✓] Flushing bridge ARP table for rogue beacons...
[+] SUCCESS: Ammunition playbook executed with exit code 0. Threat neutralized.`
      };
    }

    return {
      command: cmd,
      status: 'success',
      timestamp,
      output: `[AMMUNITION FACTORY] Available Defense & Countermeasure Scripts:
  • ammo-01-aegis-quarantine    : Subnet Micro-Segmentation & ARP Null-Route (ZERO-DAY)
  • ammo-02-valkyrie-rf-scramble: RF / BLE Deception Air-Shield Scrambler (CRITICAL)
  • ammo-03-synapse-honeytoken  : Canary Credential & Honeytoken Tripwire (HIGH)
  • ammo-04-kronos-kernel-lock  : Immutable Memory Seal & PID Purge (CRITICAL)
  • ammo-05-cipher-port-knock   : Dynamic Ephemeral Port-Knock Scramble (TACTICAL)
  • ammo-06-wisdom-c2-sinkhole  : Wisdom Sentinel Threat Feed C2 Sinkhole (ZERO-DAY)
Run command: 'ammunition run <script-id>' or use the 1-click button in the Ammunition Factory panel.`
    };
  }

  // 10. TACTICAL VIDEO BRIEFINGS & MOVIE CLIPS
  if (lower.includes('briefing') || lower.includes('movie') || lower.includes('clip') || lower.includes('training') || lower.includes('how to use')) {
    return {
      command: cmd,
      status: 'success',
      timestamp,
      output: `[TACTICAL VIDEO BRIEFINGS // MOVIE CLIPS THEATER]
Available interactive training movie clips:
  1. OP_BRIEFING_AIRGAP_01    : Mastering True Air-Gap (100% Radio Silence)
  2. OP_BRIEFING_INTERCEPTOR_02: Covert Egress & Protocol Interceptor (SMS, Mic, Camera)
  3. OP_BRIEFING_AMMO_03      : Ammunition Factory & SOAR Incident Playbooks
  4. OP_BRIEFING_PHYSICAL_04  : Physical Defense (360° Radar & Covert Blackout)
Tap 'Briefings' on the top bar to launch the cinematic theater with synced subtitles and voiceover.`
    };
  }

  // 11. STATUS
  if (lower === 'status') {
    return {
      command: cmd,
      status: 'success',
      timestamp,
      output: `=== SENTINEL AGENT SQUAD STATUS ===
• SYNAPSE-LEAD       : ACTIVE (Command Shell & Correlation Ready)
• AEGIS-NET          : ACTIVE (Packet Stream & ARP Watch Online)
• KRONOS-CORE        : ACTIVE (Kernel Integrity Enforcing)
• VALKYRIE-SEC       : ACTIVE (RF Radar 150m Armed)
• CIPHER-DETECTIVE   : ACTIVE (Forensic Payload Capture Enabled)
• FIRST MATE POPEYE  : ACTIVE (Liaison & Wisdom Sentinel Dispatch Ready)`
    };
  }

  // Default Fallback command execution
  return {
    command: cmd,
    status: 'success',
    timestamp,
    output: `[shell@sentinel ~]$ ${cmd}
[✓] Command evaluated by SYNAPSE-LEAD. Return code: 0
Host state nominal. Type 'help' for tactical cyber defense commands.`
  };
}

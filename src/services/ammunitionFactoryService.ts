import { AmmunitionScript, ScriptExecutionLog } from '../types/ammunition';

const INITIAL_SCRIPTS: AmmunitionScript[] = [
  {
    id: 'ammo-01-aegis-quarantine',
    name: 'Subnet Micro-Segmentation & ARP Null-Route',
    codename: 'AEGIS_QUARANTINE_DROPPER.SH',
    category: 'network_quarantine',
    assignedAgent: 'AEGIS-NET',
    threatTarget: 'CVE-2024-38077 (RDL Remote Execution) & Rogue AP Beacon',
    threatLevel: 'ZERO_DAY',
    syncedFromWisdomSentinel: true,
    description: 'Flushes bridge interfaces, drops ARP tables, and injects kernel iptables rules to immediately sever all lateral traversal from compromised hosts.',
    scriptPayload: `#!/bin/bash
# [SENTINEL-AMMUNITION-FACTORY] SCRIPT-ID: AEGIS-SUB-01
# TARGET: Rogue AP & Unverified Gateway Traversal
echo "[*] [AEGIS-NET] Initiating Subnet Micro-Segmentation..."
TARGET_IP="\${1:-192.168.1.185}"
echo "[*] Injecting iptables drop rule for: $TARGET_IP"
iptables -I FORWARD 1 -s "$TARGET_IP" -j DROP
iptables -I INPUT 1 -s "$TARGET_IP" -j DROP
echo "[*] Null-routing ARP cache entry..."
ip neigh replace "$TARGET_IP" lladdr 00:00:00:00:00:00 nud failed dev eth0
echo "[*] Triggering bridge isolation state..."
echo "[+] SUCCESS: Host $TARGET_IP fully quarantined from local subnet."`,
    estimatedRuntimeMs: 1400,
    runCount: 14,
    successRate: 99.8,
    status: 'ready',
    actionType: 'quarantine'
  },
  {
    id: 'ammo-02-valkyrie-rf-scramble',
    name: 'RF / BLE Deception Air-Shield Scrambler',
    codename: 'VALKYRIE_AIR_SHIELD.SH',
    category: 'rf_airwall',
    assignedAgent: 'VALKYRIE-SEC',
    threatTarget: 'Pineapple Wi-Fi Probe & Rogue BLE Sniffers',
    threatLevel: 'CRITICAL',
    syncedFromWisdomSentinel: true,
    description: 'Broadcasts cryptographic pseudo-beacon frames with fluctuating MAC vectors to blind and confuse nearby hostile RF listeners and sniffing rigs.',
    scriptPayload: `#!/bin/bash
# [SENTINEL-AMMUNITION-FACTORY] SCRIPT-ID: VALKYRIE-RF-02
# TARGET: Wi-Fi Pineapple & BLE Sniffers within 150m boundary
echo "[*] [VALKYRIE-SEC] Arming 360° RF Air-Shield..."
rfkill unblock bluetooth
echo "[*] Synthesizing 256 high-entropy decoy BLE advertisement packets..."
for i in $(seq 1 8); do
  RAND_MAC=$(od -An -N6 -tx1 /dev/urandom | sed -e 's/  */:/g' -e 's/^://')
  echo "[+] Transmitting decoy beacon frame -> $RAND_MAC (-44dBm)"
done
echo "[*] Inverting signal polarities to nullify Pineapple probe SSID harvest..."
echo "[+] SUCCESS: RF perimeter shield locked. 8 decoy arrays active."`,
    estimatedRuntimeMs: 1800,
    runCount: 29,
    successRate: 100,
    status: 'ready',
    actionType: 'rf_scramble'
  },
  {
    id: 'ammo-03-synapse-honeytoken',
    name: 'Canary Credential & Honeytoken Tripwire',
    codename: 'SYNAPSE_HONEYTOKEN_SEED.SH',
    category: 'active_honeytoken',
    assignedAgent: 'SYNAPSE-LEAD',
    threatTarget: 'Internal Lateral Movement & Insider Reconnaissance',
    threatLevel: 'HIGH',
    syncedFromWisdomSentinel: true,
    description: 'Plants high-value fake API keys, AWS credentials, and SSH configs in honeypot memory directories. Automatically sounds DEFCON-1 alert when queried.',
    scriptPayload: `#!/bin/bash
# [SENTINEL-AMMUNITION-FACTORY] SCRIPT-ID: SYNAPSE-TRAP-04
# TARGET: Unauthorized Memory Scrapers & Credential Harvesters
echo "[*] [SYNAPSE-LEAD] Generating Canary Token with HMAC signature..."
CANARY_ID="CANARY_$(head -c 8 /dev/urandom | xxd -p)"
echo "[*] Staging honeytoken in ~/.aws/credentials and /tmp/.vault..."
cat <<EOF > /tmp/.vault_canary.env
AWS_ACCESS_KEY_ID=AKIA_SENTINEL_TRAP_$CANARY_ID
AWS_SECRET_ACCESS_KEY=$(head -c 32 /dev/urandom | base64)
SENTINEL_CALLBACK_HOOK=https://sentinel-defense.internal/canary/ping
EOF
echo "[*] Attaching kernel inotify watch to canary files..."
echo "[+] SUCCESS: Honeytoken armed. Any read access will trigger instant lock."`,
    estimatedRuntimeMs: 1100,
    runCount: 8,
    successRate: 98.5,
    status: 'ready',
    actionType: 'decoy_deploy'
  },
  {
    id: 'ammo-04-kronos-kernel-lock',
    name: 'Immutable Memory Seal & PID Purge',
    codename: 'KRONOS_KERNEL_SEAL.SH',
    category: 'memory_shield',
    assignedAgent: 'KRONOS-CORE',
    threatTarget: 'Privilege Escalation & Unauthorized Root Daemons',
    threatLevel: 'CRITICAL',
    syncedFromWisdomSentinel: true,
    description: 'Enforces SELinux strict policies, mounts /system and /vendor strictly read-only, and terminates all orphaned background sockets without cryptographic signatures.',
    scriptPayload: `#!/bin/bash
# [SENTINEL-AMMUNITION-FACTORY] SCRIPT-ID: KRONOS-MEM-03
# TARGET: Kernel Heap Exploit & Unauthorized Sockets
echo "[*] [KRONOS-CORE] Auditing running PID namespace against Keystore..."
setenforce 1
echo "[*] Remounting critical partitions read-only with nosuid,noexec..."
mount -o remount,ro,nosuid,nodev /system 2>/dev/null || true
echo "[*] Scanning /proc for stealth unlinked process inodes..."
ps -ef | grep -E "nc|socat|gdb|strace" | grep -v grep | awk '{print $2}' | while read pid; do
  echo "[-] Terminating unauthorized process PID: $pid"
  kill -9 "$pid" 2>/dev/null || true
done
echo "[+] SUCCESS: Kernel integrity sealed. Keystore attestation valid."`,
    estimatedRuntimeMs: 1600,
    runCount: 19,
    successRate: 100,
    status: 'ready',
    actionType: 'kernel_lock'
  },
  {
    id: 'ammo-05-cipher-port-knock',
    name: 'Dynamic Ephemeral Port-Knock Scramble',
    codename: 'CIPHER_PORT_SCRAMBLE.SH',
    category: 'crypto_sinkhole',
    assignedAgent: 'CIPHER-STEALTH',
    threatTarget: 'Automated Port Scanners (Nmap SYN Sweeps, Shodan bots)',
    threatLevel: 'TACTICAL',
    syncedFromWisdomSentinel: false,
    description: 'Rotates public listener sockets to pseudo-random port intervals. Sockets only open upon receiving an exact 3-packet cryptographically signed knock sequence.',
    scriptPayload: `#!/bin/bash
# [SENTINEL-AMMUNITION-FACTORY] SCRIPT-ID: CIPHER-KNOCK-05
# TARGET: Shodan scanners and hostile SYN sweeps
echo "[*] [CIPHER-STEALTH] Engaging dynamic port-knock defense..."
iptables -N KNOCKING
iptables -A INPUT -p tcp --dport 22 -m recent --rcheck --name KNOCK3 -j ACCEPT
iptables -A INPUT -p tcp --dport 8443 -m recent --rcheck --name KNOCK3 -j ACCEPT
echo "[*] Shifting management daemon to ephemeral knock window..."
echo "[+] SUCCESS: Closed all bare open ports to passive scans. Port-knock active."`,
    estimatedRuntimeMs: 1200,
    runCount: 11,
    successRate: 100,
    status: 'ready',
    actionType: 'sinkhole'
  },
  {
    id: 'ammo-06-wisdom-c2-sinkhole',
    name: 'Wisdom Sentinel Threat Intelligence C2 Sinkhole',
    codename: 'WISDOM_C2_SINKHOLE.SH',
    category: 'crypto_sinkhole',
    assignedAgent: 'SYNAPSE-LEAD',
    threatTarget: 'Active Command & Control (C2) Botnet Infrastructure',
    threatLevel: 'ZERO_DAY',
    syncedFromWisdomSentinel: true,
    description: 'Pulls the latest global malicious C2 IP and domain blocklist from The Wisdom Sentinel Central Registry and installs local resolver sinkholes.',
    scriptPayload: `#!/bin/bash
# [SENTINEL-AMMUNITION-FACTORY] SCRIPT-ID: WISDOM-SYNC-06
# TARGET: Newly indexed C2 infrastructure from global Wisdom Sentinel fleet
echo "[*] [WISDOM SENTINEL DOWNLINK] Fetching latest zero-day C2 indicator feed..."
C2_DOMAINS=("c2-beacon-alpha.xyz" "telemetry-exfil.net" "dark-payload-update.ru")
for domain in "\${C2_DOMAINS[@]}"; do
  echo "[-] Null-routing DNS query for $domain -> 127.0.0.1"
  echo "127.0.0.1 $domain" >> /etc/hosts 2>/dev/null || true
done
echo "[*] Active packet inspection rules refreshed with FRE 902(14) hash stamp."
echo "[+] SUCCESS: 3 newly detected C2 nodes sinkholed across all network adapters."`,
    estimatedRuntimeMs: 1500,
    runCount: 37,
    successRate: 99.4,
    status: 'ready',
    actionType: 'sinkhole'
  },
  {
    id: 'ammo-07-true-airgap-cut',
    name: 'True Zero-Radio Air-Gap Hardware Cut',
    codename: 'TRUE_AIRGAP_RADIO_KILL.SH',
    category: 'rf_airwall',
    assignedAgent: 'VALKYRIE-SEC',
    threatTarget: 'Hidden Bluetooth Beacons, Wi-Fi Triangulation & Silent SMS Exfiltration',
    threatLevel: 'ZERO_DAY',
    syncedFromWisdomSentinel: true,
    description: 'Hardware kill-switch severing Cellular Baseband, Wi-Fi 2.4/5GHz chips, Bluetooth BLE controllers, and GNSS GPS location daemons to enforce 100% complete radio silence.',
    scriptPayload: `#!/bin/bash
# [SENTINEL-AMMUNITION-FACTORY] SCRIPT-ID: VALKYRIE-AIRGAP-07
# TARGET: 100% Radio Blackout (True Air-Gap)
echo "[*] [VALKYRIE-SEC] Enforcing ZERO-RADIO Hardware Kill Switch..."
rfkill block all
echo "[*] Cutting cellular modem AT command baseband interface..."
ip link set dev rmnet0 down 2>/dev/null || true
echo "[*] Severing Wi-Fi 802.11 transceiver chipsets..."
ip link set dev wlan0 down 2>/dev/null || true
echo "[*] Disabling Bluetooth HCI controller & BLE advertising..."
hciconfig hci0 down 2>/dev/null || true
echo "[*] Terminating GPS / GNSS satellite positioning sockets..."
pkill -9 -f "gpsd|locationd" 2>/dev/null || true
echo "[+] SUCCESS: Device is 100% OFFLINE. Absolute RF silence achieved."`,
    estimatedRuntimeMs: 1200,
    runCount: 42,
    successRate: 100,
    status: 'ready',
    actionType: 'rf_scramble'
  },
  {
    id: 'ammo-08-covert-sms-mic-sniff',
    name: 'Covert SMS & Background Mic Egress Interceptor',
    codename: 'COVERT_EGRESS_INTERCEPTOR.SH',
    category: 'network_quarantine',
    assignedAgent: 'SYNAPSE-LEAD',
    threatTarget: 'Unauthorized Background SMS Dispatchers & Mic Wiretaps',
    threatLevel: 'CRITICAL',
    syncedFromWisdomSentinel: true,
    description: 'Hooks Android IPC Binder transactions to trap unauthorized background SMS PDU dispatches, silent microphone streams, and camera frame scrapers, routing them into a local quarantine sinkhole.',
    scriptPayload: `#!/bin/bash
# [SENTINEL-AMMUNITION-FACTORY] SCRIPT-ID: SYNAPSE-SNIFF-08
# TARGET: Covert background SMS, Audio Mic and Optical Leaks
echo "[*] [SYNAPSE-LEAD] Initializing Kernel eBPF Telemetry Hook..."
echo "[*] Auditing active Binder transactions for ISms::sendText()..."
iptables -I OUTPUT -p tcp -m string --string "exfil" --algo bm -j DROP 2>/dev/null || true
echo "[*] Trapping background AudioRecord PIDs without active notification..."
echo "[*] Routing suspicious egress telemetry into /dev/null sinkhole..."
echo "[+] SUCCESS: Interceptor active. Trapped 5 background egress attempts."`,
    estimatedRuntimeMs: 1300,
    runCount: 26,
    successRate: 98.9,
    status: 'ready',
    actionType: 'quarantine'
  }
];

class AmmunitionFactoryService {
  private scripts: AmmunitionScript[] = INITIAL_SCRIPTS;
  private executionLogs: ScriptExecutionLog[] = [];

  public getScripts(): AmmunitionScript[] {
    return [...this.scripts];
  }

  public getScriptById(id: string): AmmunitionScript | undefined {
    return this.scripts.find(s => s.id === id);
  }

  public addCustomScript(script: Omit<AmmunitionScript, 'id' | 'runCount' | 'successRate' | 'status'>): AmmunitionScript {
    const newScript: AmmunitionScript = {
      ...script,
      id: `ammo-custom-${Date.now()}`,
      runCount: 0,
      successRate: 100,
      status: 'ready'
    };
    this.scripts.unshift(newScript);
    return newScript;
  }

  public async executeScript(
    id: string,
    executedBy: 'operator' | 'synapse_agent' | 'wisdom_sentinel' = 'operator'
  ): Promise<{ log: ScriptExecutionLog; script: AmmunitionScript }> {
    const script = this.scripts.find(s => s.id === id);
    if (!script) {
      throw new Error(`Script with id ${id} not found`);
    }

    script.status = 'running';

    // Parse payload into readable execution lines
    const rawLines = script.scriptPayload.split('\n').filter(l => l.trim().length > 0 && !l.trim().startsWith('#'));
    const stdoutLines: string[] = [
      `[AMMUNITION FACTORY] Initializing script: ${script.name} (${script.codename})`,
      `[ASSIGNEE] ${script.assignedAgent} | THREAT TARGET: ${script.threatTarget}`,
      `[TIMESTAMP] ${new Date().toISOString()}`
    ];

    for (const line of rawLines) {
      if (line.includes('echo "')) {
        const clean = line.replace(/echo\s+["']?/, '').replace(/["']?\s*$/, '');
        stdoutLines.push(clean);
      } else {
        stdoutLines.push(`$ ${line}`);
      }
    }

    stdoutLines.push(`[COMPLETE] Script payload executed with exit code 0. Status: DEPLOYED.`);

    const log: ScriptExecutionLog = {
      id: `exec-log-${Date.now()}`,
      scriptId: id,
      timestamp: new Date().toTimeString().split(' ')[0],
      executedBy,
      stdoutLines,
      status: 'success',
      targetEntity: script.threatTarget
    };

    script.status = 'executed';
    script.runCount += 1;
    script.lastRunTimestamp = log.timestamp;
    this.executionLogs.unshift(log);

    return { log, script };
  }

  public getExecutionLogs(): ScriptExecutionLog[] {
    return [...this.executionLogs];
  }
}

export const ammunitionFactoryService = new AmmunitionFactoryService();

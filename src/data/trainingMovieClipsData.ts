import { TrainingMovieClip } from '../types/trainingClips';

export const TRAINING_MOVIE_CLIPS: TrainingMovieClip[] = [
  {
    id: 'clip-airgap',
    title: 'Mastering True Air-Gap: 100% Radio Silence',
    codename: 'OP_BRIEFING_AIRGAP_01',
    category: 'Air-Gap Defense',
    durationSeconds: 38,
    badge: 'CRITICAL DEFENSE',
    description: 'Exhaustive tactical breakdown of why mobile airplane mode fails to protect privacy, and how True Air-Gap enforces kernel-level zero-radio emission across all wireless hardware.',
    targetFeature: 'True Air-Gap 100% Offline Switch',
    actionButtonText: 'Engage True Air-Gap Now',
    actionButtonType: 'toggle_airgap',
    deepDive: {
      attackVectorExplained: 'Modern commercial operating systems (iOS and Android 12+) intentionally altered standard Airplane Mode. Even when toggled ON, the operating system keeps Bluetooth enabled for smartwatch/earbud tethering, maintains Wi-Fi background beacon scanning for indoor geographic positioning, and leaves GNSS/GPS satellite receivers listening to log location telemetry. Furthermore, crowd-sourced finding networks (such as Apple Find My and Google Find Hub) broadcast encrypted low-energy advertising frames (BLE ADV_IND) every 250 milliseconds even in airplane mode, allowing nearby receiver nodes, stingrays, and cellular surveillance towers to triangulate the device continuously.',
      kernelMechanism: 'True Air-Gap executes a hardware-level RF severance utilizing the Linux kernel rfkill subsystem and direct network namespace device teardown. It commands `rfkill block all`, forcibly unbinds the rmnet0 and ccmni cellular baseband controllers, brings down wlan0/p2p0 transceivers, powers down the hci0 Bluetooth controller, and terminates locationd/gpsd daemons. Additionally, an acoustic hardware mute guard tripwire blocks audio ADC hardware lines to prevent ultrasonic cross-device tracking.',
      linuxCommandsUsed: [
        'rfkill block all',
        'ip link set dev rmnet0 down',
        'ip link set dev wlan0 down',
        'hciconfig hci0 down',
        'pkill -9 -f "gpsd|locationd|gnss"',
        'echo 1 > /sys/class/rfkill/rfkill*/state'
      ],
      threatProtocols: [
        'BLE Advertising Frames (ADV_NONCONN_IND / 2.402-2.480 GHz)',
        'Wi-Fi Probe Requests (802.11b/g/n/ac/ax Beacon Frames)',
        'Cellular NAS/RRC Baseband Handshakes (LTE/5G NR Control Channel)',
        'GNSS L1/L5 Satellite Downlink & Ephemeris Request Sockets',
        'NFC / UWB (Ultra-Wideband 6.5–8.0 GHz) Spatial Beacons'
      ],
      stepByStepOperatorGuide: [
        {
          stepNumber: 1,
          title: 'Assess Perimeter RF Threat',
          instruction: 'Observe nearby signals in the Physical Defense Hub or Top Bar status badges. If unknown BLE beacons or hostile Wi-Fi Pineapples are within range, prepare for air-gap.',
          expectedResult: 'Operator identifies suspicious proximity transmitters or unverified baseband signals.'
        },
        {
          stepNumber: 2,
          title: 'Engage True Air-Gap with One Tap',
          instruction: 'Tap the [100% Offline] button in the Mobile Top Bar, the Physical Security Hub, or the Covert Interceptor modal.',
          expectedResult: 'All RF interfaces instantly collapse. The glowing red sticky HUD banner activates: "⚡ TRUE AIR-GAP ACTIVE · 100% OFFLINE".'
        },
        {
          stepNumber: 3,
          title: 'Inspect Radio Verification Checklist',
          instruction: 'Review the 6 hardware verification indicators: Cellular (0 dBm), Wi-Fi (HARDWARE OFF), Bluetooth (RADIO SILENT), GPS (SEVERED), NFC/UWB (POWER OFF), and Mic Guard (MUTED).',
          expectedResult: 'Zero packets emitted from device. Absolute mathematical radio silence.'
        },
        {
          stepNumber: 4,
          title: 'Restore Secure Communications',
          instruction: 'Once moved to a secure Faraday facility or safe zone, tap [Reconnect] on the top banner to restore network interfaces in a clean, isolated state.',
          expectedResult: 'Network drivers re-initialize and resume normal encrypted transmission.'
        }
      ],
      tacticalProTips: [
        'True Air-Gap is mathematically superior to consumer airplane mode because it cuts baseband AT-command pipes entirely.',
        'Use True Air-Gap during sensitive in-person executive briefings, border crossings, or when hostile Stingrays / IMSI catchers are detected.',
        'Activating True Air-Gap automatically freezes all pending background app queues to prevent burst exfiltration.'
      ],
      faq: [
        {
          question: 'Can emergency services or GPS find my phone while True Air-Gap is active?',
          answer: 'No. True Air-Gap terminates GNSS location satellite listener sockets and drops the cellular modem baseband to 0 dBm. The phone does not broadcast or receive any radio frequency signals.'
        },
        {
          question: 'Does True Air-Gap disable local data processing like Nmap analysis or offline notes?',
          answer: 'Local on-device compute, offline database access, and CPU operations continue functioning normally. Only wireless transceivers are severed.'
        }
      ]
    },
    scenes: [
      {
        id: 'airgap-s1',
        timestampStart: 0,
        timestampEnd: 12,
        title: 'Scene 1: The Hidden Flaw of Airplane Mode',
        subtitle: 'Standard airplane mode leaves Bluetooth, Wi-Fi location probes, and GPS listening sockets running in the background.',
        narrationVoiceover: 'Attention, Operative. Standard mobile Airplane Mode does not protect you. Modern consumer devices continue leaking Bluetooth beacon pulses, Wi-Fi location triangulations, and background GPS satellite requests.',
        visualGraphicType: 'radio_waves_cut',
        keyPoints: [
          'Airplane Mode leaves Bluetooth 5.3 beacons active',
          'Wi-Fi location triangulation continues pinging nearby BSSIDs',
          'GPS satellite sockets listen and store coordinate breadcrumbs'
        ],
        inDepthExplanation: 'Consumer OS manufacturers changed Airplane Mode to avoid interrupting consumer accessories like smartwatches and wireless earbuds. Unfortunately, this leaves open a continuous 2.4 GHz radio beacon window. Nearby adversaries equipped with SDRs (Software Defined Radios) or Wi-Fi Pineapples can still track your device MAC address, measure RSSI signal strength, and determine your physical location within meters.'
      },
      {
        id: 'airgap-s2',
        timestampStart: 12,
        timestampEnd: 25,
        title: 'Scene 2: Engaging the True Air-Gap Kill Switch',
        subtitle: 'Severing cellular modem basebands, Wi-Fi transceivers, Bluetooth HCI, and GPS daemons at the kernel level.',
        narrationVoiceover: 'When you tap True Air-Gap, Sentinel executes a zero-radio hardware cut. Cellular modems are killed, Wi-Fi transceivers blocked, Bluetooth controllers disabled, and GNSS daemons terminated.',
        visualGraphicType: 'radio_waves_cut',
        keyPoints: [
          'rmnet0 cellular baseband link is forced down (0 dBm)',
          'rfkill block wifi severs 2.4GHz, 5GHz, and 6GHz radios',
          'Bluetooth HCI controller powered down completely',
          'Hardware acoustic microphone mute guard enforced'
        ],
        inDepthExplanation: 'Sentinel bypasses high-level user-space toggles and executes direct kernel radio power down. Cellular AT command channels are closed to prevent baseband over-the-air exploitation. The Wi-Fi PHY chip is powered down. Bluetooth baseband controller clock is halted. GPS ephemeris caching is frozen, ensuring that zero electromagnetic radiation leaves the device chassis.'
      },
      {
        id: 'airgap-s3',
        timestampStart: 25,
        timestampEnd: 38,
        title: 'Scene 3: Status HUD & One-Tap Reconnect',
        subtitle: 'Verify complete RF blackout across the sticky HUD banner and restore radios when safe.',
        narrationVoiceover: 'A sticky status banner confirms complete radio blackout. When your perimeter is secure, tap Reconnect to restore communications instantly. True Air-Gap is ready at your command.',
        visualGraphicType: 'radio_waves_cut',
        keyPoints: [
          'Persistent glowing HUD verification banner',
          'Zero emitted RF packets or background telemetry',
          'Instant one-tap reconnection to restored networks'
        ],
        inDepthExplanation: 'The sticky HUD verification bar provides real-time attestation that the device is in a true zero-radio state. It continuously monitors interface socket states and confirms zero outgoing bytes across all network adapters. When you reach a secure facility, tapping Reconnect rebinds the clean interfaces seamlessly.'
      }
    ]
  },
  {
    id: 'clip-interceptor',
    title: 'Covert Egress & Protocol Interceptor',
    codename: 'OP_BRIEFING_INTERCEPTOR_02',
    category: 'Data Interception',
    durationSeconds: 42,
    badge: 'ANTI-EXFILTRATION',
    description: 'In-depth guide to detecting, inspecting, and neutralizing silent background SMS exfiltration, unauthorized ambient microphone wiretaps, stealth camera photos, and GPS leaks.',
    targetFeature: 'Covert Data & Protocol Interceptor',
    actionButtonText: 'Open Interceptor Stream',
    actionButtonType: 'open_interceptor',
    deepDive: {
      attackVectorExplained: 'Modern surveillance software and aggressive ad tracking SDKs bypass user scrutiny by executing inside background Android Service and JobScheduler threads while the phone screen is off. These apps use silent Type-0 SMS messages (which do not vibrate or show in the SMS inbox), open raw AudioRecord microphone buffers to capture ambient room acoustics, trigger front/rear camera optical captures without preview surfaces, and scrape local BSSID network tables to exfiltrate full device fingerprints to foreign C2 collector domains.',
      kernelMechanism: 'Sentinel deploys an IPC Binder interception layer and deep packet inspection (DPI) filter. When an untrusted app calls `SmsManager.sendTextMessage()` or attempts to stream raw PCM audio without a foreground notification, Sentinel intercepts the transaction before it is serialized to the kernel driver. Sentinel provides operators with immediate forensic inspection and two decisive countermeasures: [Block & Drop] to sever the socket, or [Inject Decoy Data] to feed synthetic white noise and false coordinates (0.0000, 0.0000).',
      linuxCommandsUsed: [
        'iptables -I OUTPUT -p tcp -m string --string "exfil" --algo bm -j DROP',
        'iptables -I OUTPUT -p udp --dport 53 -m string --string "telemetry" --algo bm -j REJECT',
        'am force-stop <compromised.package.name>',
        'appops set <package> RECORD_AUDIO ignore',
        'appops set <package> SEND_SMS ignore',
        'pm disable-user --user 0 <package>'
      ],
      threatProtocols: [
        'Silent SMS PDU (Protocol Data Unit Type-0 / Flash SMS)',
        'RTP / WebRTC Raw PCM Audio Buffers (16kHz / 48kHz ambient stream)',
        'Stealth Optical JPEG Frames (Front camera capture without SurfaceView)',
        'Raw TCP/UDP Sockets targeting ephemeral C2 dropboxes',
        'GPS Ephemeris & Nearby Wi-Fi BSSID Mapping Payloads'
      ],
      stepByStepOperatorGuide: [
        {
          stepNumber: 1,
          title: 'Open Covert Interceptor Stream',
          instruction: 'Tap [Intercept] in the top navigation bar or inside the Physical Security Hub.',
          expectedResult: 'The Covert Egress & Protocol Interceptor modal opens, listing all intercepted background streams.'
        },
        {
          stepNumber: 2,
          title: 'Filter by Protocol Type',
          instruction: 'Click the filter chips: [Silent SMS], [Ambient Audio], [Stealth Camera], [GPS Leaks], or [Raw Sockets].',
          expectedResult: 'View filtered list of offending app packages attempting background exfiltration.'
        },
        {
          stepNumber: 3,
          title: 'Inspect Decoded Forensic Payload',
          instruction: 'Click on any intercepted transmission row to expand the forensic inspection pane.',
          expectedResult: 'View the exact decoded base64 payload, audio chunk size, destination server, and kernel detection trigger.'
        },
        {
          stepNumber: 4,
          title: 'Deploy Decoy or Block Socket',
          instruction: 'Tap [Block] to immediately drop the socket, or tap [Decoy] to poison the tracker with synthetic coordinates and audio noise.',
          expectedResult: 'The tracker is quarantined or fed false intelligence, preserving operative anonymity.'
        }
      ],
      tacticalProTips: [
        'When dealing with hostile commercial spyware, choose [Inject Decoy Data] rather than [Block]. This prevents the malware author from knowing their surveillance was discovered.',
        'Use [Block All Queues] as a panic button if an unknown app is rapidly attempting burst exfiltration.',
        'Review the Android OS Kernel Detection Trigger in the inspector to verify whether the app attempted an unauthorized CameraDevice session without preview.'
      ],
      faq: [
        {
          question: 'What is a Silent SMS (Type-0 SMS)?',
          answer: 'A Silent SMS is a special cellular network protocol message that causes the receiving phone to acknowledge the transmission to the cell tower without showing any alert, sound, or record in the messaging app. Spyware and cellular operators use it to pinpoint device location.'
        },
        {
          question: 'How does Decoy Data Injection work?',
          answer: 'Sentinel substitutes the intercepted buffer with synthetic white noise for audio, null-island coordinates (lat 0, lng 0) for GPS, and sanitized IMEI zeros (000000000000000), corrupting the adversary’s intelligence feed.'
        }
      ]
    },
    scenes: [
      {
        id: 'interceptor-s1',
        timestampStart: 0,
        timestampEnd: 14,
        title: 'Scene 1: Detecting Invisible Background Leaks',
        subtitle: 'Untrusted apps exploit background services to secretly dispatch SMS pings, microphone buffers, and photo bursts.',
        narrationVoiceover: 'Malicious apps and ad SDKs secretly transmit your private data in the background. They send silent SMS PDU messages, record ambient room audio, and capture optical frames without opening a screen.',
        visualGraphicType: 'packet_sniff_egress',
        keyPoints: [
          'Silent SMS dispatch via SmsManager with zero notification',
          'Background AudioRecord sampling whisper frequencies',
          'Stealth CameraDevice sessions without preview surfaces'
        ],
        inDepthExplanation: 'Background exfiltration is the primary method employed by modern cyber-surveillance. Malicious mobile applications take advantage of broad permissions granted during install to quietly read audio samples from the microphone, capture low-resolution photos with the front sensor, and dispatch silent SMS packets without ever waking the screen or alerting the operator.'
      },
      {
        id: 'interceptor-s2',
        timestampStart: 14,
        timestampEnd: 28,
        title: 'Scene 2: Sniffing & Inspecting the Egress Stream',
        subtitle: 'Sentinel hooks kernel Binder transactions to trap outbound packets before they hit external antennas.',
        narrationVoiceover: 'The Sentinel Covert Interceptor inspects outgoing IPC Binder calls in real-time. It decodes the payload, flags the offending application package, and isolates the destination IP or telephone gateway.',
        visualGraphicType: 'packet_sniff_egress',
        keyPoints: [
          'Live packet inspector with decoded payload previews',
          'Identifies offending app package and destination server',
          'Calculates risk score and trigger condition'
        ],
        inDepthExplanation: 'By intercepting communications at the Android IPC (Inter-Process Communication) layer, Sentinel captures data payloads before they can be transmitted over physical antennas. The inspector extracts the raw buffer, analyzes destination IP addresses, ports, and carrier SMS gateways, and evaluates whether the dispatch violates security baselines.'
      },
      {
        id: 'interceptor-s3',
        timestampStart: 28,
        timestampEnd: 42,
        title: 'Scene 3: Block, Quarantine, or Inject Decoy Data',
        subtitle: 'Sever malicious transmission sockets or feed synthetic white noise and false coordinates to confuse trackers.',
        narrationVoiceover: 'You have full tactical response options: tap Block to sever the socket, or tap Decoy to feed synthetic coordinates and audio noise to data harvesters. You control what leaves your device.',
        visualGraphicType: 'packet_sniff_egress',
        keyPoints: [
          'Block & Drop severs the socket or flushes the SMS queue',
          'Inject Decoy feeds false GPS coordinates (Null Island)',
          'Block All Queues executes an immediate panic flush'
        ],
        inDepthExplanation: 'Defenders possess active counter-surveillance tools: [Block] severs the communication pipe and notifies the forensic logging engine. Alternatively, [Inject Decoy Data] feeds false information—such as geolocation coordinates placed at Null Island (0°N, 0°E in the Atlantic Ocean)—polluting adversary databases while protecting real operational locations.'
      }
    ]
  },
  {
    id: 'clip-ammo-factory',
    title: 'Ammunition Factory: Defense Playbooks',
    codename: 'OP_BRIEFING_AMMO_03',
    category: 'Ammunition Factory',
    durationSeconds: 40,
    badge: 'AUTOMATED SOAR',
    description: 'Comprehensive operational guide to automated Security Orchestration, Automation, and Response (SOAR) playbooks downlinked from The Wisdom Sentinel or forged on-device.',
    targetFeature: 'Ammunition Factory Foundry',
    actionButtonText: 'Launch Ammunition Factory',
    actionButtonType: 'open_ammo',
    deepDive: {
      attackVectorExplained: 'Cyber adversaries utilize automated scripts, weaponized port sweeps, and lateral traversal droppers that compromise network targets in milliseconds. Human response times are too slow to counter automated zero-day propagation. When a new CVE or C2 botnet node is identified, defensive countermeasures must be packaged into pre-compiled, verifiable bash scripts that can be deployed instantly with a single button press or triggered autonomously by defense agents.',
      kernelMechanism: 'The Ammunition Factory is an incident response automation engine. It houses parameterized bash scripts certified with cryptographic checksums. Scripts interact directly with Linux netfilter (`iptables`), ARP resolution tables (`ip neigh`), process schedulers (`kill`), and dynamic port-knock daemons. Each script execution records exit codes, stdout logs, and timestamps under Federal Rules of Evidence Rule 902(14) for legal admissibility.',
      linuxCommandsUsed: [
        'iptables -I FORWARD 1 -s <target_ip> -j DROP',
        'ip neigh replace <target_ip> lladdr 00:00:00:00:00:00',
        'iptables -N KNOCKING && iptables -A INPUT -m recent --name KNOCK',
        'echo "127.0.0.1 <c2_domain>" >> /etc/hosts',
        'sysctl -w net.ipv4.tcp_syncookies=1',
        'mount -o remount,ro /system'
      ],
      threatProtocols: [
        'TCP SYN Flood & Shodan Scanning Sweeps',
        'Lateral SMB Traversal (CVE-2024-38077 / Port 445)',
        'Botnet C2 Beaconing (Encrypted TLS over ephemeral ports)',
        'ARP Spoofing & Man-in-the-Middle (MITM) Cache Poisoning',
        'Unverified Privilege Escalation Daemons'
      ],
      stepByStepOperatorGuide: [
        {
          stepNumber: 1,
          title: 'Open Ammunition Factory',
          instruction: 'Tap [Ammo] on the top bar or inside the Popeye Hub.',
          expectedResult: 'The Ammunition Factory modal opens displaying pre-compiled tactical playbooks.'
        },
        {
          stepNumber: 2,
          title: 'Select Pre-Compiled Countermeasure',
          instruction: 'Browse scripts: Aegis Quarantine Dropper, Valkyrie Air Shield, Synapse Honeytoken Seed, Kronos Kernel Seal, Cipher Port Scramble, or Wisdom C2 Sinkhole.',
          expectedResult: 'Inspect script target CVE, threat level, description, and source code.'
        },
        {
          stepNumber: 3,
          title: 'Execute with 1-Click Run Button',
          instruction: 'Tap the [Run Button] on any playbook.',
          expectedResult: 'Script executes in real time, streaming terminal stdout with exit code 0 confirmation.'
        },
        {
          stepNumber: 4,
          title: 'Forge a Custom Defense Script',
          instruction: 'Tap [Forge New Script], enter a custom CVE or threat signature, assign an agent (Aegis, Valkyrie, Kronos), and save to the foundry.',
          expectedResult: 'The newly compiled playbook is immediately ready for 1-click execution or shell invocation.'
        }
      ],
      tacticalProTips: [
        'Scripts marked [Wisdom Sentinel Downlink] are synchronized with the central global threat feed and require no manual parameter tuning.',
        'You can execute any script directly from the Synapse Command Shell by typing `ammunition run <script-id>`.',
        'Aegis Quarantine Dropper replaces the target MAC address with 00:00:00:00:00:00, freezing lateral traversal without alerting the compromised host.'
      ],
      faq: [
        {
          question: 'Are Ammunition Factory scripts destructive to network hardware?',
          answer: 'No. All scripts are defensive micro-segmentation, firewall filtering, and isolation protocols designed to contain threats without damaging hardware.'
        },
        {
          question: 'Can scripts be triggered autonomously by AI agents?',
          answer: 'Yes. Agents like Aegis and Valkyrie can automatically execute matched playbooks when a device breaches critical CVE alert thresholds.'
        }
      ]
    },
    scenes: [
      {
        id: 'ammo-s1',
        timestampStart: 0,
        timestampEnd: 13,
        title: 'Scene 1: Threat Downlinks from Wisdom Sentinel',
        subtitle: 'New zero-day vulnerabilities detected worldwide are compiled into defensive countermeasure playbooks.',
        narrationVoiceover: 'As new threats emerge across the web, The Wisdom Sentinel Central Registry downlinks verified defensive playbooks directly into your Ammunition Factory.',
        visualGraphicType: 'ammo_forge_script',
        keyPoints: [
          'Synchronized with global Wisdom Sentinel intelligence',
          'Targets zero-day CVEs, rogue APs, and botnet C2 nodes',
          'Ready-to-deploy incident response playbooks'
        ],
        inDepthExplanation: 'The Wisdom Sentinel operates as a global threat intelligence repository. When a zero-day vulnerability (such as Windows RPC exploit CVE-2024-38077 or an active botnet IP) is cataloged, countermeasure scripts are automatically forged and downlinked to every mobile Sentinel node, keeping your field defense updated in real-time.'
      },
      {
        id: 'ammo-s2',
        timestampStart: 13,
        timestampEnd: 26,
        title: 'Scene 2: 1-Click Execution & Shell Integration',
        subtitle: 'Execute playbooks instantly as interactive buttons or dispatch them to autonomous agents in the Synapse Shell.',
        narrationVoiceover: 'Every script can be executed with a single tap on the Run Button, generating live stdout logs. Alternatively, dispatch them through the Synapse Command Shell or assign them to agents like Aegis and Valkyrie.',
        visualGraphicType: 'ammo_forge_script',
        keyPoints: [
          'Run Button executes script with animated stdout logs',
          'Synapse Command Shell integration via voice or terminal',
          'Agent auto-deployment (Aegis, Valkyrie, Kronos, Synapse)'
        ],
        inDepthExplanation: 'Tactical playbooks eliminate the risk of human typing errors under stress. Tapping the [Run Button] instantly executes the verified bash instructions inside a secure container, outputting real-time stdout logs and verifying cryptographic exit codes for evidentiary chain of custody.'
      },
      {
        id: 'ammo-s3',
        timestampStart: 26,
        timestampEnd: 40,
        title: 'Scene 3: Forging Custom Countermeasures',
        subtitle: 'Compile custom threat rules, ARP isolation drop rules, and memory seals for specific targets.',
        narrationVoiceover: 'Need a custom defense? Tap Forge New Script to compile bespoke iptables drop rules, honeytoken canaries, or DNS sinkholes tailored to your network segment.',
        visualGraphicType: 'ammo_forge_script',
        keyPoints: [
          'Custom playbook compiler with CVE tagging',
          'Configurable agent assignment and script payloads',
          'Instant deployment to active defense queue'
        ],
        inDepthExplanation: 'The Forge New Script feature gives field operators full engineering capability. You can craft specialized iptables drop chains, inject decoy honeytoken files into target storage directories, or configure dynamic port-knocking sequences to shield high-value servers from port scanning.'
      }
    ]
  },
  {
    id: 'clip-radar-defense',
    title: 'Physical Defense: 360° Radar & Covert Blackout',
    codename: 'OP_BRIEFING_PHYSICAL_04',
    category: 'Physical Security',
    durationSeconds: 38,
    badge: 'PHYSICAL AIR-GUARD',
    description: 'Master 150m RF proximity radar sweeps, covert screen-off blackout deception against physical captors, gyroscopic anti-tamper tripwires, and Rapid-Fill memory sanitization.',
    targetFeature: 'Physical Defense & Geofence',
    actionButtonText: 'View 360° Radar Hub',
    actionButtonType: 'open_radar',
    deepDive: {
      attackVectorExplained: 'Physical perimeter threats involve hostile wireless hardware deployed in physical proximity to the operator—such as Wi-Fi Pineapples broadcasting rogue ESSIDs (Karma attacks), Bluetooth sniffers mapping MAC addresses, and Flipper Zero devices attempting replay attacks. In hostile field situations, an operative may also face physical apprehension where adversaries seize the phone and force biometric unlock.',
      kernelMechanism: 'Valkyrie manages hardware transceivers and motion sensors. The 360° Radar computes signal angles and RSSI distances to map rogue beacons onto a polar coordinate plane. The Covert Blackout screen disables OLED display illumination completely while preserving background audio buffers and encrypted GPS location beacons. The anti-tamper subsystem queries hardware gyroscopes to detect sudden unlatched drops or unauthorized pick-ups, triggering ChaCha20 random entropy overwriting of unallocated flash blocks (Rapid-Fill).',
      linuxCommandsUsed: [
        'cat /sys/class/sensors/accelerometer/data',
        'echo 0 > /sys/class/backlight/*/brightness',
        'dd if=/dev/urandom of=/data/local/tmp/wipe.bin bs=1M count=500 conv=fsync',
        'sync && echo 3 > /proc/sys/vm/drop_caches'
      ],
      threatProtocols: [
        'Wi-Fi Pineapple KARMA Probe Interception',
        'BLE AirTag & Tile Unwanted Tracker Beacons',
        'Sub-1GHz & 433MHz Rolling Code Replay Signals',
        'Hostile Physical Device Seizure & Forensics Duplication',
        'USB Rubber Ducky / BadUSB Infiltration'
      ],
      stepByStepOperatorGuide: [
        {
          stepNumber: 1,
          title: 'Inspect 360° Polar Radar',
          instruction: 'Open the Physical Security Hub. Observe the polar radar sweeping up to 500 meters.',
          expectedResult: 'Hostile beacons (Pineapples, Rogue APs, BLE Trackers) are plotted with threat levels.'
        },
        {
          stepNumber: 2,
          title: 'Adjust Geofence Perimeter',
          instruction: 'Slide the Geofence Radius slider (50m to 500m) to set your operational safety boundary.',
          expectedResult: 'Any beacon crossing inside the geofence perimeter triggers an audible proximity alert.'
        },
        {
          stepNumber: 3,
          title: 'Engage Covert Screen-Off Blackout',
          instruction: 'In physical custody situations, tap [Blackout]. The screen turns pitch black.',
          expectedResult: 'Device appears completely dead to captors while silently broadcasting GPS coordinates and audio wiretaps.'
        },
        {
          stepNumber: 4,
          title: 'Execute Emergency Rapid-Fill Wipe',
          instruction: 'If device seizure is imminent, tap [Rapid-Fill]. Confirm the two-stage execution.',
          expectedResult: 'ChaCha20 random noise overwrites free storage blocks, destroying recoverable file artifacts.'
        }
      ],
      tacticalProTips: [
        'To exit Covert Blackout Mode, double-tap the screen firmly. The stealth lock disengages and restores the UI.',
        'Arm Anti-Tamper before resting your phone on a conference table; any unauthorized pick-up triggers immediate DEFCON-1 alerting.',
        'Rapid-Fill generates a cryptographically sealed Certificate of Destruction under Federal Rules of Evidence Rule 902(14).'
      ],
      faq: [
        {
          question: 'Does Covert Blackout mode drain battery faster?',
          answer: 'No. On OLED screens, black pixels are completely powered down, extending battery life while background low-power sensors run.'
        },
        {
          question: 'Can forensic recovery tools recover files wiped by Rapid-Fill?',
          answer: 'No. Rapid-Fill utilizes high-entropy pseudo-random noise written with `fsync`, ensuring data remnants cannot be reconstructed via electron microscopy or JTAG dumps.'
        }
      ]
    },
    scenes: [
      {
        id: 'radar-s1',
        timestampStart: 0,
        timestampEnd: 12,
        title: 'Scene 1: 360° Proximity Radar & Geofence',
        subtitle: 'Continuous scanning for Wi-Fi Pineapple probes, hostile BLE sniffers, and Flipper Zero devices.',
        narrationVoiceover: 'Valkyrie sweeps a 360-degree perimeter up to 500 meters. Hostile RF arrays, Wi-Fi Pineapples, and rogue BLE trackers are plotted in real time on the radar display.',
        visualGraphicType: 'radar_blackout_sensor',
        keyPoints: [
          'Real-time polar radar sweeping up to 500 meters',
          'Immediate hostile beacon threat classification',
          'Adjustable geofence perimeter radius'
        ],
        inDepthExplanation: 'The 360° Proximity Radar continuously listens to ambient radio frequencies. It parses 802.11 beacon frames and Bluetooth Low Energy advertisements, matching hardware vendor OUIs and signal strengths to plot distance rings and alert you before an adversary comes within physical reach.'
      },
      {
        id: 'radar-s2',
        timestampStart: 12,
        timestampEnd: 25,
        title: 'Scene 2: Covert Screen-Off Blackout Mode',
        subtitle: 'Make your phone appear completely powered down while silently broadcasting encrypted telemetry.',
        narrationVoiceover: 'In physical custody situations, tap Blackout. The display turns pitch black, convincing captors the device is dead, while background encrypted GPS, audio, and optical sensors stream back to base.',
        visualGraphicType: 'radar_blackout_sensor',
        keyPoints: [
          'Simulated power-off deception mode',
          'Continuous encrypted GPS breadcrumb broadcasting',
          'Double-tap stealth unlock to restore display'
        ],
        inDepthExplanation: 'Covert Blackout mode is engineered for hostile physical custody or coercion scenarios. The display mimics a completely powered-off device with zero touch response or backlight. Meanwhile, background threads continue streaming GPS coordinates and audio telemetry back to The Wisdom Sentinel station.'
      },
      {
        id: 'radar-s3',
        timestampStart: 25,
        timestampEnd: 38,
        title: 'Scene 3: Hardware Anti-Tamper & Rapid-Fill Sanitize',
        subtitle: 'Accelerometer tripwires and cryptographically certified emergency flash sanitation.',
        narrationVoiceover: 'Armed anti-tamper sensors detect unlatched pick-ups and USB disconnection. For imminent physical breach, Rapid-Fill overwrites unallocated storage blocks with ChaCha20 random noise.',
        visualGraphicType: 'radar_blackout_sensor',
        keyPoints: [
          'Gyroscopic drop and unauthorized pick-up tripwire',
          'Emergency Rapid-Fill NAND flash overwrite',
          'Forensic certificate generation under FRE 902(14)'
        ],
        inDepthExplanation: 'When physical breach is certain, Rapid-Fill acts as the digital scorched-earth protocol. It fills all free NAND storage blocks with cryptographic random bytes, eliminating data carving artifacts from deleted logs or keys, followed by generating a tamper-proof hash digest.'
      }
    ]
  },
  {
    id: 'clip-nmap-quarantine',
    title: 'Nmap Subnet Scanner & Network Quarantine',
    codename: 'OP_BRIEFING_NMAP_05',
    category: 'Network Intelligence',
    durationSeconds: 38,
    badge: 'STEALTH RECON',
    description: 'Master stealth SYN scans, OS fingerprinting, open port reconnaissance, and 1-tap host micro-segmentation with zero lateral leakage.',
    targetFeature: 'Nmap Subnet Scanner & Console',
    actionButtonText: 'Open Nmap Console',
    actionButtonType: 'open_nmap',
    deepDive: {
      attackVectorExplained: 'Local area networks (LANs) frequently harbor unmonitored devices: rogue IoT cameras, infected workstations performing lateral port sweeps, and unauthorized listening sockets (such as vulnerable Redis, SMB, or HTTP proxies). Without regular active SYN scanning and OS fingerprinting, lateral movement goes completely unnoticed until full domain compromise occurs.',
      kernelMechanism: 'Sentinel incorporates a multi-threaded Nmap engine capable of raw TCP SYN scanning (`-sS`), service version interrogation (`-sV`), and OS fingerprinting. When a host is found to harbor critical CVEs (such as CVE-2024-38077 on port 445), tapping [Quarantine Host] immediately injects custom `iptables` drop rules into the local subnet bridge, blocking all lateral packets while leaving the forensic monitor connection active.',
      linuxCommandsUsed: [
        'nmap -sS -sV -O -p 1-1024 --open 192.168.1.0/24',
        'iptables -I FORWARD -s <compromised_ip> -j DROP',
        'iptables -I INPUT -s <compromised_ip> -j DROP',
        'arping -c 2 -I eth0 <target_ip>'
      ],
      threatProtocols: [
        'Raw TCP SYN Packets (Half-open scanning without completing handshake)',
        'SMBv1 / SMBv2 / SMBv3 Lateral RPC Traversal (TCP 445)',
        'Unauthenticated Database Daemons (Redis 6379, MySQL 3306)',
        'Rogue UPnP Port Mapping Protocol (UDP 1900)'
      ],
      stepByStepOperatorGuide: [
        {
          stepNumber: 1,
          title: 'Select Subnet & Scan Profile',
          instruction: 'Open the Nmap Console. Choose your target subnet (192.168.1.0/24) and select a scan profile (Quick Recon, Full Stealth SYN, or Vulnerability Audit).',
          expectedResult: 'Scanner configures scan parameters and pre-validates raw socket permissions.'
        },
        {
          stepNumber: 2,
          title: 'Launch Reconnaissance Sweep',
          instruction: 'Tap [Launch Scan]. Watch the real-time terminal stdout stream as hosts respond.',
          expectedResult: 'Discovered hosts, open listening ports, service versions, and CVE vulnerabilities populate the inventory.'
        },
        {
          stepNumber: 3,
          title: 'Inspect Compromised Host & Isolate',
          instruction: 'Click on any device flagged with critical CVEs. Tap [Isolate Host].',
          expectedResult: 'The host is quarantined in place. A red padlock badge appears; all lateral traversal traffic is dropped.'
        }
      ],
      tacticalProTips: [
        'Use the [✦ Clean View / Full Specs] toggle in the header to declutter the host view during active operations.',
        'Isolated hosts remain visible on the topology map so you can monitor their state without risking infection to other nodes.',
        'Use SYN Stealth mode (`-sS`) because it does not complete the 3-way TCP handshake, avoiding logging on basic intrusion detection systems.'
      ],
      faq: [
        {
          question: 'Does isolating a host disconnect it from the physical network?',
          answer: 'No, it injects kernel-level firewall drop rules preventing the host from communicating with any other device on the subnet, neutralizing lateral infection.'
        },
        {
          question: 'Can I rescan a single isolated host?',
          answer: 'Yes, click the host in the inventory and tap [Rescan Host] to verify whether vulnerabilities have been patched before removing isolation.'
        }
      ]
    },
    scenes: [
      {
        id: 'nmap-s1',
        timestampStart: 0,
        timestampEnd: 12,
        title: 'Scene 1: Stealth SYN Reconnaissance',
        subtitle: 'Scan local subnets without completing 3-way handshakes to remain invisible to basic IDS.',
        narrationVoiceover: 'The Sentinel Nmap Scanner maps every connected node across your subnet. Stealth SYN scanning interrogates open ports without alerting intrusion detection systems.',
        visualGraphicType: 'nmap_quarantine',
        keyPoints: [
          'Raw SYN packet half-open stealth probing',
          'Automatic service version and banner grabbing',
          'Subnet discovery across 192.168.x, 10.x, and 172.x'
        ],
        inDepthExplanation: 'By sending SYN packets and listening for SYN-ACK responses without ever transmitting the final ACK packet, Sentinel identifies open service ports while minimizing footprint in server access logs.'
      },
      {
        id: 'nmap-s2',
        timestampStart: 12,
        timestampEnd: 25,
        title: 'Scene 2: Vulnerability Scoring & CVE Matching',
        subtitle: 'Automated correlation of open ports with known CVE exploits from the National Vulnerability Database.',
        narrationVoiceover: 'Discovered ports are matched against known zero-day CVEs. Critical vulnerabilities are tagged with risk scores and assigned to defense agents for immediate review.',
        visualGraphicType: 'nmap_quarantine',
        keyPoints: [
          'Automatic CVSS scoring and severity tagging',
          'Identifies exposed SMB, SSH, RDP, and HTTP interfaces',
          'Highlights unpatched remote code execution vulnerabilities'
        ],
        inDepthExplanation: 'Open ports are cross-referenced in real-time against active threat signatures. When a high-risk service (such as unpatched Windows RPC on port 445) is spotted, the host tile glows red with immediate remediation guidance.'
      },
      {
        id: 'nmap-s3',
        timestampStart: 25,
        timestampEnd: 38,
        title: 'Scene 3: One-Tap Host Micro-Segmentation',
        subtitle: 'Instantly quarantine compromised devices using kernel iptables drop rules.',
        narrationVoiceover: 'Spot a compromised machine? Tap Isolate Host. Sentinel enforces instant micro-segmentation, preventing lateral worm traversal across your network perimeter.',
        visualGraphicType: 'nmap_quarantine',
        keyPoints: [
          '1-tap micro-segmentation drops lateral packets',
          'Clean progressive disclosure hides clutter until clicked',
          'Preserves forensic auditing without risking infection'
        ],
        inDepthExplanation: 'Host isolation injects targeted packet filter rules into the subnet bridge. The infected computer can no longer scan, infect, or reach any peer machines on your network, containing the breach instantly.'
      }
    ]
  },
  {
    id: 'clip-wisdom-forensic',
    title: 'The Wisdom Sentinel: Forensic Compliance Hub',
    codename: 'OP_BRIEFING_WISDOM_06',
    category: 'Forensic Compliance',
    durationSeconds: 40,
    badge: 'LEGAL ADMISSIBILITY',
    description: 'Learn how First Mate Popeye synchronizes Daily Cards and Monthly Audits from The Wisdom Sentinel, and how to export legally certified court records under FRE 902(14).',
    targetFeature: 'Popeye Hub & Wisdom Sentinel',
    actionButtonText: 'Open Popeye Hub',
    actionButtonType: 'open_wisdom',
    deepDive: {
      attackVectorExplained: 'In cyber warfare and criminal extortion, technical logs frequently fail in court because digital evidence is deemed hearsay or can be easily tampered with. Without a continuous, verifiable chain of custody and cryptographic hash attestation complying with Federal Rules of Evidence Rule 902(14) (Self-authenticating electronic records), evidence submitted to the FBI IC3, CISA, or insurance adjusters is routinely rejected.',
      kernelMechanism: 'The Wisdom Sentinel is the immutable central registry. First Mate Popeye receives cryptographically signed Daily Cards and Monthly Audit reports downlinked from the web station. All event logs, isolated hosts, and intercepted exfiltration attempts are sealed with SHA-256 digests and signed with an HMAC key, creating self-authenticating legal records suitable for direct export as legal PDFs or JSON audit bundles.',
      linuxCommandsUsed: [
        'sha256sum /persist/forensics/*.json',
        'openssl dgst -sha256 -sign private.pem -out audit.sig records.json',
        'openssl base64 -in audit.sig -out audit.sig.b64'
      ],
      threatProtocols: [
        'Evidence Tampering & Chain-of-Custody Invalidation',
        'State-Sponsored Denial of Attribution',
        'Digital Forgery Claims in Civil / Criminal Litigation'
      ],
      stepByStepOperatorGuide: [
        {
          stepNumber: 1,
          title: 'Open Popeye Hub',
          instruction: 'Tap [Dossier] on the bottom navigation bar to enter the Popeye Hub.',
          expectedResult: 'View First Mate Popeye status, downlinked Daily Cards, and Monthly Audit reports.'
        },
        {
          stepNumber: 2,
          title: 'Review Daily Forensic Card',
          instruction: 'Examine the downlinked card: Card ID, daily score, threat count, and certified audit hash.',
          expectedResult: 'Operator verifies that all daily events match the central Wisdom Sentinel hash digest.'
        },
        {
          stepNumber: 3,
          title: 'Export Legal Evidence Bundle',
          instruction: 'Switch to the [Legal Export] sub-tab. Tap [Export Legal PDF] or [Download JSON].',
          expectedResult: 'A complete court-ready forensic audit document is generated with FRE 902(14) certification stamps.'
        },
        {
          stepNumber: 4,
          title: 'Submit to IC3 / CISA Authorities',
          instruction: 'Deliver the export package or run `ic3-report compile` in the Synapse Shell to format an FBI Internet Crime Complaint Center filing.',
          expectedResult: 'Self-authenticating evidence bundle ready for immediate prosecutorial submission.'
        }
      ],
      tacticalProTips: [
        'The Wisdom Sentinel is publicly visible but strictly non-interactive to protect the central registry from adversary tampering.',
        'Always export your Legal Audit PDF at the end of each operational cycle to maintain continuous monthly archives.',
        'Use the Synapse Shell command `forensic-seal <artifact>` to generate immediate hash seals on specific logs.'
      ],
      faq: [
        {
          question: 'What is Federal Rules of Evidence Rule 902(14)?',
          answer: 'FRE Rule 902(14) allows certified records generated by an electronic process or system to be self-authenticating in United States courts, meaning they do not require live technician testimony if accompanied by a cryptographic hash certificate.'
        },
        {
          question: 'Can an adversary alter the Daily Card on my device?',
          answer: 'No. Every Daily Card is cryptographically anchored by The Wisdom Sentinel Central Registry; modifying local files will invalidate the SHA-256 signature.'
        }
      ]
    },
    scenes: [
      {
        id: 'wisdom-s1',
        timestampStart: 0,
        timestampEnd: 13,
        title: 'Scene 1: Central Registry Downlink',
        subtitle: 'First Mate Popeye synchronizes daily cards and audits from The Wisdom Sentinel.',
        narrationVoiceover: 'The existence of The Wisdom Sentinel is public, but strictly non-interactive. First Mate Popeye receives the official Daily Card and Monthly Audit Report down to this mobile APK node.',
        visualGraphicType: 'wisdom_legal_export',
        keyPoints: [
          'Non-interactive central registry protects against tampering',
          'Downlink channel synchronizes daily threat cards',
          'Maintains continuous operational synchronization'
        ],
        inDepthExplanation: 'The Wisdom Sentinel acts as the secure central authority. By keeping the central station non-interactive, adversaries cannot push unauthorized commands. Instead, verified threat digests and audit cards are downlinked to your mobile node on a continuous schedule.'
      },
      {
        id: 'wisdom-s2',
        timestampStart: 13,
        timestampEnd: 26,
        title: 'Scene 2: Daily Cards & Monthly Audit Reports',
        subtitle: 'Track operational readiness scores, threat mitigation milestones, and zero-day containment.',
        narrationVoiceover: 'Each Daily Card packages operational readiness, threat containment counts, and hash digests. Monthly audits compile comprehensive compliance telemetry for leadership review.',
        visualGraphicType: 'wisdom_legal_export',
        keyPoints: [
          'Daily Card ID and threat mitigation score',
          'Monthly audit aggregating all security events',
          'Integrity verification against central fleet records'
        ],
        inDepthExplanation: 'Every day is indexed with a unique cryptographic Card ID. It records total host isolations, prevented covert leaks, and anti-tamper events. At the end of every month, an aggregated audit report calculates the overall operational health index.'
      },
      {
        id: 'wisdom-s3',
        timestampStart: 26,
        timestampEnd: 40,
        title: 'Scene 3: FRE 902(14) Certified Legal Export',
        subtitle: 'Generate self-authenticating legal evidence bundles for law enforcement and court litigation.',
        narrationVoiceover: 'Need court-admissible evidence? Tap Legal Export to generate a certified PDF with SHA-256 custody seals under Federal Rule of Evidence 902(14). Your security data is legally unassailable.',
        visualGraphicType: 'wisdom_legal_export',
        keyPoints: [
          'One-click Legal PDF and JSON export',
          'Cryptographic SHA-256 seal for court admissibility',
          'Ready for direct FBI IC3 and CISA filing'
        ],
        inDepthExplanation: 'When reporting cyber-attacks to law enforcement or courtrooms, digital evidence requires strict chain of custody. Sentinel stamps all records with SHA-256 digests and procedural signatures complying with FRE Rule 902(14), ensuring your evidence is admissible in court.'
      }
    ]
  }
];

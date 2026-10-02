import { TrainingMovieClip } from '../types/trainingClips';

export const TRAINING_MOVIE_CLIPS: TrainingMovieClip[] = [
  {
    id: 'clip-airgap',
    title: 'Mastering True Air-Gap: 100% Radio Silence',
    codename: 'OP_BRIEFING_AIRGAP_01',
    category: 'Air-Gap Defense',
    durationSeconds: 36,
    badge: 'CRITICAL DEFENSE',
    description: 'Learn why standard mobile airplane mode fails to protect your privacy, and how True Air-Gap severs Cellular, Wi-Fi, Bluetooth, and GPS satellite sockets.',
    targetFeature: 'True Air-Gap 100% Offline Switch',
    actionButtonText: 'Engage True Air-Gap Now',
    actionButtonType: 'toggle_airgap',
    scenes: [
      {
        id: 'airgap-s1',
        timestampStart: 0,
        timestampEnd: 11,
        title: 'Scene 1: The Hidden Flaw of Airplane Mode',
        subtitle: 'Standard airplane mode leaves Bluetooth, Wi-Fi location probes, and GPS listening sockets running in the background.',
        narrationVoiceover: 'Attention, Operative. Standard mobile Airplane Mode does not protect you. Modern devices continue leaking Bluetooth beacon pulses, Wi-Fi location triangulations, and background GPS satellite requests.',
        visualGraphicType: 'radio_waves_cut',
        keyPoints: [
          'Airplane Mode leaves Bluetooth 5.3 beacons active',
          'Wi-Fi location triangulation continues pinging nearby BSSIDs',
          'GPS satellite sockets listen and store coordinate breadcrumbs'
        ]
      },
      {
        id: 'airgap-s2',
        timestampStart: 11,
        timestampEnd: 24,
        title: 'Scene 2: Engaging the True Air-Gap Kill Switch',
        subtitle: 'Severing cellular modem basebands, Wi-Fi transceivers, Bluetooth HCI, and GPS daemons at the kernel level.',
        narrationVoiceover: 'When you tap True Air-Gap, Sentinel executes a zero-radio hardware cut. Cellular modems are killed, Wi-Fi transceivers blocked, Bluetooth controllers disabled, and GNSS daemons terminated.',
        visualGraphicType: 'radio_waves_cut',
        keyPoints: [
          'rmnet0 cellular baseband link is forced down (0 dBm)',
          'rfkill block wifi severs 2.4GHz, 5GHz, and 6GHz radios',
          'Bluetooth HCI controller powered down completely',
          'Hardware acoustic microphone mute guard enforced'
        ]
      },
      {
        id: 'airgap-s3',
        timestampStart: 24,
        timestampEnd: 36,
        title: 'Scene 3: Status HUD & One-Tap Reconnect',
        subtitle: 'Verify complete RF blackout across the sticky HUD banner and restore radios when safe.',
        narrationVoiceover: 'A sticky status banner confirms complete radio blackout. When your perimeter is secure, tap Reconnect to restore communications instantly. True Air-Gap is ready at your command.',
        visualGraphicType: 'radio_waves_cut',
        keyPoints: [
          'Persistent glowing HUD verification banner',
          'Zero emitted RF packets or background telemetry',
          'Instant one-tap reconnection to restored networks'
        ]
      }
    ]
  },
  {
    id: 'clip-interceptor',
    title: 'Covert Egress & Protocol Interceptor',
    codename: 'OP_BRIEFING_INTERCEPTOR_02',
    category: 'Data Interception',
    durationSeconds: 40,
    badge: 'ANTI-EXFILTRATION',
    description: 'How to intercept invisible background SMS transmissions, ambient microphone listeners, stealth camera photos, and GPS leaks.',
    targetFeature: 'Covert Data & Protocol Interceptor',
    actionButtonText: 'Open Interceptor Stream',
    actionButtonType: 'open_interceptor',
    scenes: [
      {
        id: 'interceptor-s1',
        timestampStart: 0,
        timestampEnd: 13,
        title: 'Scene 1: Detecting Invisible Background Leaks',
        subtitle: 'Untrusted apps exploit background services to secretly dispatch SMS pings, microphone buffers, and photo bursts.',
        narrationVoiceover: 'Malicious apps and ad SDKs secretly transmit your private data in the background. They send silent SMS PDU messages, record ambient room audio, and capture optical frames without opening a screen.',
        visualGraphicType: 'packet_sniff_egress',
        keyPoints: [
          'Silent SMS dispatch via SmsManager with zero notification',
          'Background AudioRecord sampling whisper frequencies',
          'Stealth CameraDevice sessions without preview surfaces'
        ]
      },
      {
        id: 'interceptor-s2',
        timestampStart: 13,
        timestampEnd: 26,
        title: 'Scene 2: Sniffing & Inspecting the Egress Stream',
        subtitle: 'Sentinel hooks kernel Binder transactions to trap outbound packets before they hit external antennas.',
        narrationVoiceover: 'The Sentinel Covert Interceptor inspects outgoing IPC Binder calls in real-time. It decodes the payload, flags the offending application package, and isolates the destination IP or telephone gateway.',
        visualGraphicType: 'packet_sniff_egress',
        keyPoints: [
          'Live packet inspector with decoded payload previews',
          'Identifies offending app package and destination server',
          'Calculates risk score and trigger condition'
        ]
      },
      {
        id: 'interceptor-s3',
        timestampStart: 26,
        timestampEnd: 40,
        title: 'Scene 3: Block, Quarantine, or Inject Decoy Data',
        subtitle: 'Sever malicious transmission sockets or feed synthetic white noise and false coordinates to confuse trackers.',
        narrationVoiceover: 'You have full tactical response options: tap Block to sever the socket, or tap Decoy to feed synthetic coordinates and audio noise to data harvesters. You control what leaves your device.',
        visualGraphicType: 'packet_sniff_egress',
        keyPoints: [
          'Block & Drop severs the socket or flushes the SMS queue',
          'Inject Decoy feeds false GPS coordinates (Null Island)',
          'Block All Queues executes an immediate panic flush'
        ]
      }
    ]
  },
  {
    id: 'clip-ammo-factory',
    title: 'Ammunition Factory: Defense Playbooks',
    codename: 'OP_BRIEFING_AMMO_03',
    category: 'Ammunition Factory',
    durationSeconds: 38,
    badge: 'AUTOMATED SOAR',
    description: 'How to forge and execute automated countermeasure playbooks developed as threats are identified on the web or by The Wisdom Sentinel.',
    targetFeature: 'Ammunition Factory Foundry',
    actionButtonText: 'Launch Ammunition Factory',
    actionButtonType: 'open_ammo',
    scenes: [
      {
        id: 'ammo-s1',
        timestampStart: 0,
        timestampEnd: 12,
        title: 'Scene 1: Threat Downlinks from Wisdom Sentinel',
        subtitle: 'New zero-day vulnerabilities detected worldwide are compiled into defensive countermeasure playbooks.',
        narrationVoiceover: 'As new threats emerge across the web, The Wisdom Sentinel Central Registry downlinks verified defensive playbooks directly into your Ammunition Factory.',
        visualGraphicType: 'ammo_forge_script',
        keyPoints: [
          'Synchronized with global Wisdom Sentinel intelligence',
          'Targets zero-day CVEs, rogue APs, and botnet C2 nodes',
          'Ready-to-deploy incident response playbooks'
        ]
      },
      {
        id: 'ammo-s2',
        timestampStart: 12,
        timestampEnd: 25,
        title: 'Scene 2: 1-Click Execution & Shell Integration',
        subtitle: 'Execute playbooks instantly as interactive buttons or dispatch them to autonomous agents in the Synapse Shell.',
        narrationVoiceover: 'Every script can be executed with a single tap on the Run Button, generating live stdout logs. Alternatively, dispatch them through the Synapse Command Shell or assign them to agents like Aegis and Valkyrie.',
        visualGraphicType: 'ammo_forge_script',
        keyPoints: [
          'Run Button executes script with animated stdout logs',
          'Synapse Command Shell integration via voice or terminal',
          'Agent auto-deployment (Aegis, Valkyrie, Kronos, Synapse)'
        ]
      },
      {
        id: 'ammo-s3',
        timestampStart: 25,
        timestampEnd: 38,
        title: 'Scene 3: Forging Custom Countermeasures',
        subtitle: 'Compile custom threat rules, ARP isolation drop rules, and memory seals for specific targets.',
        narrationVoiceover: 'Need a custom defense? Tap Forge New Script to compile bespoke iptables drop rules, honeytoken canaries, or DNS sinkholes tailored to your network segment.',
        visualGraphicType: 'ammo_forge_script',
        keyPoints: [
          'Custom playbook compiler with CVE tagging',
          'Configurable agent assignment and script payloads',
          'Instant deployment to active defense queue'
        ]
      }
    ]
  },
  {
    id: 'clip-radar-defense',
    title: 'Physical Defense: 360° Radar & Covert Blackout',
    codename: 'OP_BRIEFING_PHYSICAL_04',
    category: 'Physical Security',
    durationSeconds: 36,
    badge: 'PHYSICAL AIR-GUARD',
    description: 'Master 150m RF geofencing, hardware tamper sensors, and the pitch-black Covert Screen-Off wiretap defense.',
    targetFeature: 'Physical Defense & Geofence',
    actionButtonText: 'View 360° Radar Hub',
    actionButtonType: 'open_radar',
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
        ]
      },
      {
        id: 'radar-s2',
        timestampStart: 12,
        timestampEnd: 24,
        title: 'Scene 2: Covert Screen-Off Blackout Mode',
        subtitle: 'Make your phone appear completely powered down while silently broadcasting encrypted telemetry.',
        narrationVoiceover: 'In physical custody situations, tap Blackout. The display turns pitch black, convincing captors the device is dead, while background encrypted GPS, audio, and optical sensors stream back to base.',
        visualGraphicType: 'radar_blackout_sensor',
        keyPoints: [
          'Simulated power-off deception mode',
          'Continuous encrypted GPS breadcrumb broadcasting',
          'Double-tap stealth unlock to restore display'
        ]
      },
      {
        id: 'radar-s3',
        timestampStart: 24,
        timestampEnd: 36,
        title: 'Scene 3: Hardware Anti-Tamper & Rapid-Fill Sanitize',
        subtitle: 'Accelerometer tripwires and cryptographically certified emergency flash sanitation.',
        narrationVoiceover: 'Armed anti-tamper sensors detect unlatched pick-ups and USB disconnection. For imminent physical breach, Rapid-Fill overwrites unallocated storage blocks with ChaCha20 random noise.',
        visualGraphicType: 'radar_blackout_sensor',
        keyPoints: [
          'Gyroscopic drop and unauthorized pick-up tripwire',
          'Emergency Rapid-Fill NAND flash overwrite',
          'Forensic certificate generation under FRE 902(14)'
        ]
      }
    ]
  }
];

import { InterceptedTransmission, TrueAirGapState, ProtocolType } from '../types/interceptor';

const INITIAL_INTERCEPTIONS: InterceptedTransmission[] = [
  {
    id: 'intercept-01',
    timestamp: '12:21:04',
    sourceApp: 'SocialConnect Live',
    sourcePackage: 'com.socialconnect.android.sdk',
    protocol: 'SMS',
    destination: '+1-800-555-0199 (Silent SMS PDU Gateway)',
    payloadSnippet: 'SMS-SUB: [BASE64: SU1FST04OTM4MjAxOTI4MzgxOTk7Q09PUkRTPTM3Ljc3LC0xMjIuNDFd]',
    dataSizeKb: 0.16,
    riskLevel: 'CRITICAL',
    status: 'intercepted',
    dataType: 'Silent SMS Beacon',
    detectionTrigger: 'SmsManager.sendTextMessage() invoked from background service with null notification'
  },
  {
    id: 'intercept-02',
    timestamp: '12:20:48',
    sourceApp: 'SmartFlashlight Pro',
    sourcePackage: 'com.utility.brightflash.tool',
    protocol: 'AUDIO_MIC',
    destination: 'https://exfil-collector.adtracking-cdn.xyz/v2/stream',
    payloadSnippet: 'RTP_CHUNK: 48kHz PCM ambient mic audio buffer (2048 samples) [Acoustic Hash: 0x88F2...]',
    dataSizeKb: 124.5,
    riskLevel: 'CRITICAL',
    status: 'intercepted',
    dataType: 'Ambient Audio Stream',
    detectionTrigger: 'AudioRecord.read() active while screen is off and app has no active foreground service'
  },
  {
    id: 'intercept-03',
    timestamp: '12:19:15',
    sourceApp: 'FreeScanner Document Tool',
    sourcePackage: 'com.scanner.docpdf.ocr',
    protocol: 'CAMERA_OPTIC',
    destination: 'https://api.ocr-cloud-storage.ru/upload/stealth',
    payloadSnippet: 'JPEG Frame: Front-facing camera optical burst 640x480 (Stealth capture without preview)',
    dataSizeKb: 382.0,
    riskLevel: 'CRITICAL',
    status: 'blocked',
    dataType: 'Stealth Snapshot',
    detectionTrigger: 'CameraDevice.createCaptureSession() initialized without SurfaceView attachment'
  },
  {
    id: 'intercept-04',
    timestamp: '12:18:02',
    sourceApp: 'Fitness Step Sync',
    sourcePackage: 'com.fitness.tracker.health',
    protocol: 'GPS_TELEMETRY',
    destination: 'https://telemetry.adnetwork-broker.com/geo',
    payloadSnippet: 'JSON: {"imei":"359281...","bssid_list":["00:1A:2B:3C:4D:5E","70:3A:0E:11:22:33"],"lat":37.7749,"lng":-122.4194}',
    dataSizeKb: 4.2,
    riskLevel: 'HIGH',
    status: 'intercepted',
    dataType: 'Personal Network Data',
    detectionTrigger: 'LocationListener continuous GPS polling combined with WifiManager.getScanResults()'
  },
  {
    id: 'intercept-05',
    timestamp: '12:15:30',
    sourceApp: 'System Diagnostics & Battery',
    sourcePackage: 'com.sys.batteryoptimizer.clean',
    protocol: 'CELLULAR_DATA',
    destination: 'http://185.220.101.5:8080/device_fingerprint',
    payloadSnippet: 'RAW_SOCKET: IMSI, Serial Number, Installed App Package List (84 packages mapped)',
    dataSizeKb: 48.6,
    riskLevel: 'HIGH',
    status: 'quarantined',
    dataType: 'Personal Network Data',
    detectionTrigger: 'PackageManager.getInstalledPackages() scraped and dispatched to unencrypted HTTP raw socket'
  }
];

class DataInterceptorService {
  private interceptions: InterceptedTransmission[] = INITIAL_INTERCEPTIONS;
  private airGapState: TrueAirGapState = {
    isAirGapActive: false,
    radiosKilled: {
      cellularModem: false,
      wifiRadio: false,
      bluetoothBLE: false,
      gpsGnss: false,
      nfcUwb: false,
      audioHardwareMute: false
    },
    preventedLeaksCount: 4
  };

  private listeners: Array<() => void> = [];

  public getInterceptions(): InterceptedTransmission[] {
    return [...this.interceptions];
  }

  public getAirGapState(): TrueAirGapState {
    return { ...this.airGapState };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public blockTransmission(id: string) {
    const item = this.interceptions.find(i => i.id === id);
    if (item) {
      item.status = 'blocked';
      this.notify();
    }
  }

  public injectDecoyData(id: string) {
    const item = this.interceptions.find(i => i.id === id);
    if (item) {
      item.status = 'decoy_injected';
      item.payloadSnippet = `[SENTINEL-DECOY-INJECTED]: GPS={0.0000, 0.0000 (Null Island)}; AUDIO=Synthetic White Noise; IMEI=000000000000000; SMS=BLOCKED.`;
      this.notify();
    }
  }

  public quarantineApp(sourcePackage: string) {
    this.interceptions.forEach(item => {
      if (item.sourcePackage === sourcePackage) {
        item.status = 'quarantined';
      }
    });
    this.notify();
  }

  public blockAllTransmissions() {
    this.interceptions.forEach(item => {
      if (item.status === 'intercepted') {
        item.status = 'blocked';
      }
    });
    this.notify();
  }

  /**
   * TRUE AIR-GAP: 100% OFFLINE RADIO CUT
   * Unlike standard Airplane Mode, this forcefully disables:
   * 1. Cellular 5G/LTE Modem & Baseband (No SMS, calls, data)
   * 2. Wi-Fi (All bands: 2.4GHz, 5GHz, 6GHz)
   * 3. Bluetooth & BLE Beaconing (Zero peripheral tracking)
   * 4. GPS / GNSS Location Satellite Receivers
   * 5. NFC & Ultra-Wideband (UWB) Chips
   * 6. Hardware Microphone Mute tripwire
   */
  public toggleTrueAirGap(): TrueAirGapState {
    const nextState = !this.airGapState.isAirGapActive;

    this.airGapState = {
      isAirGapActive: nextState,
      activatedAt: nextState ? new Date().toTimeString().split(' ')[0] : undefined,
      radiosKilled: {
        cellularModem: nextState,
        wifiRadio: nextState,
        bluetoothBLE: nextState,
        gpsGnss: nextState,
        nfcUwb: nextState,
        audioHardwareMute: nextState
      },
      preventedLeaksCount: nextState
        ? this.airGapState.preventedLeaksCount + 3
        : this.airGapState.preventedLeaksCount
    };

    if (nextState) {
      // Auto-block any ongoing background attempts
      this.interceptions.forEach(i => {
        if (i.status === 'intercepted') {
          i.status = 'blocked';
        }
      });
    }

    this.notify();
    return { ...this.airGapState };
  }
}

export const dataInterceptorService = new DataInterceptorService();

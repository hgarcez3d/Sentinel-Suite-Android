export type ProtocolType = 'SMS' | 'AUDIO_MIC' | 'CAMERA_OPTIC' | 'CELLULAR_DATA' | 'GPS_TELEMETRY' | 'BLE_BEACON';

export interface InterceptedTransmission {
  id: string;
  timestamp: string;
  sourceApp: string;
  sourcePackage: string;
  protocol: ProtocolType;
  destination: string;
  payloadSnippet: string;
  dataSizeKb: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'SUSPICIOUS';
  status: 'intercepted' | 'blocked' | 'quarantined' | 'decoy_injected';
  dataType: 'Personal Network Data' | 'Ambient Audio Stream' | 'Stealth Snapshot' | 'Silent SMS Beacon' | 'GPS Coordinates';
  detectionTrigger: string;
}

export interface TrueAirGapState {
  isAirGapActive: boolean;
  activatedAt?: string;
  radiosKilled: {
    cellularModem: boolean;
    wifiRadio: boolean;
    bluetoothBLE: boolean;
    gpsGnss: boolean;
    nfcUwb: boolean;
    audioHardwareMute: boolean;
  };
  preventedLeaksCount: number;
}

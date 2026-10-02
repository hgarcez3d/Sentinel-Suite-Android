import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sentinel.security',
  appName: 'Sentinel AI Suite',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

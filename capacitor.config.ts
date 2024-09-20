import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.tar',
  appName: 'Tar',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;


export const Config = {
  apiKey: process.env.API_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
  isSandbox: !window.location.protocol.includes('capacitor'),
  platform: (window as any).Capacitor?.getPlatform() || 'web',
};


export const Config = {
  // Directly use the environment variable. 
  // We trim and sanitize to ensure common build-tool placeholders don't leak.
  apiKey: (function() {
    const key = process.env.API_KEY;
    if (!key || typeof key !== 'string' || key.includes('process.env') || key === 'undefined') {
      return '';
    }
    return key.trim().replace(/['"]+/g, '');
  })(),
  isProduction: process.env.NODE_ENV === 'production',
  isSandbox: !window.location.protocol.includes('capacitor'),
  platform: (window as any).Capacitor?.getPlatform() || 'web',
};


export const Config = {
  // Directly use the environment variable. 
  // We trim and sanitize to ensure common build-tool placeholders don't leak.
  apiKey: (function() {
    try {
      let key = '';
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        key = process.env.API_KEY;
      }
      
      if (!key || typeof key !== 'string' || key.includes('process.env') || key === 'undefined') {
        return '';
      }
      return key.trim().replace(/['"]+/g, '');
    } catch (e) {
      return '';
    }
  })(),
  mapboxToken: (function() {
     try {
       if (typeof process !== 'undefined' && process.env && process.env.MAPBOX_TOKEN) {
         return process.env.MAPBOX_TOKEN;
       }
     } catch (e) {}
     // Default public token for demo purposes only
     return "pk.eyJ1IjoiYmljYWQiLCJhIjoiY203eGgwdm82MDV1ZzJrc2U5Z2R2eWw1dyJ9.dummy";
  })(),
  isProduction: (function() {
    try {
      return typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';
    } catch (e) {
      return false;
    }
  })(),
  isSandbox: true,
  platform: (window as any).Capacitor?.getPlatform() || 'web',
};

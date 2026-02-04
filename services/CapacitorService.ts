
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

export const CapacitorService = {
  async getCurrentLocation() {
    try {
      // Try Capacitor first
      const coordinates = await Geolocation.getCurrentPosition();
      return coordinates;
    } catch (e) {
      console.warn('Capacitor Geolocation failed, trying web fallback...', e);
      // Fallback to Web Geolocation API
      return new Promise((resolve) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  altitude: position.coords.altitude,
                  altitudeAccuracy: position.coords.altitudeAccuracy,
                  heading: position.coords.heading,
                  speed: position.coords.speed
                },
                timestamp: position.timestamp
              });
            },
            (error) => {
              console.error("Web Geolocation error:", error);
              resolve(null);
            }
          );
        } else {
          resolve(null);
        }
      });
    }
  },

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt
      });
      return `data:image/jpeg;base64,${image.base64String}`;
    } catch (e) {
      console.warn('Capacitor Camera failed. In a real environment, check permissions.', e);
      return null;
    }
  },

  /**
   * Triggers haptic feedback.
   * Implementation is currently disabled to ensure silent interaction as requested.
   */
  async triggerHaptic() {
    // Disabled to ensure no sound/vibration feedback during clicks
    return;
  },

  async initStatusBar() {
    try {
      if (StatusBar && typeof StatusBar.setStyle === 'function') {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#101622' });
      }
    } catch (e) {
      // Ignore if not on mobile
    }
  }
};

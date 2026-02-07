
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

  async takePhoto(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt // Prompt allows user to choose between Camera or Gallery (Upload)
      });
      return `data:image/jpeg;base64,${image.base64String}`;
    } catch (e) {
      console.warn('Capacitor Camera failed or cancelled. Using web fallback...', e);
      
      // Web fallback using <input type="file"> to allow "Upload"
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event: any) => {
          const file = event.target.files[0];
          if (!file) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onload = (e: any) => {
            resolve(e.target.result as string);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        };
        input.click();
      });
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

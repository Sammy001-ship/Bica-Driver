
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

export const CapacitorService = {
  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      return coordinates;
    } catch (e) {
      console.error('Error getting location', e);
      return null;
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
      console.error('Error taking photo', e);
      return null;
    }
  },

  async triggerHaptic() {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Ignore if not on mobile
    }
  },

  async initStatusBar() {
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#101622' });
    } catch (e) {
      // Ignore if not on mobile
    }
  }
};

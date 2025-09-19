import { hasNativeModuleSupport } from '../utils/platform';

class HapticsService {
  private static instance: HapticsService;

  public static getInstance(): HapticsService {
    if (!HapticsService.instance) {
      HapticsService.instance = new HapticsService();
    }
    return HapticsService.instance;
  }

  public async impactAsync(style: 'Light' | 'Medium' | 'Heavy' = 'Light'): Promise<void> {
    if (!hasNativeModuleSupport()) {
      console.log(`[HapticsService] Impact feedback (${style}) - not available in current environment`);
      return;
    }

    try {
      const Haptics = await import('expo-haptics');
      const ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle;
      
      let feedbackStyle;
      switch (style) {
        case 'Light':
          feedbackStyle = ImpactFeedbackStyle.Light;
          break;
        case 'Medium':
          feedbackStyle = ImpactFeedbackStyle.Medium;
          break;
        case 'Heavy':
          feedbackStyle = ImpactFeedbackStyle.Heavy;
          break;
        default:
          feedbackStyle = ImpactFeedbackStyle.Light;
      }

      await Haptics.impactAsync(feedbackStyle);
    } catch (error) {
      console.log('[HapticsService] Haptic feedback not available:', error);
    }
  }

  public async notificationAsync(type: 'Success' | 'Warning' | 'Error' = 'Success'): Promise<void> {
    if (!hasNativeModuleSupport()) {
      console.log(`[HapticsService] Notification feedback (${type}) - not available in current environment`);
      return;
    }

    try {
      const Haptics = await import('expo-haptics');
      const NotificationFeedbackType = Haptics.NotificationFeedbackType;
      
      let feedbackType;
      switch (type) {
        case 'Success':
          feedbackType = NotificationFeedbackType.Success;
          break;
        case 'Warning':
          feedbackType = NotificationFeedbackType.Warning;
          break;
        case 'Error':
          feedbackType = NotificationFeedbackType.Error;
          break;
        default:
          feedbackType = NotificationFeedbackType.Success;
      }

      await Haptics.notificationAsync(feedbackType);
    } catch (error) {
      console.log('[HapticsService] Notification feedback not available:', error);
    }
  }
}

export default HapticsService;

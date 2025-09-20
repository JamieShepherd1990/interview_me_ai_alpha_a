import { hasNativeModuleSupport } from '../utils/platform';

interface VoiceResult {
  value?: string[];
}

class VoiceService {
  private static instance: VoiceService;
  private isListening = false;
  private mockTranscript = "This is a mock transcript for testing in environments without native voice support.";

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  public async startListening(): Promise<boolean> {
    if (!hasNativeModuleSupport()) {
      console.log('[VoiceService] Voice recognition not available - using mock implementation');
      this.isListening = true;
      
      // Simulate voice recognition after 3 seconds
      setTimeout(() => {
        if (this.onSpeechResults) {
          this.onSpeechResults({ value: [this.mockTranscript] } as VoiceResult);
        }
        this.isListening = false;
      }, 3000);
      
      return true;
    }

    try {
      // const Voice = await import('@react-native-voice/voice');
      
      Voice.default.onSpeechStart = this.onSpeechStart?.bind(this);
      Voice.default.onSpeechEnd = this.onSpeechEnd?.bind(this);
      Voice.default.onSpeechResults = this.onSpeechResults?.bind(this);
      Voice.default.onSpeechPartialResults = this.onSpeechPartialResults?.bind(this);
      Voice.default.onSpeechError = this.onSpeechError?.bind(this);

      await Voice.default.start('en-US');
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('[VoiceService] Error starting voice recognition:', error);
      return false;
    }
  }

  public async stopListening(): Promise<boolean> {
    if (!hasNativeModuleSupport()) {
      console.log('[VoiceService] Stopping mock voice recognition');
      this.isListening = false;
      return true;
    }

    try {
      // const Voice = await import('@react-native-voice/voice');
      await Voice.default.stop();
      this.isListening = false;
      return true;
    } catch (error) {
      console.error('[VoiceService] Error stopping voice recognition:', error);
      return false;
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  // Event handlers - can be set by consuming components
  public onSpeechStart?: (event: any) => void;
  public onSpeechEnd?: (event: any) => void;
  public onSpeechResults?: (event: VoiceResult) => void;
  public onSpeechPartialResults?: (event: VoiceResult) => void;
  public onSpeechError?: (event: any) => void;

  public async destroy(): Promise<void> {
    if (!hasNativeModuleSupport()) {
      this.isListening = false;
      return;
    }

    try {
      // const Voice = await import('@react-native-voice/voice');
      await Voice.default.destroy();
    } catch (error) {
      console.error('[VoiceService] Error destroying voice service:', error);
    }
  }
}

export default VoiceService;

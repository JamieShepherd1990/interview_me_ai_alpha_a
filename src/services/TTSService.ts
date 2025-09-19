import { Audio } from 'expo-av';
import { VisemeEvent } from '../lib/schemas';

class TTSService {
  private static instance: TTSService;
  private currentSound: Audio.Sound | null = null;
  private isPlaying = false;
  private visemeCallback: ((visemes: VisemeEvent[]) => void) | null = null;

  private constructor() {
    this.setupAudio();
  }

  public static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  private async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  }

  public setVisemeCallback(callback: (visemes: VisemeEvent[]) => void) {
    this.visemeCallback = callback;
  }

  public async playAudio(audioUrl: string, visemes: VisemeEvent[] = []): Promise<boolean> {
    try {
      // Stop any currently playing audio
      await this.stopAudio();

      // Create new sound object
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      this.currentSound = sound;
      this.isPlaying = true;

      // Set up playback status update listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.isPlaying = false;
        }
      });

      // Emit viseme events for lip-sync
      if (this.visemeCallback && visemes.length > 0) {
        this.emitVisemeEvents(visemes);
      }

      return true;
    } catch (error) {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
      return false;
    }
  }

  public async stopAudio(): Promise<boolean> {
    try {
      if (this.currentSound) {
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }
      this.isPlaying = false;
      return true;
    } catch (error) {
      console.error('Error stopping audio:', error);
      return false;
    }
  }

  public async pauseAudio(): Promise<boolean> {
    try {
      if (this.currentSound && this.isPlaying) {
        await this.currentSound.pauseAsync();
        this.isPlaying = false;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error pausing audio:', error);
      return false;
    }
  }

  public async resumeAudio(): Promise<boolean> {
    try {
      if (this.currentSound && !this.isPlaying) {
        await this.currentSound.playAsync();
        this.isPlaying = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resuming audio:', error);
      return false;
    }
  }

  private emitVisemeEvents(visemes: VisemeEvent[]) {
    if (!this.visemeCallback) return;

    visemes.forEach((viseme, index) => {
      setTimeout(() => {
        if (this.visemeCallback) {
          this.visemeCallback([viseme]);
        }
      }, viseme.timestamp * 1000);
    });
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  public async destroy(): Promise<void> {
    try {
      await this.stopAudio();
    } catch (error) {
      console.error('Error destroying TTS service:', error);
    }
  }
}

export default TTSService;

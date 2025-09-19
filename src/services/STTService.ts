import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { AppDispatch } from '../store';

class STTService {
  private static instance: STTService;
  private dispatch: AppDispatch | null = null;
  private isListening = false;

  private constructor() {
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }

  public static getInstance(): STTService {
    if (!STTService.instance) {
      STTService.instance = new STTService();
    }
    return STTService.instance;
  }

  public setDispatch(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  private onSpeechStart() {
    console.log('Speech recognition started');
    this.isListening = true;
  }

  private onSpeechEnd() {
    console.log('Speech recognition ended');
    this.isListening = false;
  }

  private onSpeechResults(event: SpeechResultsEvent) {
    console.log('Speech results:', event.value);
    if (this.dispatch && event.value && event.value.length > 0) {
      // Update transcript with final results
      this.dispatch({
        type: 'session/updateTranscript',
        payload: event.value[0],
      });
    }
  }

  private onSpeechPartialResults(event: SpeechResultsEvent) {
    console.log('Partial speech results:', event.value);
    if (this.dispatch && event.value && event.value.length > 0) {
      // Update transcript with partial results for real-time feedback
      this.dispatch({
        type: 'session/updateTranscript',
        payload: event.value[0],
      });
    }
  }

  private onSpeechError(event: SpeechErrorEvent) {
    console.error('Speech recognition error:', event.error);
    this.isListening = false;
  }

  public async startListening(): Promise<boolean> {
    try {
      if (this.isListening) {
        return true;
      }

      const available = await Voice.isAvailable();
      if (!available) {
        console.error('Speech recognition not available');
        return false;
      }

      await Voice.start('en-US');
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }

  public async stopListening(): Promise<boolean> {
    try {
      if (!this.isListening) {
        return true;
      }

      await Voice.stop();
      this.isListening = false;
      return true;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      return false;
    }
  }

  public async destroy(): Promise<void> {
    try {
      await Voice.destroy();
      this.isListening = false;
    } catch (error) {
      console.error('Error destroying speech recognition:', error);
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export default STTService;
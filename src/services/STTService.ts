import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { AppDispatch } from '../store';
import { updatePartialTranscript, finalizeTranscriptEntry, setRecording } from '../store/slices/sessionSlice';

export class STTService {
  private static instance: STTService;
  private dispatch: AppDispatch | null = null;
  private isListening = false;
  private partialText = '';
  private lastPartialTime = 0;
  private readonly PARTIAL_INTERVAL = 300; // 300ms as specified

  private constructor() {
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }

  static getInstance(): STTService {
    if (!STTService.instance) {
      STTService.instance = new STTService();
    }
    return STTService.instance;
  }

  setDispatch(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  async startListening(): Promise<boolean> {
    try {
      if (this.isListening) return true;
      
      await Voice.start('en-US', {
        PARTIAL_RESULTS: true,
        EXTRA_PARTIAL_RESULTS: true,
      });
      
      this.isListening = true;
      this.dispatch?.(setRecording(true));
      return true;
    } catch (error) {
      console.error('STT Start Error:', error);
      return false;
    }
  }

  async stopListening(): Promise<boolean> {
    try {
      if (!this.isListening) return true;
      
      await Voice.stop();
      this.isListening = false;
      this.dispatch?.(setRecording(false));
      
      // Finalize any remaining partial text
      if (this.partialText.trim()) {
        this.dispatch?.(finalizeTranscriptEntry({
          text: this.partialText.trim(),
          speaker: 'user'
        }));
        this.partialText = '';
      }
      
      return true;
    } catch (error) {
      console.error('STT Stop Error:', error);
      return false;
    }
  }

  private onSpeechStart() {
    console.log('Speech started');
    this.partialText = '';
    this.lastPartialTime = Date.now();
  }

  private onSpeechEnd() {
    console.log('Speech ended');
    this.isListening = false;
    this.dispatch?.(setRecording(false));
  }

  private onSpeechPartialResults(e: SpeechResultsEvent) {
    const text = e.value?.[0] || '';
    const now = Date.now();
    
    // Update partial transcript every 300ms as specified
    if (now - this.lastPartialTime >= this.PARTIAL_INTERVAL) {
      this.partialText = text;
      this.dispatch?.(updatePartialTranscript({
        text,
        speaker: 'user'
      }));
      this.lastPartialTime = now;
    }
  }

  private onSpeechResults(e: SpeechResultsEvent) {
    const text = e.value?.[0] || '';
    if (text.trim()) {
      this.dispatch?.(finalizeTranscriptEntry({
        text: text.trim(),
        speaker: 'user'
      }));
    }
    this.partialText = '';
  }

  private onSpeechError(e: SpeechErrorEvent) {
    console.error('Speech Error:', e.error);
    this.isListening = false;
    this.dispatch?.(setRecording(false));
  }

  async destroy() {
    try {
      await Voice.destroy();
      this.isListening = false;
    } catch (error) {
      console.error('STT Destroy Error:', error);
    }
  }
}

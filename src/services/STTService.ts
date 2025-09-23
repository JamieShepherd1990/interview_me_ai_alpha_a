import Voice, { 
  SpeechResultsEvent, 
  SpeechErrorEvent, 
  SpeechStartEvent,
  SpeechEndEvent 
} from '@react-native-voice/voice';
import * as Haptics from 'expo-haptics';
import { AppDispatch } from '../store';
import { updateTranscript, appendTranscript, setListening } from '../store/slices/sessionSlice';
import TTSService from './TTSService';

interface STTConfig {
  partialResultsEnabled: boolean;
  streamingInterval: number; // ms
  silenceTimeout: number; // ms
  bargeInThreshold: number; // confidence threshold for barge-in
}

class STTService {
  private static instance: STTService;
  private dispatch: AppDispatch | null = null;
  private isListening = false;
  private partialTranscript = '';
  private finalTranscript = '';
  private streamingTimer: NodeJS.Timeout | null = null;
  private silenceTimer: NodeJS.Timeout | null = null;
  private lastPartialResult = '';
  private bargeInCallback: (() => void) | null = null;
  
  private config: STTConfig = {
    partialResultsEnabled: true,
    streamingInterval: 300, // Stream every 300ms for low latency
    silenceTimeout: 2000, // 2 seconds of silence before stopping
    bargeInThreshold: 0.7, // Confidence threshold for interruption
  };

  private constructor() {
    this.initializeVoice();
  }

  public static getInstance(): STTService {
    if (!STTService.instance) {
      STTService.instance = new STTService();
    }
    return STTService.instance;
  }

  private initializeVoice() {
    // Set up voice recognition event handlers
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
  }

  public setDispatch(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  public setBargeInCallback(callback: () => void) {
    this.bargeInCallback = callback;
  }

  public async startListening(): Promise<boolean> {
    try {
      if (this.isListening) {
        await this.stopListening();
      }

      // Clear previous state
      this.partialTranscript = '';
      this.finalTranscript = '';
      this.lastPartialResult = '';

      // Check if Voice is available
      if (!Voice) {
        console.error('Voice module not available');
        return false;
      }

      // Start voice recognition with optimized settings
      await Voice.start('en-US', {
        PARTIAL_RESULTS: true,
        EXTRA_PARTIAL_RESULTS: true,
      });

      this.isListening = true;
      this.dispatch?.(setListening(true));

      // Start streaming timer for real-time updates
      this.startStreamingTimer();

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('Voice recognition started successfully');
      return true;

    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.isListening = false;
      this.dispatch?.(setListening(false));
      
      // Show user-friendly error message
      if (this.dispatch) {
        // You could dispatch an error action here if you have one
        console.log('Voice recognition failed - check microphone permissions');
      }
      
      return false;
    }
  }

  public async stopListening(): Promise<boolean> {
    try {
      await Voice.stop();
      this.isListening = false;
      this.dispatch?.(setListening(false));
      
      this.clearTimers();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      return true;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      return false;
    }
  }

  private startStreamingTimer() {
    this.streamingTimer = setInterval(() => {
      if (this.partialTranscript && this.partialTranscript !== this.lastPartialResult) {
        this.streamPartialResult(this.partialTranscript);
        this.lastPartialResult = this.partialTranscript;
      }
    }, this.config.streamingInterval);
  }

  private async streamPartialResult(text: string) {
    try {
      // Stream partial results to backend for real-time processing
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partialTranscript: text,
          isPartial: true,
        }),
      });

      if (response.ok) {
        // Backend can start processing while user is still speaking
        console.log('Streamed partial result:', text);
      }
    } catch (error) {
      console.error('Error streaming partial result:', error);
    }
  }

  private onSpeechStart = (event: any) => {
    console.log('Speech started');
    
    // Detect barge-in: user started speaking while AI is talking
    const ttsService = TTSService.getInstance();
    if (ttsService.isCurrentlyPlaying() || ttsService.isCurrentlyStreaming()) {
      console.log('Barge-in detected!');
      ttsService.bargeIn(); // Immediately stop AI speech
      this.bargeInCallback?.();
    }

    this.clearSilenceTimer();
  };

  private onSpeechEnd = (event: any) => {
    console.log('Speech ended');
    this.startSilenceTimer();
  };

  private onSpeechResults = (event: any) => {
    const results = event.value || [];
    console.log('Speech results received:', results);
    
    if (results.length > 0) {
      this.finalTranscript = results[0];
      console.log('Final transcript:', this.finalTranscript);
      
      // Update Redux store with final transcript
      this.dispatch?.(updateTranscript(this.finalTranscript));
      this.dispatch?.(appendTranscript(`\nUser: ${this.finalTranscript}`));
      
      // Process final result
      this.processFinalResult(this.finalTranscript);
    } else {
      console.log('No speech results received');
    }
  };

  private onSpeechPartialResults = (event: any) => {
    const results = event.value || [];
    if (results.length > 0) {
      this.partialTranscript = results[0];
      console.log('Partial result:', this.partialTranscript);
      
      // Update UI with partial transcript for real-time feedback
      this.dispatch?.(updateTranscript(this.partialTranscript));
      
      // Reset silence timer on new speech
      this.clearSilenceTimer();
      this.startSilenceTimer();
    }
  };

  private onSpeechError = (event: any) => {
    console.error('Speech recognition error:', event.error);
    this.isListening = false;
    this.dispatch?.(setListening(false));
    this.clearTimers();
  };

  private onSpeechVolumeChanged = (event: any) => {
    // Could be used for visual feedback (volume indicators)
    const volume = event.value;
    console.log('Speech volume:', volume);
  };

  private async processFinalResult(text: string) {
    try {
      // Send final transcript to backend for AI processing
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://interview-c3gu77xyq-jamies-projects-c3ccf727.vercel.app';
      console.log('Calling API:', `${apiUrl}/api/chat`);
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': process.env.EXPO_PUBLIC_VERCEL_BYPASS_TOKEN || '6ZOXLEs9hp1hPovTicTHrbJcW0yRENmt'
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: text }
          ],
          role: 'Software Engineer', // Should come from session state
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('AI Response received:', data);
        
        // Update transcript with AI response
        this.dispatch?.(appendTranscript(`\nAI: ${data.content}`));
        
        // Start TTS for AI response with low latency
        const ttsService = TTSService.getInstance();
        console.log('Starting TTS for:', data.content);
        const ttsSuccess = await ttsService.playAudioFromAPI(data.content);
        console.log('TTS result:', ttsSuccess);
      } else {
        console.error('AI API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('API error response:', errorText);
      }

    } catch (error) {
      console.error('Error processing final result:', error);
    }
  }

  private startSilenceTimer() {
    this.silenceTimer = setTimeout(() => {
      console.log('Silence timeout - stopping listening');
      this.stopListening();
    }, this.config.silenceTimeout);
  }

  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private clearTimers() {
    if (this.streamingTimer) {
      clearInterval(this.streamingTimer);
      this.streamingTimer = null;
    }
    this.clearSilenceTimer();
  }

  public updateConfig(newConfig: Partial<STTConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): STTConfig {
    return { ...this.config };
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  public getCurrentTranscript(): string {
    return this.finalTranscript;
  }

  public getCurrentPartialTranscript(): string {
    return this.partialTranscript;
  }

  public async destroy(): Promise<void> {
    try {
      await this.stopListening();
      await Voice.destroy();
      this.clearTimers();
    } catch (error) {
      console.error('Error destroying STT service:', error);
    }
  }
}

export default STTService;
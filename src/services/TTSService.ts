import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { VisemeEvent } from '../lib/schemas';

interface TTSQueueItem {
  text: string;
  priority: 'high' | 'normal';
  onComplete?: () => void;
}

class TTSService {
  private static instance: TTSService;
  private currentSound: Audio.Sound | null = null;
  private isPlaying = false;
  private visemeCallback: ((visemes: VisemeEvent[]) => void) | null = null;
  private queue: TTSQueueItem[] = [];
  private isProcessingQueue = false;
  private websocket: WebSocket | null = null;
  private audioChunks: string[] = [];
  private isStreaming = false;
  private bargeInCallback: (() => void) | null = null;

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

  public setBargeInCallback(callback: () => void) {
    this.bargeInCallback = callback;
  }

  // Real-time streaming TTS for low latency
  public async streamAudio(text: string): Promise<void> {
    try {
      this.isStreaming = true;
      this.audioChunks = [];

      // Initialize WebSocket connection to backend for streaming
      const wsUrl = `${process.env.EXPO_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:3000'}/ws/tts`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('TTS WebSocket connected');
        this.websocket?.send(JSON.stringify({
          action: 'stream_tts',
          text,
          voiceId: 'pNInz6obpgDQGcFmaJgB',
          settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          }
        }));
      };

      this.websocket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'audio_chunk') {
            // Buffer audio chunks for smooth playback
            this.audioChunks.push(data.audio);
            
            // Start playback when we have enough buffered audio (~200ms)
            if (this.audioChunks.length === 1 && !this.isPlaying) {
              await this.playBufferedAudio();
            }
          } else if (data.type === 'viseme') {
            // Real-time viseme events for lip-sync
            if (this.visemeCallback) {
              this.visemeCallback([data.viseme]);
            }
          } else if (data.type === 'complete') {
            this.isStreaming = false;
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        } catch (error) {
          console.error('Error processing TTS stream:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('TTS WebSocket error:', error);
        this.isStreaming = false;
      };

    } catch (error) {
      console.error('Error starting TTS stream:', error);
      this.isStreaming = false;
    }
  }

  private async playBufferedAudio() {
    if (this.audioChunks.length === 0) return;

    try {
      // Convert base64 chunks to playable audio
      const audioData = this.audioChunks.join('');
      const audioUrl = `data:audio/mpeg;base64,${audioData}`;

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, isLooping: false }
      );

      this.currentSound = sound;
      this.isPlaying = true;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.isPlaying = false;
          // Continue with next buffered chunks
          if (this.isStreaming && this.audioChunks.length > 0) {
            this.audioChunks.shift(); // Remove played chunk
            setTimeout(() => this.playBufferedAudio(), 50);
          }
        }
      });

    } catch (error) {
      console.error('Error playing buffered audio:', error);
    }
  }

  public async addToQueue(text: string, priority: 'high' | 'normal' = 'normal', onComplete?: () => void): Promise<void> {
    const item: TTSQueueItem = { text, priority, onComplete };
    
    if (priority === 'high') {
      this.queue.unshift(item);
    } else {
      this.queue.push(item);
    }

    if (!this.isProcessingQueue) {
      await this.processQueue();
    }
  }

  // Simple method for STT service to call
  public async playAudioFromAPI(text: string): Promise<boolean> {
    try {
      console.log('Requesting TTS for text:', text);
      
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://interview-c3gu77xyq-jamies-projects-c3ccf727.vercel.app';
      console.log('Calling TTS API:', `${apiUrl}/api/tts`);
      const response = await fetch(`${apiUrl}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.error('TTS API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('TTS API error response:', errorText);
        return false;
      }

      const data = await response.json();
      console.log('TTS response received:', data);

      // Convert base64 audio to data URL
      const audioUrl = `data:audio/mpeg;base64,${data.audio}`;
      console.log('Playing audio from URL:', audioUrl.substring(0, 50) + '...');
      return await this.playAudio(audioUrl, []);

    } catch (error) {
      console.error('Error playing audio from API:', error);
      return false;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.queue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        await this.synthesizeAndPlay(item.text);
        item.onComplete?.();
      }
    }

    this.isProcessingQueue = false;
  }

  private async synthesizeAndPlay(text: string): Promise<void> {
    try {
      // Use regular API for non-streaming requests
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://interview-c3gu77xyq-jamies-projects-c3ccf727.vercel.app';
      console.log('Calling TTS API:', `${apiUrl}/api/tts`);
      const response = await fetch(`${apiUrl}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('TTS API error');

      const data = await response.json();
      
      // Convert base64 audio to data URL
      const audioUrl = `data:audio/mpeg;base64,${data.audio}`;
      await this.playAudio(audioUrl, []);

    } catch (error) {
      console.error('Error in synthesizeAndPlay:', error);
    }
  }

  public async playAudio(audioUrl: string, visemes: VisemeEvent[] = []): Promise<boolean> {
    try {
      await this.stopAudio();

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      this.currentSound = sound;
      this.isPlaying = true;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.isPlaying = false;
        }
      });

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

  // Immediate stop for barge-in scenarios
  public async bargeIn(): Promise<void> {
    try {
      // Stop current audio immediately
      await this.stopAudio();
      
      // Clear queue
      this.queue = [];
      this.isProcessingQueue = false;
      
      // Close streaming connection
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }
      
      this.isStreaming = false;
      this.audioChunks = [];
      
      // Trigger barge-in callback
      this.bargeInCallback?.();
      
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
    } catch (error) {
      console.error('Error during barge-in:', error);
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

    visemes.forEach((viseme) => {
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

  public isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }

  public clearQueue(): void {
    this.queue = [];
  }

  public async destroy(): Promise<void> {
    try {
      await this.stopAudio();
      this.clearQueue();
      
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }
      
    } catch (error) {
      console.error('Error destroying TTS service:', error);
    }
  }
}

export default TTSService;
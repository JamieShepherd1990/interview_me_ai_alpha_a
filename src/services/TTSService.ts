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

      // Try API first, fallback to local TTS if it fails
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://interviewme-lilac.vercel.app';
        console.log('Calling TTS API:', `${apiUrl}/api/tts`);
        const response = await fetch(`${apiUrl}/api/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-vercel-protection-bypass': process.env.EXPO_PUBLIC_VERCEL_BYPASS_TOKEN || '6ZOXLEs9hp1hPovTicTHrbJcW0yRENmt'
          },
          body: JSON.stringify({ text }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('TTS response received:', data);

          // Convert base64 audio to data URL
          const audioUrl = `data:audio/mpeg;base64,${data.audio}`;
          return await this.playAudioFromUrl(audioUrl);
        } else {
          console.log('TTS API failed, using fallback');
          throw new Error('API failed');
        }
      } catch (apiError) {
        console.log('TTS API error, retrying with different approach:', apiError);
        // Try direct ElevenLabs API call
        return await this.callElevenLabsDirectly(text);
      }

    } catch (error) {
      console.error('Error in playAudioFromAPI:', error);
      return false;
    }
  }

  private async callElevenLabsDirectly(text: string): Promise<boolean> {
    try {
      console.log('Calling ElevenLabs directly for text:', text);
      
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || 'your_elevenlabs_key_here',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
      
      return await this.playAudioFromUrl(audioUrl);
    } catch (error) {
      console.error('Direct ElevenLabs call failed:', error);
      // Final fallback to local TTS
      return await this.playAudioFromFallback(text);
    }
  }

  private async playAudioFromFallback(text: string): Promise<boolean> {
    try {
      console.log('Using fallback TTS for text:', text);
      
      // Use Expo Speech as fallback
      const { speak } = await import('expo-speech');
      
      return new Promise((resolve) => {
        speak(text, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
          onDone: () => {
            console.log('Fallback TTS completed');
            resolve(true);
          },
          onError: (error) => {
            console.error('Fallback TTS error:', error);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('Fallback TTS error:', error);
      return false;
    }
  }

  private async playAudioFromUrl(audioUrl: string): Promise<boolean> {
    try {
      console.log('Playing audio from URL:', audioUrl.substring(0, 50) + '...');
      return await this.playAudio(audioUrl, []);

    } catch (error) {
      console.error('Error playing audio from API:', error);
      return false;
    }
  }

  // Real-time streaming TTS for ChatGPT-like responsiveness
  public async startStreamingTTS(): Promise<void> {
    try {
      console.log('Starting streaming TTS session');
      this.isStreaming = true;
      this.audioChunks = [];
      
      // For now, we'll use the working TTS API instead of WebSocket
      // This ensures TTS actually works
      console.log('TTS streaming session started (using API fallback)');

    } catch (error) {
      console.error('Error starting streaming TTS:', error);
      this.isStreaming = false;
    }
  }

  public async streamTextToTTS(text: string): Promise<void> {
    if (!this.isStreaming) {
      console.log('TTS streaming not active');
      return;
    }

    try {
      console.log('Streaming text to TTS:', text);
      
      // Generate viseme events for lip-sync (no API call needed for visemes)
      if (this.visemeCallback) {
        const visemes = this.generateVisemes(text);
        console.log('Generated visemes for lip-sync:', visemes);
        this.visemeCallback(visemes);
      } else {
        console.log('No viseme callback set');
      }
      
      // For now, just simulate the audio without making API calls for every word
      // This prevents rate limiting and performance issues
      console.log('Simulating audio playback for:', text);
      
    } catch (error) {
      console.error('Error streaming text to TTS:', error);
    }
  }

  public generateVisemes(text: string): VisemeEvent[] {
    // Generate realistic viseme events for lip-sync
    const visemes: VisemeEvent[] = [];
    const words = text.split(' ');
    let currentTime = Date.now();
    
    words.forEach((word, index) => {
      // Generate multiple visemes per word for more realistic lip-sync
      const wordVisemes = this.getVisemesForWord(word);
      
      wordVisemes.forEach((viseme, visemeIndex) => {
        visemes.push({
          phoneme: viseme,
          timestamp: currentTime + (visemeIndex * 100), // 100ms per viseme
          duration: 100 // 100ms duration per viseme
        });
      });
      
      currentTime += word.length * 50; // Time based on word length
    });
    
    return visemes;
  }

  private getVisemesForWord(word: string): string[] {
    // Generate realistic viseme sequence for each word
    const lowerWord = word.toLowerCase();
    const visemes: string[] = [];
    
    // Start with mouth opening
    visemes.push('ah');
    
    // Generate visemes based on vowels and consonants
    for (let i = 0; i < lowerWord.length; i++) {
      const char = lowerWord[i];
      if ('aeiou'.includes(char)) {
        visemes.push('ah');
      } else if ('bcdfg'.includes(char)) {
        visemes.push('mm');
      } else if ('hjkl'.includes(char)) {
        visemes.push('ah');
      } else if ('mnp'.includes(char)) {
        visemes.push('mm');
      } else if ('qrst'.includes(char)) {
        visemes.push('ss');
      } else if ('vwxyz'.includes(char)) {
        visemes.push('ff');
      } else {
        visemes.push('ah');
      }
    }
    
    // End with mouth closing
    visemes.push('mm');
    
    return visemes;
  }

  public async finishStreamingTTS(): Promise<void> {
    try {
      if (this.isStreaming) {
        this.isStreaming = false;
        console.log('Finished streaming TTS');
      }
    } catch (error) {
      console.error('Error finishing streaming TTS:', error);
    }
  }

  // Barge-in methods for real-time interruption
  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  public isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }

  public async bargeIn(): Promise<void> {
    try {
      console.log('Barge-in: Stopping all audio immediately');
      
      // Stop current audio playback
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }
      
      // Stop streaming
      if (this.websocket && this.isStreaming) {
        this.websocket.close();
        this.websocket = null;
        this.isStreaming = false;
      }
      
      // Clear audio chunks
      this.audioChunks = [];
      this.isPlaying = false;
      
      console.log('Barge-in: Audio stopped successfully');
    } catch (error) {
      console.error('Error during barge-in:', error);
    }
  }

  public async stopCurrentAudio(): Promise<void> {
    await this.bargeIn();
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
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://interviewme-lilac.vercel.app';
      console.log('Calling TTS API:', `${apiUrl}/api/tts`);
      const response = await fetch(`${apiUrl}/api/tts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': process.env.EXPO_PUBLIC_VERCEL_BYPASS_TOKEN || '6ZOXLEs9hp1hPovTicTHrbJcW0yRENmt'
        },
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
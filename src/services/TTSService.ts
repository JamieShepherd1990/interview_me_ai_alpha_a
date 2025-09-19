import { VisemeEvent } from '../lib/schemas';

export class TTSService {
  private static instance: TTSService;
  private websocket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private visemeCallback: ((viseme: VisemeEvent) => void) | null = null;

  private constructor() {}

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  setVisemeCallback(callback: (viseme: VisemeEvent) => void) {
    this.visemeCallback = callback;
  }

  async initialize(): Promise<boolean> {
    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      return true;
    } catch (error) {
      console.error('TTS Initialization Error:', error);
      return false;
    }
  }

  async speak(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<boolean> {
    try {
      // Stop any current playback
      await this.stop();
      
      // Call backend TTS API
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API Error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioBuffer = await audioBlob.arrayBuffer();
      
      return this.playAudio(audioBuffer);
    } catch (error) {
      console.error('TTS Speak Error:', error);
      return false;
    }
  }

  private async playAudio(audioBuffer: ArrayBuffer): Promise<boolean> {
    try {
      if (!this.audioContext) {
        throw new Error('Audio context not initialized');
      }

      const audioData = await this.audioContext.decodeAudioData(audioBuffer.slice(0));
      const source = this.audioContext.createBufferSource();
      source.buffer = audioData;
      source.connect(this.audioContext.destination);
      
      this.isPlaying = true;
      
      source.onended = () => {
        this.isPlaying = false;
      };

      source.start(0);
      return true;
    } catch (error) {
      console.error('Audio Playback Error:', error);
      this.isPlaying = false;
      return false;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.suspend();
        await this.audioContext.resume();
      }
      this.isPlaying = false;
    } catch (error) {
      console.error('TTS Stop Error:', error);
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  async destroy(): Promise<void> {
    try {
      await this.stop();
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
    } catch (error) {
      console.error('TTS Destroy Error:', error);
    }
  }
}

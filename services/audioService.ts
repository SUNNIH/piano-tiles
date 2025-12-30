
import { Audio } from 'expo-av';

class AudioService {
  private sound: Audio.Sound | null = null;
  private audioContext: any = null;
  private sourceNode: any = null;

  constructor() {
    // Initialize AudioContext if in a browser environment to support Web components
    if (typeof window !== 'undefined') {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
  }

  /**
   * Initializes audio mode for mobile (Native/Expo)
   */
  async init() {
    if (Audio && typeof Audio.setAudioModeAsync === 'function') {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldRouteThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.warn('Failed to set audio mode', e);
      }
    }
  }

  /**
   * Loads audio from a URI. Returns an AudioBuffer for Web usage or null for Native.
   */
  async loadAudio(uri: string): Promise<any> {
    if (this.audioContext) {
      try {
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
      } catch (e) {
        console.error('Failed to load web audio', e);
        return null;
      }
    }

    if (this.sound) {
      await this.sound.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false, volume: 1.0 }
    );
    this.sound = sound;
    return null;
  }

  /**
   * Loads audio from a local File object (Web specific)
   */
  async loadAudioFromFile(file: any): Promise<any> {
    if (!this.audioContext) {
      throw new Error('AudioContext not available for file loading');
    }
    const arrayBuffer = await file.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  /**
   * Generates tiles based on audio duration or peaks.
   * Handles both numeric duration and AudioBuffer input.
   */
  analyzeAudioPeaks(input: any, bpm: number = 120): any[] {
    let durationMs = 0;
    
    // Check if input is an AudioBuffer or similar object with a duration property
    if (input && typeof input.duration === 'number') {
      durationMs = input.duration * 1000;
    } else if (typeof input === 'number') {
      durationMs = input;
    }

    const peaks = [];
    const interval = (60 / bpm) * 1000;
    for (let time = 0; time < durationMs; time += interval) {
      peaks.push({
        time: time / 1000,
        lane: Math.floor(Math.random() * 4),
        isLong: Math.random() > 0.8
      });
    }
    return peaks;
  }

  /**
   * Resumes the audio context (required by modern browsers)
   */
  async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Plays audio from a buffer (Web) or uses URI/Native sound object.
   */
  async playBuffer(bufferOrUri: any, delayMs: number = 0) {
    // Handle Web Audio API playback
    if (this.audioContext && bufferOrUri && typeof bufferOrUri !== 'string') {
      this.stop(); // Stop previous instance
      
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = bufferOrUri;
      this.sourceNode.connect(this.audioContext.destination);
      
      setTimeout(() => {
        if (this.sourceNode) {
          this.sourceNode.start();
        }
      }, delayMs);
      return;
    }

    // Handle Native/Legacy playback
    if (this.sound) {
      setTimeout(async () => {
        await this.sound?.playAsync();
      }, delayMs);
    }
  }

  /**
   * Stops all active audio playback
   */
  async stop(): Promise<void> {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
      } catch (e) {
        // Handle stop before start or double stop
      }
      this.sourceNode = null;
    }
    if (this.sound) {
      try {
        await this.sound.stopAsync();
      } catch (e) {}
    }
  }

  /**
   * Unloads resources
   */
  async unload() {
    await this.stop();
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

export const audioService = new AudioService();

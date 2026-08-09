const NOTE_FREQS: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  // Shorthands without octave default to 4th octave
  'C': 261.63, 'C#': 277.18, 'Db': 277.18, 'D': 293.66, 'D#': 311.13, 'Eb': 311.13, 'E': 329.63,
  'F': 349.23, 'F#': 369.99, 'Gb': 369.99, 'G': 392.00, 'G#': 415.30, 'Ab': 415.30, 'A': 440.00,
  'A#': 466.16, 'Bb': 466.16, 'B': 493.88
};

class AudioService {
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private playbackStartTime: number = 0;
  private pauseOffset: number = 0;
  private currentBuffer: AudioBuffer | null = null;
  private isCurrentlyPlaying: boolean = false;

  private getContext(): AudioContext {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.context = new AudioContextClass();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.85;

      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);
    }
    return this.context;
  }

  async resume() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn("AudioContext resume attempted:", err);
      }
    }
    return ctx;
  }

  getAnalyser(): AnalyserNode | null {
    this.getContext();
    return this.analyser;
  }

  async loadAudio(url: string): Promise<AudioBuffer> {
    const ctx = this.getContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  }

  async loadAudioFromFile(file: File): Promise<AudioBuffer> {
    const ctx = this.getContext();
    const arrayBuffer = await file.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  }

  async loadAudioFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    const ctx = this.getContext();
    // Use copy if needed because decodeAudioData detaches the buffer in some implementations
    const bufferCopy = arrayBuffer.slice(0);
    return await ctx.decodeAudioData(bufferCopy);
  }

  playBuffer(buffer: AudioBuffer | null, delay: number = 0) {
    this.stop();
    const ctx = this.getContext();
    this.currentBuffer = buffer;

    if (!buffer) {
      this.playbackStartTime = ctx.currentTime + delay;
      this.isCurrentlyPlaying = true;
      return;
    }

    try {
      this.source = ctx.createBufferSource();
      this.source.buffer = buffer;
      this.source.connect(this.analyser!);

      this.playbackStartTime = ctx.currentTime + delay;
      this.pauseOffset = 0;
      this.isCurrentlyPlaying = true;

      this.source.start(this.playbackStartTime);
    } catch (e) {
      console.warn("Error starting AudioBuffer source:", e);
      this.playbackStartTime = ctx.currentTime + delay;
      this.isCurrentlyPlaying = true;
    }
  }

  pause() {
    if (!this.isCurrentlyPlaying) return;
    this.pauseOffset = this.getCurrentTime();
    if (this.source) {
      try { this.source.stop(); } catch {}
      this.source.disconnect();
      this.source = null;
    }
    this.isCurrentlyPlaying = false;
  }

  resumePlayback() {
    if (this.isCurrentlyPlaying) return;
    const ctx = this.getContext();
    if (this.currentBuffer) {
      try {
        this.source = ctx.createBufferSource();
        this.source.buffer = this.currentBuffer;
        this.source.connect(this.analyser!);
        this.playbackStartTime = ctx.currentTime - this.pauseOffset;
        this.source.start(0, this.pauseOffset);
        this.isCurrentlyPlaying = true;
      } catch (e) {
        console.warn("Resume playback error:", e);
      }
    } else {
      this.playbackStartTime = ctx.currentTime - this.pauseOffset;
      this.isCurrentlyPlaying = true;
    }
  }

  stop() {
    if (this.source) {
      try { this.source.stop(); } catch {}
      this.source.disconnect();
      this.source = null;
    }
    this.playbackStartTime = 0;
    this.pauseOffset = 0;
    this.isCurrentlyPlaying = false;
  }

  getCurrentTime(): number {
    if (!this.context || this.playbackStartTime === 0) return 0;
    if (!this.isCurrentlyPlaying) return this.pauseOffset;
    const time = this.context.currentTime - this.playbackStartTime;
    return Math.max(0, time);
  }

  playNote(noteName: string, duration: number = 0.35) {
    const ctx = this.getContext();
    const freq = NOTE_FREQS[noteName] || 440;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Warm African Marimba / Electric Piano timbre
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Filter for organic warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser!);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  playHitFeedback(type: 'PERFECT' | 'GREAT' | 'GOOD') {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'PERFECT') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    }

    osc.connect(gain);
    gain.connect(this.analyser!);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Generates an authentic synthesized Amapiano/Afrobeat AudioBuffer for songs without external MP3 files.
   * Includes log drum sub-bass pulse, shaker groove, and warm marimba melody chords.
   */
  generateMelodyBuffer(melody: string[], bpm: number): AudioBuffer {
    const ctx = this.getContext();
    const sampleRate = ctx.sampleRate;
    const beatDuration = 60 / bpm;
    const totalDuration = Math.max(8, melody.length * beatDuration + 3);
    const totalSamples = Math.floor(sampleRate * totalDuration);

    const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // 1. Synthesize Amapiano Log Drum Bass (4-on-the-floor + syncopated swing)
    for (let beat = 0; beat < totalDuration / beatDuration; beat++) {
      const beatStartTime = beat * beatDuration;
      const startSample = Math.floor(beatStartTime * sampleRate);
      const drumDuration = 0.35;
      const drumSamples = Math.floor(drumDuration * sampleRate);

      // Log drum on every beat + syncopated 16th hit
      const isSyncopated = (beat % 2 === 1) || (beat % 4 === 2);
      const drumVolume = isSyncopated ? 0.35 : 0.45;

      for (let s = 0; s < drumSamples && (startSample + s) < totalSamples; s++) {
        const t = s / sampleRate;
        // Pitch drop from 120Hz down to 45Hz (signature log drum punch)
        const freq = 120 * Math.exp(-t * 14) + 48;
        const envelope = Math.exp(-t * 8);
        const wave = Math.sin(2 * Math.PI * freq * t) * envelope * drumVolume;

        left[startSample + s] += wave;
        right[startSample + s] += wave;
      }
    }

    // 2. Synthesize Afrobeat Shaker / Percussion
    const sixteenth = beatDuration / 4;
    for (let step = 0; step < totalDuration / sixteenth; step++) {
      const stepStartTime = step * sixteenth;
      const startSample = Math.floor(stepStartTime * sampleRate);
      const shakerDuration = 0.04;
      const shakerSamples = Math.floor(shakerDuration * sampleRate);
      const accent = (step % 4 === 2 || step % 4 === 3) ? 0.12 : 0.05;

      for (let s = 0; s < shakerSamples && (startSample + s) < totalSamples; s++) {
        const t = s / sampleRate;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 80) * accent;
        left[startSample + s] += noise * 0.7;
        right[startSample + s] += noise * 0.9;
      }
    }

    // 3. Synthesize Melodic Notes (Kalimba/Piano harmonics)
    melody.forEach((noteName, index) => {
      const noteStartTime = index * beatDuration;
      const startSample = Math.floor(noteStartTime * sampleRate);
      const noteDuration = beatDuration * 0.85;
      const noteSamples = Math.floor(noteDuration * sampleRate);
      const freq = NOTE_FREQS[noteName] || 440;

      for (let s = 0; s < noteSamples && (startSample + s) < totalSamples; s++) {
        const t = s / sampleRate;
        const env = Math.exp(-t * 4) * (1 - Math.exp(-t * 50));
        // Triangle/Sine harmonic mixture
        const fundamental = Math.sin(2 * Math.PI * freq * t);
        const harmonic1 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.3;
        const harmonic2 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.15;
        const tone = (fundamental + harmonic1 + harmonic2) * env * 0.32;

        left[startSample + s] += tone;
        right[startSample + s] += tone;
      }
    });

    // Normalize buffer to prevent clipping
    let maxAmp = 0.001;
    for (let i = 0; i < totalSamples; i += 10) {
      if (Math.abs(left[i]) > maxAmp) maxAmp = Math.abs(left[i]);
      if (Math.abs(right[i]) > maxAmp) maxAmp = Math.abs(right[i]);
    }

    if (maxAmp > 0.95) {
      const scale = 0.9 / maxAmp;
      for (let i = 0; i < totalSamples; i++) {
        left[i] *= scale;
        right[i] *= scale;
      }
    }

    return buffer;
  }

  generateMidiFromBpm(melody: string[], bpm: number): { time: number; note: string; isLong?: boolean; lane?: number }[] {
    const beatDuration = 60 / bpm;
    const finalMidi: { time: number; note: string; isLong?: boolean; lane?: number }[] = [];
    const laneLastUsed = [0, 0, 0, 0];

    melody.forEach((note, index) => {
      const time = index * beatDuration;
      if (bpm > 140 && index % 2 !== 0) return;

      const energyLevel = Math.random();
      const polyphony = energyLevel > 0.94 ? 2 : 1;

      const lanes = [0, 1, 2, 3].sort((a, b) => laneLastUsed[a] - laneLastUsed[b]);

      for (let i = 0; i < polyphony; i++) {
        const lane = lanes[i];
        finalMidi.push({
          time,
          note,
          isLong: Math.random() > 0.93,
          lane
        });
        laneLastUsed[lane] = index;
      }
    });

    return finalMidi;
  }

  analyzeAudioPeaks(buffer: AudioBuffer, baseSpeed: number): { time: number; note: string; isLong?: boolean; lane?: number }[] {
    const rawData = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const windowSize = 1024;
    const hopSize = 512;

    const energyFlux: { flux: number; time: number; rms: number }[] = [];
    let prevRMS = 0;

    for (let i = 0; i < rawData.length - windowSize; i += hopSize) {
      let sumSq = 0;
      for (let j = 0; j < windowSize; j++) {
        const s = rawData[i + j];
        sumSq += s * s;
      }
      const rms = Math.sqrt(sumSq / windowSize);
      const flux = Math.max(0, rms - prevRMS);

      energyFlux.push({ flux, rms, time: i / sampleRate });
      prevRMS = rms;
    }

    const finalNotes: { time: number; note: string; isLong?: boolean; lane?: number }[] = [];
    const minTimeGap = 0.28;
    const laneEndTimes: number[] = [0, 0, 0, 0];
    const laneLastUsedLocal = [0, 0, 0, 0];
    let lastNoteTime = -minTimeGap;

    const avgWindow = 16;

    for (let i = avgWindow; i < energyFlux.length - 1; i++) {
      const curr = energyFlux[i];

      let localSum = 0;
      for (let k = -avgWindow; k < 0; k++) localSum += energyFlux[i + k].flux;
      const localAvg = localSum / avgWindow;

      const isPeak = curr.flux > energyFlux[i - 1].flux && curr.flux > energyFlux[i + 1].flux;
      const isSignificant = curr.flux > localAvg * 1.6 && curr.flux > 0.02;

      if (isPeak && isSignificant) {
        if (curr.time - lastNoteTime > minTimeGap) {
          let polyphony = 1;
          if (curr.flux > 0.12) polyphony = 2;

          let sustainSum = 0;
          const lookahead = 8;
          for (let k = 1; k <= lookahead && (i + k) < energyFlux.length; k++) sustainSum += energyFlux[i + k].rms;
          const isLong = (sustainSum / lookahead) > (curr.rms * 0.85);

          const availableLanes = [0, 1, 2, 3]
            .filter(lane => curr.time >= laneEndTimes[lane])
            .sort((a, b) => laneLastUsedLocal[a] - laneLastUsedLocal[b]);

          const actualTriggers = Math.min(polyphony, availableLanes.length);
          const duration = isLong ? (0.5 / baseSpeed) : (0.25 / baseSpeed);

          for (let p = 0; p < actualTriggers; p++) {
            const lane = availableLanes[p];
            finalNotes.push({
              time: curr.time,
              note: 'BEAT',
              isLong,
              lane
            });
            laneEndTimes[lane] = curr.time + duration;
            laneLastUsedLocal[lane] = i;
          }

          lastNoteTime = curr.time;
        }
      }
    }

    return finalNotes.sort((a, b) => a.time - b.time);
  }
}

export const audioService = new AudioService();

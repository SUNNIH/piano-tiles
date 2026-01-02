
class AudioService {
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private playbackStartTime: number = 0;

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256;
    }
    return this.context;
  }

  async resume() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') await ctx.resume();
  }

  getAnalyser(): AnalyserNode | null {
    this.getContext(); // Ensure initialization
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

  playBuffer(buffer: AudioBuffer, delay: number = 0) {
    this.stop();
    const ctx = this.getContext();
    this.source = ctx.createBufferSource();
    this.source.buffer = buffer;
    
    // Connect source -> analyser -> destination
    this.source.connect(this.analyser!);
    this.analyser!.connect(ctx.destination);
    
    // Track exactly when the audio will start playing in the context's timeline
    this.playbackStartTime = ctx.currentTime + delay;
    this.source.start(this.playbackStartTime);
  }

  stop() {
    if (this.source) {
      try { this.source.stop(); } catch (e) {}
      this.source.disconnect();
      this.source = null;
    }
    this.playbackStartTime = 0;
  }

  getCurrentTime(): number {
    if (!this.context || this.playbackStartTime === 0) return 0;
    // High precision time relative to song start
    const time = this.context.currentTime - this.playbackStartTime;
    return Math.max(0, time);
  }

  generateMidiFromBpm(melody: string[], bpm: number): {time: number, note: string, isLong?: boolean, lane?: number}[] {
    const beatDuration = 60 / bpm;
    const finalMidi: {time: number, note: string, isLong?: boolean, lane?: number}[] = [];
    const laneLastUsed = [0, 0, 0, 0];
    
    melody.forEach((note, index) => {
      const time = index * beatDuration;
      // Filter density for high BPM
      if (bpm > 140 && index % 2 !== 0) return;

      const energyLevel = Math.random();
      // REDUCED SIDE-BY-SIDE: Increased threshold from 0.92 to 0.98 to make double notes extremely rare
      let polyphony = energyLevel > 0.98 ? 2 : 1;
      
      const lanes = [0, 1, 2, 3].sort((a, b) => laneLastUsed[a] - laneLastUsed[b]);
      
      for (let i = 0; i < polyphony; i++) {
        const lane = lanes[i];
        finalMidi.push({
          time,
          note,
          isLong: Math.random() > 0.97, // Even rarer long notes
          lane
        });
        laneLastUsed[lane] = index;
      }
    });

    return finalMidi;
  }

  /**
   * Onset Detection Engine (Energy Flux)
   * Refined to prevent "too many tiles" by capping polyphony and adjusting sensitivity.
   */
  analyzeAudioPeaks(buffer: AudioBuffer, baseSpeed: number): {time: number, note: string, isLong?: boolean, lane?: number}[] {
    const rawData = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const windowSize = 1024; 
    const hopSize = 512;
    
    const energyFlux: { flux: number, time: number, rms: number }[] = [];
    let prevRMS = 0;

    // Pass 1: Calculate Energy Flux
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

    // Pass 2: Peak Picking
    const finalNotes: {time: number, note: string, isLong?: boolean, lane?: number}[] = [];
    const minTimeGap = 0.35; // Increased slightly to prevent temporal clumping
    const laneEndTimes: number[] = [0, 0, 0, 0];
    const laneLastUsedLocal = [0, 0, 0, 0];
    let lastNoteTime = -minTimeGap;

    const avgWindow = 20; // Larger window for more stable local average

    for (let i = avgWindow; i < energyFlux.length - 1; i++) {
      const curr = energyFlux[i];
      
      let localSum = 0;
      for(let k = -avgWindow; k < 0; k++) localSum += energyFlux[i+k].flux;
      const localAvg = localSum / avgWindow;
      
      const isPeak = curr.flux > energyFlux[i-1].flux && curr.flux > energyFlux[i+1].flux;
      // Stricter significance threshold to reduce clutter
      const isSignificant = curr.flux > localAvg * 1.8 && curr.flux > 0.025;

      if (isPeak && isSignificant) {
        if (curr.time - lastNoteTime > minTimeGap) {
          // REDUCED SIDE-BY-SIDE: Stricter threshold for polyphony (increased from 0.07 to 0.13)
          let polyphony = 1;
          if (curr.flux > 0.13) polyphony = 2; 

          // Detect "Long" notes
          let sustainSum = 0;
          const lookahead = 10;
          for(let k=1; k<=lookahead && (i+k) < energyFlux.length; k++) sustainSum += energyFlux[i+k].rms;
          const isLong = (sustainSum / lookahead) > (curr.rms * 0.9);

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

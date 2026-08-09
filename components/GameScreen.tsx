
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameStatus, Song, Tile, GameResults, GameRank } from '../types';
import { audioService } from '../services/audioService';
import { RotateCcw, Home, Loader2, Bot, Zap, Pause, Play } from 'lucide-react';
import { RANK_THRESHOLDS } from '../constants';

interface GameScreenProps {
  song: Song;
  onExit: () => void;
  onFinish: (results: GameResults) => void;
  isDemo?: boolean;
}

interface Feedback {
  id: number;
  text: string;
  lane: number;
  color: string;
  timestamp: number;
}

interface HitEffect {
  id: number;
  lane: number;
  type: 'PERFECT' | 'GREAT' | 'GOOD';
  startTime: number;
  x: number;
  y: number;
  themeColor: string;
  themeRgb: string;
}

interface TouchRipple {
  id: number;
  x: number;
  y: number;
  startTime: number;
}

interface TimeSyncTile extends Tile {
  audioTime: number; 
  hitTimestamp?: number;
}

const THEME_COLORS = [
  { hex: '#00f2ff', rgb: '0, 242, 255', label: 'CYAN PHASE' },
  { hex: '#7000ff', rgb: '112, 0, 255', label: 'VIOLET PHASE' },
  { hex: '#ff0055', rgb: '255, 0, 85', label: 'STRIKE PHASE' },
  { hex: '#00ff88', rgb: '0, 255, 136', label: 'NEON PHASE' }
];

const GameScreen: React.FC<GameScreenProps> = ({ song, onExit, onFinish, isDemo = false }) => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(isDemo);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  
  const scoreElRef = useRef<HTMLSpanElement>(null);
  const comboElRef = useRef<HTMLDivElement>(null);
  const accuracyElRef = useRef<HTMLSpanElement>(null);
  const rankElRef = useRef<HTMLSpanElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  
  // Game State Refs (Performance)
  const tilesRef = useRef<TimeSyncTile[]>([]);
  const feedbacksRef = useRef<Feedback[]>([]);
  const hitEffectsRef = useRef<HitEffect[]>([]);
  const touchRipplesRef = useRef<TouchRipple[]>([]);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const totalNotesRef = useRef(0);
  const hitNotesRef = useRef(0);
  const melodyIndexRef = useRef(0);
  const midiDataRef = useRef<{time: number, note: string, isLong?: boolean, lane?: number}[]>([]);
  const isPausedRef = useRef(false);
  const themeIndexRef = useRef(0);
  const awesomeTextRef = useRef<string | null>(null);
  const awesomeStartTimeRef = useRef(0);

  const playStartTimeRef = useRef<number>(0);
  const lastPhaseIndexRef = useRef<number>(0);
  const nowForPauseRef = useRef<number>(0);

  const NORMAL_HEIGHT_FRAC = 0.18; 
  const SPECIAL_HEIGHT_FRAC = 0.45;
  const OPTIMAL_HIT_Y_FRAC = 0.50; 

  const PERFECT_WINDOW = 0.12; 
  const GREAT_WINDOW = 0.20;   
  const EARLY_LATE_LIMIT = 0.30; 

  const calculateRank = (acc: number): GameRank => {
    const threshold = RANK_THRESHOLDS.find(t => acc >= t.minAccuracy);
    return threshold ? threshold.rank : 'C';
  };

  const updateHUD = useCallback(() => {
    const acc = totalNotesRef.current > 0 ? (hitNotesRef.current / totalNotesRef.current) * 100 : 100;
    
    if (scoreElRef.current) scoreElRef.current.innerText = Math.floor(scoreRef.current).toLocaleString();
    if (comboElRef.current) {
      comboElRef.current.innerText = comboRef.current.toString();
      comboElRef.current.style.display = comboRef.current > 0 ? 'block' : 'none';
    }
    if (accuracyElRef.current) accuracyElRef.current.innerText = `Accuracy ${acc.toFixed(1)}%`;
    if (rankElRef.current) {
      const rank = calculateRank(acc);
      rankElRef.current.innerText = rank;
      rankElRef.current.style.color = THEME_COLORS[themeIndexRef.current].hex;
    }
  }, []);

  const handleFinish = useCallback(() => {
    const acc = totalNotesRef.current > 0 ? (hitNotesRef.current / totalNotesRef.current) * 100 : 100;
    const results: GameResults = {
      score: scoreRef.current,
      maxCombo: maxComboRef.current,
      accuracy: acc,
      rank: calculateRank(acc),
      isNewHighScore: true
    };
    
    const history: any[] = JSON.parse(localStorage.getItem('piano-tiles-scores') || '[]');
    history.push({
      songId: song.id,
      songTitle: song.title,
      score: results.score,
      accuracy: results.accuracy,
      rank: results.rank,
      date: new Date().toISOString()
    });
    localStorage.setItem('piano-tiles-scores', JSON.stringify(history.slice(-50)));

    onFinish(results);
  }, [onFinish, song]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const currentAudioTime = audioService.getCurrentTime();
    const now = Date.now();
    const currentTheme = THEME_COLORS[themeIndexRef.current];

    ctx.clearRect(0, 0, width, height);

    // 1. Visualizer Background
    const analyser = audioService.getAnalyser();
    if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        ctx.save();
        ctx.globalAlpha = 0.15;
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * (height * 0.2);
            ctx.fillStyle = currentTheme.hex;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
        ctx.restore();
    }

    // 2. Ripples
    if (touchRipplesRef.current.length > 0) {
      ctx.lineWidth = 3;
      touchRipplesRef.current.forEach(ripple => {
          const elapsed = now - ripple.startTime;
          const progress = elapsed / 400;
          if (progress < 1) {
              ctx.beginPath();
              ctx.arc(ripple.x, ripple.y, progress * 80, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(${currentTheme.rgb}, ${0.4 * (1 - progress)})`;
              ctx.stroke();
          }
      });
      touchRipplesRef.current = touchRipplesRef.current.filter(r => now - r.startTime < 400);
    }

    // 3. Hit Effects
    hitEffectsRef.current.forEach(effect => {
        const elapsed = now - effect.startTime;
        const duration = effect.type === 'PERFECT' ? 600 : 400;
        const progress = elapsed / duration;
        const alpha = Math.max(0, 1 - progress);
        
        if (alpha > 0) {
            const laneWidth = width / 4;
            const rgb = effect.type === 'PERFECT' ? effect.themeRgb : '255, 255, 255';
            
            ctx.save();
            const grad = ctx.createLinearGradient(0, height, 0, height * (1 - alpha * 0.5));
            grad.addColorStop(0, `rgba(${rgb}, ${alpha * (effect.type === 'PERFECT' ? 0.4 : 0.2)})`);
            grad.addColorStop(1, `rgba(${rgb}, 0)`);
            ctx.fillStyle = grad;
            ctx.fillRect(effect.lane * laneWidth, 0, laneWidth, height);
            ctx.restore();

            ctx.save();
            ctx.translate(effect.x, effect.y);
            
            if (effect.type === 'PERFECT') {
                ctx.beginPath();
                ctx.arc(0, 0, progress * 150, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${rgb}, ${alpha * 0.8})`;
                ctx.lineWidth = 6 * (1 - progress);
                ctx.stroke();

                const glowSize = (1 - progress) * 60;
                const radialGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
                radialGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                radialGrad.addColorStop(1, `rgba(${rgb}, 0)`);
                ctx.fillStyle = radialGrad;
                ctx.beginPath();
                ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, progress * 100, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb}, ${alpha * 0.3})`;
                ctx.fill();
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            ctx.restore();
        }
    });

    // 4. Tiles
    const laneWidth = width / 4;
    const tileMargin = width * 0.015;
    const tileWidth = laneWidth - tileMargin * 2;

    tilesRef.current.forEach(t => {
        const hFrac = t.isLong ? SPECIAL_HEIGHT_FRAC : NORMAL_HEIGHT_FRAC;
        const timeDiff = currentAudioTime - t.audioTime;
        const yFrac = OPTIMAL_HIT_Y_FRAC - hFrac + (timeDiff * song.baseSpeed);
        
        if (yFrac > 1.2 || yFrac + hFrac < -0.2) return;

        const x = (t.lane * laneWidth) + tileMargin;
        const y = yFrac * height;
        const h = hFrac * height;

        ctx.save();
        
        if (t.isHit && t.hitTimestamp) {
            const hitElapsed = now - t.hitTimestamp;
            const progress = Math.min(1, hitElapsed / 300);
            ctx.globalAlpha = 1 - progress;
            const scale = 1 + progress * 0.3;
            ctx.translate(x + tileWidth / 2, y + h / 2);
            ctx.scale(scale, scale);
            ctx.translate(-(x + tileWidth / 2), -(y + h / 2));
        }

        const grad = ctx.createLinearGradient(x, y, x, y + h);
        if (t.isLong) {
            grad.addColorStop(0, currentTheme.hex);
            grad.addColorStop(1, '#ffffff');
        } else if (t.isSpecial) {
            grad.addColorStop(0, '#ff0055');
            grad.addColorStop(1, '#990033');
        } else {
            grad.addColorStop(0, '#333');
            grad.addColorStop(1, '#111');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, tileWidth, h, 16);
        ctx.fill();

        if (!t.isHit) {
          const syncY = y + h - 6; 
          const pulse = Math.sin(now / 150) * 0.3 + 0.7;
          ctx.beginPath();
          ctx.roundRect(x + 6, syncY, tileWidth - 12, 5, 2); 
          ctx.fillStyle = `rgba(${currentTheme.rgb}, ${pulse})`;
          ctx.fill();
        }

        ctx.restore();
    });

    // 5. Feedbacks
    feedbacksRef.current.forEach(fb => {
        const elapsed = now - fb.timestamp;
        const progress = elapsed / 600;
        if (progress < 1) {
            ctx.save();
            ctx.globalAlpha = 1 - progress;
            ctx.fillStyle = fb.color;
            ctx.font = 'italic 900 24px Inter';
            ctx.textAlign = 'center';
            const fbX = (fb.lane * laneWidth) + (laneWidth / 2);
            const fbY = (OPTIMAL_HIT_Y_FRAC - 0.1 - progress * 0.1) * height;
            ctx.fillText(fb.text, fbX, fbY);
            ctx.restore();
        }
    });
    feedbacksRef.current = feedbacksRef.current.filter(fb => now - fb.timestamp < 600);

    // 6. Awesome Text
    if (awesomeTextRef.current) {
        const elapsed = now - awesomeStartTimeRef.current;
        const progress = elapsed / 1200;
        if (progress < 1) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'italic 900 48px Inter';
            ctx.fillStyle = currentTheme.hex;
            ctx.shadowBlur = 30;
            ctx.shadowColor = currentTheme.hex;
            
            let alpha = 1;
            if (progress < 0.15) alpha = progress / 0.15;
            else if (progress > 0.85) alpha = 1 - (progress - 0.85) / 0.15;
            
            ctx.globalAlpha = alpha;
            const scale = 1 + (progress - 0.5) * 0.2;
            ctx.translate(width / 2, height / 2);
            ctx.scale(scale, scale);
            ctx.fillText(awesomeTextRef.current, 0, 0);
            ctx.restore();
        } else {
            awesomeTextRef.current = null;
        }
    }

    hitEffectsRef.current = hitEffectsRef.current.filter(e => now - e.startTime < 1000);
  }, [song.baseSpeed]);

  const animate = useCallback(() => {
    if (status !== GameStatus.PLAYING || isPausedRef.current || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d', { alpha: true });
    if (!ctx) return;

    const currentAudioTime = audioService.getCurrentTime();
    const now = Date.now();
    const elapsed = now - playStartTimeRef.current;
    
    // Interval based color changing (Every 20 seconds)
    const currentPhaseIndex = Math.floor(elapsed / 20000) % THEME_COLORS.length;
    if (currentPhaseIndex !== lastPhaseIndexRef.current) {
        lastPhaseIndexRef.current = currentPhaseIndex;
        themeIndexRef.current = currentPhaseIndex;
        awesomeTextRef.current = THEME_COLORS[currentPhaseIndex].label;
        awesomeStartTimeRef.current = now;
    }
    
    // Victory check
    if (melodyIndexRef.current >= midiDataRef.current.length && (tilesRef.current.length === 0 || tilesRef.current.every(t => t.isHit))) {
        setTimeout(handleFinish, 2000);
        setStatus(GameStatus.WON);
        return;
    }

    // Spawn tiles
    const lookAhead = 2.5;
    while (melodyIndexRef.current < midiDataRef.current.length) {
        const nextNote = midiDataRef.current[melodyIndexRef.current];
        if (nextNote.time <= currentAudioTime + lookAhead) {
            tilesRef.current.push({
                id: `note_${melodyIndexRef.current}_${Date.now()}`, 
                lane: nextNote.lane ?? Math.floor(Math.random() * 4),
                y: -1, 
                isSpecial: !!nextNote.isLong,
                isLong: !!nextNote.isLong,
                isHeld: false,
                isHit: false,
                timestamp: Date.now(),
                audioTime: nextNote.time,
                note: nextNote.note
            });
            totalNotesRef.current++;
            melodyIndexRef.current++;
        } else {
            break;
        }
    }

    // Auto-play / Bot
    if (isAutoPlay) {
        tilesRef.current.forEach(t => {
            if (!t.isHit && currentAudioTime >= t.audioTime) {
                handleLaneTouch(t.lane, true);
            }
        });
    }

    // Game Over check & filtering
    let isGameOver = false;
    tilesRef.current = tilesRef.current.filter(t => {
        if (t.isHit) return (now - (t.hitTimestamp || 0)) < 300;
        
        const hFrac = t.isLong ? SPECIAL_HEIGHT_FRAC : NORMAL_HEIGHT_FRAC;
        const yFrac = OPTIMAL_HIT_Y_FRAC - hFrac + ((currentAudioTime - t.audioTime) * song.baseSpeed);
        
        if (yFrac > 1.0) {
            isGameOver = true;
            return false;
        }
        return true;
    });

    if (isGameOver) {
      setStatus(GameStatus.GAME_OVER);
      audioService.stop();
      handleFinish();
      return; 
    }

    updateHUD();
    draw(ctx, canvasRef.current.width, canvasRef.current.height);
    requestRef.current = requestAnimationFrame(animate);
  }, [status, isAutoPlay, song.baseSpeed, draw, handleFinish, updateHUD]);

  const togglePause = useCallback(() => {
    if (status !== GameStatus.PLAYING && status !== GameStatus.PAUSED) return;
    
    if (isPausedRef.current) {
      audioService.resumePlayback();
      isPausedRef.current = false;
      const totalElapsedPriorToPause = nowForPauseRef.current - playStartTimeRef.current;
      playStartTimeRef.current = Date.now() - totalElapsedPriorToPause;
      setStatus(GameStatus.PLAYING);
    } else {
      audioService.pause();
      nowForPauseRef.current = Date.now();
      isPausedRef.current = true;
      setStatus(GameStatus.PAUSED);
    }
  }, [status]);

  const startGame = async () => {
    setIsLoading(true);
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    totalNotesRef.current = 0;
    hitNotesRef.current = 0;
    melodyIndexRef.current = 0;
    tilesRef.current = [];
    feedbacksRef.current = [];
    hitEffectsRef.current = [];
    touchRipplesRef.current = [];
    isPausedRef.current = false;
    
    themeIndexRef.current = 0;
    lastPhaseIndexRef.current = 0;
    awesomeTextRef.current = null;
    playStartTimeRef.current = Date.now();
    
    let buffer = song.audioBuffer || audioBuffer;
    if (!buffer) {
        try {
            if (song.file) buffer = await audioService.loadAudioFromFile(song.file);
            else if (song.audioSrc) buffer = await audioService.loadAudio(song.audioSrc);
            
            if (buffer) {
                setAudioBuffer(buffer);
                midiDataRef.current = song.midiData || audioService.analyzeAudioPeaks(buffer, song.baseSpeed);
            } else {
                buffer = audioService.generateMelodyBuffer(song.melody, song.bpm);
                setAudioBuffer(buffer);
                midiDataRef.current = song.midiData || audioService.generateMidiFromBpm(song.melody, song.bpm);
            }
        } catch (e) {
            console.error("Audio buffer load error:", e);
            buffer = audioService.generateMelodyBuffer(song.melody, song.bpm);
            setAudioBuffer(buffer);
            midiDataRef.current = song.midiData || audioService.generateMidiFromBpm(song.melody, song.bpm);
        }
    } else {
        setAudioBuffer(buffer);
        if (midiDataRef.current.length === 0) {
            midiDataRef.current = song.midiData || (song.melody && song.melody.length > 0 ? audioService.generateMidiFromBpm(song.melody, song.bpm) : audioService.analyzeAudioPeaks(buffer, song.baseSpeed));
        }
    }
    
    setIsLoading(false);
    await audioService.resume();
    audioService.playBuffer(buffer, 1.2);
    setStatus(GameStatus.PLAYING);
  };

  useEffect(() => {
    return () => {
      audioService.stop();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
          const dpr = window.devicePixelRatio || 1;
          const rect = container.getBoundingClientRect();
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    
    handleResize();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (status === GameStatus.PLAYING) requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [status, animate]);

  const handleLaneTouch = (laneIndex: number, isBotAction: boolean = false, touchX?: number, touchY?: number) => {
    if (status !== GameStatus.PLAYING || isPausedRef.current || !canvasRef.current) return;

    if (!isBotAction) {
        if (isAutoPlay) setIsAutoPlay(false);
        if (touchX !== undefined && touchY !== undefined) {
            touchRipplesRef.current.push({ id: Math.random(), x: touchX, y: touchY, startTime: Date.now() });
        }
    }

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    const currentAudioTime = audioService.getCurrentTime();
    const laneTiles = tilesRef.current.filter(t => t.lane === laneIndex && !t.isHit).sort((a, b) => a.audioTime - b.audioTime);
    const target = laneTiles[0];

    if (target) {
        const timeError = currentAudioTime - target.audioTime;
        const absError = Math.abs(timeError);

        if (timeError > -EARLY_LATE_LIMIT) {
            target.isHit = true;
            target.hitTimestamp = Date.now();
            hitNotesRef.current++;
            
            let bonus = 1; let text = "GOOD"; let type: HitEffect['type'] = 'GOOD';
            if (absError < PERFECT_WINDOW) { bonus = 10; text = "PERFECT"; type = 'PERFECT'; } 
            else if (absError < GREAT_WINDOW) { bonus = 5; text = "GREAT"; type = 'GREAT'; } 
            else if (timeError > PERFECT_WINDOW) { text = "LATE"; } 
            
            if (target.note && target.note !== 'BEAT') {
              audioService.playNote(target.note);
            }
            audioService.playHitFeedback(type);

            scoreRef.current += (bonus * (1 + comboRef.current * 0.1));
            comboRef.current++;
            maxComboRef.current = Math.max(maxComboRef.current, comboRef.current);

            feedbacksRef.current.push({ 
              id: Math.random(), 
              text, 
              lane: laneIndex, 
              color: type === 'PERFECT' ? THEME_COLORS[themeIndexRef.current].hex : '#fff', 
              timestamp: Date.now() 
            });

            const impactY = (OPTIMAL_HIT_Y_FRAC + 0.02) * height;
            const laneCenter = (laneIndex * (width / 4)) + (width / 8);

            hitEffectsRef.current.push({ 
              id: Math.random(), 
              lane: laneIndex, 
              type, 
              startTime: Date.now(),
              x: laneCenter,
              y: impactY,
              themeColor: THEME_COLORS[themeIndexRef.current].hex,
              themeRgb: THEME_COLORS[themeIndexRef.current].rgb
            });
        } else {
            comboRef.current = 0;
        }
    } else {
        comboRef.current = 0;
    }
  };

  const onTouchStart = (e: React.PointerEvent, laneIndex: number) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const touchX = (e.clientX - rect.left) * dpr;
    const touchY = (e.clientY - rect.top) * dpr;
    handleLaneTouch(laneIndex, false, touchX, touchY);
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden select-none touch-none bg-black transition-colors duration-[1000ms]`}>
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000" 
        style={{ background: `radial-gradient(circle at 50% 100%, ${THEME_COLORS[themeIndexRef.current].hex}66 0%, transparent 70%)` }} 
      />

      <div className="absolute inset-0 flex pointer-events-none opacity-20">
        {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex-1 border-r last:border-r-0 h-full border-white/10" />
        ))}
      </div>
      
      <div 
        className="absolute w-full h-[4px] z-20 pointer-events-none transition-all duration-1000" 
        style={{ 
          top: `${OPTIMAL_HIT_Y_FRAC * 100}%`, 
          backgroundColor: THEME_COLORS[themeIndexRef.current].hex, 
          boxShadow: `0 0 25px ${THEME_COLORS[themeIndexRef.current].hex}` 
        }} 
      />
      <div 
        className="absolute -translate-y-full left-10 z-20 text-[11px] font-black text-white/40 uppercase tracking-[0.4em] italic" 
        style={{ top: `${OPTIMAL_HIT_Y_FRAC * 100}%` }}
      >
        Impact Point
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

      <div className="absolute inset-x-0 top-0 p-10 pt-16 flex justify-between items-start z-40 pointer-events-none">
        <div className="space-y-1">
            <div className="flex items-end gap-3">
                <span ref={scoreElRef} className="text-5xl font-black italic tracking-tighter text-white tabular-nums drop-shadow-2xl leading-none">0</span>
                <span ref={rankElRef} className="text-xl font-bold transition-colors duration-1000 mb-2 uppercase tracking-widest">S</span>
            </div>
            <div className="flex items-center gap-3 mt-4">
                <div className="h-2 w-2 rounded-full transition-colors duration-1000" style={{ backgroundColor: THEME_COLORS[themeIndexRef.current].hex, boxShadow: `0 0 10px ${THEME_COLORS[themeIndexRef.current].hex}` }} />
                <span ref={accuracyElRef} className="text-[11px] font-bold text-white/30 uppercase tracking-[0.4em]">Accuracy 100.0%</span>
            </div>
        </div>

        <div className="flex flex-col items-end gap-5 pointer-events-auto">
            <div className="flex gap-4">
                <button 
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`p-5 rounded-3xl border transition-all duration-500 ${isAutoPlay ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-white/30 border-white/10'}`}
                  style={isAutoPlay ? { backgroundColor: THEME_COLORS[themeIndexRef.current].hex, borderColor: THEME_COLORS[themeIndexRef.current].hex } : {}}
                >
                  <Bot size={28} />
                </button>
                <button 
                  onClick={togglePause}
                  className="p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <Pause size={28} />
                </button>
            </div>
            <div className="text-right">
                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Combo</div>
                <div ref={comboElRef} className="text-5xl font-black italic tracking-tighter text-white leading-none">0</div>
            </div>
        </div>
      </div>

      <div className="absolute inset-0 flex z-30">
        {[0, 1, 2, 3].map(i => (
            <div 
                key={i} 
                className="flex-1 active:bg-white/[0.05] transition-colors" 
                onPointerDown={(e) => onTouchStart(e, i)} 
            />
        ))}
      </div>

      {status === GameStatus.IDLE && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
            {isLoading ? (
                <div className="flex flex-col items-center">
                    <Loader2 size={80} className="animate-spin text-cyan-500 mb-10" />
                    <p className="text-white/30 text-xs font-black tracking-[0.6em] uppercase">Syncing Buffer</p>
                </div>
            ) : (
                <div className="text-center px-12 max-w-sm">
                    <div className="w-28 h-28 bg-cyan-500/10 rounded-[2.5rem] border border-cyan-500/30 flex items-center justify-center mb-12 mx-auto rotate-6 shadow-[0_0_40px_rgba(0,242,255,0.1)]">
                        <Zap size={56} className="text-cyan-400 fill-cyan-400" />
                    </div>
                    <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase mb-4 leading-none">IMPACT ENGINE</h2>
                    <p className="text-white/30 text-sm mb-16 leading-relaxed font-bold tracking-wide">Simulation optimized. Visual phase transitions recalibrated for max clarity.</p>
                    <button 
                      onClick={startGame} 
                      className="w-full py-9 bg-white text-black font-black rounded-[2.5rem] text-4xl italic tracking-tighter shadow-2xl active:scale-90 transition-transform"
                    >
                      ENGAGE
                    </button>
                </div>
            )}
        </div>
      )}

      {status === GameStatus.PAUSED && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
           <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase mb-16">SESSION PAUSED</h2>
           <div className="w-full max-w-xs space-y-5">
              <button 
                onClick={togglePause}
                className="w-full py-8 text-black font-black rounded-[2.5rem] text-2xl flex items-center justify-center gap-4 active:scale-95 transition-all duration-1000"
                style={{ backgroundColor: THEME_COLORS[themeIndexRef.current].hex }}
              >
                <Play size={32} fill="black" /> RESUME
              </button>
              <button onClick={startGame} className="w-full py-5 bg-white/10 text-white font-black rounded-3xl flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs">
                <RotateCcw size={24} /> RESTART
              </button>
              <button onClick={onExit} className="w-full py-5 bg-white/5 text-white/30 font-black rounded-3xl flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs">
                <Home size={24} /> EXIT
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;

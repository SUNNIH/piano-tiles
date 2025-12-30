
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameStatus, Song, Tile } from '../types';
import { audioService } from '../services/audioService';
import { RotateCcw, Home, Bot, Code } from 'lucide-react';
import { COLORS } from '../constants';
import CodeGenerator from './CodeGenerator';

interface GameScreenProps {
  song: Song;
  onExit: () => void;
}

interface Feedback {
  id: number;
  text: string;
  lane: number;
  color: string;
  timestamp: number;
}

const GameScreen: React.FC<GameScreenProps> = ({ song, onExit }) => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [showCodeGen, setShowCodeGen] = useState(false);
  
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const tilesRef = useRef<Tile[]>([]);
  const activeLanesRef = useRef<Set<number>>(new Set());
  const scoreRef = useRef(0);
  const melodyIndexRef = useRef(0);
  const speedRef = useRef(song.baseSpeed);
  const midiDataRef = useRef<any[]>([]);
  const startTimeRef = useRef<number>(0);
  const lastSpeedIncreaseTimeRef = useRef<number>(0);

  const NORMAL_HEIGHT = 0.20; 
  const SPECIAL_HEIGHT = 0.45;
  const OPTIMAL_HIT_Y = 0.75; 
  
  // Effect for initializing song data and setting up cleanup
  useEffect(() => {
    const initGameData = async () => {
        setIsLoading(true);
        audioService.stop();
        setAudioBuffer(null);
        midiDataRef.current = [];

        try {
            let buffer: AudioBuffer | null = null;
            if (song.file) {
                // Fixed: Added loadAudioFromFile to AudioService to handle local files
                buffer = await audioService.loadAudioFromFile(song.file);
            } else if (song.audioSrc) {
                // Fixed: Updated loadAudio to return a Promise<AudioBuffer> correctly
                buffer = await audioService.loadAudio(song.audioSrc);
            }

            if (buffer) {
                setAudioBuffer(buffer);
                // Fixed: Added analyzeAudioPeaks to generate rhythmic tiles from audio data
                const generated = audioService.analyzeAudioPeaks(buffer);
                midiDataRef.current = generated;
            }
        } catch (err) {
            console.error("Init failed", err);
        } finally {
            setIsLoading(false);
        }
    };
    initGameData();
    // Fix: Explicitly return a synchronous void cleanup function
    return () => {
      audioService.stop();
    };
  }, [song]);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current === undefined) lastTimeRef.current = time;
    const deltaTime = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;
    const now = Date.now();

    if (now - lastSpeedIncreaseTimeRef.current > 30000) {
        speedRef.current = speedRef.current * 1.05;
        lastSpeedIncreaseTimeRef.current = now;
    }

    const moveAmount = speedRef.current * deltaTime;
    const currentSongTime = (now - startTimeRef.current) / 1000;
    const travelTime = 0.95 / speedRef.current;

    // Spawn Logic
    while (melodyIndexRef.current < midiDataRef.current.length) {
        const nextNote = midiDataRef.current[melodyIndexRef.current];
        if (currentSongTime >= nextNote.time - travelTime) {
            const lane = nextNote.lane ?? Math.floor(Math.random() * 4);
            const tileHeight = nextNote.isLong ? SPECIAL_HEIGHT : NORMAL_HEIGHT;
            
            tilesRef.current.push({
                id: `note_${melodyIndexRef.current}_${now}`, 
                lane,
                y: -tileHeight, 
                isSpecial: !!nextNote.isLong,
                isLong: !!nextNote.isLong,
                isHeld: false,
                isHit: false,
                timestamp: time
            });
            melodyIndexRef.current++;
        } else break;
    }

    // Auto-play logic
    if (isAutoPlay) {
      tilesRef.current.forEach(t => {
        if (!t.isHit && t.y >= OPTIMAL_HIT_Y - 0.05) {
          t.isHit = true;
          scoreRef.current += 10;
        }
      });
    }

    // Update Logic
    tilesRef.current.forEach(t => {
        t.y += moveAmount;
        if (t.isLong && t.isHit) {
            t.isHeld = activeLanesRef.current.has(t.lane);
            if (t.isHeld) scoreRef.current += 1;
        }
    });
    setScore(scoreRef.current);

    // Miss check
    if (tilesRef.current.some(t => t.y > 1.0 && !t.isHit)) {
        setStatus(GameStatus.GAME_OVER);
        audioService.stop();
        return;
    }

    tilesRef.current = tilesRef.current.filter(t => t.y < 1.1);
    setTiles([...tilesRef.current]);

    if (status === GameStatus.PLAYING) {
        requestRef.current = requestAnimationFrame(animate);
    }
  }, [status, isAutoPlay]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
        requestRef.current = requestAnimationFrame(animate);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [status, animate]);

  const startGame = () => {
    setTiles([]);
    setScore(0);
    tilesRef.current = [];
    scoreRef.current = 0;
    melodyIndexRef.current = 0;
    speedRef.current = song.baseSpeed * 0.7;
    startTimeRef.current = Date.now() + 3000;
    lastSpeedIncreaseTimeRef.current = startTimeRef.current;
    setShowCodeGen(false);
    
    // Fixed: Added resume to handle browser audio suspension policies
    audioService.resume();
    // Fixed: Added playBuffer to AudioService to play the analyzed track
    if (audioBuffer) audioService.playBuffer(audioBuffer, 3);
    setStatus(GameStatus.PLAYING);
  };

  const handleInput = (laneIndex: number) => {
    if (status !== GameStatus.PLAYING || isAutoPlay) return;
    const candidates = tilesRef.current.filter(t => t.lane === laneIndex && !t.isHit);
    candidates.sort((a, b) => b.y - a.y);
    const target = candidates[0];

    if (target && target.y > 0.4) {
        target.isHit = true;
        scoreRef.current += 10;
        setScore(scoreRef.current);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#120a06] h-full overflow-hidden relative select-none touch-none">
      {/* Lanes */}
      <div className="flex h-full w-full">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            onPointerDown={(e) => {
              activeLanesRef.current.add(i);
              handleInput(i);
            }}
            onPointerUp={() => activeLanesRef.current.delete(i)}
            className="flex-1 border-r border-white/10 active:bg-white/5 transition-colors"
          />
        ))}
      </div>

      {/* Tiles */}
      {tiles.map(tile => (
        <div 
            key={tile.id}
            className="absolute w-[24%] mx-[0.5%] rounded-lg border border-white/20 pointer-events-none transition-opacity duration-150"
            style={{
                left: `${tile.lane * 25}%`,
                top: `${tile.y * 100}%`,
                height: `${(tile.isLong ? SPECIAL_HEIGHT : NORMAL_HEIGHT) * 100}%`,
                backgroundColor: tile.isHit ? COLORS.tileHit : (tile.isLong ? COLORS.tileSpecial : COLORS.tileNormal),
                opacity: tile.isHit && !tile.isLong ? 0 : 1
            }}
        />
      ))}

      {/* Hit Line */}
      <div 
        className="absolute w-full h-0.5 pointer-events-none"
        style={{ top: `${OPTIMAL_HIT_Y * 100}%`, backgroundColor: COLORS.tileHit, opacity: 0.5 }} 
      />

      {/* HUD */}
      <div className="absolute top-8 left-0 w-full px-8 flex justify-between items-center pointer-events-none">
        <span className="text-5xl font-black text-white drop-shadow-lg">{score}</span>
        <button 
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="pointer-events-auto p-2 rounded-full bg-white/10"
        >
            <Bot color={isAutoPlay ? '#4caf50' : '#fff'} />
        </button>
      </div>

      {/* Overlays */}
      {status === GameStatus.IDLE && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-40">
           {isLoading ? (
               <div className="flex flex-col items-center gap-4">
                 <div className="w-12 h-12 border-4 border-[#eebb55] border-t-transparent rounded-full animate-spin" />
                 <p className="text-white/50 text-sm font-mono">ANALYZING AUDIO...</p>
               </div>
           ) : (
               <button 
                  onClick={startGame}
                  className="bg-[#eebb55] px-12 py-5 rounded-full text-2xl font-bold tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#eebb55]/20 text-black"
               >
                  PLAY
               </button>
           )}
        </div>
      )}

      {status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-8 z-50">
              {!showCodeGen ? (
                <>
                  <h2 className="text-5xl font-black text-[#eebb55] mb-2 tracking-tighter">GAME OVER</h2>
                  <p className="text-2xl text-white mb-12">Score: <span className="font-bold">{score}</span></p>
                  
                  <div className="flex gap-6 mb-12">
                    <button onClick={onExit} className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Home color="#fff" size={28} />
                    </button>
                    <button onClick={startGame} className="w-16 h-16 rounded-full border border-[#eebb55] bg-[#eebb55]/10 flex items-center justify-center hover:bg-[#eebb55]/20 transition-colors">
                      <RotateCcw color="#eebb55" size={28} />
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowCodeGen(true)}
                    className="flex items-center gap-3 bg-blue-600/20 text-blue-400 px-6 py-3 rounded-xl border border-blue-500/30 hover:bg-blue-600/30 transition-all"
                  >
                    <Code size={20} />
                    <span>Generate C++ Source</span>
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col max-w-4xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">C++ Game Generator</h3>
                    <button onClick={() => setShowCodeGen(false)} className="text-white/40 hover:text-white">Back to Stats</button>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-2xl shadow-2xl">
                    <CodeGenerator bgmName={song.file?.name || song.title} bgmVolume={0.8} />
                  </div>
                </div>
              )}
          </div>
      )}
    </div>
  );
};

export default GameScreen;

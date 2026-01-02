
import React, { useEffect, useState } from 'react';
import { Song } from '../types';
import { COLORS } from '../constants';
import { Loader2, Music, Cpu, BarChart3, Binary } from 'lucide-react';

interface LoadingScreenProps {
  song: Song;
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ song, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing Engine...');
  const [dataFlux, setDataFlux] = useState('0x000000');

  useEffect(() => {
    const steps = [
      { p: 15, s: 'Allocating Buffer...' },
      { p: 35, s: 'Spectral Energy Mapping...' },
      { p: 55, s: 'Onset Detection Calibration...' },
      { p: 75, s: 'MIDI Sequence Synthesis...' },
      { p: 90, s: 'Visual Modality Sync...' },
      { p: 100, s: 'System Ready' },
    ];

    // Data flux simulation (random bits)
    const fluxInterval = setInterval(() => {
      const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      setDataFlux(`0x${hex.toUpperCase()}`);
    }, 100);

    let currentStep = 0;
    // Slowed down the interval for a more "analytical" feel
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        
        if (currentStep < steps.length && next >= steps[currentStep].p) {
          setStatus(steps[currentStep].s);
          currentStep++;
        }

        if (next >= 100) {
          clearInterval(interval);
          clearInterval(fluxInterval);
          setTimeout(onComplete, 800);
          return 100;
        }
        return next;
      });
    }, 45);

    return () => {
      clearInterval(interval);
      clearInterval(fluxInterval);
    };
  }, [onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center relative overflow-hidden" style={{ backgroundColor: COLORS.bg }}>
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse"></div>
      </div>

      <div className="relative mb-16 group">
        <div className="absolute -inset-4 bg-cyan-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse rounded-full"></div>
        <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 border border-white/10 flex items-center justify-center relative z-10 shadow-2xl">
          <Music className="w-16 h-16 text-cyan-400 animate-bounce" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-[2.5rem] animate-ping opacity-20"></div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-10 z-10">
        <div className="space-y-3">
          <p className="text-cyan-400/60 text-[11px] font-black tracking-[0.5em] uppercase">{song.artist}</p>
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">{song.title}</h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end mb-1 px-1">
             <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Processing Flux</span>
             <span className="text-[10px] font-mono text-cyan-400/40 uppercase">{dataFlux}</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
            <div 
              className="h-full bg-cyan-400 shadow-[0_0_20px_rgba(0,242,255,0.8)] transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] px-1">
             <div className="flex items-center gap-3 text-cyan-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="italic">{status}</span>
             </div>
             <span className="text-white/40 tabular-nums">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-16 flex gap-10 opacity-30">
          <div className="flex flex-col items-center gap-2">
            <Cpu size={18} className="text-white" />
            <span className="text-[8px] font-bold tracking-widest uppercase">Engine</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <BarChart3 size={18} className="text-white" />
            <span className="text-[8px] font-bold tracking-widest uppercase">Analysis</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Binary size={18} className="text-white" />
            <span className="text-[8px] font-bold tracking-widest uppercase">Stream</span>
          </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;

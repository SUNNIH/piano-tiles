
import React, { useEffect, useState } from 'react';
import { COLORS } from '../constants';
import { Music, Sparkles } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const IntroSequence: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Cinematic timing sequence with overlaps for smooth blending
    const timer1 = setTimeout(() => setStep(1), 1400);
    const timer2 = setTimeout(() => setStep(2), 2800);
    const timer3 = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 1200);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  // Dynamic background colors based on step for natural blending
  const getBgStyle = () => {
    if (isExiting) return 'radial-gradient(circle at center, #000 0%, #000 100%)';
    switch (step) {
      case 0: return 'radial-gradient(circle at center, #1a1205 0%, #000 100%)'; // Deep Earthy Orange
      case 1: return 'radial-gradient(circle at center, #051a1a 0%, #000 100%)'; // Deep Cyan
      case 2: return 'radial-gradient(circle at center, #0a0a12 0%, #000 100%)'; // Deep Indigo
      default: return 'radial-gradient(circle at center, #000 0%, #000 100%)';
    }
  };

  return (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center transition-all duration-[1500ms] cubic-bezier(0.23, 1, 0.32, 1) relative overflow-hidden ${isExiting ? 'opacity-0 scale-105 blur-3xl' : 'opacity-100'}`} 
      style={{ 
        backgroundColor: '#000',
        background: getBgStyle()
      }}
    >
      {/* Cinematic Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay noise-bg"></div>

      <div className="relative w-full max-w-lg h-96 flex items-center justify-center">
        
        {/* Step 1: Sound of Africa - Earthy and Warm */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${step === 0 ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 -translate-y-12 scale-110 blur-2xl'}`}>
          <div className="relative mb-10 group">
             <div className="absolute -inset-10 bg-orange-600/10 blur-[60px] rounded-full animate-pulse-slow"></div>
             <div className="p-10 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full border border-orange-500/20 relative z-10 animate-bass-pulse">
               <Music className="w-20 h-20 text-orange-500/80" />
             </div>
          </div>
          <h2 className="text-3xl font-black tracking-[0.8em] uppercase text-orange-500/60 italic ml-[0.4em] text-center mix-blend-screen">
            Sound of Africa
          </h2>
          <div className="mt-6 w-16 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
        </div>

        {/* Step 2: SUNROVO productions - Technical and Cool */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${step === 1 ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 transition-all duration-700 ' + (step > 1 ? '-translate-y-12 scale-110 blur-2xl' : 'translate-y-12 scale-90 blur-2xl')}`}>
          <div className="p-8 bg-cyan-500/5 rounded-full border border-cyan-500/10 mb-8 relative">
            <Sparkles className="w-16 h-16 text-cyan-400/70 animate-spin-slow" />
            <div className="absolute inset-0 border-2 border-cyan-400/10 rounded-full animate-ping-slow opacity-20"></div>
          </div>
          <p className="text-[12px] font-bold text-white/30 uppercase tracking-[0.6em] mb-3 ml-[0.3em] text-center">SUNROVO productions</p>
          <h2 className="text-5xl font-black tracking-tight text-white/90 uppercase italic text-center drop-shadow-2xl">Present</h2>
        </div>

        {/* Step 3: AfroPI@NO - High Impact Finish */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1) ${step === 2 ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-12 scale-90 blur-2xl'}`}>
          <div className="relative group">
            <div className="absolute -inset-20 bg-cyan-500/5 blur-[100px] rounded-full animate-pulse-glow"></div>
            <div className="p-12 bg-slate-900/50 backdrop-blur-sm rounded-[4rem] border border-cyan-500/20 mb-10 shadow-[0_0_80px_rgba(0,242,255,0.1)] relative z-10">
              <Music className="w-28 h-28 text-cyan-400 animate-float" />
            </div>
          </div>
          <h1 className="text-7xl font-black italic tracking-tighter text-white animate-text-shimmer text-center">
            AFRO<span className="text-cyan-400 drop-shadow-[0_0_30px_rgba(0,242,255,0.4)]">PI@NO</span>
          </h1>
          <div className="mt-10 flex gap-2 opacity-30">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce-custom" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Bottom Ambient Bar */}
      <div className="absolute bottom-24 w-64 h-[1px] bg-white/5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-loading-bar w-full" />
      </div>

      <style>{`
        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3ExternalAudio %3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 3s ease-in-out infinite;
        }
        @keyframes bass-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .animate-bass-pulse {
          animation: bass-pulse 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.2); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.05; transform: scale(0.9); }
          50% { opacity: 0.1; transform: scale(1.4); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        @keyframes ping-slow {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        @keyframes text-shimmer {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; filter: brightness(1.2); }
        }
        .animate-text-shimmer {
          animation: text-shimmer 3s ease-in-out infinite;
        }
        @keyframes bounce-custom {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-custom {
          animation: bounce-custom 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default IntroSequence;

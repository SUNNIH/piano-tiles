
import React from 'react';
import { GameResults, Song } from '../types';
import { COLORS } from '../constants';
import { RotateCcw, Home, Trophy, BarChart3, Star, ArrowRight } from 'lucide-react';

interface ResultsScreenProps {
  results: GameResults;
  song: Song;
  onRetry: () => void;
  onMainMenu: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, song, onRetry, onMainMenu }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700" style={{ backgroundColor: COLORS.bg }}>
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>

      <div className="relative mb-8 pt-12">
        <div className="text-[120px] font-black italic tracking-tighter leading-none opacity-20 absolute -top-4 -left-12 pointer-events-none text-cyan-500 select-none">
          {results.rank}
        </div>
        <div className="relative z-10 animate-bounce duration-[2000ms]">
          <span className={`text-[140px] font-black italic tracking-tighter leading-none drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] ${
            results.rank === 'S' ? 'text-cyan-400' :
            results.rank === 'A' ? 'text-green-400' :
            results.rank === 'B' ? 'text-yellow-400' :
            'text-white/60'
          }`}>
            {results.rank}
          </span>
        </div>
        <p className="text-white/40 text-xs font-black tracking-[0.5em] uppercase mt-2">Simulation Rank</p>
      </div>

      <div className="w-full space-y-8 mb-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full"></div>
          
          <div className="space-y-1 mb-8">
            <h2 className="text-5xl font-black italic tracking-tighter text-white tabular-nums">
              {Math.floor(results.score).toLocaleString()}
            </h2>
            <p className="text-cyan-400/60 text-[10px] font-black tracking-[0.3em] uppercase">Total Synthesis Score</p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
             <div>
                <div className="text-2xl font-black italic text-white">{results.maxCombo}</div>
                <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Max Combo</div>
             </div>
             <div>
                <div className="text-2xl font-black italic text-white">{results.accuracy.toFixed(1)}%</div>
                <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Accuracy</div>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
              <Star className="text-yellow-500 mb-1" size={16} />
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">New Best</span>
           </div>
           <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
              <Trophy className="text-cyan-500 mb-1" size={16} />
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Global Top 10%</span>
           </div>
        </div>
      </div>

      <div className="w-full space-y-4">
        <button 
          onClick={onRetry}
          className="w-full py-6 bg-white text-black font-black rounded-3xl text-2xl italic tracking-tighter shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3"
        >
          <RotateCcw size={28} /> RE-ENGAGE
        </button>
        <div className="flex gap-4">
           <button 
             onClick={onMainMenu}
             className="flex-1 py-4 bg-white/5 text-white/50 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
           >
             <Home size={18} />
           </button>
           <button 
             className="flex-[3] py-4 bg-white/5 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl flex items-center justify-center gap-2"
           >
             Continue to next <ArrowRight size={14} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;

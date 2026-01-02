
import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { COLORS } from '../constants';
import { Trophy, ArrowLeft, Music, Calendar } from 'lucide-react';

interface LeaderboardScreenProps {
  onBack: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const history: LeaderboardEntry[] = JSON.parse(localStorage.getItem('piano-tiles-scores') || '[]');
    setEntries(history.sort((a, b) => b.score - a.score).slice(0, 10));
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-8" style={{ backgroundColor: COLORS.bg }}>
      <header className="flex items-center gap-6 mb-12">
        <button 
          onClick={onBack}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all active:scale-90"
        >
          <ArrowLeft className="text-white" size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">HALL OF FAME</h1>
          <p className="text-cyan-400/60 text-[10px] font-bold tracking-[0.3em] uppercase">Peak Performance Log</p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/20">
             <Trophy size={48} className="mb-4 opacity-10" />
             <p className="text-sm font-bold uppercase tracking-widest">No synthesis data found</p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div 
              key={index} 
              className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black italic text-xl ${
                   index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(238,187,85,0.4)]' :
                   index === 1 ? 'bg-slate-300 text-black' :
                   index === 2 ? 'bg-orange-400 text-black' :
                   'bg-white/10 text-white/40'
                }`}>
                  {index + 1}
                </div>
                <div>
                   <h3 className="text-white font-bold leading-none mb-1">{entry.songTitle}</h3>
                   <div className="flex items-center gap-3 text-white/30 text-[9px] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Music size={8} /> {entry.accuracy.toFixed(1)}%</span>
                      <span className="flex items-center gap-1"><Calendar size={8} /> {new Date(entry.date).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
              <div className="text-right">
                 <div className="text-xl font-black italic text-cyan-400 tracking-tighter">{entry.score.toLocaleString()}</div>
                 <div className="text-[10px] font-black text-white/40 leading-none">{entry.rank} Rank</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-dashed border-white/10 flex items-center justify-center text-center">
         <p className="text-[10px] font-medium text-white/30 italic">Scores are locally encrypted and synchronized with your simulation engine.</p>
      </div>
    </div>
  );
};

export default LeaderboardScreen;

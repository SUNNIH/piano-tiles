
import React, { useEffect } from 'react';
import { Music } from 'lucide-react';
import { COLORS } from '../constants';

interface Props {
  onComplete: () => void;
}

const IntroSequence: React.FC<Props> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#120a06] z-50 animate-in fade-in duration-1000">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#eebb55] opacity-10 rounded-full scale-150 blur-xl" />
        <div className="animate-bounce-slow">
          <Music size={80} color={COLORS.primary} strokeWidth={1.5} />
        </div>
      </div>
      <h1 className="text-3xl font-black text-white tracking-[0.25em] font-mono">
        PIANO<span className="text-[#eebb55]">TILES</span>
      </h1>
      <p className="text-[10px] text-white/40 mt-2 font-mono tracking-widest uppercase">
        Loading Resources...
      </p>
    </div>
  );
};

export default IntroSequence;

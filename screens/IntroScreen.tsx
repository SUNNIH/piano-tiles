
import React, { useEffect, useState } from 'react';
import { Music } from 'lucide-react';
import { COLORS } from '../constants';

interface Props {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center bg-[#120a06] transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#eebb55] opacity-10 rounded-full scale-150 blur-xl animate-pulse" />
        <div className="animate-bounce-slow">
          <Music size={80} color={COLORS.primary} strokeWidth={1.5} />
        </div>
      </div>
      <h1 className="text-4xl font-black text-white tracking-[0.25em] font-mono">
        PIANO<span className="text-[#eebb55]">TILES</span>
      </h1>
      <p className="text-[10px] text-white/40 mt-4 font-mono tracking-widest uppercase">
        Initializing Web Audio...
      </p>
    </div>
  );
}

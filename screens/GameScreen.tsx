
import React, { useState } from 'react';
import { Home, RotateCcw, Code, Bot } from 'lucide-react';
import { GameEngine } from '../components/GameEngine';
import { useGameStore } from '../store';
import { GameStatus } from '../types';
import { COLORS } from '../constants';
import CodeGenerator from '../components/CodeGenerator';

export default function GameScreen() {
  const { status, setView, resetGame, score, selectedSong, isAutoPlay, toggleAutoPlay } = useGameStore();
  const [showCodeGen, setShowCodeGen] = useState(false);

  const handleExit = () => {
    resetGame();
    setView('MENU');
  };

  const handleRetry = () => {
    resetGame();
    // Setting status to IDLE then PLAYING triggers a remount of the logic
  };

  return (
    <div className="flex-1 flex flex-col bg-[#120a06] relative overflow-hidden">
      <GameEngine />

      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start pointer-events-none">
        <div className="text-6xl font-black text-white drop-shadow-2xl opacity-80">{score}</div>
        <button 
          onClick={toggleAutoPlay}
          className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center transition-all ${isAutoPlay ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40'}`}
        >
          <Bot size={24} />
        </button>
      </div>

      {status === GameStatus.GAME_OVER && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          {!showCodeGen ? (
            <div className="text-center w-full max-w-sm">
              <h2 className="text-6xl font-black text-[#eebb55] mb-2 tracking-tighter">GAME OVER</h2>
              <p className="text-2xl text-white/60 mb-12">Total Score: <span className="text-white font-bold">{score}</span></p>
              
              <div className="flex justify-center gap-6 mb-12">
                <button 
                  onClick={handleExit}
                  className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Home color="#fff" size={28} />
                </button>
                <button 
                  onClick={handleRetry}
                  className="w-16 h-16 rounded-full bg-[#eebb55]/10 border border-[#eebb55]/30 flex items-center justify-center hover:bg-[#eebb55]/20 transition-colors"
                >
                  <RotateCcw color="#eebb55" size={28} />
                </button>
              </div>

              <button 
                onClick={() => setShowCodeGen(true)}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-600/20 transition-all"
              >
                <Code size={20} />
                <span>Export C++ Logic</span>
              </button>
            </div>
          ) : (
            <div className="w-full h-full max-w-4xl flex flex-col bg-[#1e1e1e] rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center p-6 bg-[#2d2d2d] border-b border-black/20">
                <h3 className="font-bold text-lg">C++ Game Generator</h3>
                <button onClick={() => setShowCodeGen(false)} className="text-white/40 hover:text-white px-3 py-1">Close</button>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeGenerator 
                  bgmName={selectedSong.title} 
                  bgmVolume={0.8} 
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

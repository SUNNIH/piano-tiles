
import { create } from 'zustand';
import { Song, GameStatus } from './types';
import { SONGS } from './constants';

interface GameState {
  view: 'INTRO' | 'MENU' | 'GAME';
  status: GameStatus;
  score: number;
  highScore: number;
  selectedSong: Song;
  isAutoPlay: boolean;
  
  setView: (view: 'INTRO' | 'MENU' | 'GAME') => void;
  setStatus: (status: GameStatus) => void;
  setScore: (score: number) => void;
  setHighScore: (score: number) => void;
  setSelectedSong: (song: Song) => void;
  toggleAutoPlay: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  view: 'INTRO',
  status: GameStatus.IDLE,
  score: 0,
  highScore: 0,
  selectedSong: SONGS[0],
  isAutoPlay: false,

  setView: (view) => set({ view }),
  setStatus: (status) => set({ status }),
  setScore: (score) => set((state) => ({ 
    score, 
    highScore: Math.max(state.highScore, score) 
  })),
  setHighScore: (highScore) => set({ highScore }),
  setSelectedSong: (selectedSong) => set({ selectedSong }),
  toggleAutoPlay: () => set((state) => ({ isAutoPlay: !state.isAutoPlay })),
  resetGame: () => set({ score: 0, status: GameStatus.IDLE }),
}));

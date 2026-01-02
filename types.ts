
export type ViewState = 'INTRO' | 'LOADING' | 'MENU' | 'GAME' | 'RESULTS' | 'LEADERBOARD';

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  WON = 'WON'
}

export type GameRank = 'S' | 'A' | 'B' | 'C';

export interface GameResults {
  score: number;
  maxCombo: number;
  accuracy: number;
  rank: GameRank;
  isNewHighScore: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  baseSpeed: number;
  melody: string[];
  audioSrc?: string; 
  midiSrc?: string;
  midiData?: {time: number, note: string, isLong?: boolean, lane?: number}[];
  file?: File;
}

export interface Tile {
  id: string;
  lane: number;
  y: number;
  isSpecial: boolean;
  isHit: boolean;
  timestamp: number;
  targetHitTime?: number;
  isLong: boolean;
  isHeld: boolean;
}

export interface LeaderboardEntry {
  songId: string;
  songTitle: string;
  score: number;
  accuracy: number;
  rank: GameRank;
  date: string;
}

export enum CppFramework {
  SFML = 'SFML',
  SDL2 = 'SDL2',
  RAYLIB = 'Raylib',
  OPENGL = 'Modern OpenGL'
}

export interface GeneratedCode {
  code: string;
  explanation: string;
}

export interface AudioTrackState {
  isPlaying: boolean;
  volume: number;
  file: File | null;
}

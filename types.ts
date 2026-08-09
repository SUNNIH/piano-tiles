
export type ViewState = 'INTRO' | 'LOADING' | 'MENU' | 'GAME' | 'RESULTS' | 'LEADERBOARD' | 'CPP_FORGE' | 'LIBRARY';

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
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Custom';
  baseSpeed: number;
  melody: string[];
  audioSrc?: string; 
  midiSrc?: string;
  midiData?: {time: number, note: string, isLong?: boolean, lane?: number}[];
  file?: File;
  storagePath?: string; // Native storage reference
  isGoogleDrive?: boolean;
  driveFileId?: string;
  mimeType?: string;
  audioBuffer?: AudioBuffer;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  iconUrl?: string;
  thumbnailUrl?: string;
}

export interface LibraryFolder {
  id: string;
  name: string;
  path: string;
  songCount: number;
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
  note?: string;
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
  cmake: string;
  explanation: string;
}

export interface AudioTrackState {
  isPlaying: boolean;
  volume: number;
  file: File | null;
}

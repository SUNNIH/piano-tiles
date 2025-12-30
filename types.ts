
export type ViewState = 'INTRO' | 'MENU' | 'GAME' | 'GITHUB';

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  WON = 'WON'
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

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  public_repos: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  private: boolean;
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

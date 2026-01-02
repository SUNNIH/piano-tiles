
import { Song, GameRank } from './types';

export const COLORS = {
  bg: '#0a0a0c',
  card: 'rgba(25, 25, 30, 0.8)',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  primary: '#00f2ff', // Neon Cyan
  primaryGlow: 'rgba(0, 242, 255, 0.5)',
  secondary: '#7000ff', // Electric Purple
  accent: '#ff0055', // Hot Pink
  success: '#00ff88', // Emerald Neon
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  laneBorder: 'rgba(255, 255, 255, 0.05)',
  laneLine: 'rgba(255, 255, 255, 0.1)',
};

export const RANK_THRESHOLDS: { rank: GameRank; minAccuracy: number }[] = [
  { rank: 'S', minAccuracy: 98 },
  { rank: 'A', minAccuracy: 90 },
  { rank: 'B', minAccuracy: 80 },
  { rank: 'C', minAccuracy: 0 },
];

export const SONGS: Song[] = [
  { 
    id: '1', 
    title: 'Canon in D', 
    artist: 'Pachelbel', 
    bpm: 75, 
    difficulty: 'Easy',
    baseSpeed: 0.4,
    melody: [
        'D', 'A', 'B', 'F#', 'G', 'D', 'G', 'A',
        'D', 'A', 'B', 'F#', 'G', 'D', 'G', 'A',
        'D', 'C#', 'B', 'A', 'G', 'F#', 'G', 'E',
        'D', 'F#', 'A', 'G', 'F#', 'D', 'F#', 'E',
        'D', 'A', 'B', 'F#', 'G', 'D', 'G', 'A',
        'D', 'A', 'B', 'F#', 'G', 'D', 'G', 'A',
        'D', 'C#', 'B', 'A', 'G', 'F#', 'G', 'E',
        'D', 'F#', 'A', 'G', 'F#', 'D', 'F#', 'E',
        'D'
    ]
  },
  { 
    id: '2', 
    title: 'Fur Elise', 
    artist: 'Beethoven', 
    bpm: 110, 
    difficulty: 'Medium',
    baseSpeed: 0.55,
    melody: [
        'E', 'D#', 'E', 'D#', 'E', 'B', 'D', 'C', 'A',
        'C', 'E', 'A', 'B', 
        'E', 'G#', 'B', 'C',
        'E', 'E', 'D#', 'E', 'D#', 'E', 'B', 'D', 'C', 'A',
        'C', 'E', 'A', 'B', 
        'E', 'C', 'B', 'A',
        'B', 'C', 'D', 'E',
        'G', 'F', 'E', 'D',
        'F', 'E', 'D', 'C',
        'E', 'D', 'C', 'B',
        'E', 'E', 'E', 'E'
    ]
  },
  { 
    id: '3', 
    title: 'Moonlight Sonata', 
    artist: 'Beethoven', 
    bpm: 130, 
    difficulty: 'Hard',
    baseSpeed: 0.7,
    melody: [
        'C#', 'C#', 'C#', 'G#', 'C#', 'E', 'G#', 'C#',
        'E', 'G#', 'C#', 'E', 'G#', 'C#', 'E', 'G#',
        'B', 'E', 'G#', 'B', 'E', 'G#', 'B', 'E',
        'A', 'C#', 'E', 'A', 'C#', 'E', 'A', 'C#',
        'F#', 'A', 'C#', 'F#', 'A', 'C#', 'F#', 'A',
        'G#', 'C', 'F#', 'G#', 'C', 'F#', 'G#', 'C',
        'G#', 'C#', 'E', 'G#', 'C#', 'E', 'G#', 'C#'
    ]
  }
];

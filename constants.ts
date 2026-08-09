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
    title: 'Sax Dance',
    artist: 'Tumisho & DJ Manzo (Amapiano Hit)',
    bpm: 112,
    difficulty: 'Medium',
    baseSpeed: 0.6,
    melody: [
      'E', 'G', 'A', 'B', 'A', 'G', 'E', 'D',
      'E', 'G', 'A', 'B', 'D5', 'B', 'A', 'G',
      'E', 'G', 'A', 'B', 'A', 'G', 'E', 'D',
      'C', 'D', 'E', 'G', 'A', 'B', 'A', 'E',
      'E', 'G', 'A', 'B', 'A', 'G', 'E', 'D',
      'E', 'G', 'A', 'B', 'D5', 'B', 'A', 'G'
    ]
  },
  {
    id: '2',
    title: 'Soweto Log Drum Anthem',
    artist: 'Amapiano Originals',
    bpm: 115,
    difficulty: 'Hard',
    baseSpeed: 0.72,
    melody: [
      'A', 'C', 'D', 'E', 'G', 'A', 'G', 'E',
      'D', 'E', 'G', 'A', 'C5', 'A', 'G', 'E',
      'A', 'C', 'D', 'E', 'G', 'A', 'G', 'E',
      'F', 'G', 'A', 'C5', 'D5', 'C5', 'A', 'G',
      'A', 'C', 'D', 'E', 'G', 'A', 'G', 'E'
    ]
  },
  { 
    id: '3', 
    title: 'Canon in D (Afrobeat Mix)', 
    artist: 'Pachelbel & Sunrovo', 
    bpm: 75, 
    difficulty: 'Easy',
    baseSpeed: 0.45,
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
    id: '4', 
    title: 'Fur Elise (Kwaito Groove)', 
    artist: 'Beethoven & Sunrovo', 
    bpm: 110, 
    difficulty: 'Medium',
    baseSpeed: 0.58,
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
    id: '5', 
    title: 'Moonlight Sonata (Tribal Pulse)', 
    artist: 'Beethoven & Sunrovo', 
    bpm: 130, 
    difficulty: 'Hard',
    baseSpeed: 0.72,
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

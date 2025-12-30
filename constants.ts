import { Song } from './types';

export const COLORS = {
  bg: '#120a06',
  primary: '#eebb55',
  primaryDark: '#c79a30',
  secondary: '#3d2b23',
  text: '#f2e8e4',
  accent: '#ff5555',
  laneBorder: 'rgba(255, 255, 255, 0.1)',
  laneLine: '#ffffff20',
  tileGradientStart: '#444',
  tileGradientEnd: '#111',
  tileActive: '#666',
  tileHit: '#4caf50',
  tileSpecial: '#ffd700',
  tileNormal: '#444444'
};

export const SONGS: Song[] = [
  { 
    id: '1', 
    title: 'Canon in D', 
    artist: 'Pachelbel', 
    bpm: 75, 
    difficulty: 'Easy',
    baseSpeed: 0.4,
    // Repeating the main theme for a longer gameplay experience
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
    bpm: 130, // Slightly accelerated for gameplay
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
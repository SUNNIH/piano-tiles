import React, { useRef, useEffect } from 'react';
import { Upload, Volume2, Music, Mic } from 'lucide-react';
import { AudioTrackState } from '../types';

interface TrackPlayerProps {
  track: AudioTrackState;
  onFileChange: (file: File) => void;
  onVolumeChange: (vol: number) => void;
  title: string;
  icon: 'mic' | 'music';
  color: string;
  analyserNode?: AnalyserNode; // For future visualizer hookup per track if needed
}

const TrackPlayer: React.FC<TrackPlayerProps> = ({ 
  track, 
  onFileChange, 
  onVolumeChange,
  title,
  icon,
  color
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const borderColor = track.isPlaying ? `border-${color}-500` : 'border-slate-700';
  const glow = track.isPlaying ? `shadow-[0_0_15px_rgba(var(--${color}-rgb),0.3)]` : '';

  return (
    <div className={`bg-slate-800 p-6 rounded-xl border ${borderColor} transition-all duration-300 ${glow}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {icon === 'mic' ? <Mic className={`text-${color}-400`} /> : <Music className={`text-${color}-400`} />}
          <h3 className="font-semibold text-lg text-white">{title}</h3>
        </div>
        {track.file && (
          <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300 max-w-[150px] truncate">
            {track.file.name}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* File Upload Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer group relative h-20 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center hover:border-slate-400 hover:bg-slate-700/50 transition-colors"
        >
          <input 
            type="file" 
            accept="audio/*" 
            ref={fileInputRef}
            onChange={handleFile}
            className="hidden"
          />
          <Upload className="w-6 h-6 text-slate-500 group-hover:text-slate-300 mb-1" />
          <span className="text-xs text-slate-500 group-hover:text-slate-300">
            {track.file ? "Change File" : "Click to Upload Audio"}
          </span>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1"><Volume2 className="w-3 h-3"/> Volume</span>
            <span>{Math.round(track.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={track.volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-${color}-500 hover:accent-${color}-400`}
          />
        </div>
      </div>
    </div>
  );
};

export default TrackPlayer;

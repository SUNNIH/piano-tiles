
import React, { useRef } from 'react';
import { Song } from '../types';
import { SONGS, COLORS } from '../constants';
import { Play, Music, Upload, FileAudio } from 'lucide-react';

interface Props {
  onPlay: (song: Song) => void;
  selectedSong: Song;
  setSelectedSong: (song: Song) => void;
}

const MenuScreen: React.FC<Props> = ({ onPlay, selectedSong, setSelectedSong }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const customSong: Song = {
        id: `custom-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Custom Track',
        bpm: 120,
        difficulty: 'Medium',
        baseSpeed: 0.65,
        melody: [],
        audioSrc: url,
        file: file
      };
      setSelectedSong(customSong);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#120a06] h-full">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        className="hidden" 
        accept="audio/*"
      />

      <div className="p-8 pb-4">
        <h2 className="text-2xl font-bold text-white">Select Song</h2>
        <p className="text-sm text-white/50">Choose your rhythm</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4">
        {/* Custom Upload Card */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className={`w-full text-left p-4 rounded-2xl border-2 border-dashed transition-all ${
            selectedSong.id.startsWith('custom') 
              ? 'border-[#eebb55] bg-[#eebb55]/10' 
              : 'border-white/20 hover:border-white/40'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedSong.id.startsWith('custom') ? 'bg-[#eebb55]' : 'bg-white/10'}`}>
              {selectedSong.id.startsWith('custom') 
                ? <FileAudio size={20} color="#000" /> 
                : <Upload size={20} color="rgba(255,255,255,0.5)" />}
            </div>
            <div>
              <p className={`font-bold ${selectedSong.id.startsWith('custom') ? 'text-[#eebb55]' : 'text-white'}`}>
                {selectedSong.id.startsWith('custom') ? selectedSong.title : "Upload Custom Song"}
              </p>
              <p className="text-xs text-white/60">
                {selectedSong.id.startsWith('custom') ? "Local Audio File" : "Use your own MP3/WAV"}
              </p>
            </div>
          </div>
        </button>

        {/* Preset Songs */}
        {SONGS.map((item) => {
          const isSelected = selectedSong.id === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setSelectedSong(item)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                isSelected 
                  ? 'border-[#eebb55] bg-[#eebb55]/10 shadow-[0_0_15px_rgba(238,187,85,0.1)]' 
                  : 'border-white/5 bg-[#1a1410] hover:bg-[#251d18]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#eebb55]' : 'bg-white/10'}`}>
                  <Music size={20} color={isSelected ? '#000' : 'rgba(255,255,255,0.5)'} />
                </div>
                <div>
                  <p className={`font-bold ${isSelected ? 'text-[#eebb55]' : 'text-white'}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-white/60">
                    {item.artist} • {item.bpm} BPM
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-8">
        <button 
          onClick={() => onPlay(selectedSong)}
          className="w-full flex items-center justify-center gap-3 bg-[#eebb55] py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-[#eebb55]/20"
        >
          <Play size={24} fill="#000" color="#000" />
          <span className="text-lg font-bold text-black tracking-wide">START GAME</span>
        </button>
      </div>
    </div>
  );
};

export default MenuScreen;

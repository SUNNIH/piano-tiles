
import React, { useRef, useState, useEffect } from 'react';
import { Song, ViewState } from '../types';
import { SONGS, COLORS } from '../constants';
import { Play, Music, Upload, FileAudio, Eye, Settings, Trophy, ChevronRight, Folder, Terminal, FolderOpen, Cloud, Sparkles } from 'lucide-react';
import { audioService } from '../services/audioService';
import { GoogleDriveModal } from './GoogleDriveModal';

interface Props {
  onPlay: (song: Song, isDemo?: boolean) => void;
  onShowLeaderboard: () => void;
  onShowCppForge: () => void;
  selectedSong: Song;
  setSelectedSong: (song: Song) => void;
  onOpenLibrary?: () => void;
}

const MenuScreen: React.FC<Props> = ({ 
  onPlay, 
  onShowLeaderboard, 
  onShowCppForge, 
  selectedSong, 
  setSelectedSong,
  onOpenLibrary 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [importedSongs, setImportedSongs] = useState<Song[]>([]);

  // Load any previously imported songs from local session
  useEffect(() => {
    const saved = localStorage.getItem('afropiano_custom_tracks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setImportedSongs(parsed);
        }
      } catch (e) {
        console.warn("Error parsing saved tracks:", e);
      }
    }
  }, []);

  const resumeAudio = () => {
    audioService.resume().catch(err => console.error("Audio resume failed:", err));
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    resumeAudio();
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const customSong: Song = {
        id: `custom-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Local Audio File',
        bpm: 120,
        difficulty: 'Medium',
        baseSpeed: 0.65,
        melody: [],
        audioSrc: url,
        file: file,
        storagePath: `/AfroPiano/Library/${file.name}`
      };
      setSelectedSong(customSong);
      setImportedSongs(prev => [customSong, ...prev]);
    }
  };

  const handleGoogleDriveImported = (song: Song) => {
    resumeAudio();
    setSelectedSong(song);
    setImportedSongs(prev => [song, ...prev.filter(s => s.id !== song.id)]);
  };

  return (
    <div 
      className="w-full h-full flex flex-col relative" 
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
      onClick={resumeAudio}
      onTouchStart={resumeAudio}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[130px] pointer-events-none"></div>

      <div className="p-10 pb-6 flex justify-between items-center z-10">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white">AFRO<span className="text-cyan-400">PI@NO</span></h1>
          <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.4em] mt-2">Cultural Rhythm Simulation</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors"
        >
          <Settings size={24} className="text-white/60" />
        </button>
      </div>

      <div className="flex px-10 gap-3 mb-8 z-10">
        <button 
          onClick={(e) => { e.stopPropagation(); setShowDriveModal(true); }}
          className="flex-1 py-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-3xl border border-cyan-400/30 flex items-center justify-center gap-3 transition-all group shadow-[0_0_20px_rgba(0,242,255,0.15)]"
        >
          <Cloud size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Google Drive</span>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onShowLeaderboard(); }}
          className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 flex items-center justify-center gap-3 transition-all group"
        >
          <Trophy size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Scores</span>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onShowCppForge(); }}
          className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 flex items-center justify-center gap-3 transition-all group"
        >
          <Terminal size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70">SDK Forge</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-10 py-2 space-y-5 custom-scrollbar z-10">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">Import Sources</h3>
        </div>
        
        {/* Google Drive Picker Card */}
        <div 
            onClick={(e) => { e.stopPropagation(); setShowDriveModal(true); }}
            className={`p-6 rounded-[2.5rem] border-2 border-dashed flex items-center justify-between cursor-pointer transition-all active:scale-95 group ${
              selectedSong.isGoogleDrive 
                ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_30px_rgba(0,242,255,0.2)]' 
                : 'border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-400/5 bg-cyan-950/10'
            }`}
        >
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${selectedSong.isGoogleDrive ? 'bg-cyan-400 text-black shadow-[0_0_25px_rgba(0,242,255,0.4)]' : 'bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black'}`}>
                <Cloud size={28} />
              </div>
              <div>
                <div className={`font-black text-xl tracking-tight flex items-center gap-2 ${selectedSong.isGoogleDrive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                    {selectedSong.isGoogleDrive ? selectedSong.title : "Google Drive / Picker"}
                    <Sparkles size={16} className="text-cyan-400" />
                </div>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-50 mt-1">
                    {selectedSong.isGoogleDrive ? selectedSong.storagePath : "Import Audio Files directly from Google Drive"}
                </div>
              </div>
            </div>
            <ChevronRight className={`opacity-40 group-hover:opacity-100 transition-opacity ${selectedSong.isGoogleDrive ? 'text-cyan-400' : 'text-white'}`} size={24} />
        </div>

        {/* Local Storage / Folder Action */}
        <div 
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className={`p-6 rounded-[2.5rem] border-2 border-dashed flex items-center justify-between cursor-pointer transition-all active:scale-95 group ${
              selectedSong.id.startsWith('custom') && !selectedSong.isGoogleDrive
                ? 'border-cyan-400 bg-cyan-400/10' 
                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
            }`}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileImport} 
                className="hidden" 
                accept="audio/*"
            />
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${selectedSong.id.startsWith('custom') && !selectedSong.isGoogleDrive ? 'bg-cyan-400 text-black shadow-[0_0_25px_rgba(0,242,255,0.4)]' : 'bg-white/5 text-white/40 group-hover:text-white group-hover:bg-white/10'}`}>
                {selectedSong.id.startsWith('custom') && !selectedSong.isGoogleDrive ? <FolderOpen size={28} /> : <Folder size={28} />}
              </div>
              <div>
                <div className={`font-black text-xl tracking-tight ${selectedSong.id.startsWith('custom') && !selectedSong.isGoogleDrive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                    {selectedSong.id.startsWith('custom') && !selectedSong.isGoogleDrive ? selectedSong.title : "Local Device Upload"}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mt-1">
                    {selectedSong.storagePath || "Select MP3/WAV from disk"}
                </div>
              </div>
            </div>
            <ChevronRight className={`opacity-20 group-hover:opacity-100 transition-opacity ${selectedSong.id.startsWith('custom') && !selectedSong.isGoogleDrive ? 'text-cyan-400' : 'text-white'}`} size={24} />
        </div>

        <div className="flex items-center justify-between px-1 pt-2">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">Curated & Imported Tracks</h3>
        </div>

        {/* List of songs */}
        {[...importedSongs, ...SONGS].map(song => (
          <div 
            key={song.id}
            onClick={(e) => { e.stopPropagation(); setSelectedSong(song); }}
            className={`p-6 rounded-[2.5rem] border transition-all active:scale-95 flex items-center justify-between ${
              selectedSong.id === song.id 
                ? 'border-cyan-400/50 bg-cyan-400/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]' 
                : 'border-white/5 hover:bg-white/5 bg-slate-900/30 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${selectedSong.id === song.id ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,242,255,0.2)]' : 'bg-white/5 text-white/30'}`}>
                {song.isGoogleDrive ? <Cloud size={26} /> : song.id.startsWith('custom') ? <FileAudio size={26} /> : <Music size={26} />}
              </div>
              <div>
                <div className={`font-black text-xl tracking-tight ${selectedSong.id === song.id ? 'text-white' : 'text-white/60'}`}>{song.title}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">{song.artist}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black italic tracking-tighter ${
                    song.isGoogleDrive ? 'bg-cyan-500/20 text-cyan-400' :
                    song.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    song.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>{song.isGoogleDrive ? 'Google Drive' : song.difficulty}</span>
                </div>
              </div>
            </div>
            {selectedSong.id === song.id && (
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_15px_rgba(0,242,255,1)]"></div>
            )}
          </div>
        ))}
      </div>

      <div className="p-10 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent space-y-4 z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); onPlay(selectedSong); }}
          className="w-full py-7 bg-cyan-400 text-black font-black rounded-[2.5rem] text-3xl italic tracking-tighter hover:bg-cyan-300 transition-all flex items-center justify-center gap-4 shadow-[0_10px_50px_rgba(0,242,255,0.3)] active:scale-95"
        >
          <Play className="w-10 h-10 fill-black" />
          START SESSION
        </button>
      </div>

      {/* Google Drive / Picker Modal */}
      <GoogleDriveModal 
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        onSongImported={handleGoogleDriveImported}
      />

      {showSettings && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl z-[100] p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
           <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-10 border border-white/10">
              <Settings size={48} className="text-cyan-400" />
           </div>
           <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-3">ENGINE CONFIG</h2>
           <p className="text-white/30 text-xs mb-14 tracking-widest font-bold">Native & Cloud Storage Calibration</p>
           
           <div className="w-full space-y-5 mb-14">
              <div className="p-5 bg-white/5 rounded-3xl border border-white/10 flex justify-between items-center">
                 <span className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Google Drive Auto-Sync</span>
                 <div className="w-14 h-7 bg-cyan-400 rounded-full relative p-1 transition-all"><div className="w-5 h-5 bg-white rounded-full absolute right-1"></div></div>
              </div>
              <div className="p-5 bg-white/5 rounded-3xl border border-white/10 flex justify-between items-center">
                 <span className="text-xs font-black uppercase tracking-[0.3em] text-white/50">High Fidelity Buffering</span>
                 <div className="w-14 h-7 bg-cyan-400 rounded-full relative p-1 transition-all"><div className="w-5 h-5 bg-white rounded-full absolute right-1"></div></div>
              </div>
           </div>

           <button 
             onClick={(e) => { e.stopPropagation(); setShowSettings(false); }}
             className="w-full py-6 bg-cyan-400 text-black font-black rounded-[2rem] uppercase tracking-[0.3em] text-[11px] shadow-2xl active:scale-95 transition-transform"
           >
             Save Paths
           </button>
        </div>
      )}
    </div>
  );
};

export default MenuScreen;


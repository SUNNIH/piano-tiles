
import React, { useState, useCallback, useEffect } from 'react';
import MenuScreen from './components/MenuScreen';
import GameScreen from './components/GameScreen';
import IntroSequence from './components/IntroSequence';
import LoadingScreen from './components/LoadingScreen';
import ResultsScreen from './components/ResultsScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import CodeGenerator from './components/CodeGenerator';
import { Song, ViewState, GameResults } from './types';
import { SONGS, COLORS } from './constants';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('INTRO');
  const [selectedSong, setSelectedSong] = useState<Song>(SONGS[0]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [lastResults, setLastResults] = useState<GameResults | null>(null);

  // Web Lifecycle Handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) audioService.stop();
      else audioService.resume();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handlePlay = useCallback((song: Song, demo: boolean = false) => {
    setSelectedSong(song);
    setIsDemoMode(demo);
    setView('LOADING');
  }, []);

  return (
    <div className="w-full h-screen flex justify-center bg-black overflow-hidden font-sans">
      <div className="w-full h-full max-w-lg relative shadow-2xl overflow-hidden" style={{ backgroundColor: COLORS.bg }}>
        {view === 'INTRO' && (
           <IntroSequence onComplete={() => setView('MENU')} />
        )}
        
        {view === 'LOADING' && (
          <LoadingScreen song={selectedSong} onComplete={() => setView('GAME')} />
        )}

        {view === 'MENU' && (
          <MenuScreen 
            onPlay={handlePlay} 
            onShowLeaderboard={() => setView('LEADERBOARD')}
            onShowCppForge={() => setView('CPP_FORGE')}
            selectedSong={selectedSong} 
            setSelectedSong={setSelectedSong}
          />
        )}

        {view === 'LEADERBOARD' && (
          <LeaderboardScreen onBack={() => setView('MENU')} />
        )}

        {view === 'CPP_FORGE' && (
           <CodeGenerator 
             bgmName={selectedSong.title + (selectedSong.file ? ".mp3" : ".wav")} 
             bgmVolume={1.0} 
             onBack={() => setView('MENU')}
           />
        )}

        {view === 'GAME' && (
          <GameScreen 
            song={selectedSong} 
            onExit={() => setView('MENU')} 
            onFinish={(results) => { setLastResults(results); setView('RESULTS'); }}
            isDemo={isDemoMode}
          />
        )}

        {view === 'RESULTS' && lastResults && (
          <ResultsScreen 
            results={lastResults} 
            song={selectedSong}
            onRetry={() => handlePlay(selectedSong, isDemoMode)}
            onMainMenu={() => setView('MENU')}
          />
        )}
      </div>
    </div>
  );
};

export default App;

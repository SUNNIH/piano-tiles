
import React, { useState, useCallback } from 'react';
import MenuScreen from './components/MenuScreen';
import GameScreen from './components/GameScreen';
import IntroSequence from './components/IntroSequence';
import LoadingScreen from './components/LoadingScreen';
import ResultsScreen from './components/ResultsScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import { Song, ViewState, GameResults } from './types';
import { SONGS, COLORS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('INTRO');
  const [selectedSong, setSelectedSong] = useState<Song>(SONGS[0]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [lastResults, setLastResults] = useState<GameResults | null>(null);

  const handlePlay = useCallback((song: Song, demo: boolean = false) => {
    setSelectedSong(song);
    setIsDemoMode(demo);
    setView('LOADING');
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setView('GAME');
  }, []);

  const handleGameFinish = useCallback((results: GameResults) => {
    setLastResults(results);
    setView('RESULTS');
  }, []);

  const handleExitGame = useCallback(() => {
    setIsDemoMode(false);
    setView('MENU');
  }, []);

  const handleShowLeaderboard = useCallback(() => {
    setView('LEADERBOARD');
  }, []);

  const handleIntroComplete = useCallback(() => {
    setView('MENU');
  }, []);

  return (
    <div className="w-full h-screen flex justify-center bg-black overflow-hidden font-sans">
      <div className="w-full h-full max-w-lg relative shadow-2xl overflow-hidden" style={{ backgroundColor: COLORS.bg }}>
        {view === 'INTRO' && (
           <IntroSequence onComplete={handleIntroComplete} />
        )}
        
        {view === 'LOADING' && (
          <LoadingScreen song={selectedSong} onComplete={handleLoadingComplete} />
        )}

        {view === 'MENU' && (
          <MenuScreen 
            onPlay={handlePlay} 
            onShowLeaderboard={handleShowLeaderboard}
            selectedSong={selectedSong} 
            setSelectedSong={setSelectedSong}
          />
        )}

        {view === 'LEADERBOARD' && (
          <LeaderboardScreen onBack={() => setView('MENU')} />
        )}

        {view === 'GAME' && (
          <GameScreen 
            song={selectedSong} 
            onExit={handleExitGame} 
            onFinish={handleGameFinish}
            isDemo={isDemoMode}
          />
        )}

        {view === 'RESULTS' && lastResults && (
          <ResultsScreen 
            results={lastResults} 
            song={selectedSong}
            onRetry={() => handlePlay(selectedSong, isDemoMode)}
            onMainMenu={handleExitGame}
          />
        )}
      </div>
    </div>
  );
};

export default App;

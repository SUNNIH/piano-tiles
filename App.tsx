
import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useGameStore } from './store';
import IntroScreen from './screens/IntroScreen';
import MenuScreen from './screens/MenuScreen';
import GameScreen from './screens/GameScreen';
import GitHubScreen from './screens/GitHubScreen';
import { COLORS } from './constants';
import { audioService } from './services/audioService';
import { dbService } from './services/dbService';

export default function App() {
  const { view, setView, setHighScore } = useGameStore();

  useEffect(() => {
    audioService.init();
    dbService.getHighScore().then(setHighScore);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.container}>
          {view === 'INTRO' && <IntroScreen onComplete={() => setView('MENU')} />}
          {view === 'MENU' && <MenuScreen />}
          {view === 'GAME' && <GameScreen />}
          {view === 'GITHUB' && <GitHubScreen />}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
});


import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  runOnJS,
  cancelAnimation
} from 'react-native-reanimated';
import { useGameStore } from '../store';
import { GameStatus, Tile } from '../types';
import { COLORS } from '../constants';
import { audioService } from '../services/audioService';
import { dbService } from '../services/dbService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const LANE_WIDTH = SCREEN_WIDTH / 4;

export const GameEngine: React.FC = () => {
  const { status, selectedSong, setScore, setStatus, isAutoPlay, score } = useGameStore();
  const [activeTiles, setActiveTiles] = useState<Tile[]>([]);
  const tilesRef = useRef<Tile[]>([]);
  const scoreRef = useRef(0);
  
  // Game parameters
  const speed = (selectedSong?.baseSpeed || 0.5) * 800; // pixels per second

  const handleHit = (id: string) => {
    const tile = tilesRef.current.find(t => t.id === id);
    if (tile && !tile.isHit) {
      tile.isHit = true;
      scoreRef.current += 10;
      runOnJS(setScore)(scoreRef.current);
    }
  };

  const handleMiss = () => {
    runOnJS(dbService.saveHighScore)(scoreRef.current);
    runOnJS(setStatus)(GameStatus.GAME_OVER);
  };

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      scoreRef.current = 0;
      tilesRef.current = [];
      
      const interval = setInterval(() => {
        const id = `tile-${Date.now()}`;
        const newTile: Tile = {
          id,
          lane: Math.floor(Math.random() * 4),
          y: -200,
          isSpecial: Math.random() > 0.9,
          isHit: false,
          timestamp: Date.now(),
          isLong: false,
          isHeld: false
        };
        tilesRef.current.push(newTile);
        setActiveTiles([...tilesRef.current]);
      }, 800 / (selectedSong.baseSpeed || 1));

      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <View style={styles.container}>
      {/* Background Lanes */}
      <View style={styles.lanes}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={styles.laneBorder} />
        ))}
      </View>

      {/* Target Hit Line */}
      <View style={styles.targetLine} />

      {/* Tiles */}
      {activeTiles.map(tile => (
        <TileComponent 
          key={tile.id} 
          tile={tile} 
          speed={speed} 
          onHit={() => handleHit(tile.id)} 
          onMiss={handleMiss}
          isAutoPlay={isAutoPlay}
        />
      ))}

      {/* Input Handling Overlays */}
      <View style={styles.inputContainer}>
        {[0, 1, 2, 3].map(i => (
          <Pressable 
            key={i} 
            style={styles.inputLane} 
            onPressIn={() => {
              const target = tilesRef.current
                .filter(t => t.lane === i && !t.isHit && t.y > SCREEN_HEIGHT * 0.5)
                .sort((a,b) => b.y - a.y)[0];
              if (target) handleHit(target.id);
            }} 
          />
        ))}
      </View>
    </View>
  );
};

const TileComponent = ({ tile, speed, onHit, onMiss, isAutoPlay }: any) => {
  const translateY = useSharedValue(-200);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(SCREEN_HEIGHT + 200, {
      duration: (SCREEN_HEIGHT + 400) / (speed / 1000),
      easing: Easing.linear
    }, (finished) => {
      if (finished && !tile.isHit) {
        runOnJS(onMiss)();
      }
    });

    return () => cancelAnimation(translateY);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Sync ref for collision detection in JS thread if needed
    tile.y = translateY.value;

    if (isAutoPlay && !tile.isHit && translateY.value > SCREEN_HEIGHT * 0.75) {
      runOnJS(onHit)();
    }

    return {
      transform: [{ translateY: translateY.value }],
      opacity: tile.isHit ? 0 : 1,
    };
  });

  return (
    <Animated.View style={[
      styles.tile, 
      { left: tile.lane * LANE_WIDTH, backgroundColor: tile.isSpecial ? COLORS.tileSpecial : COLORS.tileNormal },
      animatedStyle
    ]} />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  lanes: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  laneBorder: { flex: 1, borderRightWidth: 1, borderRightColor: COLORS.laneBorder },
  targetLine: { position: 'absolute', top: '80%', width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
  inputContainer: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  inputLane: { flex: 1 },
  tile: {
    position: 'absolute',
    width: LANE_WIDTH - 4,
    height: 160,
    marginHorizontal: 2,
    borderRadius: 12,
  }
});

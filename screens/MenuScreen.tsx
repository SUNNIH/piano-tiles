
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Music, Upload, Play, Star, Github } from 'lucide-react-native';
import { useGameStore } from '../store';
import { useGitHubStore } from '../store/githubStore';
import { SONGS, COLORS } from '../constants';
import { Song } from '../types';

export default function MenuScreen() {
  const { selectedSong, setSelectedSong, setView, highScore } = useGameStore();
  const { user } = useGitHubStore();

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (!result.canceled) {
      const file = result.assets[0];
      const customSong: Song = {
        id: `custom-${Date.now()}`,
        title: file.name,
        artist: 'Local File',
        bpm: 120,
        difficulty: 'Medium',
        baseSpeed: 0.65,
        melody: [],
        audioSrc: file.uri,
      };
      setSelectedSong(customSong);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>PIANO<Text style={{ color: COLORS.primary }}>TILES</Text></Text>
          <TouchableOpacity onPress={() => setView('GITHUB')} style={styles.ghToggle}>
            {user ? (
              <Image source={{ uri: user.avatar_url }} style={styles.ghAvatar} />
            ) : (
              <Github color={COLORS.primary} size={24} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.stats}>
          <Star size={14} color={COLORS.primary} fill={COLORS.primary} />
          <Text style={styles.statsText}>BEST: {highScore}</Text>
        </View>
      </View>

      <ScrollView style={styles.list}>
        <TouchableOpacity style={styles.uploadCard} onPress={handlePickDocument}>
          <Upload color={COLORS.primary} size={24} />
          <Text style={styles.uploadText}>IMPORT CUSTOM MUSIC</Text>
        </TouchableOpacity>

        {SONGS.map((song) => (
          <TouchableOpacity 
            key={song.id}
            style={[styles.songCard, selectedSong.id === song.id && styles.selectedCard]}
            onPress={() => setSelectedSong(song)}
          >
            <Music color={selectedSong.id === song.id ? COLORS.primary : '#555'} size={20} />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{song.title}</Text>
              <Text style={styles.songArtist}>{song.artist} • {song.difficulty}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.playButton} onPress={() => setView('GAME')}>
        <Play fill="#000" size={24} />
        <Text style={styles.playButtonText}>START TRACK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  // Fix: Corrected typo 'borderWeight' to 'borderWidth' as React Native styles only support borderWidth
  ghToggle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a1410', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  ghAvatar: { width: 36, height: 36, borderRadius: 18 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff' },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statsText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  list: { flex: 1 },
  uploadCard: {
    backgroundColor: '#1a1410',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: { color: COLORS.primary, fontWeight: 'bold', marginTop: 10 },
  songCard: {
    backgroundColor: '#1a1410',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedCard: { borderColor: COLORS.primary, borderWidth: 1 },
  songInfo: { marginLeft: 15 },
  songTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  songArtist: { color: '#666', fontSize: 12 },
  playButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  playButtonText: { color: '#000', fontSize: 18, fontWeight: '900', marginLeft: 10 },
});

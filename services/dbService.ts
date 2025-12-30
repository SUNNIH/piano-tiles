
import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = '@piano_tiles_high_score';

export const dbService = {
  /**
   * Saves the high score locally.
   */
  async saveHighScore(score: number): Promise<void> {
    try {
      const current = await this.getHighScore();
      if (score > current) {
        await AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
        // For actual Firebase integration:
        // await firebase.database().ref('leaderboard/' + userId).set({ score });
      }
    } catch (e) {
      console.error('Failed to save score', e);
    }
  },

  /**
   * Retrieves high score.
   */
  async getHighScore(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(HIGH_SCORE_KEY);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  }
};

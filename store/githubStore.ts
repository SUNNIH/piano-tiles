
import { create } from 'zustand';
import { GitHubUser, GitHubRepo } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GitHubState {
  accessToken: string | null;
  user: GitHubUser | null;
  repos: GitHubRepo[];
  isLoading: boolean;
  
  setToken: (token: string | null) => void;
  setUser: (user: GitHubUser | null) => void;
  setRepos: (repos: GitHubRepo[]) => void;
  logout: () => void;
}

export const useGitHubStore = create<GitHubState>((set) => ({
  accessToken: null,
  user: null,
  repos: [],
  isLoading: false,

  setToken: async (token) => {
    if (token) await AsyncStorage.setItem('github_token', token);
    else await AsyncStorage.removeItem('github_token');
    set({ accessToken: token });
  },
  
  setUser: (user) => set({ user }),
  setRepos: (repos) => set({ repos }),
  
  logout: async () => {
    await AsyncStorage.removeItem('github_token');
    set({ accessToken: null, user: null, repos: [] });
  }
}));

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Song, DriveFileItem } from '../types';
import { audioService } from './audioService';

// Initialize Firebase App instance safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));
// Force prompt to ensure refresh token / new scopes if needed
provider.setCustomParameters({
  prompt: 'select_account'
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is logged in via Firebase session, but we may need a fresh access token for Drive APIs
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    currentUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentUser = (): User | null => {
  return currentUser || auth.currentUser;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  currentUser = null;
};

/**
 * Loads the Google API script and Google Picker library
 */
export const loadGooglePickerApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if gapi and picker are already ready
    if (typeof window !== 'undefined' && (window as any).google?.picker) {
      resolve();
      return;
    }

    const onGapiLoaded = () => {
      const gapi = (window as any).gapi;
      if (!gapi) {
        reject(new Error('Google API client failed to initialize'));
        return;
      }
      gapi.load('picker', {
        callback: () => {
          if ((window as any).google?.picker) {
            resolve();
          } else {
            reject(new Error('Google Picker library failed to load'));
          }
        },
        onerror: () => reject(new Error('Error loading Google Picker API'))
      });
    };

    if (typeof window !== 'undefined' && (window as any).gapi) {
      onGapiLoaded();
    } else {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = onGapiLoaded;
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.body.appendChild(script);
    }
  });
};

export interface PickedGoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  iconUrl?: string;
}

/**
 * Opens Google Picker modal configured for Audio files in Google Drive
 */
export const openDriveAudioPicker = async (
  onFilePicked: (file: PickedGoogleDriveFile) => void,
  onCancel?: () => void
): Promise<void> => {
  let token = cachedAccessToken;

  if (!token) {
    const authResult = await googleSignIn();
    if (!authResult?.accessToken) {
      throw new Error('Authentication required to open Google Drive');
    }
    token = authResult.accessToken;
  }

  await loadGooglePickerApi();

  const google = (window as any).google;
  if (!google?.picker) {
    throw new Error('Google Picker is not available');
  }

  const pickerOrigin =
    typeof window !== 'undefined' &&
    window.location.ancestorOrigins &&
    window.location.ancestorOrigins.length > 0
      ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
      : window.location.origin;

  // View specifically filtering for audio formats
  const audioView = new google.picker.DocsView(google.picker.ViewId.DOCS)
    .setMimeTypes('audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-m4a,audio/m4a,audio/aac,audio/flac,audio/mp4,audio/webm,audio/x-wav')
    .setMode(google.picker.DocsViewMode.LIST)
    .setSelectFolderEnabled(false);

  // All files view allowing user to navigate folders
  const allDocsView = new google.picker.DocsView(google.picker.ViewId.DOCS)
    .setMode(google.picker.DocsViewMode.LIST)
    .setSelectFolderEnabled(false);

  const picker = new google.picker.PickerBuilder()
    .addView(audioView)
    .addView(allDocsView)
    .setOAuthToken(token)
    .setOrigin(pickerOrigin)
    .setTitle('Select Afrobeat / Amapiano Audio Track')
    .setCallback((data: any) => {
      if (data.action === google.picker.Action.PICKED) {
        const doc = data.docs?.[0];
        if (doc) {
          onFilePicked({
            id: doc.id,
            name: doc.name || 'Untitled Audio',
            mimeType: doc.mimeType || 'audio/mpeg',
            sizeBytes: doc.sizeBytes ? parseInt(doc.sizeBytes, 10) : undefined,
            iconUrl: doc.iconUrl
          });
        }
      } else if (data.action === google.picker.Action.CANCEL) {
        if (onCancel) onCancel();
      }
    })
    .build();

  picker.setVisible(true);
};

/**
 * Downloads audio file content directly from Google Drive API
 */
export const downloadDriveAudioFile = async (
  fileId: string, 
  customToken?: string
): Promise<ArrayBuffer> => {
  const token = customToken || cachedAccessToken;
  if (!token) {
    throw new Error('Missing Google Drive OAuth Access Token');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      cachedAccessToken = null;
      throw new Error('Google Drive session expired. Please sign in again.');
    }
    throw new Error(`Failed to download audio from Google Drive (${response.status}: ${response.statusText})`);
  }

  return await response.arrayBuffer();
};

/**
 * Lists recent audio files in user's Google Drive via Drive REST API
 */
export const listRecentDriveAudioFiles = async (
  customToken?: string
): Promise<DriveFileItem[]> => {
  const token = customToken || cachedAccessToken;
  if (!token) {
    throw new Error('Authentication required to access Google Drive files');
  }

  const query = "mimeType contains 'audio/' and trashed = false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,iconLink,thumbnailLink,modifiedTime)&pageSize=30&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to list Google Drive files (${response.status})`);
  }

  const data = await response.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    sizeBytes: f.size ? parseInt(f.size, 10) : undefined,
    iconUrl: f.iconLink,
    thumbnailUrl: f.thumbnailLink
  }));
};

/**
 * Transforms a Google Drive audio file into an AfroPI@NO playable Song object
 */
export const processDriveAudioSong = async (
  driveFile: PickedGoogleDriveFile | DriveFileItem,
  arrayBuffer: ArrayBuffer
): Promise<Song> => {
  // Decode audio into AudioBuffer using Web Audio API
  const audioBuffer = await audioService.loadAudioFromArrayBuffer(arrayBuffer);

  // Real-time Energy Flux Onset Detection for polyrhythmic note tiles
  const detectedMidi = audioService.analyzeAudioPeaks(audioBuffer, 0.65);

  const cleanTitle = driveFile.name.replace(/\.[^/.]+$/, "");

  return {
    id: `gdrive-${driveFile.id}`,
    title: cleanTitle,
    artist: 'Google Drive Audio',
    bpm: 115,
    difficulty: 'Custom',
    baseSpeed: 0.65,
    melody: [],
    audioBuffer: audioBuffer,
    midiData: detectedMidi,
    isGoogleDrive: true,
    driveFileId: driveFile.id,
    mimeType: driveFile.mimeType,
    storagePath: `Google Drive / ${driveFile.name}`
  };
};

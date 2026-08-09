import React, { useState, useEffect } from 'react';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  openDriveAudioPicker, 
  downloadDriveAudioFile, 
  listRecentDriveAudioFiles,
  processDriveAudioSong, 
  getCurrentUser,
  PickedGoogleDriveFile 
} from '../services/googleDriveService';
import { Song, DriveFileItem } from '../types';
import { 
  X, 
  Cloud, 
  Music, 
  RefreshCw, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  FileAudio, 
  Sparkles, 
  ExternalLink,
  HardDrive
} from 'lucide-react';
import { User } from 'firebase/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSongImported: (song: Song) => void;
}

export const GoogleDriveModal: React.FC<Props> = ({ isOpen, onClose, onSongImported }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgressText, setDownloadProgressText] = useState<string>('');
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setAccessToken(token);
        fetchRecentFiles(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setDriveFiles([]);
      }
    );

    const activeUser = getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
    }

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const fetchRecentFiles = async (token?: string) => {
    try {
      setIsLoadingFiles(true);
      setErrorMessage(null);
      const files = await listRecentDriveAudioFiles(token);
      setDriveFiles(files);
    } catch (err: any) {
      console.warn("Could not load recent drive files list:", err);
      // Non-blocking, user can still use Picker
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setErrorMessage(null);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        await fetchRecentFiles(res.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setDriveFiles([]);
    } catch (err: any) {
      console.error("Sign out error:", err);
    }
  };

  const handleLaunchPicker = async () => {
    setErrorMessage(null);
    setIsPickerLoading(true);
    try {
      await openDriveAudioPicker(
        async (pickedFile: PickedGoogleDriveFile) => {
          await handleProcessDriveFile(pickedFile);
        },
        () => {
          setIsPickerLoading(false);
        }
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to open Google Picker');
    } finally {
      setIsPickerLoading(false);
    }
  };

  const handleProcessDriveFile = async (file: PickedGoogleDriveFile | DriveFileItem) => {
    try {
      setIsDownloading(true);
      setDownloadProgressText(`Fetching "${file.name}" from Google Drive...`);
      setErrorMessage(null);

      const arrayBuffer = await downloadDriveAudioFile(file.id, accessToken || undefined);

      setDownloadProgressText(`Analyzing Afrobeat polyrhythms and energy flux...`);
      const song = await processDriveAudioSong(file, arrayBuffer);

      setDownloadProgressText(`Ready! Launching track...`);
      setTimeout(() => {
        onSongImported(song);
        onClose();
        setIsDownloading(false);
      }, 400);
    } catch (err: any) {
      console.error("Error processing Drive audio:", err);
      setErrorMessage(err?.message || 'Failed to download and process audio file from Google Drive.');
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#0e0e12] border border-cyan-500/20 rounded-[2.5rem] p-6 sm:p-8 flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,242,255,0.15)] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient backgrounds */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
              <Cloud size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tight text-white flex items-center gap-2">
                GOOGLE <span className="text-cyan-400">DRIVE</span>
              </h2>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em]">
                Google Picker Audio Import
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-400 text-xs">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 custom-scrollbar relative z-10">
          
          {/* User Auth Banner */}
          <div className="p-5 bg-white/5 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {user ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Google User'} 
                    className="w-11 h-11 rounded-full border border-cyan-400/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center font-bold text-base">
                    {(user.displayName || user.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <div className="truncate">
                  <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                    {user.displayName || 'Connected User'}
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-[11px] text-white/40 truncate">{user.email}</div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-white">Connect Google Account</div>
                <div className="text-[11px] text-white/40">Select MP3s & tribal beats from your Drive</div>
              </div>
            )}

            <div>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2.5 bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-300 rounded-2xl border border-white/10 text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="gsi-material-button"
                  style={{ height: '40px' }}
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents font-medium text-xs">
                      {isAuthenticating ? 'Connecting...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Primary Action: Google Picker */}
          <div className="space-y-3">
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 px-1">
              Interactive Picker
            </div>

            <button
              onClick={handleLaunchPicker}
              disabled={isPickerLoading || isDownloading}
              className="w-full p-6 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-cyan-400/10 to-purple-500/20 border-2 border-cyan-400/50 hover:border-cyan-300 hover:bg-cyan-400/20 transition-all flex items-center justify-between text-left group shadow-[0_10px_30px_rgba(0,242,255,0.15)] active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)] group-hover:scale-105 transition-transform">
                  <HardDrive size={26} />
                </div>
                <div>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    Open Google Picker
                    <Sparkles size={16} className="text-cyan-400" />
                  </div>
                  <div className="text-xs text-white/60 mt-0.5">
                    Browse folders, shared drives & audio tracks
                  </div>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-cyan-400 group-hover:text-black transition-all">
                <ExternalLink size={18} />
              </div>
            </button>
          </div>

          {/* Downloading / Analysis Spinner overlay */}
          {isDownloading && (
            <div className="p-6 rounded-3xl bg-cyan-500/10 border border-cyan-400/40 text-center space-y-3 animate-pulse">
              <div className="flex justify-center">
                <RefreshCw size={28} className="text-cyan-400 animate-spin" />
              </div>
              <div className="text-sm font-bold text-white">{downloadProgressText}</div>
              <div className="text-[11px] text-white/50 uppercase tracking-widest font-mono">
                Web Audio Energy Flux Detection
              </div>
            </div>
          )}

          {/* Recent Drive Audio Files Section */}
          {user && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">
                  Drive Audio Tracks ({driveFiles.length})
                </span>
                <button
                  onClick={() => fetchRecentFiles()}
                  disabled={isLoadingFiles}
                  className="text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} className={isLoadingFiles ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {isLoadingFiles ? (
                <div className="p-8 text-center text-white/40 text-xs flex flex-col items-center gap-2">
                  <RefreshCw size={20} className="animate-spin text-cyan-400" />
                  Scanning Drive for audio files...
                </div>
              ) : driveFiles.length > 0 ? (
                <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {driveFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleProcessDriveFile(file)}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-cyan-400/10 border border-white/10 hover:border-cyan-400/40 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors shrink-0">
                          <FileAudio size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                            {file.name}
                          </div>
                          <div className="text-[10px] text-white/40 font-mono mt-0.5">
                            {file.sizeBytes ? `${(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : 'Audio Stream'}
                          </div>
                        </div>
                      </div>

                      <button
                        className="px-3.5 py-1.5 bg-cyan-400/20 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-black rounded-xl text-xs font-bold transition-all shrink-0 ml-3"
                      >
                        Play
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-white/30 text-xs bg-white/5 rounded-2xl border border-white/5">
                  No audio tracks found automatically. Use the <strong className="text-white/60">Open Google Picker</strong> button above to browse any folder or audio file in Drive.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 text-center text-[10px] text-white/30 uppercase tracking-widest relative z-10">
          AfroPI@NO • Google Drive Audio Stream Engine
        </div>
      </div>
    </div>
  );
};

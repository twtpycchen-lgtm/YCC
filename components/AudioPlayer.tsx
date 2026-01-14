
import React, { useEffect, useRef, useState } from 'react';
import { PlayerState } from '../types';

interface AudioPlayerProps {
  state: PlayerState;
  onTogglePlay: () => void;
  onProgressChange: (progress: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ state, onTogglePlay, onProgressChange }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isDriveFile, setIsDriveFile] = useState(false);

  const getDriveId = (url: string) => {
    if (!url || typeof url !== 'string' || url.startsWith('blob:')) return null;
    const match = url.match(/[-\w]{25,50}/);
    return match ? match[0] : null;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;
    
    setError(null);
    setIsBuffering(true);
    
    const trackUrl = state.currentTrack.audioUrl;
    const driveId = getDriveId(trackUrl);
    setIsDriveFile(!!driveId);

    // 停止先前的播放
    audio.pause();
    
    if (driveId) {
      // 使用最穩定的 Google Drive 串流位址
      audio.src = `https://drive.google.com/uc?export=download&id=${driveId}`;
    } else {
      audio.src = trackUrl;
    }
    
    audio.load();

    if (state.isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("[AudioPlayer] Playback issue:", e.name);
          if (e.name === 'NotAllowedError') {
            setError("瀏覽器攔截了自動播放，請手動點擊播放按鈕。");
          }
        });
      }
    }
  }, [state.currentTrack?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;
    
    if (state.isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);

  const handleAudioError = () => {
    if (!state.currentTrack) return;
    const trackUrl = state.currentTrack.audioUrl;
    const driveId = getDriveId(trackUrl);

    if (driveId) {
      setError("Google Drive 拒絕了直接串流。這通常是因為檔案過大或權限設定不正確。");
    } else {
      setError(`無法讀取檔案：${trackUrl.split('/').pop()}`);
    }
    setIsBuffering(false);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || isNaN(audioRef.current.duration)) return;
    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    onProgressChange(progress);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!state.currentTrack) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[60] glass rounded-[2rem] p-5 shadow-2xl border border-white/10 animate-fade-in-up">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { if (state.isPlaying) onTogglePlay(); }}
        onError={handleAudioError}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => { setError(null); setIsBuffering(false); }}
        onPlaying={() => setIsBuffering(false)}
        preload="auto"
      />
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Track Info */}
        <div className="flex items-center gap-4 min-w-[280px] max-w-[350px]">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl bg-gray-900 border border-white/5">
            <img src={state.currentAlbum?.coverImage} alt="Cover" className="w-full h-full object-cover" />
            {isBuffering && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm truncate text-white mb-1">{state.currentTrack.title}</h4>
            <div className="flex items-center gap-2">
              {error ? (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">載入失敗</span>
                  {isDriveFile && (
                    <a 
                      href={state.currentTrack.mp3Url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[8px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-gray-300 transition-all uppercase"
                    >
                      開啟原檔 ↗
                    </a>
                  )}
                </div>
              ) : isBuffering ? (
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">雲端串流中...</span>
              ) : (
                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
                  正在撥放
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-grow flex flex-col items-center gap-2 w-full">
          <div className="flex items-center gap-8">
            <button className="text-gray-600 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
            </button>
            <button 
              onClick={onTogglePlay} 
              className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {state.isPlaying && !audioRef.current?.paused ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              )}
            </button>
            <button className="text-gray-600 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 6.168A1 1 0 003 7v6a1 1 0 001.555.832l6 4a1 1 0 000 1.664l6 4z" /></svg>
            </button>
          </div>
          <div className="w-full flex items-center gap-4">
            <span className="text-[10px] text-gray-500 font-mono w-10 text-right">{formatTime(audioRef.current?.currentTime || 0)}</span>
            <div className="flex-grow h-1.5 bg-white/5 rounded-full relative overflow-hidden group cursor-pointer">
              <div 
                className="absolute top-0 left-0 h-full bg-white group-hover:bg-blue-400 transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-gray-500 font-mono w-10">{formatTime(audioRef.current?.duration || 0)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-4 min-w-[150px] justify-end">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" /></svg>
          <input 
            type="range" min="0" max="1" step="0.01" value={volume} 
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;

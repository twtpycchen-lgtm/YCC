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
  const [retryCount, setRetryCount] = useState(0);

  const getDriveId = (url: string) => {
    if (!url || typeof url !== 'string' || url.startsWith('blob:')) return null;
    const patterns = [
      /[?&]id=([^&]+)/,
      /d\/([a-zA-Z0-9_-]{25,})/,
      /file\/d\/([a-zA-Z0-9_-]{25,})/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const getStreamUrls = (id: string) => [
    `https://drive.google.com/uc?export=download&id=${id}`,
    `https://docs.google.com/uc?export=download&id=${id}`,
    `https://drive.google.com/u/0/uc?export=download&id=${id}`
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;
    
    setError(null);
    setIsBuffering(true);
    setRetryCount(0);

    const trackUrl = state.currentTrack.audioUrl;
    const driveId = getDriveId(trackUrl);
    
    // 清除可能干擾相對路徑播放的跨域屬性
    audio.removeAttribute('crossOrigin');
    
    if (driveId) {
      const urls = getStreamUrls(driveId);
      audio.src = urls[retryCount];
    } else {
      // 直接播放相對路徑或直連網址
      audio.src = trackUrl;
    }
    
    audio.load();
    if (state.isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("[Audio] 自動播放受阻，或路徑無效:", e);
          if (e.name === 'NotSupportedError') {
            setError("檔案格式不支援或路徑無效。");
          }
        });
      }
    }
  }, [state.currentTrack?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);

  const handleAudioError = () => {
    if (!audioRef.current || !state.currentTrack) return;
    
    const trackUrl = state.currentTrack.audioUrl;
    const driveId = getDriveId(trackUrl);

    if (driveId) {
      const urls = getStreamUrls(driveId);
      if (retryCount < urls.length - 1) {
        setRetryCount(prev => prev + 1);
        return;
      }
      setError("Google Drive 串流受阻。");
    } else {
      setError("無法讀取檔案。請檢查路徑或網路。");
    }
    setIsBuffering(false);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    onProgressChange(progress || 0);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!state.currentTrack) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[60] glass rounded-3xl p-4 md:p-6 shadow-2xl border border-white/5 animate-fade-in-up">
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
        <div className="flex items-center gap-4 min-w-[340px]">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-gray-900">
            <img src={state.currentAlbum?.coverImage} alt="Cover" className="w-full h-full object-cover" />
            {isBuffering && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm truncate tracking-wide text-glow text-white">{state.currentTrack.title}</h4>
            <div className="flex items-center gap-2">
              {error ? (
                <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest animate-pulse">
                  錯誤: {error}
                </span>
              ) : isBuffering ? (
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">
                  Buffering...
                </span>
              ) : (
                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></div>
                  串流正常
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center gap-2 w-full">
          <div className="flex items-center gap-8">
            <button className="text-gray-500 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.445 14.832A1 1 0 0010 14V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg></button>
            <button 
              onClick={onTogglePlay} 
              className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 shadow-xl"
            >
              {state.isPlaying ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
            </button>
            <button className="text-gray-500 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832l6-4a1 1 0 000 1.664l-6-4z" /><path d="M11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832l6-4a1 1 0 000 1.664l-6-4z" /></svg></button>
          </div>
          <div className="w-full max-w-2xl flex items-center gap-4 px-4">
            <span className="text-[10px] font-mono text-gray-500 w-10 text-right">{formatTime(audioRef.current?.currentTime || 0)}</span>
            <input type="range" min="0" max="100" value={state.progress || 0} onChange={(e) => {
              if (audioRef.current) {
                const newTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
                audioRef.current.currentTime = newTime;
              }
            }} className="flex-grow h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white" />
            <span className="text-[10px] font-mono text-gray-500 w-10">{formatTime(audioRef.current?.duration || 0)}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 min-w-[180px] justify-end">
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }} className="w-24 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white" />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
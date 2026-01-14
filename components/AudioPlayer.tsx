
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

  // Effect to load track when it changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;
    
    setError(null);
    setIsBuffering(true);
    setRetryCount(0);

    let trackUrl = state.currentTrack.audioUrl;

    // 檢查是否包含本地盤符 (例如 C:\ 或 C:/)
    if (/^[a-zA-Z]:[\\\/]/.test(trackUrl) || trackUrl.startsWith('file://')) {
      setError("不支援本地路徑 (C:\\...)，請將檔案上傳至 GitHub 並改用相對路徑。");
      setIsBuffering(false);
      return;
    }

    const driveId = getDriveId(trackUrl);
    
    // 清除跨域屬性，避免影響相對路徑加載
    audio.removeAttribute('crossOrigin');
    
    if (driveId) {
      const urls = getStreamUrls(driveId);
      audio.src = urls[retryCount];
    } else {
      // 確保路徑不帶多餘的斜線，並保留 URL 格式
      audio.src = trackUrl;
      console.log(`[AudioPlayer] Attempting to load: ${trackUrl}`);
    }
    
    audio.load();
    if (state.isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("[AudioPlayer] Playback blocked or failed:", e);
          if (e.name === 'NotSupportedError' || e.name === 'AbortError') {
            setError(`無法加載：${trackUrl} (檔案不存在或格式錯誤)`);
          }
        });
      }
    }
  }, [state.currentTrack?.id, retryCount]);

  // Effect to toggle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.isPlaying && !error) {
      audio.play().catch(e => {
        console.warn("Play failed:", e);
        if (!error) setError("播放受阻，請點擊播放鍵重試。");
      });
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);

  const handleAudioError = (e: any) => {
    if (!audioRef.current || !state.currentTrack) return;
    
    const trackUrl = state.currentTrack.audioUrl;
    const driveId = getDriveId(trackUrl);

    if (driveId) {
      const urls = getStreamUrls(driveId);
      if (retryCount < urls.length - 1) {
        setRetryCount(prev => prev + 1);
        return;
      }
      setError("雲端串流受限，請稍後再試。");
    } else {
      console.error("[AudioPlayer] Error loading source:", trackUrl);
      setError(`404 錯誤：找不到檔案 "${trackUrl}"`);
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
        <div className="flex items-center gap-4 min-w-[300px] max-w-[400px]">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-gray-900">
            <img src={state.currentAlbum?.coverImage} alt="Cover" className="w-full h-full object-cover" />
            {(isBuffering || (state.isPlaying && !error && audioRef.current?.paused)) && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm truncate tracking-wide text-white">{state.currentTrack.title}</h4>
            <div className="flex items-center gap-2">
              {error ? (
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                  {error}
                </span>
              ) : isBuffering ? (
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">
                  Buffering...
                </span>
              ) : (
                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
                  正在播放
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center gap-2 w-full">
          <div className="flex items-center gap-8">
            <button className="text-gray-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.445 14.832A1 1 0 0010 14V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
            <button 
              onClick={onTogglePlay} 
              className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 shadow-xl disabled:opacity-50"
              disabled={!!error}
            >
              {state.isPlaying && !audioRef.current?.paused ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              )}
            </button>
            <button className="text-gray-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4.555 6.168A1 1 0 003 7v6a1 1 0 001.555.832l6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-mono w-8">{formatTime(audioRef.current?.currentTime || 0)}</span>
            <div className="flex-grow h-1.5 bg-white/10 rounded-full relative overflow-hidden group/progress cursor-pointer">
              <div 
                className="absolute top-0 left-0 h-full bg-white group-hover/progress:bg-blue-400 transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-gray-500 font-mono w-8">{formatTime(audioRef.current?.duration || 0)}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 min-w-[200px] justify-end">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 14.828a1 1 0 01-1.414-1.414L14.414 12l-1.171-1.172a1 1 0 111.414-1.414L15.828 10.586l1.172-1.172a1 1 0 111.414 1.414L17.243 12l1.172 1.172a1 1 0 11-1.414 1.414L15.828 13.414l-1.171 1.172z" clipRule="evenodd" />
            </svg>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;

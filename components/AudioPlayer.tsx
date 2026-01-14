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
    if (!url || typeof url !== 'string') return null;
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
    // 優先使用 usercontent 網域，這通常用於直接下載，避開 Google Drive 主站的 HTML 警告頁
    `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`,
    `https://drive.google.com/uc?id=${id}&export=download&confirm=t`,
    `https://docs.google.com/uc?export=download&id=${id}`
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;
    
    // 解決連線被拒絕的關鍵：不傳送 Referrer
    audio.setAttribute('referrerpolicy', 'no-referrer');
    
    setError(null);
    setIsBuffering(true);
    setRetryCount(0);
    
    const id = getDriveId(state.currentTrack.audioUrl);
    if (id) {
      const urls = getStreamUrls(id);
      audio.src = urls[0];
    } else {
      audio.src = state.currentTrack.audioUrl;
    }
    
    audio.load();
    if (state.isPlaying) {
      audio.play().catch(e => {
        console.warn("自動播放受限:", e);
      });
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
    
    const id = getDriveId(state.currentTrack.audioUrl);
    if (id) {
      const urls = getStreamUrls(id);
      if (retryCount < urls.length - 1) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);
        console.warn(`[V11] 網域 ${retryCount} 遭攔截，嘗試備用通道 ${nextRetry}...`);
        audioRef.current.src = urls[nextRetry];
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
        return;
      }
    }
    
    setError("NotSupportedError: Google 已攔截串流並傳送 HTML 警告。請點擊按鈕修復權限。");
    setIsBuffering(false);
  };

  const openAuthRepair = () => {
    if (!state.currentTrack) return;
    const id = getDriveId(state.currentTrack.audioUrl);
    if (!id) return;
    // 打開預覽頁面，這會強迫瀏覽器獲取 Google 的 Session Cookie
    window.open(`https://drive.google.com/file/d/${id}/view`, '_blank');
    alert("已在新視窗開啟檔案。請在該分頁確認看到播放器後，回到本站再次點擊「播放」。這能有效繞過 Google 的防盜鏈限制。");
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
        crossOrigin="anonymous"
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
                <button onClick={openAuthRepair} className="text-[10px] bg-red-600 text-white px-3 py-1 rounded-full font-bold animate-pulse shadow-lg hover:bg-red-500 transition-all">
                  點擊修復 Google 授權
                </button>
              ) : isBuffering ? (
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">
                  建立直連隧道中...
                </span>
              ) : (
                <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                  數據串流已鎖定
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
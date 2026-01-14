
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
  const [errorInfo, setErrorInfo] = useState<{status: string, code?: number}>({ status: 'none' });
  const [isBuffering, setIsBuffering] = useState(false);

  const isDropbox = state.currentTrack?.audioUrl.includes('dropboxusercontent.com');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    setErrorInfo({ status: 'none' });
    setIsBuffering(true);

    audio.pause();
    // 給予新的 src 並重新載入
    audio.src = state.currentTrack.audioUrl;
    audio.load();

    if (state.isPlaying) {
      audio.play().catch(e => {
        if (e.name !== 'AbortError') console.warn("播放器異常:", e);
      });
    }
  }, [state.currentTrack?.id]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (state.isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [state.isPlaying]);

  const handleAudioError = (e: any) => {
    const error = e.target.error;
    console.error("[AudioPlayer] Error Code:", error?.code, "Message:", error?.message);
    setIsBuffering(false);
    
    let status = 'generic';
    if (state.currentTrack?.audioUrl.includes('drive.google.com')) {
      status = 'blocked';
    }
    setErrorInfo({ status, code: error?.code });
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!state.currentTrack) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[60] glass rounded-[2.5rem] p-6 shadow-2xl border border-white/10 animate-fade-in-up">
      <audio 
        ref={audioRef} 
        onTimeUpdate={() => {
          if (audioRef.current && !isNaN(audioRef.current.duration)) {
            onProgressChange((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }}
        onEnded={() => { if (state.isPlaying) onTogglePlay(); }}
        onError={handleAudioError}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => { setErrorInfo({ status: 'none' }); setIsBuffering(false); }}
        onPlaying={() => setIsBuffering(false)}
        preload="auto"
        crossOrigin="anonymous"
      />
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Track Info */}
        <div className="flex items-center gap-5 min-w-[320px] max-w-[450px]">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/5 flex-shrink-0">
            <img src={state.currentAlbum?.coverImage} alt="Cover" className="w-full h-full object-cover" />
            {isBuffering && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-base truncate text-white mb-1">{state.currentTrack.title}</h4>
            <div className="flex flex-col gap-2">
              {errorInfo.status === 'blocked' ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">🔒 Google 掃描攔截</span>
                  <a href={state.currentTrack.mp3Url} target="_blank" rel="noreferrer" className="text-[9px] bg-blue-500/20 px-3 py-1 rounded-full text-blue-300 border border-blue-500/30">點擊解鎖</a>
                </div>
              ) : errorInfo.status === 'generic' ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">載入失敗 (碼:{errorInfo.code})</span>
                  <button onClick={() => audioRef.current?.load()} className="text-[9px] text-gray-400 underline uppercase">重試</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${isDropbox ? 'bg-blue-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${isDropbox ? 'text-blue-400' : 'text-gray-400'}`}>
                     {isDropbox ? '💎 高速串流 (Dropbox)' : (isBuffering ? '同步雲端數據...' : '音訊穩定連接中')}
                   </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-grow flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-10">
            <button className="text-gray-600 hover:text-white transition-colors" onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 10 }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
            </button>
            <button 
              onClick={onTogglePlay} 
              className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 shadow-2xl"
            >
              {state.isPlaying && !audioRef.current?.paused ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              )}
            </button>
            <button className="text-gray-600 hover:text-white transition-colors" onClick={() => { if(audioRef.current) audioRef.current.currentTime += 10 }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 6.168A1 1 0 003 7v6a1 1 0 001.555.832l6 4a1 1 0 000 1.664l6 4z" /></svg>
            </button>
          </div>
          <div className="w-full flex items-center gap-5">
            <span className="text-[11px] text-gray-500 font-mono w-12 text-right">{formatTime(audioRef.current?.currentTime || 0)}</span>
            <div 
              className="flex-grow h-1.5 bg-white/5 rounded-full relative overflow-hidden group cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                if (audioRef.current) audioRef.current.currentTime = pos * audioRef.current.duration;
              }}
            >
              <div 
                className={`absolute top-0 left-0 h-full ${isDropbox ? 'bg-blue-400' : 'bg-white'} group-hover:opacity-80 transition-all duration-300`}
                style={{ width: `${state.progress}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-gray-500 font-mono w-12">{formatTime(audioRef.current?.duration || 0)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden lg:flex items-center gap-6 min-w-[200px] justify-end">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" /></svg>
            <input 
              type="range" min="0" max="1" step="0.01" value={volume} 
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

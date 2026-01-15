
import React, { useEffect, useRef, useState } from 'react';
import { PlayerState } from '../types';

interface AudioPlayerProps {
  state: PlayerState;
  onTogglePlay: () => void;
  onProgressChange: (progress: number) => void;
  onRemove: () => void;
  onEnded?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ state, onTogglePlay, onProgressChange, onRemove, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    setIsBuffering(true);
    audio.pause();
    audio.crossOrigin = "anonymous";
    audio.src = state.currentTrack.audioUrl;
    audio.load();

    if (state.isPlaying) {
      audio.play().catch(e => {
        if (e.name !== 'AbortError') console.warn("Sync Error", e);
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

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnded = () => {
    if (onEnded) {
      onEnded();
    } else if (state.isPlaying) {
      onTogglePlay();
    }
  };

  if (!state.currentTrack) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[110] glass rounded-[1.8rem] p-4 md:p-5 border-white/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.8)] animate-reveal group/player">
      <button 
        onClick={onRemove}
        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black border border-white/10 text-gray-500 hover:text-white hover:border-[#d4af37]/40 flex items-center justify-center transition-all opacity-0 group-hover/player:opacity-100 shadow-xl"
        title="Stop & Close Player"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <audio 
        ref={audioRef} 
        onTimeUpdate={() => {
          if (audioRef.current && !isNaN(audioRef.current.duration)) {
            onProgressChange((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }}
        onEnded={handleEnded}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onPlaying={() => setIsBuffering(false)}
        preload="auto"
        crossOrigin="anonymous"
      />
      
      <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8">
        <div className="flex items-center gap-4 min-w-[200px] md:min-w-[320px] max-w-[400px]">
          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden shadow-lg bg-black border border-white/5 flex-shrink-0">
            <img src={state.currentAlbum?.coverImage} className="w-full h-full object-cover" />
            {isBuffering && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-4 h-4 border border-white/20 border-t-[#d4af37] rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="overflow-hidden flex flex-col gap-1">
            <h4 className="font-bold text-sm md:text-base truncate text-white tracking-wide leading-tight">
              {state.currentTrack.title}
            </h4>
            <div className="flex flex-col gap-0.5 overflow-hidden">
              <div className="flex items-center gap-3">
                <span className={`text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border shrink-0 ${state.isAlbumMode ? 'text-[#d4af37] border-[#d4af37]/40 bg-[#d4af37]/5' : 'text-gray-600 border-white/5 bg-white/5'}`}>
                  {state.isAlbumMode ? 'Album' : 'Single'}
                </span>
              </div>
              {/* 放大「人工 Key-in 歌名」(remarks) */}
              {state.currentTrack.remarks && (
                <span className="text-[11px] md:text-xs text-gray-400 truncate italic font-medium tracking-wide">
                   {state.currentTrack.remarks}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center gap-2.5 w-full">
          <div className="flex items-center gap-8">
            <button className="text-gray-700 hover:text-white transition-all" onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 10 }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
            </button>
            <button 
              onClick={onTogglePlay} 
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${state.isPlaying ? 'bg-white text-black' : 'bg-[#d4af37]'}`}
            >
              {state.isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              )}
            </button>
            <button className="text-gray-700 hover:text-white transition-all" onClick={() => { if(audioRef.current) audioRef.current.currentTime += 10 }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 6.168A1 1 0 003 7v6a1 1 0 001.555.832l6 4a1 1 0 000 1.664l6 4z" /></svg>
            </button>
          </div>
          
          <div className="w-full flex items-center gap-4">
            <span className="text-[8px] text-gray-700 font-mono w-8 text-right font-bold">{formatTime(audioRef.current?.currentTime || 0)}</span>
            <div 
              className="flex-grow h-0.5 bg-white/5 rounded-full relative cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                if (audioRef.current) audioRef.current.currentTime = pos * audioRef.current.duration;
              }}
            >
              <div 
                className="absolute top-0 left-0 h-full rounded-full bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.4)] transition-all"
                style={{ width: `${state.progress}%` }}
              ></div>
            </div>
            <span className="text-[8px] text-gray-700 font-mono w-8 font-bold">{formatTime(audioRef.current?.duration || 0)}</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 min-w-[140px] justify-end">
          <input 
            type="range" min="0" max="1" step="0.01" value={volume} 
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="w-16 h-[1px] bg-white/10 rounded-full appearance-none cursor-pointer accent-[#d4af37]"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;

import React, { useState } from 'react';
import { Album, Track } from '../types';

interface AlbumDetailViewProps {
  album: Album;
  onBack: () => void;
  onPlayTrack: (track: Track) => void;
  onDelete: () => void;
  onEdit: () => void;
  currentTrackId?: string;
  isPlaying: boolean;
  isCuratorMode: boolean;
}

const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ 
  album, 
  onBack, 
  onPlayTrack, 
  onDelete,
  onEdit,
  currentTrackId,
  isPlaying,
  isCuratorMode
}) => {
  const [showCopyMsg, setShowCopyMsg] = useState(false);
  const [useOptimizedTitles, setUseOptimizedTitles] = useState(true);

  const handleShare = () => {
    try {
      const albumJson = JSON.stringify(album);
      const encodedData = btoa(unescape(encodeURIComponent(albumJson)));
      const shareUrl = `${window.location.origin}${window.location.pathname}#share-${encodedData}`;
      navigator.clipboard.writeText(shareUrl);
      setShowCopyMsg(true);
      setTimeout(() => setShowCopyMsg(false), 3000);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
        <button onClick={onBack} className="flex items-center gap-5 text-gray-500 hover:text-[#d4af37] transition-all uppercase text-sm tracking-[0.3em] font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          返回策展典藏
        </button>

        <div className="flex gap-5 items-center">
          <button 
            onClick={() => setUseOptimizedTitles(!useOptimizedTitles)} 
            className={`px-8 py-4 rounded-full border transition-all uppercase text-[10px] tracking-widest font-black ${useOptimizedTitles ? 'bg-[#d4af37]/10 border-[#d4af37]/40 text-[#d4af37]' : 'border-white/10 text-gray-400'}`}
          >
            {useOptimizedTitles ? '✨ AI 藝術標題' : '📁 原始檔名'}
          </button>
          
          <button onClick={handleShare} className="relative px-8 py-4 rounded-full glass border border-white/5 text-white hover:bg-[#d4af37] hover:text-black transition-all uppercase text-xs tracking-widest font-bold">
            分享典藏
            {showCopyMsg && <span className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-[10px] text-[#d4af37] bg-black/95 px-6 py-3 rounded-full border border-[#d4af37]/20 shadow-2xl animate-fade-in">加密連結已複製</span>}
          </button>

          {isCuratorMode && (
            <div className="flex gap-4 border-l border-white/5 pl-5">
              <button onClick={onEdit} className="px-8 py-4 rounded-full border border-white/5 text-gray-500 hover:text-white uppercase text-xs tracking-widest font-bold">編輯</button>
              <button onClick={onDelete} className="px-8 py-4 rounded-full border border-red-950/20 text-red-900/60 hover:text-red-500 uppercase text-xs tracking-widest font-bold">移除</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div className="space-y-12">
          <div className="relative rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] group border border-white/5">
            <img src={album.coverImage} className="w-full h-auto transition-transform duration-[4s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700">
               <button onClick={() => album.tracks.length > 0 && onPlayTrack(album.tracks[0])} className="w-32 h-32 bg-[#d4af37] text-black rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-all">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
               </button>
            </div>
          </div>
          <div className="glass p-14 rounded-[3.5rem] border border-[#d4af37]/10 bg-[#d4af37]/[0.01]">
            <h4 className="font-luxury uppercase tracking-[0.4em] text-[10px] text-[#d4af37] mb-10">策展引言 / Session Story</h4>
            <p className="text-gray-200 leading-[1.8] font-light italic text-2xl tracking-wide">&ldquo;{album.story || '這段旋律正在等待被賦予靈魂...'}&rdquo;</p>
          </div>
        </div>

        <div className="pt-8">
          <h2 className="text-7xl md:text-9xl font-luxury mb-8 tracking-tighter text-glow">{album.title}</h2>
          <p className="text-2xl text-gray-500 mb-16 font-extralight leading-relaxed tracking-wide">{album.description}</p>
          <div className="space-y-6">
            {album.tracks.map((track, idx) => {
              const isActive = currentTrackId === track.id;
              const displayTitle = useOptimizedTitles ? (track.title || track.originalTitle) : track.originalTitle;
              return (
                <div key={track.id} onClick={() => onPlayTrack(track)} className={`group flex items-center justify-between p-8 rounded-[2.5rem] transition-all duration-500 cursor-pointer ${isActive ? 'bg-[#d4af37]/10 border border-[#d4af37]/30 shadow-2xl' : 'hover:bg-white/[0.04] border border-transparent'}`}>
                  <div className="flex items-center gap-10">
                    <span className="text-xs text-gray-700 font-mono w-8">{idx + 1}</span>
                    <div className="min-w-0">
                      <h5 className={`text-2xl font-bold tracking-[0.05em] transition-colors mb-2 truncate ${isActive ? 'text-[#d4af37]' : 'text-gray-200 group-hover:text-white'}`}>
                        {displayTitle}
                      </h5>
                      <span className="text-[10px] text-gray-600 uppercase tracking-widest font-black">{track.genre}</span>
                    </div>
                  </div>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isActive && isPlaying ? 'bg-[#d4af37] text-black scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-white group-hover:bg-white/10'}`}>
                    {isActive && isPlaying ? <span className="text-lg">■</span> : <span className="text-lg ml-1">▶</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailView;
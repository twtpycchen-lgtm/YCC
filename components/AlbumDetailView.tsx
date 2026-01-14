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

  const handleShare = () => {
    try {
      const albumJson = JSON.stringify(album);
      const encodedData = btoa(unescape(encodeURIComponent(albumJson)));
      const shareUrl = `${window.location.origin}${window.location.pathname}#share-${encodedData}`;
      
      navigator.clipboard.writeText(shareUrl);
      setShowCopyMsg(true);
      setTimeout(() => setShowCopyMsg(false), 3000);
    } catch (e) {
      console.error("分享連結生成失敗", e);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-4 text-gray-500 hover:text-[#d4af37] transition-all uppercase text-sm tracking-[0.3em] font-bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回典藏庫
        </button>

        <div className="flex gap-4 items-center">
          <button 
            onClick={handleShare}
            className="relative px-8 py-4 rounded-full glass border border-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/10 transition-all uppercase text-sm tracking-[0.2em] font-bold flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            分享此典藏
            {showCopyMsg && (
              <span className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-xs text-[#d4af37] bg-black/90 px-6 py-3 rounded-full border border-[#d4af37]/20 whitespace-nowrap animate-fade-in shadow-2xl">
                連結已加密並複製
              </span>
            )}
          </button>

          {isCuratorMode && (
            <div className="flex gap-4 animate-fade-in border-l border-white/5 pl-4">
              <button onClick={onEdit} className="px-8 py-4 rounded-full border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 transition-all uppercase text-sm tracking-widest font-bold">編輯</button>
              <button onClick={onDelete} className="px-8 py-4 rounded-full border border-red-900/20 text-red-900/60 hover:text-red-500 hover:bg-red-500/5 transition-all uppercase text-sm tracking-widest font-bold">移除</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* 左側：封面與故事 */}
        <div className="space-y-12">
          <div className="relative rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] group border border-white/5 bg-black">
            <img src={album.coverImage} alt={album.title} className="w-full h-auto transition-transform duration-[3s] group-hover:scale-105 opacity-90 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700">
               <button 
                onClick={() => album.tracks.length > 0 && onPlayTrack(album.tracks[0])}
                className="w-32 h-32 bg-[#d4af37] text-black rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform shadow-2xl"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 ml-1" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                 </svg>
               </button>
            </div>
          </div>
          
          <div className="glass p-12 rounded-[3rem] relative overflow-hidden border border-[#d4af37]/10 bg-[#d4af37]/[0.02]">
            <h4 className="font-luxury uppercase tracking-[0.5em] text-xs text-[#d4af37] mb-8 flex items-center gap-4">
              <span className="w-10 h-[1px] bg-[#d4af37]/40"></span>
              策展引言 / Session Story
            </h4>
            {album.story ? (
              <p className="text-gray-200 leading-relaxed font-light italic text-2xl tracking-wide">
                &ldquo;{album.story}&rdquo;
              </p>
            ) : (
              <p className="text-gray-600 italic tracking-widest text-sm uppercase">尚無策展故事</p>
            )}
          </div>
        </div>

        {/* 右側：音軌清單 */}
        <div className="pt-8">
          <h2 className="text-7xl md:text-8xl font-luxury mb-8 tracking-tighter text-glow leading-[1.1]">{album.title}</h2>
          <p className="text-2xl text-gray-500 mb-16 font-extralight tracking-wide leading-relaxed">{album.description}</p>
          
          <div className="space-y-6">
            <h4 className="font-luxury uppercase tracking-[0.5em] text-xs text-gray-600 mb-10 pl-2">收錄音軌 / Session Tracks</h4>
            <div className="space-y-4">
              {album.tracks.map((track, idx) => {
                const isActive = currentTrackId === track.id;
                return (
                  <div 
                    key={track.id}
                    className={`group flex items-center justify-between p-8 rounded-[2rem] transition-all duration-500 cursor-pointer ${isActive ? 'bg-[#d4af37]/10 border border-[#d4af37]/30 shadow-[0_0_30px_rgba(212,175,55,0.05)]' : 'hover:bg-white/[0.04] border border-transparent'}`}
                    onClick={() => onPlayTrack(track)}
                  >
                    <div className="flex items-center gap-10">
                      <span className="text-sm text-gray-700 font-mono w-8">{idx + 1}</span>
                      <div>
                        <h5 className={`text-2xl font-bold tracking-widest transition-colors mb-2 ${isActive ? 'text-[#d4af37]' : 'text-gray-200 group-hover:text-white'}`}>
                          {track.title}
                        </h5>
                        <div className="flex items-center gap-4">
                           <span className="text-xs text-gray-600 uppercase tracking-[0.3em] font-black">{track.genre}</span>
                           <span className="w-1 h-1 rounded-full bg-white/10"></span>
                           <span className="text-[10px] text-gray-700 font-mono">ORIGINAL FILENAME MODE</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-10 text-xs text-gray-600 font-mono uppercase tracking-widest">
                      {track.duration}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isActive && isPlaying ? 'bg-[#d4af37] text-black shadow-xl scale-110' : 'bg-white/5 text-white hover:bg-white/10 group-hover:scale-105'}`}>
                        {isActive && isPlaying ? (
                          <span className="text-lg">■</span>
                        ) : (
                          <span className="text-lg ml-1">▶</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailView;
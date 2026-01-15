import React, { useState } from 'react';
import { Album, Track } from '../types';

interface AlbumDetailViewProps {
  album: Album;
  onBack: () => void;
  onPlayTrack: (track: Track) => void;
  onPlayAll: () => void;
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
  onPlayAll,
  onDelete,
  onEdit,
  currentTrackId,
  isPlaying,
  isCuratorMode
}) => {
  const [showCopyMsg, setShowCopyMsg] = useState(false);
  const [useOptimizedTitles, setUseOptimizedTitles] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const tracks = album.tracks || [];
  const INITIAL_VISIBLE_COUNT = 8;
  const hasManyTracks = tracks.length > INITIAL_VISIBLE_COUNT;
  const visibleTracks = (hasManyTracks && !isExpanded) 
    ? tracks.slice(0, INITIAL_VISIBLE_COUNT) 
    : tracks;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#album-${album.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `爵非鼓狂 | ${album.title}`,
          text: `沉浸在《${album.title}》的 AI 爵士世界中。`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopyMsg(true);
      setTimeout(() => setShowCopyMsg(false), 2500);
    } catch (e) { 
      alert("無法複製連結，請手動複製網址。");
    }
  };

  return (
    <div className="animate-reveal space-y-10 md:space-y-16 max-w-7xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-white/5">
        <button onClick={onBack} className="flex items-center gap-3 text-gray-500 hover:text-[#d4af37] transition-all uppercase text-[9px] tracking-[0.4em] font-black group">
          <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center transition-all group-hover:border-[#d4af37]/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
          Return to Archives
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setUseOptimizedTitles(!useOptimizedTitles)} 
            className={`px-6 py-2 rounded-full border transition-all uppercase text-[8px] tracking-[0.2em] font-black ${useOptimizedTitles ? 'bg-[#d4af37]/5 border-[#d4af37]/30 text-[#d4af37]' : 'border-white/5 text-gray-500 hover:text-white'}`}
          >
            {useOptimizedTitles ? '✨ Optimized' : '📁 Metadata'}
          </button>
          
          <button onClick={handleShare} className="relative px-6 py-2 rounded-full border border-white/5 text-gray-500 hover:text-white hover:border-white/20 transition-all uppercase text-[8px] tracking-[0.2em] font-black">
            Share Masterpiece
            {showCopyMsg && (
              <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-[9px] text-black bg-[#d4af37] px-5 py-2 rounded-full shadow-[0_10px_30px_rgba(212,175,55,0.3)] animate-bounce whitespace-nowrap font-black">
                Link Copied to Archive
              </span>
            )}
          </button>

          {isCuratorMode && (
            <div className="flex gap-2 pl-4 border-l border-white/5">
              <button onClick={onEdit} className="px-6 py-2 rounded-full border border-white/5 text-gray-600 hover:text-white uppercase text-[8px] tracking-[0.2em] font-black transition-all">Edit</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20 items-start">
        <div className="lg:col-span-4 space-y-12 lg:sticky lg:top-32">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/10 bg-black group aspect-square">
            <img src={album.coverImage} className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700">
               <button onClick={onPlayAll} className="w-20 h-20 bg-[#d4af37] text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-transform hover:scale-110">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
               </button>
            </div>
          </div>
          <div className="glass p-8 md:p-10 rounded-[2rem] border-white/5 bg-white/[0.005]">
            <h4 className="font-luxury text-[8px] text-[#d4af37] tracking-[0.6em] mb-6 border-b border-white/5 pb-3">Curatorial Insight</h4>
            <p className="text-gray-400 leading-relaxed font-light italic text-base md:text-lg tracking-wide font-serif">&ldquo;{album.story || 'Silent whispers of the machine soul...'}&rdquo;</p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-14">
            <h2 className="text-[clamp(2.5rem,6vw,4rem)] font-luxury mb-6 tracking-tight text-white leading-[1.1]">{album.title}</h2>
            <div className="flex items-center gap-4 mb-8 text-[9px] uppercase tracking-[0.4em] font-black">
               <span className="text-[#d4af37]">Archive Session {album.id.split('-').pop()?.slice(0,4)}</span>
               <span className="h-1.5 w-1.5 rounded-full bg-gray-800"></span>
               <span className="text-gray-600">{album.releaseDate}</span>
            </div>
            <p className="text-base md:text-lg text-gray-500 font-light leading-relaxed tracking-wider max-w-2xl border-l-2 border-[#d4af37]/20 pl-8">{album.description}</p>
          </div>

          <div className="mb-14">
             <button 
              onClick={onPlayAll}
              className="group relative flex items-center gap-6 py-5 px-12 rounded-full border-2 border-[#d4af37]/40 bg-gradient-to-r from-[#d4af37]/10 to-transparent hover:from-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-700 shadow-[0_20px_50px_rgba(212,175,55,0.1)] hover:shadow-[0_20px_60px_rgba(212,175,55,0.25)] hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="w-12 h-12 bg-[#d4af37] rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xl md:text-2xl font-luxury text-white tracking-[0.2em]">全部播放</span>
                <span className="text-[9px] uppercase tracking-[0.5em] text-[#d4af37] font-black group-hover:text-white transition-colors">Start Archive Session</span>
              </div>
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/5 pb-3 mb-6">
              <h4 className="font-luxury uppercase tracking-[0.5em] text-[10px] text-gray-700">Musical Program</h4>
              <span className="text-[9px] font-mono text-gray-800 uppercase tracking-[0.3em] font-black">{tracks.length} Sessions Record</span>
            </div>

            <div className="space-y-2.5">
              {visibleTracks.map((track, idx) => {
                const isActive = currentTrackId === track.id;
                const displayTitle = useOptimizedTitles ? (track.title || track.originalTitle) : track.originalTitle;
                return (
                  <div 
                    key={track.id} 
                    onClick={() => onPlayTrack(track)} 
                    className={`group flex items-center justify-between p-5 md:p-6 rounded-[1.5rem] transition-all duration-700 cursor-pointer border ${isActive ? 'bg-[#d4af37]/10 border-[#d4af37]/30 shadow-[0_15px_40px_rgba(212,175,55,0.05)]' : 'hover:bg-white/[0.03] border-transparent'}`}
                  >
                    <div className="flex items-center gap-6 md:gap-10 flex-grow min-w-0">
                      <span className="text-[10px] text-gray-800 font-mono w-6 flex-shrink-0 text-center">{idx + 1}</span>
                      <div className="min-w-0 flex-grow">
                        <h5 className={`text-base md:text-xl font-medium tracking-wide transition-all leading-relaxed ${isActive ? 'text-[#d4af37]' : 'text-gray-300 group-hover:text-white'}`}>
                          {displayTitle}
                        </h5>
                        {track.remarks && (
                          <p className={`text-sm md:text-base font-luxury tracking-[0.1em] transition-colors leading-tight italic mt-1.5 ${isActive ? 'text-[#d4af37]/90' : 'text-[#d4af37]/60'}`}>
                            {track.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-700 border flex-shrink-0 ml-5 ${isActive && isPlaying ? 'bg-[#d4af37] border-[#d4af37] text-black scale-105 shadow-lg' : 'bg-transparent border-white/10 text-white group-hover:border-[#d4af37]/40'}`}>
                      {isActive && isPlaying ? <span className="text-sm">■</span> : <span className="text-sm ml-1">▶</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasManyTracks && (
              <div className="pt-10 flex justify-center relative">
                {!isExpanded && (
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none -translate-y-16"></div>
                )}
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="group flex flex-col items-center gap-3 py-3 px-10 rounded-full border border-white/10 hover:border-[#d4af37]/40 transition-all duration-700"
                >
                  <span className="text-[9px] uppercase tracking-[0.5em] font-black text-gray-700 group-hover:text-[#d4af37]">
                    {isExpanded ? 'Collapse Program' : `Reveal All ${tracks.length} Sessions`}
                  </span>
                  <div className={`transition-transform duration-700 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800 group-hover:text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailView;
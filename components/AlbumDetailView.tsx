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
  const [isExpanded, setIsExpanded] = useState(false);

  const INITIAL_VISIBLE_COUNT = 8;
  const hasManyTracks = album.tracks.length > INITIAL_VISIBLE_COUNT;
  const visibleTracks = (hasManyTracks && !isExpanded) 
    ? album.tracks.slice(0, INITIAL_VISIBLE_COUNT) 
    : album.tracks;

  const handleShare = () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}#album-${album.id}`;
      navigator.clipboard.writeText(shareUrl);
      setShowCopyMsg(true);
      setTimeout(() => setShowCopyMsg(false), 2500);
    } catch (e) { console.error("Share failed", e); }
  };

  return (
    <div className="animate-reveal space-y-10 md:space-y-12 max-w-7xl mx-auto">
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
            Share Link
            {showCopyMsg && <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[8px] text-[#d4af37] bg-black px-4 py-2 rounded-full border border-[#d4af37]/20 shadow-2xl animate-reveal whitespace-nowrap">Link Copied</span>}
          </button>

          {isCuratorMode && (
            <div className="flex gap-2 pl-4 border-l border-white/5">
              <button onClick={onEdit} className="px-6 py-2 rounded-full border border-white/5 text-gray-600 hover:text-white uppercase text-[8px] tracking-[0.2em] font-black transition-all">Edit</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
        {/* Visual & Story Side */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-black group aspect-square">
            <img src={album.coverImage} className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700">
               <button onClick={() => album.tracks.length > 0 && onPlayTrack(album.tracks[0])} className="w-16 h-16 bg-[#d4af37] text-black rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
               </button>
            </div>
          </div>
          <div className="glass p-6 md:p-8 rounded-[1.5rem] border-white/5 bg-white/[0.005]">
            <h4 className="font-luxury text-[7px] text-[#d4af37] tracking-[0.5em] mb-4 border-b border-white/5 pb-2">Curatorial Insight</h4>
            <p className="text-gray-400 leading-relaxed font-light italic text-sm md:text-base tracking-wide font-serif">&ldquo;{album.story || 'Silent whispers of the machine soul...'}&rdquo;</p>
          </div>
        </div>

        {/* Track List Side */}
        <div className="lg:col-span-8">
          <div className="mb-10">
            <h2 className="text-[clamp(1.5rem,5vw,3rem)] font-luxury mb-3 tracking-tight text-white leading-tight">{album.title}</h2>
            <div className="flex items-center gap-3 mb-5 text-[8px] uppercase tracking-[0.3em] font-black">
               <span className="text-[#d4af37]">Archive Session {album.id.split('-').pop()?.slice(0,4)}</span>
               <span className="h-1 w-1 rounded-full bg-gray-800"></span>
               <span className="text-gray-600">{album.releaseDate}</span>
            </div>
            <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed tracking-wide max-w-xl">{album.description}</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-white/5 pb-2 mb-4">
              <h4 className="font-luxury uppercase tracking-[0.4em] text-[8px] text-gray-700">Musical Program</h4>
              <span className="text-[7px] font-mono text-gray-800 uppercase tracking-[0.2em]">{album.tracks.length} Tracks</span>
            </div>

            <div className="space-y-1.5">
              {visibleTracks.map((track, idx) => {
                const isActive = currentTrackId === track.id;
                const displayTitle = useOptimizedTitles ? (track.title || track.originalTitle) : track.originalTitle;
                return (
                  <div 
                    key={track.id} 
                    onClick={() => onPlayTrack(track)} 
                    className={`group flex items-center justify-between p-4 md:p-5 rounded-[1.2rem] transition-all duration-500 cursor-pointer border ${isActive ? 'bg-[#d4af37]/5 border-[#d4af37]/20 shadow-lg' : 'hover:bg-white/[0.02] border-transparent'}`}
                  >
                    <div className="flex items-center gap-4 md:gap-6 flex-grow min-w-0">
                      <span className="text-[9px] text-gray-800 font-mono w-4 flex-shrink-0">{idx + 1}</span>
                      <div className="min-w-0 flex-grow">
                        <h5 className={`text-sm md:text-base font-medium tracking-wide transition-colors truncate mb-1 ${isActive ? 'text-[#d4af37]' : 'text-gray-200 group-hover:text-white'}`}>
                          {displayTitle}
                        </h5>
                        {track.remarks && (
                          <p className={`text-sm md:text-base font-luxury tracking-[0.1em] transition-colors leading-tight italic ${isActive ? 'text-[#d4af37]' : 'text-[#d4af37]/80'}`}>
                            {track.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-500 border flex-shrink-0 ml-3 ${isActive && isPlaying ? 'bg-[#d4af37] border-[#d4af37] text-black scale-105' : 'bg-transparent border-white/10 text-white group-hover:border-[#d4af37]/40'}`}>
                      {isActive && isPlaying ? <span className="text-[10px]">■</span> : <span className="text-[10px] ml-0.5">▶</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasManyTracks && (
              <div className="pt-6 flex justify-center relative">
                {!isExpanded && (
                  <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none -translate-y-12"></div>
                )}
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="group flex flex-col items-center gap-2 py-2 px-8 rounded-full border border-white/5 hover:border-[#d4af37]/30 transition-all duration-500"
                >
                  <span className="text-[7px] uppercase tracking-[0.4em] font-black text-gray-700 group-hover:text-[#d4af37]">
                    {isExpanded ? 'Collapse' : `View All Tracks`}
                  </span>
                  <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-800 group-hover:text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
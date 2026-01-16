
import React, { useState, useRef } from 'react';
import { Album } from '../types';

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  isJazzMode?: boolean;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick, onDelete, isJazzMode }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

  return (
    <div 
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer relative transition-all duration-700 animate-reveal"
      style={{ perspective: '1200px' }}
    >
      <div 
        className={`relative aspect-[4/5] overflow-hidden rounded-[3.5rem] transition-all duration-700 border shadow-2xl ${
          isJazzMode 
          ? 'bg-[#050508] border-indigo-500/40 group-hover:border-indigo-400 shadow-indigo-900/30' 
          : 'bg-[#08080a] border-white/[0.06] group-hover:border-[#d4af37]/30 shadow-black/80'
        }`}
        style={{ 
          transform: `rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={album.coverImage} 
            alt={album.title}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              isJazzMode ? 'opacity-30 group-hover:opacity-60' : 'opacity-60 grayscale-[0.1] group-hover:grayscale-0'
            }`}
            style={{ transform: `scale(1.1) translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
          />
        </div>

        {/* 管理模式專屬按鈕 */}
        {isJazzMode && onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
            className="absolute top-8 right-8 w-12 h-12 glass border border-red-500/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
        
        <div className="absolute bottom-12 left-12 right-12 z-20">
           <div className="flex items-center gap-4 mb-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
             <span className={`h-[1px] w-8 ${isJazzMode ? 'bg-indigo-400' : 'bg-[#d4af37]'}`}></span>
             <span className={`text-[9px] uppercase tracking-[0.6em] font-black ${isJazzMode ? 'text-indigo-300' : 'text-[#d4af37]'}`}>
               Archive Entry
             </span>
           </div>
           <h3 className="text-4xl md:text-5xl font-luxury text-white leading-[1.05] drop-shadow-2xl">
             {album.title}
           </h3>
        </div>
      </div>
      
      <div className="mt-8 px-8 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-[0.5em] text-gray-600 font-black">{album.releaseDate}</span>
        <div className="flex items-center gap-3">
           <span className={`w-1 h-1 rounded-full ${isJazzMode ? 'bg-indigo-500' : 'bg-[#d4af37]'}`}></span>
           <span className="text-[9px] uppercase tracking-[0.5em] text-gray-700 font-bold">{album.tracks.length} Tracks</span>
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;

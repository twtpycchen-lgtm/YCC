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

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const imgTransform = `scale(1.15) translate3d(${mousePos.x * -25}px, ${mousePos.y * -25}px, 0) rotate(${mousePos.x * 2}deg)`;
  const contentTransform = `translate3d(${mousePos.x * 15}px, ${mousePos.y * 15}px, 0)`;
  const glintTransform = `translate3d(${mousePos.x * 100}%, ${mousePos.y * 100}%, 0)`;

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
          ? 'bg-[#050508] border-indigo-500/20 group-hover:border-indigo-400/40 shadow-indigo-900/20' 
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
              isJazzMode ? 'opacity-40 grayscale-[0.3] group-hover:grayscale-0' : 'opacity-60 grayscale-[0.1] group-hover:grayscale-0'
            }`}
            style={{ transform: imgTransform }}
          />
        </div>

        <div 
          className={`absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-br from-transparent via-white/20 to-transparent blur-3xl`}
          style={{ transform: glintTransform }}
        ></div>
        
        <div className={`absolute inset-0 bg-gradient-to-t via-black/10 transition-opacity duration-1000 ${
          isJazzMode ? 'from-indigo-950/90' : 'from-[#08080a] via-transparent to-transparent'
        } group-hover:opacity-60`}></div>
        
        {onDelete && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            className="absolute top-10 right-10 w-12 h-12 glass border border-red-500/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:border-red-500 transition-all duration-500 z-30 group/del"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 group-hover/del:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        <div 
          className="absolute bottom-12 left-12 right-12 z-20 transition-transform duration-700 ease-out"
          style={{ transform: contentTransform }}
        >
           <div className="flex items-center gap-4 mb-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-100">
             <span className={`h-[1px] w-8 ${isJazzMode ? 'bg-indigo-400' : 'bg-[#d4af37]'}`}></span>
             <span className={`text-[9px] uppercase tracking-[0.6em] font-black ${isJazzMode ? 'text-indigo-300' : 'text-[#d4af37]'}`}>
               Featured Masterpiece
             </span>
           </div>
           <h3 className={`text-4xl md:text-5xl font-luxury leading-[1.05] mb-2 drop-shadow-2xl transition-all duration-700 ${isJazzMode ? 'text-indigo-50' : 'text-white'}`}>
             {album.title}
           </h3>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-15 transition-all duration-1000 scale-150 group-hover:scale-110">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
              style={{ 
                width: `${100 + i * 80}px`, 
                height: `${100 + i * 80}px`,
                animation: `pulse ${4 + i}s infinite alternate ease-in-out`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      <div className="mt-12 px-8 flex justify-between items-center transition-opacity duration-700">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.5em] text-gray-700 font-black group-hover:text-gray-500 transition-colors">{album.releaseDate}</span>
          <div className={`h-[2px] w-0 bg-[#d4af37] group-hover:w-full transition-all duration-700 delay-200`}></div>
        </div>
        <div className="flex items-center gap-4 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] group-hover:border-[#d4af37]/20 transition-all">
           <span className={`w-1 h-1 rounded-full ${isJazzMode ? 'bg-indigo-500' : 'bg-[#d4af37]'}`}></span>
           <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-bold">{(album.tracks?.length || 0)} Sessions</span>
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;
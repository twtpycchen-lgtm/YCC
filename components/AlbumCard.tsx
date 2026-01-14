
import React from 'react';
import { Album } from '../types';

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick, onDelete }) => {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2"
    >
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={album.coverImage} 
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
        
        {/* 懸浮刪除按鈕 */}
        {onDelete && (
          <button 
            onClick={onDelete}
            className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:scale-110 transition-all z-10"
            title="刪除專輯"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{album.releaseDate}</p>
        <h3 className="text-2xl font-luxury tracking-wider mb-2 group-hover:text-glow transition-all">{album.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {album.description}
        </p>
      </div>
    </div>
  );
};

export default AlbumCard;

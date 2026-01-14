
import React from 'react';
import { Album } from '../types';

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
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

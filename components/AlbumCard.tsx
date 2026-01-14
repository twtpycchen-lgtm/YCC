import React from 'react';
import { Album } from '../types';

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  isJazzMode?: boolean;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick, onDelete, isJazzMode }) => {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer relative overflow-visible transition-all duration-700 hover:-translate-y-6"
    >
      <div className={`relative aspect-[4/5] overflow-hidden rounded-[2.5rem] transition-all duration-700 border shadow-2xl group-hover:shadow-[0_40px_100px_rgba(0,0,0,0.8)] ${
        isJazzMode 
        ? 'bg-[#050510] border-indigo-500/10 group-hover:border-indigo-500/30' 
        : 'bg-[#0A0A0A] border-white/5 group-hover:border-white/10'
      }`}>
        <img 
          src={album.coverImage} 
          alt={album.title}
          className={`w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-110 ${isJazzMode ? 'opacity-70 group-hover:opacity-90 saturate-[0.8]' : 'opacity-80 group-hover:opacity-100'}`}
        />
        
        {/* 極簡藝術遮罩 */}
        <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent transition-opacity duration-700 ${
          isJazzMode ? 'from-indigo-950 opacity-100' : 'from-black opacity-90'
        } group-hover:opacity-60`}></div>
        
        {/* 操作按鈕 */}
        {onDelete && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            className="absolute top-8 right-8 w-14 h-14 glass border border-red-500/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/90 hover:border-red-500 transition-all duration-500 z-30 group/del"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 group-hover/del:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {/* 懸浮細節 */}
        <div className="absolute bottom-10 left-10 right-10">
           <div className="overflow-hidden mb-2">
             <h3 className={`text-4xl font-luxury tracking-tight group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-700 ${isJazzMode ? 'text-indigo-100' : 'text-white'}`}>
               {album.title}
             </h3>
           </div>
           <div className="flex items-center gap-4 opacity-0 group-hover:opacity-40 transition-opacity duration-1000 delay-100">
             <span className={`h-px w-8 ${isJazzMode ? 'bg-indigo-400' : 'bg-white'}`}></span>
             <span className={`text-[9px] uppercase tracking-[0.4em] font-bold ${isJazzMode ? 'text-indigo-400' : 'text-gray-400'}`}>
               {isJazzMode ? 'Noir Session' : 'Curated Series'}
             </span>
           </div>
        </div>

        {/* 播放圓盤 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none scale-110 group-hover:scale-100">
          <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center glass shadow-2xl">
             <div className="w-16 h-16 border border-white/5 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ml-1 ${isJazzMode ? 'text-indigo-400' : 'text-white'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
             </div>
          </div>
        </div>
      </div>
      
      {/* 外部資訊 */}
      <div className="mt-8 px-2 space-y-2">
        <div className={`flex justify-between items-center text-[10px] uppercase tracking-[0.3em] font-medium transition-colors duration-1000 ${isJazzMode ? 'text-indigo-400/60' : 'text-gray-500'}`}>
          <span>{album.releaseDate}</span>
          <span className={`${isJazzMode ? 'text-indigo-400/20' : 'text-white/20'} group-hover:text-white/60 transition-colors`}>{album.tracks.length} Tracks</span>
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;
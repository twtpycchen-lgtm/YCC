
import React from 'react';
import { Album, Track } from '../types';

interface AlbumDetailViewProps {
  album: Album;
  onBack: () => void;
  onPlayTrack: (track: Track) => void;
  onDelete: () => void;
  onEdit: () => void;
  currentTrackId?: string;
  isPlaying: boolean;
}

// Completed component logic and added missing default export
const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ 
  album, 
  onBack, 
  onPlayTrack, 
  onDelete,
  onEdit,
  currentTrackId,
  isPlaying 
}) => {
  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase text-xs tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回收藏庫
        </button>

        <div className="flex gap-4">
          <button 
            onClick={onEdit}
            className="px-6 py-2 rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase text-[10px] tracking-widest font-bold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編輯作品
          </button>
          <button 
            onClick={onDelete}
            className="px-6 py-2 rounded-full border border-red-500/20 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all uppercase text-[10px] tracking-widest font-bold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            刪除作品
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 group">
            <img src={album.coverImage} alt={album.title} className="w-full h-auto" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={() => album.tracks.length > 0 && onPlayTrack(album.tracks[0])}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black ml-1" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                 </svg>
               </button>
            </div>
          </div>
          
          <div className="glass p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={onEdit} className="text-[9px] uppercase tracking-widest text-blue-400 hover:text-white transition-colors">編輯故事</button>
            </div>
            <h4 className="font-luxury uppercase tracking-widest text-sm text-gray-500 mb-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-gray-500"></span>
              作品敘事
            </h4>
            {album.story ? (
              <p className="text-gray-300 leading-relaxed font-light italic text-lg">
                &ldquo;{album.story}&rdquo;
              </p>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-gray-600 text-sm italic mb-4">這件作品還沒有專屬的故事敘事...</p>
                <button 
                  onClick={onEdit}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-[10px] uppercase tracking-widest border border-white/10 transition-all"
                >
                  前往編輯並使用 AI 生成故事
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-6xl font-luxury mb-2 tracking-tight text-glow">{album.title}</h2>
          <p className="text-xl text-gray-400 mb-8 font-light">{album.description}</p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-luxury uppercase tracking-widest text-sm text-gray-500 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-gray-500"></span>
                收錄曲目
              </h4>
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">{album.tracks.length} Tracks Total</span>
            </div>
            {album.tracks.map((track, idx) => {
              const isActive = currentTrackId === track.id;
              return (
                <div 
                  key={track.id}
                  className={`group flex items-center justify-between p-4 rounded-xl transition-all ${isActive ? 'bg-white/10 shadow-lg scale-[1.02]' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 font-mono w-4">{idx + 1}</span>
                    <div>
                      <h5 className={`text-sm font-bold tracking-wide ${isActive ? 'text-white' : 'text-gray-300'}`}>{track.title}</h5>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">{track.genre}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-gray-500 font-mono">{track.duration}</span>
                    <button 
                      onClick={() => onPlayTrack(track)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive && isPlaying ? 'bg-white text-black' : 'bg-white/5 text-white hover:bg-white hover:text-black'}`}
                    >
                      {isActive && isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
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

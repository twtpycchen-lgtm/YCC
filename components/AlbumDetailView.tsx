
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase text-xs tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回首頁
        </button>

        <div className="flex gap-4">
          <button 
            onClick={onEdit}
            className="px-6 py-2.5 rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase text-[10px] tracking-widest font-bold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編輯
          </button>
          <button 
            onClick={onDelete}
            className="px-6 py-2.5 rounded-full border border-red-500/20 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all uppercase text-[10px] tracking-widest font-bold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            刪除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-10">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group">
            <img src={album.coverImage} alt={album.title} className="w-full h-auto" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
               <button 
                onClick={() => album.tracks.length > 0 && onPlayTrack(album.tracks[0])}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform shadow-2xl"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black ml-1" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                 </svg>
               </button>
            </div>
          </div>
          
          <div className="glass p-10 rounded-[2.5rem] relative overflow-hidden">
            <h4 className="font-luxury uppercase tracking-widest text-xs text-gray-500 mb-6 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-gray-500"></span>
              AI 音樂故事
            </h4>
            {album.story ? (
              <p className="text-gray-200 leading-relaxed font-light italic text-xl">
                &ldquo;{album.story}&rdquo;
              </p>
            ) : (
              <div className="py-10 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl">
                <p className="text-gray-500 text-sm italic mb-6 text-center px-6">這張專輯還沒有寫下它的故事...</p>
                <button 
                  onClick={onEdit}
                  className="px-8 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-full text-[10px] uppercase tracking-widest border border-purple-500/20 transition-all flex items-center gap-2"
                >
                  <span className="animate-pulse">✨</span> 使用 AI 生成靈感故事
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-7xl font-luxury mb-4 tracking-tight text-glow leading-tight">{album.title}</h2>
          <p className="text-2xl text-gray-400 mb-12 font-light">{album.description}</p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-luxury uppercase tracking-widest text-xs text-gray-500 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-gray-500"></span>
                典藏曲目
              </h4>
              <span className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">Vol. {album.tracks.length}</span>
            </div>
            <div className="space-y-2 scrollbar-custom max-h-[60vh] overflow-y-auto pr-2">
              {album.tracks.map((track, idx) => {
                const isActive = currentTrackId === track.id;
                return (
                  <div 
                    key={track.id}
                    className={`group flex items-center justify-between p-5 rounded-2xl transition-all cursor-pointer ${isActive ? 'bg-white/10 shadow-xl border border-white/5' : 'hover:bg-white/5 border border-transparent'}`}
                    onClick={() => onPlayTrack(track)}
                  >
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] text-gray-600 font-mono w-4">{idx + 1}</span>
                      <div>
                        <h5 className={`text-base font-bold tracking-wide transition-colors ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{track.title}</h5>
                        <span className="text-[9px] text-gray-600 uppercase tracking-[0.2em]">{track.genre}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="text-xs text-gray-600 font-mono">{track.duration}</span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive && isPlaying ? 'bg-white text-black' : 'bg-white/5 text-white group-hover:bg-white group-hover:text-black'}`}>
                        {isActive && isPlaying ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
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

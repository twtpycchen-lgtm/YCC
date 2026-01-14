
import React from 'react';
import { Album, Track } from '../types';

interface AlbumDetailViewProps {
  album: Album;
  onBack: () => void;
  onPlayTrack: (track: Track) => void;
  currentTrackId?: string;
  isPlaying: boolean;
}

const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ 
  album, 
  onBack, 
  onPlayTrack, 
  currentTrackId,
  isPlaying 
}) => {
  return (
    <div className="animate-fade-in-up">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 mb-10 text-gray-400 hover:text-white transition-colors uppercase text-xs tracking-widest"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Library
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 group">
            <img src={album.coverImage} alt={album.title} className="w-full h-auto" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={() => onPlayTrack(album.tracks[0])}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black ml-1" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                 </svg>
               </button>
            </div>
          </div>
          
          <div className="glass p-8 rounded-3xl">
            <h4 className="font-luxury uppercase tracking-widest text-sm text-gray-500 mb-4">The Narrative</h4>
            <p className="text-gray-300 leading-relaxed font-light italic">
              &ldquo;{album.story}&rdquo;
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-6xl font-luxury mb-2 tracking-tight">{album.title}</h2>
          <p className="text-xl text-gray-400 mb-8 font-light">{album.description}</p>
          
          <div className="space-y-4">
            <h4 className="font-luxury uppercase tracking-widest text-sm text-gray-500 mb-6">Tracklist</h4>
            {album.tracks.map((track, idx) => {
              const isActive = currentTrackId === track.id;
              return (
                <div 
                  key={track.id}
                  className={`group flex items-center justify-between p-4 rounded-xl transition-all ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-gray-600 font-luxury w-4">{idx + 1}</span>
                    <button 
                      onClick={() => onPlayTrack(track)}
                      className="text-left"
                    >
                      <p className={`font-semibold tracking-wide ${isActive ? 'text-white' : 'text-gray-300'}`}>{track.title}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-tighter">{track.genre}</p>
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-500 font-mono">{track.duration}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <a 
                        href={track.mp3Url} 
                        download 
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title="Download MP3"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                       </a>
                       <a 
                        href={track.wavUrl} 
                        download 
                        className="px-2 py-1 flex items-center text-[10px] font-bold border border-gray-600 text-gray-500 rounded hover:text-white hover:border-white transition-all"
                        title="Download WAV"
                       >
                         WAV
                       </a>
                    </div>
                    <button 
                      onClick={() => onPlayTrack(track)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive && isPlaying ? 'bg-white text-black' : 'border border-white/20 hover:border-white text-white'}`}
                    >
                      {isActive && isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
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

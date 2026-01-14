
import React, { useState } from 'react';
import { MOCK_ALBUMS } from './constants';
import { Album, Track, PlayerState } from './types';
import Navbar from './components/Navbar';
import AlbumCard from './components/AlbumCard';
import AlbumDetailView from './components/AlbumDetailView';
import AudioPlayer from './components/AudioPlayer';
import UploadModal from './components/UploadModal';

const ITEMS_PER_PAGE = 3;

const App: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>(MOCK_ALBUMS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
  });

  const totalPages = Math.ceil(albums.length / ITEMS_PER_PAGE);
  const displayedAlbums = albums.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePlayTrack = (album: Album, track: Track) => {
    setPlayerState((prev) => ({
      ...prev,
      currentAlbum: album,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
    }));
  };

  const handleTogglePlay = () => {
    setPlayerState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleUploadAlbum = (newAlbum: Album) => {
    setAlbums([newAlbum, ...albums]);
    setIsUploadOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
      </div>

      <Navbar 
        onHome={() => { setSelectedAlbum(null); setCurrentPage(1); }} 
        onUpload={() => setIsUploadOpen(true)}
      />

      <main className="flex-grow container mx-auto px-6 pt-24 pb-40">
        {!selectedAlbum ? (
          <>
            <section className="mb-12">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter uppercase font-luxury text-glow">
                AI Curator <span className="text-gray-500">Discography</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl font-light">
                Explore the frontier of sound. Every note, every texture, every story—meticulously crafted by Suno Curator AI.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {displayedAlbums.map((album) => (
                <AlbumCard 
                  key={album.id} 
                  album={album} 
                  onClick={() => setSelectedAlbum(album)} 
                />
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 mt-8">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2 glass rounded-full disabled:opacity-30 hover:bg-white/10 transition-colors uppercase text-sm tracking-widest"
              >
                Previous
              </button>
              <span className="text-gray-400 font-luxury">
                {currentPage} <span className="mx-2">/</span> {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-2 glass rounded-full disabled:opacity-30 hover:bg-white/10 transition-colors uppercase text-sm tracking-widest"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <AlbumDetailView 
            album={selectedAlbum} 
            onBack={() => setSelectedAlbum(null)} 
            onPlayTrack={(track) => handlePlayTrack(selectedAlbum, track)}
            currentTrackId={playerState.currentTrack?.id}
            isPlaying={playerState.isPlaying}
          />
        )}
      </main>

      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onUpload={handleUploadAlbum}
        />
      )}

      <AudioPlayer 
        state={playerState} 
        onTogglePlay={handleTogglePlay}
        onProgressChange={(p) => setPlayerState(prev => ({ ...prev, progress: p }))}
      />
    </div>
  );
};

export default App;
